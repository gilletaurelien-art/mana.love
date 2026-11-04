import type { SupabaseClient, Session } from "@supabase/supabase-js";

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
 *
 * ⭐ `@supabase/supabase-js` (~220 Ko) n'est importé qu'EN DYNAMIQUE, dans
 * `obtenirClient()` — un `import` statique en haut de fichier serait
 * inclus dans le chunk principal par Vite, téléchargé par tout le monde,
 * même qui ne configure jamais de compte (`compteConfigure() === false`,
 * le cas réel aujourd'hui) et ne visite jamais `/compte`.
 */

const URL = import.meta.env.VITE_SUPABASE_URL;
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

/** Honnête, comme `aiConfigured` pour Mistral : pas de repli silencieux. */
export function compteConfigure(): boolean {
  return Boolean(URL && ANON_KEY);
}

let client: SupabaseClient | null = null;

async function obtenirClient(): Promise<SupabaseClient | null> {
  if (!compteConfigure()) return null;
  if (!client) {
    const { createClient } = await import("@supabase/supabase-js");
    client = createClient(URL!, ANON_KEY!);
  }
  return client;
}

export interface ResultatEnvoi {
  ok: boolean;
  erreur?: string;
}

export async function envoyerLienMagique(email: string): Promise<ResultatEnvoi> {
  const c = await obtenirClient();
  if (!c) return { ok: false, erreur: "Compte non configuré." };
  const { error } = await c.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: window.location.origin },
  });
  if (error) return { ok: false, erreur: error.message };
  return { ok: true };
}

export async function obtenirSession(): Promise<Session | null> {
  const c = await obtenirClient();
  if (!c) return null;
  const { data } = await c.auth.getSession();
  return data.session;
}

/**
 * S'abonne aux changements de session. Rend la fonction de désabonnement
 * — synchrone en apparence, mais `obtenirClient()` est asynchrone (import
 * dynamique) : l'abonnement réel se fait dès que le client est prêt, et
 * le désabonnement fonctionne même appelé avant (il attend la promesse).
 */
export function ecouterSession(cb: (session: Session | null) => void): () => void {
  let desabonner: (() => void) | null = null;
  let annule = false;
  void obtenirClient().then((c) => {
    if (!c || annule) return;
    const { data } = c.auth.onAuthStateChange((_event, session) => cb(session));
    desabonner = () => data.subscription.unsubscribe();
  });
  return () => {
    annule = true;
    desabonner?.();
  };
}

export async function seDeconnecter(): Promise<void> {
  const c = await obtenirClient();
  if (!c) return;
  await c.auth.signOut();
}
