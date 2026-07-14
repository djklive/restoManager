import { Router } from "express";
import { Role } from "@prisma/client";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { authenticate } from "../../middleware/authenticate.js";
import { roleCheck } from "../../middleware/roleCheck.js";
import { validate } from "../../middleware/validate.js";
import { updateRestaurantStatusSchema } from "./admin.schema.js";
import {
  listRestaurantsController,
  updateRestaurantStatusController,
} from "./admin.controller.js";

const router = Router();

router.use(authenticate, roleCheck(Role.ADMIN));

router.get("/", asyncHandler(listRestaurantsController));

router.patch(
  "/:id/status",
  validate(updateRestaurantStatusSchema),
  asyncHandler(updateRestaurantStatusController)
);

export default router;
