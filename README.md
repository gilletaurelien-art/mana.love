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
server/            Routes API côté serveur (plugin Vite en dev)
  index.ts              /api/health, montage des routes
  chat.ts               /api/chat → proxy Mistral (clé jamais exposée)
  geo.ts                /api/places/nearby (Overpass), /api/geo/reverse (Nominatim)
src/
  domain/           Logique métier pure, sans dépendance UI
    personalities.ts     Contrats des personnalités / messages
    personalityRegistry.ts  Registre canonique (MANA + démos)
    progression.ts       Règles de récompense, registre, déblocages
    exploration.ts       Contrats lieux / expériences / géo (futur)
    audio.ts             Contrats catalogue & lecture audio (futur)
    chat.ts              Contrat fournisseur IA
    systemPrompt.ts      Construction du prompt système (utilisé côté serveur)
  infrastructure/   Adaptateurs
    persistence.ts       Cache local (localStorage) — non-autoritaire
    demoChatProvider.ts  Mode démo clairement identifié
    liveChatProvider.ts  Fournisseur serveur (routes /api)
    sampleExploreData.ts Données de démonstration (séparées de la prod)
    osmExploreService.ts Client des routes /api (Overpass/Nominatim proxifiés)
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

**Réel et fonctionnel avec configuration :**

- Conversation **Mistral** : dès que `MISTRAL_API_KEY` est définie dans
  `.env.local`, les réponses viennent du modèle (prompt système avec
  garde-fous éthiques, construit côté serveur).
- Exploration **OpenStreetMap** : lieux naturels réels autour de
  l'utilisateur (Overpass) + localité (Nominatim), attributions ODbL.

**Démonstration (clairement identifiée dans l'UI) :**

- Réponses de conversation sans clé : **mode démo local**, jamais présenté
  comme une sortie de modèle réelle (bannière visible).
- Contenu d'exploration sans géolocalisation : exemples illustratifs,
  **aucune donnée géographique réelle** (pas de coordonnées, horaires,
  itinéraires).
- Catalogue radio : entrées sans ressource audio — aucun contenu sous licence
  n'est diffusé.

## Intégrations configurées

### Mistral (conversation) — branché, activé par clé

La conversation passe par la route serveur `/api/chat` qui proxifie
l'API Mistral. Sans `MISTRAL_API_KEY`, l'application bascule
automatiquement et honnêtement en **mode démo local** (bannière visible
dans l'écran de conversation) ; avec la clé, le badge « Mistral · connecté »
s'affiche et les réponses viennent du modèle.

```bash
cp .env.example .env.local
# éditez .env.local : MISTRAL_API_KEY=... (optionnel : MISTRAL_MODEL)
npm run dev
```

- La clé est lue **côté serveur uniquement** (`server/chat.ts`) ; le
  navigateur ne la voit jamais.
- Le prompt système est reconstruit côté serveur depuis le registre de
  personnalités (`src/domain/systemPrompt.ts`), avec les garde-fous
  éthiques (pas de jalousie, pas de pression, rappel que MANA est une IA).
- `MISTRAL_API_KEY` est requise ; `MISTRAL_MODEL` est optionnelle
  (défaut : `mistral-small-latest`).

### OpenStreetMap (exploration) — branché, sur demande utilisateur

L'exploration propose deux sources, clairement étiquetées :

- **Contenu de démonstration** (défaut) : fiches illustratives, aucune
  donnée réelle.
- **Lieux réels autour de vous** : au clic sur « Découvrir des lieux réels
  autour de moi », le navigateur demande la géolocalisation, puis les
  routes serveur interrogent **Overpass API** (POI nature/parcs/belvédères
  dans un rayon de 3 km) et **Nominatim** (localité). Attributions
  « © OpenStreetMap contributors (ODbL) » affichées.

Le proxy serveur (`server/geo.ts`) impose un User-Agent conforme à la
politique OSM, met en cache 10 minutes, et valider/normalise les
résultats. Aucune donnée de localisation n'est stockée : les coordonnées
restent en mémoire le temps de la requête.

## Intégrations en attente

1. **Routing pédestre (Valhalla/OSRM)** — `GeoService.estimateRouteTime`
   existe mais renvoie `null` ; l'UI n'affiche donc aucun temps de trajet.
2. **Audio (voix, paysages sonores)** — `src/domain/audio.ts` définit
   `AudioCatalog` / `AudioPlayer` ; le catalogue radio reste vide tant que
   les droits ne sont pas établis.
3. **Backend de progression autoritaire** — le registre est aujourd'hui un
   cache client ; le serveur devra valider les récompenses
   (idempotence, plafonds, déblocages atomiques) et servir de source de
   vérité.
4. **Serveur de production** — les routes `/api/*` sont servies par le
   plugin Vite en développement ; en production, il faut un runtime Node
   équivalent qui réutilise `server/chat.ts` et `server/geo.ts`.

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

Voir `.env.example`. Une seule variable active une intégration :

| Variable          | Effet                                                       |
| ----------------- | ----------------------------------------------------------- |
| `MISTRAL_API_KEY` | Active Mistral pour la conversation (lue côté serveur)      |
| `MISTRAL_MODEL`   | Modèle à utiliser (défaut : `mistral-small-latest`)        |

Sans clé, l'application est pleinement utilisable en mode démo. `.env` et
`.env.local` sont ignorés par git ; ne committez jamais de clé.
