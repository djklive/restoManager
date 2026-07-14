/**
 * Crée un compte Admin plateforme en base (hors register-restaurant).
 *
 * Usage :
 *   node scripts/createAdmin.js
 *   node scripts/createAdmin.js --email admin@restomanager.cm --password Admin123 --nom "Admin Plateforme"
 *
 * Variables optionnelles (sinon valeurs par défaut ci-dessous) :
 *   ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NOM
 */

import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient, Role } from "@prisma/client";

const prisma = new PrismaClient();

const DEFAULTS = {
  email: "admin@restomanager.cm",
  password: "Admin123",
  nom: "Admin Plateforme",
};

const parseArgs = () => {
  const args = process.argv.slice(2);
  const options = { ...DEFAULTS };

  for (let i = 0; i < args.length; i += 1) {
    const key = args[i];
    const value = args[i + 1];

    if (key === "--email" && value) {
      options.email = value;
      i += 1;
    } else if (key === "--password" && value) {
      options.password = value;
      i += 1;
    } else if (key === "--nom" && value) {
      options.nom = value;
      i += 1;
    }
  }

  if (process.env.ADMIN_EMAIL) options.email = process.env.ADMIN_EMAIL;
  if (process.env.ADMIN_PASSWORD) options.password = process.env.ADMIN_PASSWORD;
  if (process.env.ADMIN_NOM) options.nom = process.env.ADMIN_NOM;

  return options;
};

async function createAdmin() {
  const { email, password, nom } = parseArgs();

  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL manquant dans backend/.env");
  }

  if (password.length < 8) {
    throw new Error("Le mot de passe doit contenir au moins 8 caractères");
  }

  const motDePasseHash = await bcrypt.hash(password, 10);

  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    if (existing.role === Role.ADMIN) {
      const updated = await prisma.user.update({
        where: { email },
        data: {
          nom,
          motDePasseHash,
          restaurantId: null,
          actif: true,
        },
      });

      console.log("Admin déjà existant — compte mis à jour :");
      console.log({
        id: updated.id,
        nom: updated.nom,
        email: updated.email,
        role: updated.role,
        restaurantId: updated.restaurantId,
      });
      return;
    }

    throw new Error(
      `L'email ${email} est déjà utilisé par un compte ${existing.role}. Choisis un autre email.`
    );
  }

  const admin = await prisma.user.create({
    data: {
      nom,
      email,
      motDePasseHash,
      role: Role.ADMIN,
      restaurantId: null,
      actif: true,
    },
  });

  console.log("Admin créé avec succès :");
  console.log({
    id: admin.id,
    nom: admin.nom,
    email: admin.email,
    role: admin.role,
    restaurantId: admin.restaurantId,
  });
  console.log("\nConnexion :");
  console.log(`  email    : ${email}`);
  console.log(`  password : ${password}`);
}

try {
  await createAdmin();
} catch (error) {
  console.error("Échec création admin :", error.message);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
