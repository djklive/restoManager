import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import {
  getPublicRestaurantController,
  getPublicMenuController,
} from "./public.controller.js";

const router = Router();

// Accès anonyme volontaire — aucun authenticate / tenantContext / roleCheck
router.get(
  "/restaurants/:slug",
  asyncHandler(getPublicRestaurantController)
);

router.get(
  "/restaurants/:slug/menu",
  asyncHandler(getPublicMenuController)
);

export default router;
