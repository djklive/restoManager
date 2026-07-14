import jwt from "jsonwebtoken";
import { AppError } from "../utils/AppError.js";

export const JWT_EXPIRES_IN = "2h";

const getSecret = () => {
  if (!process.env.JWT_SECRET) {
    throw new AppError(500, "INTERNAL_ERROR", "JWT_SECRET non configuré");
  }
  return process.env.JWT_SECRET;
};

export const signJwt = (payload) =>
  jwt.sign(payload, getSecret(), { expiresIn: JWT_EXPIRES_IN });

export const verifyJwt = (token) => {
  try {
    return jwt.verify(token, getSecret());
  } catch {
    throw new AppError(401, "INVALID_TOKEN", "Token invalide ou expiré");
  }
};
