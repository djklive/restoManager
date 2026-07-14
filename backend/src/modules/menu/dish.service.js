import { prisma } from "../../config/db.js";
import { AppError } from "../../utils/AppError.js";
import { uploadImage } from "../../utils/uploadImage.js";
import { toBaseSlug } from "../../utils/slug.js";

export const serializeDish = (dish) => ({
  ...dish,
  prix: Number(dish.prix),
});

const buildDishFileName = (label) =>
  `${Date.now()}-${toBaseSlug(String(label || "plat"))}`;

const assertCategoryInRestaurant = async (restaurantId, categorieId) => {
  const category = await prisma.menuCategory.findUnique({
    where: { id: categorieId },
  });

  if (!category || category.restaurantId !== restaurantId) {
    throw new AppError(
      404,
      "CATEGORY_NOT_FOUND",
      "Catégorie introuvable pour ce restaurant"
    );
  }

  return category;
};

const assertDishInRestaurant = async (restaurantId, dishId) => {
  const dish = await prisma.dish.findUnique({ where: { id: dishId } });

  if (!dish || dish.restaurantId !== restaurantId) {
    throw new AppError(404, "DISH_NOT_FOUND", "Plat introuvable");
  }

  return dish;
};

export const listDishes = async (restaurantId, { categorieId } = {}) => {
  const dishes = await prisma.dish.findMany({
    where: {
      restaurantId,
      ...(categorieId ? { categorieId } : {}),
    },
    orderBy: [{ createdAt: "desc" }],
    include: {
      categorie: {
        select: { id: true, nom: true, ordre: true },
      },
    },
  });

  return dishes.map(serializeDish);
};

export const createDish = async (
  restaurantId,
  { nom, prix, description, categorieId },
  imageFile
) => {
  await assertCategoryInRestaurant(restaurantId, categorieId);

  let imageUrl = null;

  if (imageFile?.buffer) {
    const uploaded = await uploadImage(imageFile.buffer, {
      folder: `restaurants/${restaurantId}/dishes`,
      fileName: buildDishFileName(nom),
    });
    imageUrl = uploaded.url;
  }

  const dish = await prisma.dish.create({
    data: {
      nom,
      prix,
      description: description ?? null,
      categorieId,
      restaurantId,
      imageUrl,
    },
    include: {
      categorie: {
        select: { id: true, nom: true, ordre: true },
      },
    },
  });

  return serializeDish(dish);
};

export const updateDish = async (restaurantId, dishId, data, imageFile) => {
  await assertDishInRestaurant(restaurantId, dishId);

  if (data.categorieId) {
    await assertCategoryInRestaurant(restaurantId, data.categorieId);
  }

  let imageUrl;

  if (imageFile?.buffer) {
    const uploaded = await uploadImage(imageFile.buffer, {
      folder: `restaurants/${restaurantId}/dishes`,
      fileName: buildDishFileName(data.nom ?? dishId),
    });
    imageUrl = uploaded.url;
  }

  const dish = await prisma.dish.update({
    where: { id: dishId },
    data: {
      ...(data.nom !== undefined && { nom: data.nom }),
      ...(data.prix !== undefined && { prix: data.prix }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.categorieId !== undefined && { categorieId: data.categorieId }),
      ...(imageUrl !== undefined && { imageUrl }),
    },
    include: {
      categorie: {
        select: { id: true, nom: true, ordre: true },
      },
    },
  });

  return serializeDish(dish);
};

export const updateDishAvailability = async (
  restaurantId,
  dishId,
  disponible
) => {
  await assertDishInRestaurant(restaurantId, dishId);

  const dish = await prisma.dish.update({
    where: { id: dishId },
    data: { disponible },
    include: {
      categorie: {
        select: { id: true, nom: true, ordre: true },
      },
    },
  });

  return serializeDish(dish);
};

export const deleteDish = async (restaurantId, dishId) => {
  await assertDishInRestaurant(restaurantId, dishId);
  await prisma.dish.delete({ where: { id: dishId } });
  return { id: dishId };
};
