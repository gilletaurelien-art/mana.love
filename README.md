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
- Astronomie (`/ciel`) : carte du ciel visible, étoiles et constellations
  réelles (catalogue HYG via d3-celestial, BSD-3-Clause), position
  calculée localement (aucune API) à partir de l'heure et du lieu —
  démonstration (Paris) sans géolocalisation, réel avec.

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

✅ Le SDK (~214 Ko) est maintenant importé **en dynamique** (`await
import("@supabase/supabase-js")`, dans `obtenirClient()`) au lieu d'un
`import` statique en haut de fichier — voir « Découpage par route » plus
bas pour la mesure et la méthode.

### Internationalisation — les dix écrans, pas seulement l'accueil

Jusqu'au 4/11, un seul écran (l'accueil) utilisait vraiment `src/i18n/` ;
les neuf autres avaient leur texte en dur, en français — un écart déjà
repéré dans le cadrage (dépôt `mana`, §V). Les dix écrans utilisent
maintenant `useI18n()` : conversation, exploration (liste, détail lieu,
détail expérience), panthéon, sommeil, action, radio, confidentialité,
compte. Un test verrouille la complétude du dictionnaire anglais (`src/i18n/__tests__/i18n.test.ts`)
— une clé FR sans équivalent EN se rabat sur le français sans jamais le
signaler ; le test l'attrape.

⚠️ **Ce que ça ne couvre PAS**, par construction, pas par oubli :
- le **contenu du domaine** — noms et lore des personnalités, lieux et
  expériences d'exemple — reste dans sa langue d'origine (français) ;
  traduire du contenu éditorial demande une traduction par entrée, pas un
  dictionnaire de chrome ;
- la **conversation elle-même** : `systemPrompt.ts:17` ordonne au modèle
  de répondre en français, verrouillé par un test — changer la langue de
  l'interface ne change pas la langue de MANA ;
- le **texte généré par le domaine** (la phrase de `decrireFenetre()`
  pour la météo) et les **messages d'erreur runtime** (échec réseau,
  etc.) restent en français — ils ne sont pas des chaînes statiques que
  ce dictionnaire peut intercepter sans faire remonter la langue jusqu'au
  domaine.

### Astronomie (`/ciel`) — carte du ciel calculée localement, aucune API

`src/domain/ciel.ts` convertit des coordonnées équatoriales (ascension
droite, déclinaison — fixes, ce que mesure un catalogue d'étoiles) en
coordonnées horizontales (altitude, azimut — ce que voit un observateur
précis, à un instant précis) par les formules classiques du temps
sidéral de Greenwich (Meeus) et de la transformation équatorial→horizontal
(Duffett-Smith). Aucun appel réseau pour la position : c'est un calcul,
pas une donnée récupérée.

Le catalogue (`public/ciel/*.json`, ~77 Ko) est dérivé de
[d3-celestial](https://github.com/ofrohn/d3-celestial) (Olaf Frohn,
BSD-3-Clause), lui-même dérivé du catalogue HYG (CC BY-SA 4.0) : 1018
étoiles de magnitude ≤ 4.6 (visibles à l'œil nu), les lignes et noms des
88 constellations. Vérifié contre une référence externe avant filtrage :
l'étoile d'identifiant 32349 dans le fichier source correspond
exactement à Sirius (même numéro HIP, même magnitude -1.44, mêmes
coordonnées) — pas une supposition sur le format du fichier.

🔴 **Vérifié par un invariant géométrique, pas par une table de
référence à croire sur parole** : pour un observateur dans l'hémisphère
nord, une étoile de déclinaison ≈ 90° (quasi au pôle céleste nord, comme
Polaris) a une altitude ≈ la latitude de l'observateur, à toute heure —
une conséquence directe de l'axe de rotation terrestre, testée sur 4
combinaisons latitude/heure. L'ambiguïté de signe de l'azimut
(Duffett-Smith) est vérifiée par symétrie est/ouest du méridien, et par
mutation (la correction de signe retirée, confirmé que le test
correspondant passe au rouge, puis restaurée).

⚠️ Démonstration (Paris) sans géolocalisation ; réel avec, via le même
bouton explicite que l'exploration — jamais une position supposée.

**Phase de la Lune** (`src/domain/lune.ts`) — même discipline : un
calcul (époque de référence + période synodique, Meeus ch. 49), pas une
donnée récupérée. ⚠️ Cette session n'a pas accès à un éphéméride en
ligne pour croiser une date précise contre un almanach — plutôt que
d'avancer une date non vérifiée, les tests portent sur des propriétés
**physiques** du cycle, vraies quelle que soit l'époque de référence
choisie : la phase se répète exactement une période synodique plus
tard, l'illumination est nulle à la nouvelle lune et maximale à la
pleine lune, et le croissant montant à J jours a la même illumination
que le croissant descendant à J jours de l'autre côté de la pleine lune
(symétrie) — vérifié par mutation sur le signe de l'illumination.
L'icône (deux arcs SVG, bord fixe + terminateur) a été vérifiée
visuellement avant intégration : les 8 phases rendues côte à côte
reproduisent la progression réelle.

### Thème astral (`/theme-astral`) — positions réelles, lecture symbolique assumée

`src/domain/themeAstral.ts` calcule la longitude écliptique réelle du
Soleil, de la Lune et des 5 planètes classiques (Mercure, Vénus, Mars,
Jupiter, Saturne) à une date donnée — éléments kepleriens moyens
(Standish/JPL, table standard 1800-2050), équation de Kepler résolue par
Newton-Raphson, rotation vers l'écliptique. Même principe que `ciel.ts` :
un calcul, pas une donnée récupérée.

⭐ **La distinction qui tient tout le module** : la position d'un astre
est un fait astronomique calculé ; le sens attribué au signe qu'elle
occupe est une tradition symbolique, pas une mesure. L'écran l'affiche
explicitement ("Lecture symbolique, pas une science") et rappelle que
MANA reste une IA — cohérent avec le garde-fou déjà posé dans
`systemPrompt.ts` ("tu n'es pas un être surnaturel"). Aucun texte
d'interprétation par signe n'est fourni : ce serait du contenu inventé
présenté comme un sens, exactement ce que ce module refuse de faire.

⚠️ **Vérification différente de celle du catalogue d'étoiles** : pas
d'identifiant à croiser contre une référence externe cette fois (les
éléments orbitaux sont reconstitués de mémoire, pas consultés cette
session). Vérifié par deux invariants physiques, vrais indépendamment de
l'exactitude fine des coefficients : la longitude du Soleil vaut
0°/90°/180°/270° aux équinoxes et solstices (vrai *par définition* du
repère écliptique) ; Mercure et Vénus ne s'éloignent jamais du Soleil
au-delà de leur élongation maximale (~28° et ~48°, conséquence directe
de leur orbite intérieure à celle de la Terre) — testé sur une année
complète, et vérifié par mutation (une rotation écliptique cassée,
confirmé que les deux bornes d'élongation sont violées, puis restaurée).

⛔ Pas d'ascendant ni de maisons dans cette première version : ils
demandent une heure de naissance précise ET un lieu, et un système de
maisons à choisir (Placidus, maisons égales…) — un chantier à part,
signalé comme tel à l'écran plutôt que deviné.

### Serveur de production — `npm run build && npm run start`

Jusqu'ici, les routes `/api/*` n'existaient que via le plugin Vite de
développement (`server/index.ts`, `configureServer`) — rien ne les
servait en production. `server/prod.ts` est un vrai serveur Node
(`node:http`) qui sert à la fois les fichiers statiques du build
(`dist/`, avec repli sur `index.html` pour les routes client React
Router) et les routes `/api/*`.

⭐ **Une seule table de routes, pas deux à maintenir en synchronisation**
(`server/routes.ts`) : le plugin Vite (dev) et le serveur de production
l'utilisent tous les deux. Avant cette PR, une route ajoutée à l'un
pouvait être oubliée dans l'autre sans qu'aucun garde ne le remarque —
exactement le risque que ce point, resté en attente depuis le début,
rendait réel à chaque nouvelle route API (#7, #8 l'ont ajoutée deux fois
à la main). Impossible maintenant : il n'y a qu'un seul endroit où une
route existe.

```bash
npm run build   # tsc + build front (dist/) + build serveur (dist-server/)
npm run start   # node dist-server/prod.js — écoute sur $PORT (3000 par défaut)
```

🔴 **Vérifié par une vraie traversée de chemin, pas une simulation** :
`fetch()` normalise lui-même les segments `..` d'une URL avant l'envoi
(comme un navigateur) — mesuré directement en envoyant la requête à la
main en TCP brut (`node:net`), seul moyen de faire parvenir au serveur
une tentative de traversée telle quelle. Avec un fichier réel placé hors
de `dist/` comme cible, confirmé que le serveur ne le sert jamais (repli
SPA), et vérifié par mutation (le garde anti-traversée retiré, confirmé
qu'un test dédié — appelant la fonction de résolution directement,
pas via HTTP — passe au rouge, puis restauré).

⚠️ Les variables d'environnement viennent de `process.env` en
production (injectées par l'hébergeur), jamais d'un fichier `.env.local`
lu sur disque comme en développement.

### Découpage par route (`React.lazy`) — mesuré, pas supposé

Avant cette PR, `main.tsx` importait les douze écrans en statique : un
seul chunk JS de **565,79 Ko** (gzip 164,61 Ko), grossissant à chaque
nouveau module (#11, #12, #13 l'ont fait grossir sans qu'aucun garde ne
s'en inquiète), téléchargé en entier par qui ne visite que la page
d'accueil.

- Tous les écrans sauf `HomeScreen` (la page d'atterrissage, affichée
  sans flash de chargement) sont maintenant chargés via
  `lazy(() => import(...))`, avec un repli `<Suspense>` minimal pendant
  le chargement de la route.
- ⭐ **Le vrai goulot n'était pas le découpage par route lui-même, mais
  un `import` statique transitif** : `AuthContext` (monté à la racine,
  pour toute l'app) importait `supabaseAuth.ts`, qui importait
  `@supabase/supabase-js` (~214 Ko) en statique — Vite l'incluait donc
  dans le chunk principal quoi qu'il arrive, même `AccountScreen` lazy,
  même sans jamais appeler `obtenirClient()` (le cas réel aujourd'hui,
  `compteConfigure()` étant `false` tant qu'aucun projet Supabase
  n'existe). Le découpage par route seul avait fait tomber le chunk
  principal à 493,09 Ko — un gain réel mais bien inférieur à ce que les
  ~220 Ko mesurés en #9 laissaient attendre.
- Fixé en rendant l'import du SDK **dynamique**, dans `obtenirClient()`
  lui-même (`const { createClient } = await import("@supabase/supabase-js")`)
  — il devient son propre chunk, jamais téléchargé tant que personne
  n'appelle réellement une fonction d'authentification.

**Mesuré** (`npm run build`, comparé avant/après) :

| | Avant (#14) | Après le découpage par route | Après l'import dynamique du SDK |
|---|---|---|---|
| Chunk principal (JS) | 565,79 Ko (gzip 164,61 Ko) | 493,09 Ko | **278,49 Ko (gzip 89,21 Ko)** |
| SDK Supabase | inclus dans le chunk principal | toujours inclus (dans `AccountScreen`, trop petit pour l'expliquer — signe qu'il restait ailleurs) | chunk séparé, ~214 Ko, chargé seulement si `obtenirClient()` est appelé |

🔴 Vérifié par la liste des chunks produits par `vite build`, pas par
lecture de code : `AccountScreen-*.js` ne pesait que 2,62 Ko après le
découpage par route seul — bien trop peu pour contenir le SDK, ce qui a
mené à chercher où il se trouvait réellement (dans le chunk principal,
via `AuthContext`) plutôt que d'accepter une baisse partielle sans
l'expliquer.

## Intégrations en attente

1. **Audio (voix, paysages sonores)** — `src/domain/audio.ts` définit
   `AudioCatalog` / `AudioPlayer` ; le catalogue radio reste vide tant que
   les droits ne sont pas établis.
2. **Backend de progression autoritaire** — le registre est aujourd'hui un
   cache client ; le serveur devra valider les récompenses
   (idempotence, plafonds, déblocages atomiques) et servir de source de
   vérité.
3. **Mémoire déclarée et comptes** — `src/domain/memoire.ts` porte le
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
