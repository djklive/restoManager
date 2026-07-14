import { AppError } from "../utils/AppError.js";

export const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);

  if (!result.success) {
    const message = result.error.issues[0]?.message ?? "Données invalides";
    return next(new AppError(400, "VALIDATION_ERROR", message));
  }

  req.body = result.data;
  next();
};
