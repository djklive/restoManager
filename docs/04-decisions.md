cd backend

# valeurs par défaut
npm run create-admin
# → admin@restomanager.cm / Admin123

# personnalisé
node scripts/createAdmin.js --email monadmin@resto.cm --password MonMotDePasse123 --nom "Admin Plateforme"

# Décisions techniques (ADR simplifié)

Format court : Décision → Contexte → Alternatives écartées → Date/Statut.

---

## D001 — PostgreSQL plutôt que Firebase
**Décision :** PostgreSQL (local via pgAdmin, prod via Railway).
**Contexte :** SaaS multi-tenant avec relations complexes (menus, stocks,
commandes) — besoin de requêtes relationnelles et de transactions fiables.
**Écarté :** Firebase (NoSQL) — isolation multi-tenant plus complexe et coûteuse
à sécuriser, mauvais fit pour des données fortement relationnelles.
**Statut :** Actée, en place depuis le module Auth.

## D002 — Prisma 6 plutôt que 7
**Décision :** Prisma 6.19.
**Contexte :** Prisma 7 impose un `prisma.config.ts` séparé, incompatible avec
le format `schema.prisma` + `DATABASE_URL` simple utilisé dans ce projet.
**Statut :** Actée à l'étape 1 du module Auth.

## D003 — JWT en cookie httpOnly plutôt que localStorage
**Décision :** cookie httpOnly, `secure`/`sameSite` conditionnels à `NODE_ENV`
(`none`+`secure` en prod pour le cross-domain Vercel/Railway, `lax` en local).
**Contexte :** protection contre le vol de token via XSS.
**Statut :** Actée à l'étape 3 du module Auth.

## D004 — Rôle Admin plateforme séparé du Gérant
**Décision :** 4 rôles sur 2 niveaux — ADMIN (plateforme, `restaurantId` null,
hors `tenantContext`) / GERANT (admin du restaurant) / SERVEUR / CAISSIER.
**Contexte :** besoin de gérer les restaurants/abonnements globalement, sans
mélanger ça avec la gestion interne d'un restaurant.
**Statut :** Actée section 5 de `02-architecture.md`.

## D005 — Offline-first en approche incrémentale
**Décision :** MVP entièrement en ligne d'abord, PWA ensuite, puis Dexie.js
(IndexedDB), puis synchronisation — pas tout dès le départ.
**Contexte :** éviter la complexité prématurée ; Repository Pattern utilisé dès
le départ côté frontend pour faciliter l'ajout ultérieur.
**Statut :** Planifiée, pas encore commencée (prévue après plusieurs modules).

## D006 — Gestion d'erreurs centralisée (AppError + asyncHandler + errorHandler)
**Décision :** classe `AppError` custom, wrapper `asyncHandler`, middleware
d'erreur unique — contrat de réponse `{ success, data }` / `{ success: false,
error: { code, message } }` partout.
**Contexte :** cohérence sur tous les modules, debug facilité.
**Statut :** Actée, en place depuis le module Auth (section 10 de
`02-architecture.md`).

## D007 — Réinitialisation de mot de passe via bcrypt.compare en boucle
**Décision :** token en clair envoyé par email, hashé en base avec bcryptjs ;
recherche par balayage (`bcrypt.compare` sur les tokens valides), pas de
recherche directe par hash (bcrypt non déterministe).
**Écarté :** hash déterministe (SHA-256) — plus rapide à grande échelle, mais
inutile à ce volume.
**Statut :** Actée à l'étape 7 du module Auth.

## D008 — TypeScript côté frontend, JavaScript pur côté backend
**Décision :** frontend en TS/TSX depuis l'initialisation du projet ; backend
en JS (ESM) sans TypeScript.
**Contexte :** typage utile côté UI complexe (formulaires, état), backend
volontairement gardé simple pour itérer vite avec Cursor.
**Statut :** Actée, clarifiée après l'étape 8.

## D009 — Emailjs pour l'envoi d'emails (reset password)
**Décision :** `@emailjs/nodejs` (package serveur, pas la version navigateur).
**Contexte :** simple et gratuit pour un projet étudiant, pas besoin d'un vrai
service transactionnel (SendGrid, etc.) pour le volume du MVP.
**Statut :** Actée à l'étape 7 du module Auth.

## D010 — Slug du restaurant généré à l'inscription
**Décision :** champ `slug` unique sur `Restaurant`, généré automatiquement à
partir du nom (slugify + suffixe numérique en cas de collision, ex.
`le-bon-maquis`, `le-bon-maquis-2`). Non modifiable via l'API pour l'instant.
**Contexte :** nécessaire pour une URL publique lisible de la vitrine
(`/r/:slug`), plutôt que d'exposer l'UUID technique du restaurant.
**Migration :** faite en 2 étapes sur les données existantes (slug nullable →
backfill des restaurants de test → contrainte NOT NULL + UNIQUE), pour ne pas
perdre les comptes créés pendant les tests du module Auth.
**Statut :** Actée, module Menu, étape 0.

## D011 — Supabase Storage pour les images (plats, QR codes)
**Décision :** Supabase Storage, avec compression via `sharp` (conversion en
WebP, redimensionnement max 1200px) avant upload.
**Contexte :** cohérent avec la contrainte low-data du cahier des charges —
test réel : image source 11519 octets → 2038 octets après compression (~18%
de la taille originale).
**Statut :** Actée, module Menu, étape 3.

## D012 — Multer pour la réception des fichiers uploadés
**Décision :** Multer en mode `memoryStorage()` (pas `diskStorage()`), pour
recevoir les fichiers multipart/form-data côté Express avant de les passer à
`uploadImage.js` (compression + upload Supabase).
**Contexte :** `memoryStorage()` est nécessaire pour Railway, dont le système
de fichiers n'est pas persistant entre déploiements — écrire un fichier
temporaire sur disque serait inutile et risqué.
**Statut :** À confirmer — vérification en cours (voir points en attente du
journal).

## D013 — Prix des plats en Decimal, jamais en Float
**Décision :** champ `prix` typé `Decimal(10, 2)` dans le schéma Prisma.
**Contexte :** évite les erreurs d'arrondi sur des montants, importants pour
la caisse et les futurs rapports financiers.
**Statut :** Actée, module Menu, étape 2.