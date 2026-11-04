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
politique OSM, met en cache 10 minutes (en mémoire serveur, jamais sur
disque), et valide/normalise les résultats. ⚠️ Les coordonnées ne sont PAS
stockées côté serveur — mais elles LE SONT côté client, dans
`localStorage` (`mana.love.explore.coords.v1`, `persistence.ts`), pour
réafficher le dernier lieu sans redemander la position à chaque visite.
Elles partent avec le reste des données locales via le bouton de
suppression de `/confidentialite`.

### Routage piéton/vélo — branché, sur la fiche d'un lieu réel

`GeoService.estimateRouteTime` n'était qu'un contrat dormant (toujours
`null`). La route serveur `/api/geo/route` l'implémente désormais via
l'instance publique `routing.openstreetmap.de` (profils `foot`/`bike`,
même famille de politique d'usage qu'Overpass/Nominatim : User-Agent
conforme, cache 10 minutes, pas de production à grande échelle). Sur la
fiche d'un lieu réel, si une position a déjà été demandée pour
l'exploration, un temps de marche estimé s'affiche.

### Météo (Open-Meteo) — branché, sur la fiche d'un lieu réel

Open-Meteo (gratuit, sans clé) alimente `src/domain/meteo.ts`, qui choisit
la **meilleure fenêtre sèche** dans les 6 prochaines heures à l'endroit
d'un lieu réel — pas seulement « il va pleuvoir », mais « il y a une
fenêtre sèche vers 15h40 » quand elle existe, ou le dit explicitement
sinon. La route serveur `server/weather.ts` proxifie l'API (cache 30 min,
User-Agent conforme) ; `current_weather=true` et `timezone=auto` donnent
l'heure "maintenant" et les prévisions horaires dans le **même fuseau**
(celui du lieu), ce qui évite toute conversion de fuseau côté domaine.

⚠️ Même agent qui *propose*, pas qui *agit* : aucune réservation, aucune
alerte proactive, aucune notification, aucun déclenchement automatique
d'une suggestion dans le chat. Deux premiers pas vers « l'agent qui agit
sur l'exploration », pas la fin du chemin.

### Compte (lien magique) — client prêt, projet en attente

`/compte` affiche un formulaire email → lien de connexion (Supabase Auth,
aucun mot de passe), via `src/infrastructure/supabaseAuth.ts` et
`AuthContext`. ⚠️ **Honnête par construction** : sans
`VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY`, la page affiche
« Compte non configuré », jamais un formulaire inerte — ce sont les
**mêmes** valeurs d'environnement vides qui, aujourd'hui, font qu'aucun
compte réel n'existe.

🔴 **Le SDK Supabase ne sert ici qu'à l'authentification.** Le garde
d'origines (`scripts/check-origins.mjs`) interdit désormais, côté app
UNIQUEMENT, tout accès direct à une table (motif `identifiant.from(`,
distinct de `Array.from(`/`Buffer.from(` par construction) — la mémoire
déclarée reste lue/écrite exclusivement par le serveur, avec le rôle de
service. Vérifié par mutation (le motif a été temporairement élargi à
`.from(` nu, confirmé qu'`Array.from(`/`Buffer.from(` se seraient alors
fait refuser à tort, puis restauré).

⚠️ Le SDK ajoute ~220 Ko au bundle (308 Ko → 533 Ko) : non code-splitté
pour l'instant, chargé même pour qui ne visite jamais `/compte`.

## Intégrations en attente

1. **Audio (voix, paysages sonores)** — `src/domain/audio.ts` définit
   `AudioCatalog` / `AudioPlayer` ; le catalogue radio reste vide tant que
   les droits ne sont pas établis.
2. **Backend de progression autoritaire** — le registre est aujourd'hui un
   cache client ; le serveur devra valider les récompenses
   (idempotence, plafonds, déblocages atomiques) et servir de source de
   vérité.
3. **Serveur de production** — les routes `/api/*` sont servies par le
   plugin Vite en développement ; en production, il faut un runtime Node
   équivalent qui réutilise `server/chat.ts` et `server/geo.ts`.
5. **Mémoire déclarée et comptes** — `src/domain/memoire.ts` porte le
   contrat (genres, durées de péremption, calcul d'expiration), testé et
   vérifié indépendamment de toute base. `supabase/migrations/0001_memoire_declaree.sql`
   porte le schéma et les règles d'accès ligne par ligne — **vérifiées par
   un test d'isolation réel** (deux comptes, chacun ne peut lire, modifier
   ni supprimer que son propre souvenir ; l'écriture directe depuis un
   compte est refusée, seul le serveur écrit). L'écran de connexion (lien
   magique, `/compte`) existe désormais — voir « Compte » ci-dessus. ⚠️
   Rien de tout cela n'est déployé : aucun projet n'est provisionné,
   aucune variable d'environnement n'existe pour s'y connecter. C'est une
   décision qui ne se prend pas depuis un dépôt de code : le fondateur
   crée le projet, et seulement alors les identifiants (URL + clé) peuvent
   être posés en variables d'environnement comme `MISTRAL_API_KEY` l'est
   déjà, et la migration appliquée.

   **Moitié LECTURE du contrat, faite.** `/api/chat` accepte un champ
   `souvenirs` optionnel, le filtre par `souvenirsOperants()` et le passe à
   `buildSystemPrompt()` — un souvenir périmé ou désactivé n'atteint jamais
   le modèle, et le prompt dit explicitement que ce sont des faits déclarés
   et non des instructions. ⚠️ **Aucun client n'envoie encore ce champ** :
   il n'existe ni base provisionnée ni écran pour produire des souvenirs.
   La route est prête et testée, elle ne promet rien aujourd'hui.

   **Moitié ÉCRITURE du contrat, à faire.** La compagne qui décide de
   retenir un fait nouveau (`allowMemoryWrites` dans la forme mesurée de
   `mana-presence`) demande de lire la sortie du modèle, d'en extraire un
   souvenir, et de l'écrire avec le rôle de service. Rien de cela n'existe,
   et le champ n'a volontairement **pas** été ajouté à la requête : un
   champ inerte serait une promesse que le code ne tient pas.

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
