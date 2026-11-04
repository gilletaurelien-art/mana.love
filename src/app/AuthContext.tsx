import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Session } from "@supabase/supabase-js";
import {
  compteConfigure,
  obtenirSession,
  ecouterSession,
  seDeconnecter,
} from "@/infrastructure/supabaseAuth";

interface EtatCompte {
  /** false tant qu'aucun projet Supabase n'est provisionné (honnête, pas de repli silencieux). */
  configure: boolean;
  session: Session | null;
  chargement: boolean;
}

const AuthContext = createContext<EtatCompte>({
  configure: false,
  session: null,
  chargement: false,
});
const AuthActionsContext = createContext<{ seDeconnecter: () => Promise<void> }>({
  seDeconnecter: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const configure = useMemo(() => compteConfigure(), []);
  const [session, setSession] = useState<Session | null>(null);
  const [chargement, setChargement] = useState(configure);

  useEffect(() => {
    // "chargement" s'initialise déjà à `configure` : false d'emblée si pas
    // configuré, donc rien à faire ici dans ce cas (pas de setState
    // synchrone en tête d'effet).
    if (!configure) return;
    let cancelled = false;
    obtenirSession().then((s) => {
      if (!cancelled) {
        setSession(s);
        setChargement(false);
      }
    });
    const desabonner = ecouterSession((s) => setSession(s));
    return () => {
      cancelled = true;
      desabonner();
    };
  }, [configure]);

  return (
    <AuthContext.Provider value={{ configure, session, chargement }}>
      <AuthActionsContext.Provider value={{ seDeconnecter }}>
        {children}
      </AuthActionsContext.Provider>
    </AuthContext.Provider>
  );
}

export function useAuth(): EtatCompte {
  return useContext(AuthContext);
}

export function useAuthActions(): { seDeconnecter: () => Promise<void> } {
  return useContext(AuthActionsContext);
}
