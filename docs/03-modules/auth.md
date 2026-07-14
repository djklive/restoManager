# Module : Authentification & Gestion des Rôles

Dépend de : `02-architecture.md` (multi-tenant, JWT httpOnly, rôles à 2 niveaux)
Bloque : tous les autres modules (tout utilisateur et toute requête tenant en dépendent)

---

## 1. Cas d'utilisation

| # | Acteur | Cas d'utilisation |
|---|---|---|
| UC-1 | Restaurateur | S'inscrire et créer son restaurant (crée en même temps le compte Gérant) |
| UC-2 | Utilisateur (tout rôle) | Se connecter (email + mot de passe) |
| UC-3 | Utilisateur (tout rôle) | Se déconnecter |
| UC-4 | Gérant | Créer un compte Serveur ou Caissier pour son restaurant |
| UC-5 | Gérant | Désactiver / réactiver un compte de son personnel |
| UC-6 | Admin plateforme | Voir la liste de tous les restaurants inscrits |
| UC-7 | Admin plateforme | Activer / suspendre un restaurant (ex. abonnement impayé) |
| UC-8 | Utilisateur (tout rôle) | Demander une réinitialisation de mot de passe par email |
| UC-9 | Utilisateur (tout rôle) | Définir un nouveau mot de passe via le lien reçu |

---

## 2. Modèle de données (Prisma)

```prisma
model Restaurant {
  id            String   @id @default(uuid())
  nom           String
  adresse       String?
  logoUrl       String?
  statutAbonnement String @default("actif") // actif | suspendu
  createdAt     DateTime @default(now())

  users         User[]
}

model User {
  id            String   @id @default(uuid())
  nom           String
  email         String   @unique
  motDePasseHash String
  role          Role
  restaurantId  String?  // null uniquement pour role = ADMIN
  restaurant    Restaurant? @relation(fields: [restaurantId], references: [id])
  actif         Boolean  @default(true)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

enum Role {
  ADMIN     // plateforme, restaurantId = null
  GERANT    // admin du restaurant
  SERVEUR
  CAISSIER
}

model PasswordResetToken {
  id        String   @id @default(uuid())
  token     String   @unique          // valeur aléatoire, envoyée dans le lien email
  userId    String
  expiresAt DateTime                  // ex. now() + 1h
  used      Boolean  @default(false)
  createdAt DateTime @default(now())
}
```

**Points d'attention :**
- `email` unique globalement (pas par restaurant) — simplifie l'auth, un email = un compte.
- `motDePasseHash` via bcryptjs (jamais le mot de passe en clair, jamais retourné par l'API).
- Contrainte applicative (pas gérable nativement par Prisma) : si `role = ADMIN`,
  `restaurantId` doit être `null` — à vérifier dans le service, pas seulement en base.

---

## 3. Routes API

Toutes les routes sous `/api/v1/`.

### Publiques (pas de JWT requis)

| Méthode | Route | Description |
|---|---|---|
| POST | `/auth/register-restaurant` | Crée un `Restaurant` + un `User` (role GERANT) en une transaction |
| POST | `/auth/login` | Vérifie email/mot de passe, pose le cookie JWT httpOnly |
| POST | `/auth/logout` | Supprime le cookie |
| POST | `/auth/forgot-password` | Génère un `PasswordResetToken`, envoie l'email avec le lien |
| POST | `/auth/reset-password` | Vérifie le token (non expiré, non utilisé), met à jour le mot de passe |

### Protégées — tenant (JWT requis, `tenantContext` actif)

| Méthode | Route | Rôle requis |
|---|---|---|
| GET | `/users` | Gérant — liste le personnel de son restaurant |
| POST | `/users` | Gérant — crée un Serveur/Caissier |
| PATCH | `/users/:id/status` | Gérant — active/désactive un compte de son personnel |
| GET | `/me` | Tous — infos du profil connecté |

### Protégées — admin plateforme (JWT requis, hors `tenantContext`)

| Méthode | Route | Description |
|---|---|---|
| GET | `/admin/restaurants` | Liste tous les restaurants |
| PATCH | `/admin/restaurants/:id/status` | Suspend/active un restaurant |

**Validation Zod** sur chaque body de requête POST/PATCH avant d'atteindre le
controller (schéma partagé si possible entre frontend et backend).

---

## 4. Logique métier clé

- **register-restaurant** : transaction Prisma (`$transaction`) — si la création du
  `User` échoue, le `Restaurant` ne doit pas être créé (et inversement).
- **login** : vérifier `actif = true` avant d'émettre le token — un compte désactivé
  ne doit pas pouvoir se connecter, même avec le bon mot de passe.
- **Token JWT** : payload minimal — `{ userId, role, restaurantId }`. Durée de vie
  courte (ex. 2h) + refresh token si le temps le permet (sinon, reconnexion simple
  pour le MVP).
- **Middleware `tenantContext`** : lit `restaurantId` du token, le rend disponible
  dans `req.restaurantId`. Si `role = ADMIN`, ce middleware n'est pas appliqué (routes
  `/admin/*` séparées).
- **Middleware `roleCheck(...rolesAutorisés)`** : générique, réutilisé sur toutes les
  routes protégées pour vérifier le rôle.
- **forgot-password** : ne jamais révéler si un email existe ou non (répondre le même
  message générique dans les deux cas) — évite l'énumération de comptes. Le token est
  une chaîne aléatoire (ex. `crypto.randomUUID()`), stocké hashé en base (comme un
  mot de passe), avec une expiration courte (1h).
- **reset-password** : vérifie que le token existe, n'est pas expiré, n'est pas déjà
  `used`, puis met à jour `motDePasseHash` et marque le token `used = true`.
- **Service d'envoi d'email** : à trancher — options simples et gratuites pour un
  projet étudiant : **Emailjs** (API simple, gratuit jusqu'à un certain volume). Recommandation :
  emailjs, plus rapide à mettre en place. À noter dans `04-decisions.md` une fois choisi.
- **Configuration du cookie JWT** (posé par `/auth/login`) : doit s'adapter à
  l'environnement, car frontend (Vercel) et backend (Railway) sont sur des
  domaines différents en production.
```js
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",   // true en prod (HTTPS requis)
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 2 * 60 * 60 * 1000, // 2h, cohérent avec l'expiration du JWT
  });
```
  En local (`NODE_ENV=development`), `sameSite: "lax"` suffit puisque frontend et
  backend sont tous deux sur `localhost`.
- **Vérification du token de réinitialisation** : le token est généré en clair
  (`crypto.randomUUID()`) et envoyé uniquement par email — jamais stocké en clair
  en base. Il est hashé avec bcryptjs avant stockage (`PasswordResetToken.token`
  contient le hash, pas la valeur en clair). À la réinitialisation, le backend
  charge tous les enregistrements valides (`used = false`, `expiresAt > now`) et
  identifie le bon via `bcrypt.compare` en boucle — pas de recherche directe
  possible (bcrypt n'est pas déterministe). Acceptable à l'échelle de ce projet ;
  si le volume de tokens actifs devenait important, une alternative serait un
  hash déterministe (SHA-256) permettant une recherche directe `WHERE token = ...`.

---

## 5. Écrans (frontend)

| Écran | Rôle | Contenu | Fichier maquette |
|---|---|---|---|
| Connexion | Public | Email + mot de passe | `maquette/auth/connexion.png` |
| Inscription restaurant | Public | Formulaire : nom restaurant, nom gérant, email, mot de passe | `maquette/auth/inscription.png` |
| Mot de passe oublié | Public | Formulaire email — message générique de confirmation | `maquette/auth/mot-de-passe-oublie.png` |
| Réinitialisation | Public | Nouveau mot de passe + confirmation (accessible via lien reçu par email) | `maquette/auth/reinitialisation.png` |
| Gestion du personnel | Gérant | Liste + formulaire d'ajout Serveur/Caissier + activer/désactiver | `maquette/auth/gestion-equipe.png` |
| Dashboard admin plateforme | Admin | Liste des restaurants, statut abonnement, action suspendre/activer | `maquette/auth/dashboard-admin.png` |

---

## 6. Hors périmètre de ce module (MVP)

- Authentification à deux facteurs
- Connexion via Google/Facebook
- Refresh token (reconnexion simple après expiration du JWT de 2h — suffisant pour
  le MVP, cf. `02-architecture.md`)

---

## 7. Ordre d'implémentation suggéré (pour Cursor)

1. Schéma Prisma (`Restaurant`, `User`, `Role`, `PasswordResetToken`) + migration
2. Service `auth` : hash mot de passe, génération JWT, transaction register
3. Routes publiques : `register-restaurant`, `login`, `logout`
4. Middlewares `tenantContext` et `roleCheck`
5. Routes tenant : `/users`, `/me`
6. Routes admin : `/admin/restaurants`
7. Intégration Emailjs + routes `forgot-password` / `reset-password`
8. Frontend : formulaires inscription/connexion, appel API via `TanStack Query`
9. Frontend : écrans mot de passe oublié / réinitialisation
10. Frontend : écran gestion du personnel (Gérant)
11. Tests manuels : inscription, connexion, compte désactivé refusé, isolation
    restaurant A / restaurant B, flux complet de réinitialisation de mot de passe