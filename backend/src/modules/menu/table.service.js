import QRCode from "qrcode";
import { prisma } from "../../config/db.js";
import { AppError } from "../../utils/AppError.js";
import { uploadImage } from "../../utils/uploadImage.js";

const getPublicTableUrl = (slug, tableId) => {
  const baseUrl = (process.env.FRONTEND_URL || "http://localhost:5173").replace(
    /\/$/,
    ""
  );
  return `${baseUrl}/r/${slug}?table=${tableId}`;
};

export const listTables = async (restaurantId) => {
  return prisma.table.findMany({
    where: { restaurantId },
    orderBy: [{ createdAt: "asc" }],
  });
};

export const createTable = async (restaurantId, { numero }) => {
  const restaurant = await prisma.restaurant.findUnique({
    where: { id: restaurantId },
  });

  if (!restaurant) {
    throw new AppError(404, "RESTAURANT_NOT_FOUND", "Restaurant introuvable");
  }

  const table = await prisma.table.create({
    data: {
      numero,
      restaurantId,
    },
  });

  const targetUrl = getPublicTableUrl(restaurant.slug, table.id);

  try {
    const qrBuffer = await QRCode.toBuffer(targetUrl, {
      type: "png",
      width: 512,
      margin: 2,
      errorCorrectionLevel: "M",
    });

    const uploaded = await uploadImage(qrBuffer, {
      folder: `restaurants/${restaurantId}/qrcodes`,
      fileName: `table-${table.id}`,
      skipCompression: true,
      contentType: "image/png",
      extension: "png",
    });

    return prisma.table.update({
      where: { id: table.id },
      data: { qrCodeUrl: uploaded.url },
    });
  } catch (error) {
    await prisma.table.delete({ where: { id: table.id } }).catch(() => {});
    throw error;
  }
};

export const deleteTable = async (restaurantId, tableId) => {
  const table = await prisma.table.findUnique({ where: { id: tableId } });

  if (!table || table.restaurantId !== restaurantId) {
    throw new AppError(404, "TABLE_NOT_FOUND", "Table introuvable");
  }

  await prisma.table.delete({ where: { id: tableId } });

  return { id: tableId };
};
