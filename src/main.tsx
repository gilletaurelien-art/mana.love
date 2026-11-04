import { StrictMode, Suspense, lazy } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import PageShell from "@/components/PageShell";
import { ProgressionProvider } from "@/app/ProgressionContext";
import { ChatProviderProvider } from "@/app/ChatProviderContext";
import { LanguageProvider } from "@/app/LanguageContext";
import { AuthProvider } from "@/app/AuthContext";
import { installerPhaseTempsReel } from "@/components/AtmosphereTemps";
import HomeScreen from "@/features/home/HomeScreen";
import "@/styles/tokens.css";
import "@/styles/components.css";
import "@/components/nav.css";
import "@/features/home/home.css";

/**
 * ⭐ Découpage par route (#14 a fait grossir le bundle à 565 Ko, un seul
 * chunk — chaque module ajouté depuis en payait le prix pour tout le
 * monde, y compris qui ne visite jamais `/compte` ou `/theme-astral`).
 * SEUL `HomeScreen` reste chargé d'emblée : c'est la page d'atterrissage,
 * elle doit s'afficher sans un flash de chargement. Tout le reste se
 * charge à la demande, au moment où la route est visitée.
 *
 * ⚠️ Le plus gros gain vient d'`AccountScreen` : son seul import de
 * `@supabase/supabase-js` pèse ~220 Ko (mesuré en #9) — avant ce
 * découpage, tout le monde le téléchargeait pour parler à MANA.
 */
const ChatScreen = lazy(() => import("@/features/chat/ChatScreen"));
const ExploreScreen = lazy(() => import("@/features/explore/ExploreScreen"));
const PlaceDetailScreen = lazy(() => import("@/features/explore/PlaceDetailScreen"));
const ExperienceDetailScreen = lazy(() => import("@/features/explore/ExperienceDetailScreen"));
const PantheonScreen = lazy(() => import("@/features/pantheon/PantheonScreen"));
const SleepScreen = lazy(() => import("@/features/modes/SleepScreen"));
const ActionScreen = lazy(() => import("@/features/modes/ActionScreen"));
const RadioScreen = lazy(() => import("@/features/modes/RadioScreen"));
const PrivacyScreen = lazy(() => import("@/features/privacy/PrivacyScreen"));
const AccountScreen = lazy(() => import("@/features/account/AccountScreen"));
const CielScreen = lazy(() => import("@/features/astronomie/CielScreen"));
const ThemeAstralScreen = lazy(() => import("@/features/astrologie/ThemeAstralScreen"));

function ChargementRoute() {
  return (
    <div className="stack stack-3" aria-busy="true">
      <div className="skeleton-line" style={{ width: "70%" }} />
      <div className="skeleton-line" style={{ width: "50%" }} />
    </div>
  );
}

installerPhaseTempsReel();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <LanguageProvider>
      <AuthProvider>
      <ProgressionProvider>
        <ChatProviderProvider>
          <PageShell>
            <Suspense fallback={<ChargementRoute />}>
              <Routes>
                <Route path="/" element={<HomeScreen />} />
                <Route path="/parler" element={<ChatScreen />} />
                <Route path="/explorer" element={<ExploreScreen />} />
                <Route path="/explorer/lieu/:placeId" element={<PlaceDetailScreen />} />
                <Route path="/explorer/experience/:experienceId" element={<ExperienceDetailScreen />} />
                <Route path="/univers" element={<PantheonScreen />} />
                <Route path="/sommeil" element={<SleepScreen />} />
                <Route path="/action" element={<ActionScreen />} />
                <Route path="/ecouter" element={<RadioScreen />} />
                <Route path="/compte" element={<AccountScreen />} />
                <Route path="/ciel" element={<CielScreen />} />
                <Route path="/theme-astral" element={<ThemeAstralScreen />} />
                <Route path="/confidentialite" element={<PrivacyScreen />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </PageShell>
        </ChatProviderProvider>
      </ProgressionProvider>
      </AuthProvider>
      </LanguageProvider>
    </BrowserRouter>
  </StrictMode>
);
