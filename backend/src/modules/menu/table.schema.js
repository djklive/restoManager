import { z } from "zod";

export const createTableSchema = z.object({
  numero: z.string().min(1, "Le numéro de table est requis"),
});
