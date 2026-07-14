import {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "./category.service.js";

export const listCategoriesController = async (req, res) => {
  const categories = await listCategories(req.restaurantId);

  res.json({ success: true, data: { categories } });
};

export const createCategoryController = async (req, res) => {
  const category = await createCategory(req.restaurantId, req.body);

  res.status(201).json({ success: true, data: { category } });
};

export const updateCategoryController = async (req, res) => {
  const category = await updateCategory(
    req.restaurantId,
    req.params.id,
    req.body
  );

  res.json({ success: true, data: { category } });
};

export const deleteCategoryController = async (req, res) => {
  const result = await deleteCategory(req.restaurantId, req.params.id);

  res.json({ success: true, data: result });
};
