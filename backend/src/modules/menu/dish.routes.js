import { Router } from "express";
import { Role } from "@prisma/client";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { tenantContext } from "../../middleware/tenantContext.js";
import { roleCheck } from "../../middleware/roleCheck.js";
import { validate } from "../../middleware/validate.js";
import { uploadDishImage } from "../../middleware/upload.js";
import {
  createDishSchema,
  updateDishSchema,
  updateDishAvailabilitySchema,
} from "./dish.schema.js";
import {
  listDishesController,
  createDishController,
  updateDishController,
  updateDishAvailabilityController,
  deleteDishController,
} from "./dish.controller.js";

const router = Router();

router.use(tenantContext, roleCheck(Role.GERANT));

router.get("/", asyncHandler(listDishesController));

router.post(
  "/",
  uploadDishImage,
  validate(createDishSchema),
  asyncHandler(createDishController)
);

router.patch(
  "/:id/availability",
  validate(updateDishAvailabilitySchema),
  asyncHandler(updateDishAvailabilityController)
);

router.patch(
  "/:id",
  uploadDishImage,
  validate(updateDishSchema),
  asyncHandler(updateDishController)
);

router.delete("/:id", asyncHandler(deleteDishController));

export default router;
