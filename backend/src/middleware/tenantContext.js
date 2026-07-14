import { Role } from "@prisma/client";
import { attachUserFromToken } from "./authenticate.js";
import { AppError } from "../utils/AppError.js";

export const tenantContext = (req, res, next) => {
  try {
    attachUserFromToken(req);

    if (req.user.role === Role.ADMIN) {
      throw new AppError(403, "FORBIDDEN", "Accès non autorisé");
    }

    if (!req.user.restaurantId) {
      throw new AppError(403, "FORBIDDEN", "Contexte restaurant requis");
    }

    req.restaurantId = req.user.restaurantId;
    next();
  } catch (error) {
    next(error);
  }
};
