import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import { Role } from "@prisma/client";
import { prisma } from "../../config/db.js";
import { signJwt } from "../../config/jwt.js";
import { sendPasswordResetEmail } from "../../config/email.js";
import { AppError } from "../../utils/AppError.js";

const SALT_ROUNDS = 10;
const RESET_TOKEN_EXPIRY_MS = 60 * 60 * 1000;

export const PASSWORD_RESET_GENERIC_MESSAGE =
  "Si cet email est associé à un compte, un lien de réinitialisation a été envoyé.";

export const hashPassword = async (motDePasse) =>
  bcrypt.hash(motDePasse, SALT_ROUNDS);

export const comparePassword = async (motDePasse, motDePasseHash) =>
  bcrypt.compare(motDePasse, motDePasseHash);

export const generateToken = (user) =>
  signJwt({
    userId: user.id,
    role: user.role,
    restaurantId: user.restaurantId,
  });

const sanitizeUser = ({ motDePasseHash, ...user }) => user;

export const registerRestaurant = async ({
  nomRestaurant,
  adresse,
  nomGerant,
  email,
  motDePasse,
}) => {
  const existingUser = await prisma.user.findUnique({ where: { email } });

  if (existingUser) {
    throw new AppError(
      409,
      "EMAIL_ALREADY_EXISTS",
      "Cet email est déjà utilisé"
    );
  }

  const motDePasseHash = await hashPassword(motDePasse);

  try {
    const { restaurant, user } = await prisma.$transaction(async (tx) => {
      const restaurant = await tx.restaurant.create({
        data: {
          nom: nomRestaurant,
          adresse: adresse ?? null,
        },
      });

      const user = await tx.user.create({
        data: {
          nom: nomGerant,
          email,
          motDePasseHash,
          role: Role.GERANT,
          restaurantId: restaurant.id,
        },
      });

      return { restaurant, user };
    });

    return {
      user: sanitizeUser(user),
      restaurant,
      token: generateToken(user),
    };
  } catch (error) {
    if (error.code === "P2002") {
      throw new AppError(
        409,
        "EMAIL_ALREADY_EXISTS",
        "Cet email est déjà utilisé"
      );
    }
    throw error;
  }
};

export const login = async ({ email, motDePasse }) => {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !(await comparePassword(motDePasse, user.motDePasseHash))) {
    throw new AppError(
      401,
      "INVALID_CREDENTIALS",
      "Email ou mot de passe incorrect"
    );
  }

  if (!user.actif) {
    throw new AppError(
      403,
      "ACCOUNT_DISABLED",
      "Ce compte a été désactivé"
    );
  }

  return {
    user: sanitizeUser(user),
    token: generateToken(user),
  };
};

export const forgotPassword = async ({ email }) => {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    return { message: PASSWORD_RESET_GENERIC_MESSAGE };
  }

  const plainToken = randomUUID();
  const tokenHash = await hashPassword(plainToken);
  const expiresAt = new Date(Date.now() + RESET_TOKEN_EXPIRY_MS);

  await prisma.passwordResetToken.updateMany({
    where: { userId: user.id, used: false },
    data: { used: true },
  });

  await prisma.passwordResetToken.create({
    data: {
      token: tokenHash,
      userId: user.id,
      expiresAt,
    },
  });

  const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${plainToken}`;

  try {
    await sendPasswordResetEmail({ email: user.email, resetLink });
  } catch (error) {
    console.error("Échec envoi email de réinitialisation:", error);
  }

  return { message: PASSWORD_RESET_GENERIC_MESSAGE };
};

export const resetPassword = async ({ token, motDePasse }) => {
  const candidates = await prisma.passwordResetToken.findMany({
    where: {
      used: false,
      expiresAt: { gt: new Date() },
    },
  });

  let matchedToken = null;

  for (const candidate of candidates) {
    const isMatch = await comparePassword(token, candidate.token);

    if (isMatch) {
      matchedToken = candidate;
      break;
    }
  }

  if (!matchedToken) {
    throw new AppError(
      400,
      "INVALID_RESET_TOKEN",
      "Lien de réinitialisation invalide ou expiré"
    );
  }

  const motDePasseHash = await hashPassword(motDePasse);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: matchedToken.userId },
      data: { motDePasseHash },
    }),
    prisma.passwordResetToken.update({
      where: { id: matchedToken.id },
      data: { used: true },
    }),
  ]);

  return { message: "Mot de passe mis à jour avec succès" };
};
