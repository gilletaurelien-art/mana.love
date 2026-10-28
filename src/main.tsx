import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import PageShell from "@/components/PageShell";
import { ProgressionProvider } from "@/app/ProgressionContext";
import { ChatProviderProvider } from "@/app/ChatProviderContext";
import HomeScreen from "@/features/home/HomeScreen";
import ChatScreen from "@/features/chat/ChatScreen";
import ExploreScreen from "@/features/explore/ExploreScreen";
import PlaceDetailScreen from "@/features/explore/PlaceDetailScreen";
import ExperienceDetailScreen from "@/features/explore/ExperienceDetailScreen";
import PantheonScreen from "@/features/pantheon/PantheonScreen";
import SleepScreen from "@/features/modes/SleepScreen";
import ActionScreen from "@/features/modes/ActionScreen";
import RadioScreen from "@/features/modes/RadioScreen";
import PrivacyScreen from "@/features/privacy/PrivacyScreen";
import "@/styles/tokens.css";
import "@/styles/components.css";
import "@/components/nav.css";
import "@/features/home/home.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <ProgressionProvider>
        <ChatProviderProvider>
          <PageShell>
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
              <Route path="/confidentialite" element={<PrivacyScreen />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </PageShell>
        </ChatProviderProvider>
      </ProgressionProvider>
    </BrowserRouter>
  </StrictMode>
);
