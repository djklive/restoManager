import { AppError } from "../../utils/AppError.js";
import {
  listDishes,
  createDish,
  updateDish,
  updateDishAvailability,
  deleteDish,
} from "./dish.service.js";

export const listDishesController = async (req, res) => {
  const dishes = await listDishes(req.restaurantId, {
    categorieId: req.query.categorieId,
  });

  res.json({ success: true, data: { dishes } });
};

export const createDishController = async (req, res) => {
  const dish = await createDish(req.restaurantId, req.body, req.file);

  res.status(201).json({ success: true, data: { dish } });
};

export const updateDishController = async (req, res) => {
  const hasBodyUpdate = Object.keys(req.body ?? {}).length > 0;
  const hasImage = Boolean(req.file);

  if (!hasBodyUpdate && !hasImage) {
    throw new AppError(
      400,
      "VALIDATION_ERROR",
      "Au moins un champ ou une image doit être fourni"
    );
  }

  const dish = await updateDish(
    req.restaurantId,
    req.params.id,
    req.body,
    req.file
  );

  res.json({ success: true, data: { dish } });
};

export const updateDishAvailabilityController = async (req, res) => {
  const dish = await updateDishAvailability(
    req.restaurantId,
    req.params.id,
    req.body.disponible
  );

  res.json({ success: true, data: { dish } });
};

export const deleteDishController = async (req, res) => {
  const result = await deleteDish(req.restaurantId, req.params.id);

  res.json({ success: true, data: result });
};
