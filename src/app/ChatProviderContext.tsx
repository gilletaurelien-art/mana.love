import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { ChatProvider } from "@/domain/chat";
import { demoChatProvider } from "@/infrastructure/demoChatProvider";
import { createLiveChatProvider } from "@/infrastructure/liveChatProvider";

/**
 * Choisit le fournisseur de conversation actif :
 * - si le serveur répond /api/health avec aiConfigured=true → Mistral via /api/chat ;
 * - sinon → mode démo local, clairement identifié dans l'UI.
 */
const liveProvider = createLiveChatProvider({ endpoint: "/api/chat" });

const ChatProviderContext = createContext<ChatProvider>(demoChatProvider);
const ChatStatusContext = createContext<{
  aiConfigured: boolean;
  checked: boolean;
}>({ aiConfigured: false, checked: false });

export function ChatProviderProvider({ children }: { children: ReactNode }) {
  const [aiConfigured, setAiConfigured] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/health")
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { aiConfigured?: boolean } | null) => {
        if (cancelled) return;
        setAiConfigured(Boolean(data?.aiConfigured));
        setChecked(true);
      })
      .catch(() => {
        if (!cancelled) setChecked(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const provider = useMemo(
    () => (aiConfigured ? liveProvider : demoChatProvider),
    [aiConfigured]
  );

  return (
    <ChatStatusContext.Provider value={{ aiConfigured, checked }}>
      <ChatProviderContext.Provider value={provider}>
        {children}
      </ChatProviderContext.Provider>
    </ChatStatusContext.Provider>
  );
}

export function useChatProvider(): ChatProvider {
  return useContext(ChatProviderContext);
}

export function useChatStatus(): { aiConfigured: boolean; checked: boolean } {
  return useContext(ChatStatusContext);
}
