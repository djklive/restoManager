# Architecture du Projet

Référence technique unique pour tout le projet. Toute décision qui change quelque chose
ici doit être répercutée dans ce document (et notée dans `04-decisions.md`).

---

## 1. Stack technique

| Couche | Choix | Justification courte |
|---|---|---|
| Frontend | React.js + Vite + TypeScript | Léger, rapide, typage statique pour réduire les erreurs sur un projet solo long (4 mois) |
| Style | Tailwind CSS | Rapide à écrire, bundle CSS réduit (low-data) |
| Requêtes / cache | TanStack Query | Retry auto, cache, gère bien un réseau instable |
| Validation | Zod | Un seul schéma réutilisable front + back |
| Backend | Node.js + Express | Simple, standard, bien documenté |
| ORM | Prisma | Migrations propres, très adapté à PostgreSQL |
| Base de données | PostgreSQL (local via pgAdmin, prod via Railway/Supabase) | Relationnel — nécessaire vu les relations complexes (menus, stocks, commandes) |
| Auth | JWT + bcryptjs | Standard, sans dépendance à un service tiers |
| Stockage images | Supabase Storage (ou Cloudinary) | Évite de stocker des fichiers sur le serveur applicatif |
| Offline (phase ultérieure) | Dexie.js (IndexedDB) | Ajouté après le MVP en ligne, pas dès le départ |
| Déploiement | Vercel (frontend) + Railway (backend + DB) | Déploiement automatique via Git push |

**Précision TypeScript :** le frontend est en TypeScript (`.tsx`/`.ts`) depuis
l'initialisation du projet. Le backend reste en JavaScript pur (ESM,
`"type": "module"`) — pas de TypeScript côté backend pour ce projet, afin de
garder le backend simple et rapide à itérer avec Cursor. Ne pas mélanger les
deux dans un même module : composants/hooks/api frontend en `.tsx`/`.ts`,
tout le reste du backend en `.js`.

**Décision actée :** PostgreSQL plutôt que Firebase (voir `04-decisions.md`).

---

## 2. Architecture multi-tenant

**Approche retenue : Shared Database, colonne `restaurant_id`.**

- Une seule base de données pour tous les restaurants.
- Chaque table métier (menu, plats, commandes, stocks, utilisateurs...) possède une
  colonne `restaurant_id`.
- Toutes les requêtes sont automatiquement filtrées par `restaurant_id` via un
  middleware Prisma / Express, pour empêcher qu'un restaurant A voie les données
  d'un restaurant B.

C'est l'approche la plus simple et la moins coûteuse pour un MVP hébergé sur Railway.
(Alternative écartée : un schéma PostgreSQL séparé par restaurant — trop complexe à
gérer pour ce contexte.)

---

## 3. Modèle de données (vue conceptuelle)

Entités principales et relations, avant traduction en schéma Prisma :

```
Restaurant (tenant)
 ├─ id, nom, adresse, logo, couleur_theme, statut_abonnement
 │
 ├─ User (Admin, Gérant, Serveur, Caissier)
 │   └─ id, nom, email, mot_de_passe_hash, rôle, restaurant_id
 │
 ├─ MenuCategory
 │   └─ id, nom, restaurant_id
 │       └─ Dish (plat)
 │           └─ id, nom, prix, description, image_url, categorie_id, restaurant_id
 │
 ├─ Table (pour QR Code)
 │   └─ id, numero, qr_code_url, restaurant_id
 │
 ├─ Order (commande)
 │   └─ id, statut, type (sur place/emporter/en ligne), total, table_id,
 │      restaurant_id, created_at, is_synced
 │       └─ OrderItem
 │           └─ id, dish_id, quantite, prix_unitaire, order_id
 │
 └─ Stock (ingrédient)
     └─ id, nom, quantite, seuil_alerte, unite, restaurant_id
```

**Règles à retenir dès la conception :**
- Tous les identifiants en **UUID** (pas d'auto-increment) — nécessaire pour l'offline,
  pour éviter les conflits d'ID générés hors-ligne.
- Les tables critiques pour l'offline (`Order`, `OrderItem`) ont dès maintenant :
  `updated_at` et `is_synced` (booléen), même si la synchro n'est pas codée tout de
  suite.

Le schéma Prisma détaillé sera écrit séparément (`docs/03-modules/database-schema.prisma`
ou directement dans le repo `backend/prisma/schema.prisma`) une fois chaque module
abordé.

---

## 4. Structure des dossiers

### Backend (feature-based, pas par couche technique)
backend/
├── src/
│   ├── config/            # connexion DB, variables d'env, JWT
│   ├── middleware/         # auth, roleCheck, tenantContext, errorHandler
│   ├── utils/              # AppError, asyncHandler
│   ├── modules/
│   │   ├── auth/           # route, controller, service, schema Zod
│   │   ├── restaurant/
│   │   ├── menu/
│   │   ├── orders/
│   │   └── stock/
│   └── app.js
└── prisma/
└── schema.prisma

### Frontend
frontend/
├── src/
│   ├── api/                # fonctions d'appel API (une par module)
│   ├── components/         # composants réutilisables (UI générique)
│   ├── features/
│   │   ├── auth/
│   │   ├── menu/
│   │   ├── orders/
│   │   └── pos/
│   ├── hooks/
│   └── pages/

### Maquettes (Stitch/Figma)

Un sous-dossier par module, avec le **même nom** que dans `docs/03-modules/` et
`frontend/src/features/` — les trois arborescences restent alignées.
maquette/
├── auth/
│   ├── connexion.png
│   ├── inscription.png
│   ├── mot-de-passe-oublie.png
│   ├── reinitialisation.png
│   ├── gestion-equipe.png
│   └── dashboard-admin.png
├── menu/
├── orders/
└── pos/

Convention de nommage des fichiers : minuscules, tirets, sans accents ni espaces
(ex. `gestion-equipe.png`, pas `Gestion_d_équipe_-_RestoManager.png`) — évite les
problèmes de chemin lors des références dans les prompts ou le code.

Chaque module documenté dans `docs/03-modules/*.md` référence ses fichiers
maquette dans le tableau "Écrans" (voir section 5 de chaque fichier module).

---

## 5. Authentification et rôles

- **Décision actée :** JWT stocké dans un cookie **httpOnly** (plus sûr qu'un
  localStorage, protège contre le vol de token via XSS).

- 4 rôles, répartis sur **deux niveaux** :

  | Niveau | Rôle | Portée |
  |---|---|---|
  | Plateforme | **Admin** | Aucun `restaurant_id` (nullable) — gère tous les restaurants, les abonnements, active/désactive un compte. Routes dédiées `/api/v1/admin/...`, hors du `tenantContext`. |
  | Restaurant (tenant) | **Gérant** | Admin de son propre restaurant — gère menu, stocks, utilisateurs de son établissement |
  | Restaurant (tenant) | **Serveur** | Prend les commandes |
  | Restaurant (tenant) | **Caissier** | Module POS / encaissement |

- Le middleware `tenantContext` extrait le `restaurant_id` du token et l'injecte dans
  chaque requête — aucun module *tenant* ne doit interroger la BDD sans ce filtre.
  Pour le rôle Admin, ce middleware est court-circuité (il n'a pas de `restaurant_id`).

- Conséquence sur le modèle de données : dans la table `User`, `restaurant_id` doit
  être **nullable** (seul l'Admin plateforme a cette valeur à `null`).

Détail complet dans `docs/03-modules/auth.md` (à écrire).

---

## 6. Conventions API (REST)

- Base URL : `/api/v1/...`
- Ressources au pluriel : `/api/v1/restaurants/:id/menu`, `/api/v1/orders`
- Codes HTTP standards (200, 201, 400, 401, 403, 404, 500)
- Toute requête (sauf login/register) doit contenir un JWT valide dans le header
  `Authorization: Bearer <token>`
- Validation des payloads via Zod avant d'atteindre le controller

---

## 7. Offline-first — approche retenue

Pas implémenté dès le premier module. Ordre :

1. MVP entièrement en ligne (React + Express + PostgreSQL)
2. Transformation en PWA (manifest + service worker)
3. Ajout de Dexie.js (IndexedDB) pour le stockage local des commandes
4. Écriture de la logique de synchronisation (`/api/v1/sync`)

Le code frontend suit le **Repository Pattern** dès le départ : les composants
n'appellent jamais l'API directement, ils passent par un service (ex. `OrderService`)
qui, au début, appelle l'API directement et sera modifié plus tard pour écrire dans
Dexie.js puis synchroniser. Ça évite de tout réécrire quand l'offline sera ajouté.

Détail dans `docs/03-modules/offline.md` (à écrire, plus tard dans le projet — pas
maintenant).

---

## 8. Déploiement

- Backend + PostgreSQL → Railway
- Frontend → Vercel
- Déploiement automatique sur chaque `git push origin main`
- Pas de CI/CD complexe (GitHub Actions) pour ce projet — pas nécessaire vu le délai
  et la taille de l'équipe (1 personne)

---

## 9. Prochaine étape

Écrire, module par module, un fichier dans `docs/03-modules/` en commençant par
`auth.md` (c'est le module de base dont tout le reste dépend), avec pour chacun :
cas d'utilisation, modèle Prisma du module, routes API, et écrans associés.

## 10. Gestion des erreurs (centralisée)

Le backend utilise les modules ES (`"type": "module"` dans `package.json`) —
tout le code ci-dessous est en syntaxe `import`/`export`, pas `require`.

### Backend

Aucune route ne gère ses erreurs individuellement. Tout remonte vers un point unique.

- **`AppError`** (classe custom), dans `src/utils/AppError.js` :
```js
  export class AppError extends Error {
    constructor(statusCode, code, message) {
      super(message);
      this.statusCode = statusCode; // ex: 400, 401, 404
      this.code = code;             // ex: "INVALID_CREDENTIALS", "EMAIL_ALREADY_EXISTS"
    }
  }
```

- **`asyncHandler`**, dans `src/utils/asyncHandler.js` :
```js
  export const asyncHandler = (fn) => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);
```

- **Middleware d'erreur unique**, dans `src/middleware/errorHandler.js`, monté en
  tout dernier dans `app.js` :
```js
  export const errorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const code = err.code || "INTERNAL_ERROR";
    const message = statusCode === 500 && process.env.NODE_ENV === "production"
      ? "Une erreur est survenue"
      : err.message;

    console.error(`[${new Date().toISOString()}] ${req.method} ${req.path} — ${code}:`, err);

    res.status(statusCode).json({
      success: false,
      error: { code, message },
    });
  };
```

  Dans `app.js` :
```js
  import { errorHandler } from "./middleware/errorHandler.js";
  // ... toutes les routes ...
  app.use(errorHandler); // toujours en tout dernier
```

  Note ESM : penser à l'extension `.js` dans les imports relatifs
  (`from "./errorHandler.js"`, pas `from "./errorHandler"`) — obligatoire avec
  `"type": "module"`, contrairement à CommonJS.

- Toute réponse réussie suit aussi un format cohérent : `{ success: true, data: ... }`.

### CORS

```js
import cors from "cors";

app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true, // obligatoire : le JWT est en cookie httpOnly
}));
```

Le frontend doit envoyer chaque requête avec `withCredentials: true` (axios) ou
`credentials: "include"` (fetch) — sinon le cookie JWT ne sera jamais transmis,
même si CORS est bien configuré côté serveur.

### Variables d'environnement

Le backend doit avoir un fichier `.env` (jamais commit — dans `.gitignore`) et un
`.env.example` (commit, sans valeurs sensibles) qui liste toutes les variables
attendues. Minimum pour le module Auth :
.env.example
DATABASE_URL=postgresql://user:password@localhost:5432/restoconnect
JWT_SECRET=
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
PORT=3000

- En local : `FRONTEND_URL=http://localhost:5173` (port par défaut de Vite).
- En production (Railway) : cette variable devra être mise à jour avec l'URL Vercel
  réelle du frontend déployé.
- `.env.example` doit être maintenu à jour à chaque fois qu'une nouvelle variable
  d'environnement est introduite par un module — pas seulement pour Auth.

### Frontend

- Client API unique (axios instance) configuré une seule fois avec
  `withCredentials: true` — jamais répété à chaque appel.
- **TanStack Query** : gestion d'erreur globale via `QueryCache`/`MutationCache` au
  niveau du `QueryClient` :
```js
  const queryClient = new QueryClient({
    queryCache: new QueryCache({
      onError: (error) => toast.error(error.message),
    }),
  });
```
- **ErrorBoundary** React global dans `App.jsx`.
- Un seul système de toast (ex. composant `toast` de shadcn, déjà installé) pour
  tous les messages d'erreur, affichés à partir de `error.message`.