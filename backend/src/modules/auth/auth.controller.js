import { setTokenCookie, clearTokenCookie } from "../../config/cookies.js";
import {
  registerRestaurant,
  login,
  forgotPassword,
  resetPassword,
} from "./auth.service.js";

export const registerRestaurantController = async (req, res) => {
  const { user, restaurant, token } = await registerRestaurant(req.body);

  setTokenCookie(res, token);

  res.status(201).json({
    success: true,
    data: { user, restaurant },
  });
};

export const loginController = async (req, res) => {
  const { user, token } = await login(req.body);

  setTokenCookie(res, token);

  res.json({
    success: true,
    data: { user },
  });
};

export const logoutController = async (req, res) => {
  clearTokenCookie(res);

  res.json({
    success: true,
    data: { message: "Déconnexion réussie" },
  });
};

export const forgotPasswordController = async (req, res) => {
  const { message } = await forgotPassword(req.body);

  res.json({
    success: true,
    data: { message },
  });
};

export const resetPasswordController = async (req, res) => {
  const { message } = await resetPassword(req.body);

  res.json({
    success: true,
    data: { message },
  });
};
