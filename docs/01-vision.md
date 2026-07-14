# Vision du Projet

**Nom provisoire :** RestoConnect (à confirmer/changer librement)
**Type :** Plateforme SaaS modulaire et multi-tenant de gestion de restaurants
**Contexte :** Projet de fin de cycle — Licence en Génie Logiciel (Niveau 3)
**Durée :** 4 mois

---

## 1. Le problème

Au Cameroun, les restaurateurs (fast-foods, snacks, salons de thé, restaurants) doivent
aujourd'hui choisir entre trois options, toutes insatisfaisantes :

- **Plateformes de livraison** (Yango Deli, Glomart, Bolt Food) : commissions élevées
  (20-30%), perte du contact direct avec le client.
- **WhatsApp / réseaux sociaux** : gratuit et adopté, mais 100% manuel — pas de gestion
  de stock, pas de statistiques, erreurs fréquentes.
- **Logiciels de caisse (POS) classiques** : fonctionnent hors-ligne mais coûteux,
  pas connectés à une vitrine en ligne ni au Mobile Money.

Aucune solution ne combine à la fois : coût accessible, résilience aux coupures
réseau/électricité, et intégration aux habitudes locales (WhatsApp, Mobile Money).

## 2. La solution

Une plateforme SaaS **modulaire** ("à la carte") et **offline-first**, qui permet à un
restaurateur de créer une vitrine en ligne en quelques minutes et d'activer uniquement
les modules dont il a besoin :

- Vitrine + menu digital via QR Code
- Commande client → transfert automatique vers WhatsApp
- Caisse (POS) fonctionnant même sans connexion internet
- Gestion des stocks avec seuils d'alerte
- Paiement via Orange Money / MTN MoMo

## 3. Public cible

| Acteur | Rôle |
|---|---|
| Restaurateur / gérant | Bénéficiaire principal — configure son restaurant et ses modules |
| Personnel (serveur, caissier, cuisinier) | Utilise l'application au quotidien selon son rôle |
| Client final | Consulte le menu et commande via QR Code ou vitrine web |
| Livreur indépendant (moto-taxi) | Bénéficiaire secondaire, hors périmètre du MVP |

## 4. Proposition de valeur

- **Rapide à démarrer** : vitrine fonctionnelle en moins de 10 minutes
- **Résilient** : la caisse continue de fonctionner même en cas de coupure internet
- **Léger** : optimisé pour la 3G/4G instable et les smartphones d'entrée de gamme
- **Local** : paiement Mobile Money, commande WhatsApp — pas d'habitude à changer
- **Modulaire** : le restaurateur ne paie que ce qu'il utilise

## 5. Objectifs du projet

**Objectif général**
Développer un prototype fonctionnel de plateforme SaaS modulaire de gestion de
restaurants, adapté au contexte camerounais.

**Objectifs spécifiques**
1. Permettre la création d'une vitrine de restaurant en moins de 10 minutes
2. Permettre la prise de commande avec transfert automatisé vers WhatsApp
3. Assurer le fonctionnement du module caisse en mode déconnecté
4. Intégrer les paiements Orange Money et MTN Mobile Money

## 6. Hors périmètre du MVP (à ne pas faire maintenant)

Pour éviter l'effet tunnel, ce qui suit est **explicitement exclu** de la première version :

- Logistique de livraison intégrée (attribution de livreurs, tracking GPS)
- Application mobile native (on reste en PWA)
- Facturation fiscale / comptabilité complète
- Multi-langue
- Statistiques avancées / BI (un tableau de bord basique suffit)
- Synchronisation offline complète dès le départ (voir `04-decisions.md` — approche
  incrémentale : MVP en ligne d'abord, offline ajouté ensuite)

## 7. Critères de succès du MVP

Le projet est considéré réussi si, à la fin des 4 mois :

- Un restaurateur peut créer son compte, configurer son restaurant et publier un menu
- Un client peut scanner un QR code, composer un panier, et la commande arrive sur le
  WhatsApp du restaurant
- Le module caisse permet d'enregistrer une vente sans connexion internet, puis de
  synchroniser quand la connexion revient
- Les données de deux restaurants différents sont strictement isolées (multi-tenant)
- L'application est déployée et accessible publiquement (Vercel + Railway)

## 8. Contraintes principales

- **Offline-first** : obligatoire, pas optionnel — c'est un argument central du projet
- **Low-data** : pages légères, images compressées
- **Low-cost** : infrastructure et abonnement doivent rester très accessibles
- **Délai académique** : le prototype doit être testé et déployé avant la date de dépôt