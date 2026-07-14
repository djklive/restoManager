import { z } from "zod";

export const registerRestaurantSchema = z.object({
  nomRestaurant: z.string().min(1, "Le nom du restaurant est requis"),
  adresse: z.string().optional(),
  nomGerant: z.string().min(1, "Le nom du gérant est requis"),
  email: z.string().email("Email invalide"),
  motDePasse: z
    .string()
    .min(8, "Le mot de passe doit contenir au moins 8 caractères"),
});

export const loginSchema = z.object({
  email: z.string().email("Email invalide"),
  motDePasse: z.string().min(1, "Le mot de passe est requis"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Email invalide"),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Le token est requis"),
  motDePasse: z
    .string()
    .min(8, "Le mot de passe doit contenir au moins 8 caractères"),
});
