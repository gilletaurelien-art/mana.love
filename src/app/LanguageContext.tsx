import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  traduire,
  lireLangue,
  ecrireLangue,
  type CleI18n,
  type Langue,
} from "@/i18n";

interface LanguageContextValue {
  langue: Langue;
  setLangue: (l: Langue) => void;
  t: (cle: CleI18n) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [langue, setLangueState] = useState<Langue>(() => lireLangue());

  const value = useMemo<LanguageContextValue>(
    () => ({
      langue,
      setLangue: (l) => {
        setLangueState(l);
        ecrireLangue(l);
      },
      t: (cle) => traduire(cle, langue),
    }),
    [langue]
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useI18n(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useI18n must be used within LanguageProvider");
  return ctx;
}
