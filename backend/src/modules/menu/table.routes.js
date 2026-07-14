import { Router } from "express";
import { Role } from "@prisma/client";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { tenantContext } from "../../middleware/tenantContext.js";
import { roleCheck } from "../../middleware/roleCheck.js";
import { validate } from "../../middleware/validate.js";
import { createTableSchema } from "./table.schema.js";
import {
  listTablesController,
  createTableController,
  deleteTableController,
} from "./table.controller.js";

const router = Router();

router.use(tenantContext, roleCheck(Role.GERANT));

router.get("/", asyncHandler(listTablesController));

router.post(
  "/",
  validate(createTableSchema),
  asyncHandler(createTableController)
);

router.delete("/:id", asyncHandler(deleteTableController));

export default router;
