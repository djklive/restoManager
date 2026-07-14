import { Router } from "express";
import { Role } from "@prisma/client";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { tenantContext } from "../../middleware/tenantContext.js";
import { roleCheck } from "../../middleware/roleCheck.js";
import { validate } from "../../middleware/validate.js";
import {
  createCategorySchema,
  updateCategorySchema,
} from "./category.schema.js";
import {
  listCategoriesController,
  createCategoryController,
  updateCategoryController,
  deleteCategoryController,
} from "./category.controller.js";

const router = Router();

router.use(tenantContext, roleCheck(Role.GERANT));

router.get("/", asyncHandler(listCategoriesController));

router.post(
  "/",
  validate(createCategorySchema),
  asyncHandler(createCategoryController)
);

router.patch(
  "/:id",
  validate(updateCategorySchema),
  asyncHandler(updateCategoryController)
);

router.delete("/:id", asyncHandler(deleteCategoryController));

export default router;
