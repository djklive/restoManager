# Module : Menu & Vitrine Publique

Dépend de : `02-architecture.md` (multi-tenant, gestion d'erreurs, CORS),
`03-modules/auth.md` (tenantContext, roleCheck, rôle GERANT)
Bloque : module Commandes (une commande référence des plats existants)

---

## 1. Cas d'utilisation

| # | Acteur | Cas d'utilisation |
|---|---|---|
| UC-1 | Gérant | Créer/modifier/supprimer une catégorie de menu (ex. Entrées, Plats, Boissons) |
| UC-2 | Gérant | Créer/modifier/supprimer un plat (nom, prix, description, photo, catégorie) |
| UC-3 | Gérant | Activer/désactiver un plat (rupture de stock temporaire, sans le supprimer) |
| UC-4 | Gérant | Générer un QR Code pour une table |
| UC-5 | Gérant | Voir la liste des tables et leurs QR Codes |
| UC-6 | Client (public, sans compte) | Scanner un QR Code ou visiter l'URL du restaurant → voir le menu |
| UC-7 | Client (public) | Consulter le menu par catégorie, avec photos et prix |

---

## 2. Modèle de données (Prisma)

```prisma
model MenuCategory {
  id           String   @id @default(uuid())
  nom          String
  ordre        Int      @default(0)   // pour l'ordre d'affichage
  restaurantId String
  restaurant   Restaurant @relation(fields: [restaurantId], references: [id])
  dishes       Dish[]
  createdAt    DateTime @default(now())
}

model Dish {
  id           String   @id @default(uuid())
  nom          String
  description  String?
  prix         Decimal  @db.Decimal(10, 2)
  imageUrl     String?
  disponible   Boolean  @default(true)   // rupture temporaire sans suppression
  categorieId  String
  categorie    MenuCategory @relation(fields: [categorieId], references: [id])
  restaurantId String
  restaurant   Restaurant @relation(fields: [restaurantId], references: [id])
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}

model Table {
  id           String   @id @default(uuid())
  numero       String              // ex. "Table 5", "Terrasse 2"
  qrCodeUrl    String?             // image du QR généré, stockée (Supabase Storage)
  restaurantId String
  restaurant   Restaurant @relation(fields: [restaurantId], references: [id])
  createdAt    DateTime @default(now())
}
```

**Ajouts nécessaires sur `Restaurant` (déjà défini dans `auth.md`) :**
```prisma
// à ajouter au model Restaurant existant
slug         String   @unique   // ex. "le-bon-maquis" — utilisé dans l'URL publique
menuCategories MenuCategory[]
dishes         Dish[]
tables         Table[]
```

**Points d'attention :**
- `prix` en `Decimal`, jamais en `Float` — évite les erreurs d'arrondi sur des montants.
- `slug` sur `Restaurant` : généré à partir du nom au moment de `register-restaurant`
  (ex. "Le Bon Maquis" → `le-bon-maquis`), avec suffixe numérique si collision
  (`le-bon-maquis-2`). **Ceci nécessite une petite modification rétroactive du
  service `registerRestaurant`** (module Auth) — à faire en tout début de ce
  module, pas oublier.
- Tous les IDs en UUID, cohérent avec le reste du projet (préparation offline).
- `imageUrl` et `qrCodeUrl` : uploadés vers Supabase Storage (ou Cloudinary — à
  trancher, voir section 4), jamais stockés en local sur le serveur applicatif.

---

## 3. Routes API

Toutes les routes sous `/api/v1/`.

### Protégées — tenant (JWT requis, `tenantContext` + `roleCheck(GERANT)`)

| Méthode | Route | Description |
|---|---|---|
| GET | `/menu/categories` | Liste les catégories du restaurant |
| POST | `/menu/categories` | Crée une catégorie |
| PATCH | `/menu/categories/:id` | Modifie une catégorie (nom, ordre) |
| DELETE | `/menu/categories/:id` | Supprime une catégorie (si vide — voir logique métier) |
| GET | `/menu/dishes` | Liste les plats du restaurant |
| POST | `/menu/dishes` | Crée un plat (avec upload image) |
| PATCH | `/menu/dishes/:id` | Modifie un plat |
| PATCH | `/menu/dishes/:id/availability` | Active/désactive la disponibilité |
| DELETE | `/menu/dishes/:id` | Supprime un plat |
| GET | `/tables` | Liste les tables du restaurant |
| POST | `/tables` | Crée une table + génère son QR Code |
| DELETE | `/tables/:id` | Supprime une table |

### Publiques (aucun JWT — vitrine client)

| Méthode | Route | Description |
|---|---|---|
| GET | `/public/restaurants/:slug` | Infos publiques du restaurant (nom, logo, adresse) |
| GET | `/public/restaurants/:slug/menu` | Menu complet public (catégories + plats disponibles uniquement) |

**Validation Zod** sur chaque body POST/PATCH, cohérent avec le module Auth.

---

## 4. Logique métier clé

- **Génération du `slug`** : à l'inscription du restaurant (modification à apporter
  dans `registerRestaurant`, module Auth) — slugify du nom, vérifier l'unicité,
  ajouter un suffixe numérique si collision.
- **Suppression d'une catégorie** : refuser si elle contient encore des plats
  (`409 CATEGORY_NOT_EMPTY`) — le Gérant doit d'abord déplacer ou supprimer les
  plats. Évite les orphelins et les erreurs silencieuses.
- **Désactivation vs suppression d'un plat** : `disponible = false` pour une
  rupture temporaire (le plat reste dans l'historique, utile pour les futures
  commandes/stats) ; suppression réelle seulement si le plat n'a jamais été
  commandé (contrainte à vérifier une fois le module Commandes en place — pour
  l'instant, suppression simple autorisée).
- **Vitrine publique = lecture seule, sans authentification** : `/public/*` ne
  passe ni par `tenantContext` ni par `roleCheck` — c'est un accès anonyme
  volontaire. Le filtrage par restaurant se fait via le `slug` dans l'URL, pas
  via un token.
- **Le menu public ne renvoie que les plats `disponible = true`** — un plat
  désactivé ne doit jamais apparaître côté client.
- **Upload d'image** : à trancher avant l'implémentation — Supabase Storage
  (déjà mentionné dans `02-architecture.md`) ou Cloudinary. Recommandation :
  **Supabase Storage**, pour rester cohérent si tu utilises déjà Supabase comme
  hébergeur PostgreSQL en production (à confirmer selon ton choix Railway vs
  Supabase pour la base — actuellement `02-architecture.md` mentionne Railway
  pour la BDD, donc Supabase Storage serait ici un service à part, uniquement
  pour les fichiers). Compression/redimensionnement des images côté backend
  avant upload — cohérent avec la contrainte low-data du cahier des charges.
- **Génération du QR Code** : bibliothèque `qrcode` (npm), génère une image
  encodant l'URL `https://.../r/:slug?table=:tableId`, uploadée ensuite comme
  n'importe quelle image.

---

## 5. Écrans (frontend)

| Écran | Rôle | Contenu | Fichier maquette |
|---|---|---|---|
| Gestion du menu | Gérant | Liste des catégories + plats, CRUD, toggle disponibilité | `maquette/menu/gestion-menu.png` *(à créer)* |
| Ajout/édition d'un plat | Gérant | Formulaire : nom, prix, description, photo, catégorie | `maquette/menu/edition-plat.png` *(à créer)* |
| Gestion des tables / QR Codes | Gérant | Liste des tables, génération et affichage des QR Codes — **accessible depuis l'écran Gestion du menu** (bouton/lien, pas un onglet de la barre de navigation principale) | `maquette/menu/gestion-tables.png` |
| Vitrine publique | Client (public) | Nom du restaurant, logo, menu par catégorie, photos, prix | `maquette/menu/vitrine-publique.png` *(à créer)* |

**Note :** contrairement au module Auth, ces maquettes n'existent pas encore —
à générer avec Stitch une fois ce document validé (même méthode que pour Auth :
un prompt par écran, même charte graphique).

**Note de navigation :** la barre de navigation principale (bas d'écran) reste
fixe à 4 onglets (Orders, Menu, Staff, Reports). "Gestion des tables" n'est pas
un 5ème onglet — c'est une action de configuration ponctuelle (créée une fois,
rarement modifiée), rangée logiquement sous "Menu" puisque les QR codes de
table donnent accès au menu. On y accède via un bouton depuis l'écran Gestion
du menu, avec un bouton retour clair pour en sortir.

---

## 6. Hors périmètre de ce module (MVP)

- Le panier client et l'envoi vers WhatsApp → module **Commandes** séparé
  (ce module s'arrête à l'affichage du menu, pas à la commande)
- Gestion des stocks/ingrédients → module **Stock** séparé
- Statistiques de popularité des plats
- Variantes de plats (tailles, suppléments) — à voir si le temps le permet,
  sinon un plat = une seule ligne de prix pour le MVP

---

## 7. Ordre d'implémentation suggéré (pour Cursor)

1. Modification rétroactive : ajout de `slug` sur `Restaurant` + logique de
   génération dans `registerRestaurant` (module Auth) — migration Prisma
2. Schéma Prisma : `MenuCategory`, `Dish`, `Table` + migration
3. Configuration Supabase Storage (ou Cloudinary) + service d'upload d'images
4. Routes tenant : catégories (CRUD)
5. Routes tenant : plats (CRUD + toggle disponibilité)
6. Routes tenant : tables + génération QR Code
7. Routes publiques : `/public/restaurants/:slug` et `/public/restaurants/:slug/menu`
8. Frontend : écran Gestion du menu (liste + CRUD catégories/plats)
9. Frontend : écran Gestion des tables / QR Codes
10. Frontend : Vitrine publique (page client, sans authentification)
11. Tests manuels : isolation multi-tenant (un Gérant ne voit que son menu),
    vitrine publique accessible sans compte, plat désactivé invisible côté client