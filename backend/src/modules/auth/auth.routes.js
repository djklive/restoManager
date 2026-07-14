import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { validate } from "../../middleware/validate.js";
import {
  registerRestaurantSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "./auth.schema.js";
import {
  registerRestaurantController,
  loginController,
  logoutController,
  forgotPasswordController,
  resetPasswordController,
} from "./auth.controller.js";

const router = Router();

router.post(
  "/register-restaurant",
  validate(registerRestaurantSchema),
  asyncHandler(registerRestaurantController)
);

router.post(
  "/login",
  validate(loginSchema),
  asyncHandler(loginController)
);

router.post("/logout", asyncHandler(logoutController));

router.post(
  "/forgot-password",
  validate(forgotPasswordSchema),
  asyncHandler(forgotPasswordController)
);

router.post(
  "/reset-password",
  validate(resetPasswordSchema),
  asyncHandler(resetPasswordController)
);

export default router;
