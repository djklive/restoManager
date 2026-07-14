import { Router } from "express";
import { Role } from "@prisma/client";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { authenticate } from "../../middleware/authenticate.js";
import { tenantContext } from "../../middleware/tenantContext.js";
import { roleCheck } from "../../middleware/roleCheck.js";
import { validate } from "../../middleware/validate.js";
import { createUserSchema, updateUserStatusSchema } from "./user.schema.js";
import {
  getMeController,
  listUsersController,
  createUserController,
  updateUserStatusController,
} from "./user.controller.js";

const router = Router();

router.get(
  "/",
  tenantContext,
  roleCheck(Role.GERANT),
  asyncHandler(listUsersController)
);

router.post(
  "/",
  tenantContext,
  roleCheck(Role.GERANT),
  validate(createUserSchema),
  asyncHandler(createUserController)
);

router.patch(
  "/:id/status",
  tenantContext,
  roleCheck(Role.GERANT),
  validate(updateUserStatusSchema),
  asyncHandler(updateUserStatusController)
);

export const meRouter = Router();

meRouter.get(
  "/",
  authenticate,
  roleCheck(Role.ADMIN, Role.GERANT, Role.SERVEUR, Role.CAISSIER),
  asyncHandler(getMeController)
);

export default router;
