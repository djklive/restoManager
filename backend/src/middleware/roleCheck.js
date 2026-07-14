import { AppError } from "../utils/AppError.js";

export const roleCheck =
  (...rolesAutorises) =>
  (req, res, next) => {
    if (!req.user) {
      return next(
        new AppError(401, "UNAUTHORIZED", "Authentification requise")
      );
    }

    if (!rolesAutorises.includes(req.user.role)) {
      return next(new AppError(403, "FORBIDDEN", "Accès non autorisé"));
    }

    next();
  };
