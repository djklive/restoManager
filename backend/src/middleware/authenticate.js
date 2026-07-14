import { TOKEN_COOKIE_NAME } from "../config/cookies.js";
import { verifyJwt } from "../config/jwt.js";
import { AppError } from "../utils/AppError.js";

export const attachUserFromToken = (req) => {
  const token = req.cookies[TOKEN_COOKIE_NAME];

  if (!token) {
    throw new AppError(401, "UNAUTHORIZED", "Authentification requise");
  }

  try {
    const payload = verifyJwt(token);
    req.user = {
      userId: payload.userId,
      role: payload.role,
      restaurantId: payload.restaurantId,
    };
  } catch (error) {
    if (error instanceof AppError) {
      throw new AppError(401, "UNAUTHORIZED", "Token invalide ou expiré");
    }
    throw error;
  }
};

export const authenticate = (req, res, next) => {
  try {
    attachUserFromToken(req);
    next();
  } catch (error) {
    next(error);
  }
};
