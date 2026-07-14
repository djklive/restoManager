import { z } from "zod";

export const updateRestaurantStatusSchema = z.object({
  statutAbonnement: z.enum(["actif", "suspendu"], {
    errorMap: () => ({
      message: "Le statut doit être actif ou suspendu",
    }),
  }),
});
