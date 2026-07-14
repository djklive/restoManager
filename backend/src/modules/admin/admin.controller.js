import { listRestaurants, updateRestaurantStatus } from "./admin.service.js";

export const listRestaurantsController = async (req, res) => {
  const restaurants = await listRestaurants();

  res.json({ success: true, data: { restaurants } });
};

export const updateRestaurantStatusController = async (req, res) => {
  const restaurant = await updateRestaurantStatus(
    req.params.id,
    req.body.statutAbonnement
  );

  res.json({ success: true, data: { restaurant } });
};
