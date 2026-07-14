import {
  getPublicRestaurant,
  getPublicMenu,
} from "./public.service.js";

export const getPublicRestaurantController = async (req, res) => {
  const restaurant = await getPublicRestaurant(req.params.slug);

  res.json({ success: true, data: { restaurant } });
};

export const getPublicMenuController = async (req, res) => {
  const menu = await getPublicMenu(req.params.slug);

  res.json({ success: true, data: menu });
};
