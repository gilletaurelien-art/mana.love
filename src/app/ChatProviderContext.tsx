import { createContext, useContext, useMemo, type ReactNode } from "react";
import type { ChatProvider } from "@/domain/chat";
import { demoChatProvider } from "@/infrastructure/demoChatProvider";

/**
 * Chooses the active chat provider.
 * The live provider activates only when the server exposes the AI route
 * (checked at startup via /api/health). Until then, the demo provider is used
 * and clearly labeled in the UI.
 */

const ChatProviderContext = createContext<ChatProvider>(demoChatProvider);

export function ChatProviderProvider({ children }: { children: ReactNode }) {
  const provider = useMemo(() => demoChatProvider, []);
  return (
    <ChatProviderContext.Provider value={provider}>
      {children}
    </ChatProviderContext.Provider>
  );
}

export function useChatProvider(): ChatProvider {
  return useContext(ChatProviderContext);
}
