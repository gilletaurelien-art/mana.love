import { createClient, type SupabaseClient, type Session } from "@supabase/supabase-js";

/**
 * Authentification par lien magique — Supabase Auth, côté navigateur.
 *
 * ⛔ CE FICHIER NE LIT NI N'ÉCRIT JAMAIS UNE TABLE. Il n'appelle que les
 * méthodes d'authentification du client (session, lien magique,
 * déconnexion) — jamais les méthodes d'accès aux données ou de fonction
 * distante. C'est la limite que `scripts/check-origins.mjs` fait
 * respecter : le SDK Supabase est légitime ici pour l'authentification,
 * jamais pour la donnée. La mémoire déclarée reste lue/écrite uniquement
 * par le serveur, avec le rôle de service.
 *
 * ⚠️ `VITE_SUPABASE_ANON_KEY` est conçue pour être publique (comme
 * `MISTRAL_API_KEY` ne l'est pas) : la sécurité tient aux policies RLS
 * côté base (voir `supabase/migrations/0001_memoire_declaree.sql`), pas
 * au secret de cette clé.
 */

const URL = import.meta.env.VITE_SUPABASE_URL;
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

/** Honnête, comme `aiConfigured` pour Mistral : pas de repli silencieux. */
export function compteConfigure(): boolean {
  return Boolean(URL && ANON_KEY);
}

let client: SupabaseClient | null = null;

function obtenirClient(): SupabaseClient | null {
  if (!compteConfigure()) return null;
  if (!client) client = createClient(URL!, ANON_KEY!);
  return client;
}

export interface ResultatEnvoi {
  ok: boolean;
  erreur?: string;
}

export async function envoyerLienMagique(email: string): Promise<ResultatEnvoi> {
  const c = obtenirClient();
  if (!c) return { ok: false, erreur: "Compte non configuré." };
  const { error } = await c.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: window.location.origin },
  });
  if (error) return { ok: false, erreur: error.message };
  return { ok: true };
}

export async function obtenirSession(): Promise<Session | null> {
  const c = obtenirClient();
  if (!c) return null;
  const { data } = await c.auth.getSession();
  return data.session;
}

/** S'abonne aux changements de session. Rend la fonction de désabonnement. */
export function ecouterSession(cb: (session: Session | null) => void): () => void {
  const c = obtenirClient();
  if (!c) return () => {};
  const { data } = c.auth.onAuthStateChange((_event, session) => cb(session));
  return () => data.subscription.unsubscribe();
}

export async function seDeconnecter(): Promise<void> {
  const c = obtenirClient();
  if (!c) return;
  await c.auth.signOut();
}
