# Journal d'avancement

## État global du projet

**Modules terminés :** Authentification (backend + frontend, 10/10 étapes)
**Module en cours :** Aucun — prochaine étape : démarrer le module Menu
**Stack confirmée :** voir `02-architecture.md` section 1 et `04-decisions.md`

---

## Module Authentification — TERMINÉ

**Backend (7 étapes, toutes validées) :**
- Schéma Prisma : Restaurant, User, Role (enum), PasswordResetToken
- Service auth : hash bcrypt, JWT (payload { userId, role, restaurantId }, 2h)
- Routes publiques : register-restaurant, login, logout
- Middlewares : tenantContext (rejette ADMIN), roleCheck
- Routes tenant : /users (GET/POST), /users/:id/status (PATCH), /me
- Routes admin : /admin/restaurants (GET), /admin/restaurants/:id/status (PATCH)
- forgot-password / reset-password (EmailJS, token hashé, bcrypt.compare en boucle)

**Frontend (4 écrans + 2 dashboards, tous validés) :**
- /login, /register, /forgot-password, /reset-password
- /equipe (Gérant) : liste personnel, création Serveur/Caissier, activer/désactiver
- /admin/restaurants (Admin) : liste restaurants, suspendre/activer
- /dashboard (placeholder, en attente du module Menu)
- useAuth + ProtectedRoute (vérifie session via GET /me au montage)
- UserMenu (déconnexion) présent sur toutes les pages protégées

**Tests manuels validés :**
- Isolation multi-tenant confirmée (Gérant B ne voit jamais les users du
  Restaurant A, ni en liste ni en modification)
- Compte désactivé → login refusé (403 ACCOUNT_DISABLED)
- Reset password : message générique, token à usage unique, expiration 1h
- Parcours complet register → dashboard → logout → login : fonctionnel
- Compte Admin créé manuellement (via pgAdmin) → /admin/restaurants fonctionnel

**Repo :** poussé sur GitHub, commit "Module Auth complet..."

---

## Prochaine étape

Écrire `docs/03-modules/menu.md` (cas d'utilisation, modèle Prisma, routes API,
écrans), en suivant le même format que `auth.md`.

## Points en attente / à trancher plus tard (pas bloquants)

- Dashboard Admin : pas encore responsive (menu burger) — reporté volontairement,
  audience restreinte, pas prioritaire (cf. conversation module Auth)
- Page Profil utilisateur : pas implémentée (hors périmètre auth.md) — à
  reconsidérer si un besoin réel apparaît
- Vitrine publique restaurant : pas commencée (module Menu à venir)

## Module Menu — EN COURS

**Backend — étapes terminées :**
- Étape 0 (hors séquence officielle, dette technique module Auth) : slug
  Restaurant généré à l'inscription, migration testée sur données existantes
- Étape 2 : schéma Prisma — MenuCategory, Dish, Table + relations Restaurant
- Étape 3 : Supabase Storage + compression sharp (WebP, max 1200px) —
  testé de bout en bout (upload réel → URL publique → 200)
- Étape 4 : routes catégories (GET/POST/PATCH/DELETE) — isolation
  multi-tenant testée et confirmée, 409 si suppression d'une catégorie
  non vide
- Étape 5 : routes plats (GET/POST/PATCH/DELETE + toggle disponibilité) —
  upload d'image via Multer + sharp + Supabase, isolation tenant testée

**Frontend — maquettes prêtes (Stitch → Figma) :**
- `maquette/menu/gestion-menu.png` — corrigé (toggle vert uniforme, bouton
  flottant repositionné, accès "Gérer les tables & QR Codes" ajouté)
- `maquette/menu/edition-plat.png` — validé sans modification
- `maquette/menu/gestion-tables.png` — corrigé (boutons uniformisés "Voir le
  QR", barre de navigation retirée, flèche retour renforcée)
- `maquette/menu/vitrine-publique.png` — validé sans modification
- Frontend pas encore implémenté (backend en cours, frontend prévu après
  l'étape 7 de menu.md)

**Points en attente de vérification (avant étape 6) :**
- Confirmer que Multer est bien en `memoryStorage()` (pas `diskStorage()`)
- Confirmer que le correctif "sanitize les accents" (upload Supabase)
  n'affecte que le nom du fichier physique, pas le champ `nom` du plat
  stocké en base (qui doit garder les accents, ex. "Ndolé Royal")

**Prochaine étape backend :** étape 6 — routes tables + génération QR Code
(bibliothèque `qrcode`, upload via le service déjà en place)

---

## Point en attente global (pas bloquant)

- GitHub Dependabot signale 1 vulnérabilité "high" sur une dépendance —
  à vérifier via https://github.com/djklive/restoManager/security/dependabot/1
  et corriger avec `npm audit fix` si sans risque de casse (pas encore traité)
- Dashboard Admin : pas encore responsive (menu burger) — reporté
- Page Profil utilisateur : pas implémentée — à reconsidérer si besoin réel

## Module Menu — Backend TERMINÉ, Frontend à venir

**Backend (étapes 0, 2-7, toutes validées) :**
- Slug Restaurant généré à l'inscription (migration testée)
- MenuCategory, Dish, Table (schéma Prisma + migrations)
- Supabase Storage + compression sharp (images plats en WebP, QR codes en
  PNG non compressé pour rester lisibles)
- Routes tenant catégories (CRUD + protection isolation + 409 si non vide)
- Routes tenant plats (CRUD + upload image + toggle disponibilité)
- Routes tenant tables + génération QR Code
- Routes publiques (sans auth) : infos restaurant + menu (plats désactivés
  exclus, confirmé par test)

**Tests d'isolation multi-tenant :** validés à chaque étape (catégories,
plats, tables)

**Repo :** commit à faire maintenant ("Backend module Menu complet...")

**Prochaine étape :** frontend du module Menu (étapes 8-10 de menu.md) —
écrans Gestion du menu, Gestion des tables, Vitrine publique. Maquettes déjà
prêtes dans maquette/menu/ (4 fichiers, corrections validées).