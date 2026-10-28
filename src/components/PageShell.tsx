import type { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import TopBar from "./TopBar";
import MobileNav from "./MobileNav";
import Footer from "./Footer";
import { useProgression } from "@/app/ProgressionContext";

/**
 * Coquille applicative. Les pages d'exploration ouvrent l'atmosphère
 * sur une lumière de jour (Brume vivante) ; les autres restent dans
 * la nuit MANA.
 */
export default function PageShell({ children }: { children: ReactNode }) {
  const { balance } = useProgression();
  const { pathname } = useLocation();
  const isDaylit = pathname.startsWith("/explorer");

  return (
    <div className="app-shell">
      <div
        className={isDaylit ? "atmosphere atmosphere--dawn" : "atmosphere"}
        aria-hidden="true"
      />
      <TopBar balance={balance} />
      <main className="app-main" id="contenu">
        {children}
      </main>
      <Footer />
      <MobileNav />
    </div>
  );
}
