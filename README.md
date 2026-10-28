# MANA.love — Aimer la vie.

MANA est une compagne chaleureuse qui aide à reconnecter avec la vie, le monde
et les autres. Deux portes, également importantes : **la conversation** et
**l'exploration du monde réel**.

## Démarrage rapide

```bash
npm install
npm run dev        # http://localhost:5173
```

Scripts disponibles :

| Script              | Rôle                              |
| ------------------- | --------------------------------- |
| `npm run dev`       | Serveur de développement Vite     |
| `npm run build`     | Compilation TypeScript + build    |
| `npm run preview`   | Prévisualise le build de prod     |
| `npm run test`      | Tests unitaires (Vitest)          |
| `npm run test:watch`| Tests en mode watch               |
| `npm run lint`      | ESLint                            |
| `npm run typecheck` | Vérification TypeScript seule    |

Stack : **Vite + React 19 + TypeScript + React Router**, tests **Vitest +
Testing Library**. Architecture modulaire monolithique, front-end seulement
pour l'instant.

## Architecture

```
src/
  domain/           Logique métier pure, sans dépendance UI
    personalities.ts     Contrats des personnalités / messages
    personalityRegistry.ts  Registre canonique (MANA + démos)
    progression.ts       Règles de récompense, registre, déblocages
    exploration.ts       Contrats lieux / expériences / géo (futur)
    audio.ts             Contrats catalogue & lecture audio (futur)
    chat.ts              Contrat fournisseur IA
  infrastructure/   Adaptateurs
    persistence.ts       Cache local (localStorage) — non-autoritaire
    demoChatProvider.ts  Mode démo clairement identifié
    liveChatProvider.ts  Fournisseur serveur (routes /api)
    sampleExploreData.ts Données de démonstration (séparées de la prod)
    radioCatalog.ts      Catalogue radio (aucun contenu sous licence)
  app/              Contextes React (progression, fournisseur chat)
  components/       Coquille applicative (TopBar, MobileNav, Footer…)
  features/         Écrans : home, chat, explore, pantheon, modes, privacy
  styles/           Design tokens (palette V1) + composants partagés
```

## Palette officielle V1

| Couleur          | Hex       | Usage                                             |
| ---------------- | --------- | ------------------------------------------------- |
| Bleu nuit MANA   | `#11172B` | Fond identitaire, navigation                      |
| Indigo océan     | `#202A43` | Surfaces, panneaux de conversation                |
| Or lumière       | `#E2BD7E` | Signature rare : logo, accents, progression       |
| Ivoire lunaire   | `#F3EBDD` | Textes principaux, titres                        |
| Brume vivante    | `#A9C7C5` | Exploration, nature, lumière du jour             |

Typographie : **Cormorant Garamond** (titres, phrases signature) +
**Manrope** (interface, conversation). L'or est rare ; les pages d'exploration
s'ouvrent sur des surfaces plus claires sans perdre la signature MANA.

## État actuel — ce qui est réel vs démonstration

**Réel et fonctionnel :**

- Coquille applicative responsive (desktop + barre de navigation mobile).
- Accueil : deux portes (Parler / Explorer) d'importance égale.
- Conversation : historique persistant par personnalité (localStorage),
  états de chargement / erreur, sélection de personnalité, nouvelle
  conversation, soumission clavier (Entrée pour envoyer, Maj+Entrée = saut
  de ligne).
- Panthéon : personnalités avec identité, lore (fiction), configuration
  versionnée, seuils de déblocage.
- Progression : registre d'événements idempotents avec plafonds journaliers,
  règles versionnées, déblocages atomiques dérivés du registre.
- Exploration : browse → détail, recherche, lieux visités.
- Modes : sommeil (séance guidée texte), action (engagement déclaré),
  MANAradio (catalogue, lecture honnêtement indisponible).
- Confidentialité : page dédiée avec suppression réelle des données locales.

**Démonstration (clairement identifiée dans l'UI) :**

- Réponses de conversation : **mode démo local**, jamais présenté comme une
  sortie de modèle réelle (bannière visible dans l'écran de conversation).
- Contenu d'exploration : exemples illustratifs, **aucune donnée géographique
  réelle** (pas de coordonnées, horaires, itinéraires).
- Catalogue radio : entrées sans ressource audio — aucun contenu sous licence
  n'est diffusé.

## Intégrations en attente

Aucune de ces intégrations n'est branchée ; les frontières sont déjà en
place côté domaine :

1. **Fournisseur IA (ex. Mistral)** — `src/domain/chat.ts` définit le
   contrat `ChatProvider` ; `src/infrastructure/liveChatProvider.ts` appelle
   une route serveur `/api/chat` qui construirait le prompt système
   (`buildSystemPrompt` déjà implémenté). Les clés restent côté serveur,
   jamais dans le front. Variables attendues : `MISTRAL_API_KEY`,
   éventuellement `MISTRAL_MODEL`.
2. **Données géographiques (PostGIS, Valhalla, POI)** — le contrat
   `GeoService` (`src/domain/exploration.ts`) attend reverse-geocoding et
   estimation d'itinéraire.
3. **Audio (voix, paysages sonores)** — `src/domain/audio.ts` définit
   `AudioCatalog` / `AudioPlayer` ; le catalogue radio reste vide tant que
   les droits ne sont pas établis.
4. **Backend de progression autoritaire** — le registre est aujourd'hui un
   cache client ; le serveur devra valider les récompenses
   (idempotence, plafonds, déblocages atomiques) et servir de source de
   vérité.

## Points MANA — règles

Les points MANA sont des **points de progression ludiques** — pas de monnaie,
pas de cryptomonnaie, sans lien avec les unités MANA d'Alliance. Les
récompenses ne récompensent **jamais** le volume de messages, le temps d'écran
ni la réouverture de l'app ; uniquement des actions de découverte ou de
bien-être (ouverture de lieu, lieu visité, engagement d'action, séance de
sommeil, écoute active), avec plafonds journaliers et idempotence par ID
d'événement. Testé dans `src/domain/__tests__/progression.test.ts`.

## Vie privée

Dans cette version, toutes les données restent dans le stockage local du
navigateur (conversations par personnalité, lieux visités, registre de
points). La page `/confidentialite` permet de tout supprimer. Aucun envoi
serveur n'a lieu tant qu'aucun backend n'est configuré. Le contexte d'une
personnalité n'est jamais réutilisé pour une autre sans accord explicite.

## Variables d'environnement

Aucune n'est requise pour lancer la version actuelle. Les futures clés
(`MISTRAL_API_KEY`, etc.) seront lues **côté serveur uniquement** —
`.env` est ignoré par git ; utilisez `.env.example` comme documentation.
