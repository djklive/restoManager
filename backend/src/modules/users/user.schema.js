import { z } from "zod";
import { Role } from "@prisma/client";

export const createUserSchema = z.object({
  nom: z.string().min(1, "Le nom est requis"),
  email: z.string().email("Email invalide"),
  motDePasse: z
    .string()
    .min(8, "Le mot de passe doit contenir au moins 8 caractères"),
  role: z.enum([Role.SERVEUR, Role.CAISSIER], {
    errorMap: () => ({ message: "Le rôle doit être SERVEUR ou CAISSIER" }),
  }),
});

export const updateUserStatusSchema = z.object({
  actif: z.boolean({ required_error: "Le statut actif est requis" }),
});
