import { prisma } from "../../config/db.js";
import { AppError } from "../../utils/AppError.js";

export const listRestaurants = async () => {
  const restaurants = await prisma.restaurant.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { users: true } },
    },
  });

  return restaurants.map(({ _count, ...restaurant }) => ({
    ...restaurant,
    nombreUtilisateurs: _count.users,
  }));
};

export const updateRestaurantStatus = async (restaurantId, statutAbonnement) => {
  const restaurant = await prisma.restaurant.findUnique({
    where: { id: restaurantId },
  });

  if (!restaurant) {
    throw new AppError(404, "RESTAURANT_NOT_FOUND", "Restaurant introuvable");
  }

  const updatedRestaurant = await prisma.restaurant.update({
    where: { id: restaurantId },
    data: { statutAbonnement },
  });

  return updatedRestaurant;
};
