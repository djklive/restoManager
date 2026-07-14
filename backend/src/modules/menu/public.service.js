import { prisma } from "../../config/db.js";
import { AppError } from "../../utils/AppError.js";
import { serializeDish } from "./dish.service.js";

const getRestaurantBySlug = async (slug) => {
  const restaurant = await prisma.restaurant.findUnique({
    where: { slug },
  });

  if (!restaurant) {
    throw new AppError(404, "RESTAURANT_NOT_FOUND", "Restaurant introuvable");
  }

  return restaurant;
};

export const getPublicRestaurant = async (slug) => {
  const restaurant = await getRestaurantBySlug(slug);

  return {
    nom: restaurant.nom,
    logoUrl: restaurant.logoUrl,
    adresse: restaurant.adresse,
    slug: restaurant.slug,
  };
};

export const getPublicMenu = async (slug) => {
  const restaurant = await getRestaurantBySlug(slug);

  const categories = await prisma.menuCategory.findMany({
    where: { restaurantId: restaurant.id },
    orderBy: [{ ordre: "asc" }, { createdAt: "asc" }],
    include: {
      dishes: {
        where: { disponible: true },
        orderBy: [{ createdAt: "asc" }],
      },
    },
  });

  return {
    restaurant: {
      nom: restaurant.nom,
      logoUrl: restaurant.logoUrl,
      adresse: restaurant.adresse,
      slug: restaurant.slug,
    },
    categories: categories.map((category) => ({
      id: category.id,
      nom: category.nom,
      ordre: category.ordre,
      dishes: category.dishes.map(serializeDish),
    })),
  };
};
