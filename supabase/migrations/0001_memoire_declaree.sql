-- Mémoire déclarée — ce que MANA retient d'une personne, entre deux
-- conversations.
--
-- ⭐ Contrat mesuré sur le build servi de l'ancien mana.love, repris pour sa
-- qualité, sans son défaut (voir mana.love#2, la détection de détresse n'a
-- aucun interrupteur ; ici, aucun rôle ne peut lire les souvenirs d'un
-- autre, pas même un rôle applicatif privilégié mal configuré).
--
-- ⛔ LE CLIENT N'ÉCRIT JAMAIS DIRECTEMENT CETTE TABLE. L'app envoie
-- `allowMemoryWrites: true` dans sa requête de conversation, et c'est la
-- fonction serveur (jamais le navigateur) qui décide d'écrire, avec la clé
-- de service. Les trois opérations que le CLIENT peut faire directement —
-- confirmer, désactiver, supprimer — sont déjà couvertes par les policies
-- RLS ci-dessous, parce qu'elles ne créent jamais un fait nouveau : elles ne
-- font que changer le sort d'un souvenir déjà écrit par le serveur.
--
-- Voir src/domain/memoire.ts pour le contrat applicatif (durées, calcul
-- d'expiration) — cette migration ne fait qu'y donner un corps en base.

create table if not exists public.memoire_declaree (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  genre text not null check (genre in ('preference', 'intention', 'rappel', 'contexte')),
  texte text not null check (char_length(texte) between 1 and 2000),
  -- Dernière confirmation. C'est elle, pas la création, qui fait repartir
  -- le compteur de péremption — src/domain/memoire.ts:calculerExpiration.
  confirme_le timestamptz not null default now(),
  -- Dérivé de confirme_le + genre au moment de l'écriture ou de la
  -- confirmation. Stocké (et non recalculé à la volée) pour que les
  -- requêtes de nettoyage et d'affichage restent de simples comparaisons
  -- de colonnes, sans logique dupliquée côté SQL.
  expire_le timestamptz,
  desactive_le timestamptz,
  cree_le timestamptz not null default now()
);

comment on table public.memoire_declaree is
  'Souvenirs déclarés par MANA à propos d''une personne. Écriture réservée '
  'au rôle de service (fonction serveur) ; confirmer/désactiver/supprimer '
  'restent accessibles au propriétaire via RLS. Voir src/domain/memoire.ts.';

create index if not exists memoire_declaree_user_id_idx
  on public.memoire_declaree (user_id);

-- Index partiel : accélère précisément la requête qui compte, « mes
-- souvenirs encore opérants » — ni désactivés, ni périmés.
create index if not exists memoire_declaree_operants_idx
  on public.memoire_declaree (user_id, expire_le)
  where desactive_le is null;

alter table public.memoire_declaree enable row level security;

-- ⛔ AUCUNE POLICY D'INSERTION POUR authenticated. L'écriture initiale d'un
-- souvenir passe uniquement par le rôle de service, depuis la fonction
-- serveur — jamais depuis le navigateur. C'est l'absence de policy INSERT
-- ci-dessous qui porte cette garantie, pas un commentaire : PostgreSQL
-- refuse par défaut tout ce qu'aucune policy n'autorise explicitement.

create policy "memoire_declaree_lecture_proprietaire"
  on public.memoire_declaree
  for select
  to authenticated
  using (auth.uid() = user_id);

-- Confirmer repousse l'échéance (le client envoie confirme_le = now() et
-- expire_le recalculé côté client selon la même règle que memoire.ts —
-- vérifiée côté serveur avant tout usage dans un prompt).
-- Désactiver pose desactive_le = now().
-- ⚠️ with check empêche les DEUX dérives possibles d'un update : changer le
-- texte du souvenir (ce serait écrire un fait nouveau sans passer par le
-- serveur) ou se réapproprier le souvenir d'un autre en changeant user_id.
create policy "memoire_declaree_confirmer_ou_desactiver"
  on public.memoire_declaree
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "memoire_declaree_supprimer"
  on public.memoire_declaree
  for delete
  to authenticated
  using (auth.uid() = user_id);
