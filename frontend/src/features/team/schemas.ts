import { z } from "zod";

export const createStaffSchema = z.object({
  nom: z.string().min(1, "Le nom est requis"),
  email: z.string().email("Email invalide"),
  motDePasse: z
    .string()
    .min(8, "Le mot de passe doit contenir au moins 8 caractères"),
  role: z.enum(["SERVEUR", "CAISSIER"], {
    message: "Le rôle doit être Serveur ou Caissier",
  }),
});

export type CreateStaffFormValues = z.infer<typeof createStaffSchema>;
