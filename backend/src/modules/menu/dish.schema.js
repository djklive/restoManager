import { z } from "zod";

const prixSchema = z.coerce
  .number({ invalid_type_error: "Le prix doit être un nombre" })
  .positive("Le prix doit être supérieur à 0");

export const createDishSchema = z.object({
  nom: z.string().min(1, "Le nom du plat est requis"),
  prix: prixSchema,
  description: z.string().optional(),
  categorieId: z.string().uuid("categorieId invalide"),
});

export const updateDishSchema = z.object({
  nom: z.string().min(1, "Le nom du plat est requis").optional(),
  prix: prixSchema.optional(),
  description: z.string().nullable().optional(),
  categorieId: z.string().uuid("categorieId invalide").optional(),
});

export const updateDishAvailabilitySchema = z.object({
  disponible: z.boolean({
    required_error: "Le champ disponible est requis",
  }),
});
