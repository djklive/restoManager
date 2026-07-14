import { Role } from "@prisma/client";
import { prisma } from "../../config/db.js";
import { hashPassword } from "../auth/auth.service.js";
import { AppError } from "../../utils/AppError.js";

const sanitizeUser = ({ motDePasseHash, ...user }) => user;

export const getMe = async (userId) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    throw new AppError(404, "USER_NOT_FOUND", "Utilisateur introuvable");
  }

  return sanitizeUser(user);
};

export const listUsers = async (restaurantId) => {
  const users = await prisma.user.findMany({
    where: { restaurantId },
    orderBy: { createdAt: "asc" },
  });

  return users.map(sanitizeUser);
};

export const createUser = async (restaurantId, { nom, email, motDePasse, role }) => {
  if (role !== Role.SERVEUR && role !== Role.CAISSIER) {
    throw new AppError(
      400,
      "INVALID_ROLE",
      "Seuls les rôles SERVEUR et CAISSIER peuvent être créés"
    );
  }

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
    const user = await prisma.user.create({
      data: {
        nom,
        email,
        motDePasseHash,
        role,
        restaurantId,
      },
    });

    return sanitizeUser(user);
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

export const updateUserStatus = async (
  restaurantId,
  gerantId,
  userId,
  actif
) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user || user.restaurantId !== restaurantId) {
    throw new AppError(404, "USER_NOT_FOUND", "Utilisateur introuvable");
  }

  if (user.id === gerantId) {
    throw new AppError(
      403,
      "FORBIDDEN",
      "Vous ne pouvez pas modifier votre propre compte"
    );
  }

  if (user.role === Role.GERANT) {
    throw new AppError(
      403,
      "FORBIDDEN",
      "Vous ne pouvez pas modifier le compte d'un autre gérant"
    );
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { actif },
  });

  return sanitizeUser(updatedUser);
};
