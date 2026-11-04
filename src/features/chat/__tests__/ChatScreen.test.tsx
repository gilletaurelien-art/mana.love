import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ChatScreen from "../ChatScreen";
import { ProgressionProvider } from "@/app/ProgressionContext";

/**
 * 🔴 Test d'intégration, pas unitaire — même raison que
 * server/__tests__/chat.test.ts (PR #2) : les tests de
 * src/domain/__tests__/intentRouter.test.ts prouvent que la CLASSIFICATION
 * est correcte, mais pas que ChatScreen l'UTILISE correctement. Un branchement
 * inversé (appeler le modèle quand l'intention n'est PAS « intime », ou
 * l'inverse) serait invisible à un test purement sur le domaine.
 */

const completeMock = vi.fn();

vi.mock("@/app/ChatProviderContext", () => ({
  useChatProvider: () => ({ name: "fake", isLive: true, complete: completeMock }),
  useChatStatus: () => ({ aiConfigured: true, checked: true }),
}));

function renderChat() {
  render(
    <MemoryRouter initialEntries={["/chat"]}>
      <ProgressionProvider>
        <ChatScreen />
      </ProgressionProvider>
    </MemoryRouter>
  );
}

function envoyer(texte: string) {
  const champ = screen.getByRole("textbox");
  fireEvent.change(champ, { target: { value: texte } });
  fireEvent.click(screen.getByRole("button", { name: /envoyer/i }));
}

beforeEach(() => {
  completeMock.mockReset();
  completeMock.mockResolvedValue({ text: "réponse du modèle", isSimulated: false });
});

describe("ChatScreen — le routeur d'intentions court-circuite avant le réseau", () => {
  it("🔴 un message trivial (« bonjour ») n'appelle JAMAIS provider.complete", async () => {
    renderChat();
    envoyer("bonjour");

    await waitFor(() => {
      const items = within(screen.getByRole("list")).getAllByRole("listitem");
      // le message envoyé + la relance scriptée
      expect(items.length).toBeGreaterThanOrEqual(2);
    });

    expect(completeMock).not.toHaveBeenCalled();
    expect(screen.queryByText("réponse du modèle")).not.toBeInTheDocument();
  });

  it("un message substantiel appelle bien provider.complete", async () => {
    renderChat();
    envoyer(
      "Je voulais vous parler d'un souci avec mon travail en ce moment, ça me pèse un peu"
    );

    await waitFor(() => {
      expect(completeMock).toHaveBeenCalledTimes(1);
    });
    await waitFor(() => {
      expect(screen.getByText("réponse du modèle")).toBeInTheDocument();
    });
  });

  it("une clôture (« non merci ») répond sans appeler le modèle non plus", async () => {
    renderChat();
    envoyer("non merci");

    await waitFor(() => {
      const items = within(screen.getByRole("list")).getAllByRole("listitem");
      expect(items.length).toBeGreaterThanOrEqual(2);
    });
    expect(completeMock).not.toHaveBeenCalled();
  });
});
