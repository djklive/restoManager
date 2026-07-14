import slugify from "slugify";

/**
 * Transforme un nom en slug base (minuscules, tirets, sans accents).
 */
export const toBaseSlug = (nom) => {
  const slug = slugify(nom, {
    lower: true,
    strict: true,
    trim: true,
    locale: "fr",
  });

  return slug || "restaurant";
};

/**
 * Génère un slug unique à partir du nom.
 * @param {string} nom
 * @param {(candidate: string) => Promise<boolean>} isTaken - true si déjà utilisé
 */
export const generateUniqueSlug = async (nom, isTaken) => {
  const base = toBaseSlug(nom);
  let candidate = base;
  let suffix = 2;

  while (await isTaken(candidate)) {
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }

  return candidate;
};
