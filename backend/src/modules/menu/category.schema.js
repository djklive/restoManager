import { z } from "zod";

export const createCategorySchema = z.object({
  nom: z.string().min(1, "Le nom de la catégorie est requis"),
  ordre: z.number().int().optional(),
});

export const updateCategorySchema = z
  .object({
    nom: z.string().min(1, "Le nom de la catégorie est requis").optional(),
    ordre: z.number().int().optional(),
  })
  .refine((data) => data.nom !== undefined || data.ordre !== undefined, {
    message: "Au moins un champ (nom ou ordre) doit être fourni",
  });
