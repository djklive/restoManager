import { prisma } from "../../config/db.js";
import { AppError } from "../../utils/AppError.js";

export const listCategories = async (restaurantId) => {
  return prisma.menuCategory.findMany({
    where: { restaurantId },
    orderBy: [{ ordre: "asc" }, { createdAt: "asc" }],
  });
};

export const createCategory = async (restaurantId, { nom, ordre }) => {
  return prisma.menuCategory.create({
    data: {
      nom,
      ordre: ordre ?? 0,
      restaurantId,
    },
  });
};

export const updateCategory = async (restaurantId, categoryId, data) => {
  const category = await prisma.menuCategory.findUnique({
    where: { id: categoryId },
  });

  if (!category || category.restaurantId !== restaurantId) {
    throw new AppError(404, "CATEGORY_NOT_FOUND", "Catégorie introuvable");
  }

  return prisma.menuCategory.update({
    where: { id: categoryId },
    data: {
      ...(data.nom !== undefined && { nom: data.nom }),
      ...(data.ordre !== undefined && { ordre: data.ordre }),
    },
  });
};

export const deleteCategory = async (restaurantId, categoryId) => {
  const category = await prisma.menuCategory.findUnique({
    where: { id: categoryId },
    include: {
      _count: { select: { dishes: true } },
    },
  });

  if (!category || category.restaurantId !== restaurantId) {
    throw new AppError(404, "CATEGORY_NOT_FOUND", "Catégorie introuvable");
  }

  if (category._count.dishes > 0) {
    throw new AppError(
      409,
      "CATEGORY_NOT_EMPTY",
      "Impossible de supprimer une catégorie qui contient encore des plats"
    );
  }

  await prisma.menuCategory.delete({ where: { id: categoryId } });

  return { id: categoryId };
};
