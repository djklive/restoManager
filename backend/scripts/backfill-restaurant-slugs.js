/**
 * Remplit slug pour les restaurants existants (après colonne nullable).
 * Usage : node scripts/backfill-restaurant-slugs.js
 */

import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { generateUniqueSlug } from "../src/utils/slug.js";

const prisma = new PrismaClient();

async function backfill() {
  const restaurants = await prisma.restaurant.findMany({
    where: { OR: [{ slug: null }, { slug: "" }] },
    orderBy: { createdAt: "asc" },
  });

  console.log(`${restaurants.length} restaurant(s) à traiter`);

  for (const restaurant of restaurants) {
    const slug = await generateUniqueSlug(restaurant.nom, async (candidate) => {
      const found = await prisma.restaurant.findFirst({
        where: {
          slug: candidate,
          NOT: { id: restaurant.id },
        },
      });
      return Boolean(found);
    });

    await prisma.restaurant.update({
      where: { id: restaurant.id },
      data: { slug },
    });

    console.log(`  ${restaurant.nom} → ${slug}`);
  }

  console.log("Backfill terminé");
}

try {
  await backfill();
} catch (error) {
  console.error("Échec backfill :", error.message);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
