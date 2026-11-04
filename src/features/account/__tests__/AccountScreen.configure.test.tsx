import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

/**
 * 🔴 Test d'intégration : les tests de supabaseAuth.test.ts prouvent que
 * compteConfigure()/envoyerLienMagique() sont honnêtes en isolation, pas
 * que AccountScreen les utilise correctement (afficher le formulaire
 * seulement si configuré, afficher l'erreur reçue, etc). `supabaseAuth` est
 * mocké pour tout ce fichier — voir AccountScreen.test.tsx pour l'état
 * réel "non configuré", testé sans mock.
 */

const envoyerLienMagiqueMock = vi.fn();

vi.mock("@/infrastructure/supabaseAuth", () => ({
  compteConfigure: () => true,
  obtenirSession: async () => null,
  ecouterSession: () => () => {},
  seDeconnecter: async () => {},
  envoyerLienMagique: (...args: unknown[]) => envoyerLienMagiqueMock(...args),
}));

beforeEach(() => {
  envoyerLienMagiqueMock.mockReset();
});

async function renderCompte() {
  const { AuthProvider } = await import("@/app/AuthContext");
  const AccountScreen = (await import("../AccountScreen")).default;
  render(
    <MemoryRouter>
      <AuthProvider>
        <AccountScreen />
      </AuthProvider>
    </MemoryRouter>
  );
}

describe("AccountScreen — configuré (mocké)", () => {
  it("affiche le formulaire email une fois configuré, sans session", async () => {
    await renderCompte();
    await waitFor(() => expect(screen.getByRole("textbox")).toBeInTheDocument());
  });

  it("🔴 un envoi réussi affiche la confirmation, pas le formulaire", async () => {
    envoyerLienMagiqueMock.mockResolvedValue({ ok: true });
    await renderCompte();
    const champ = await screen.findByRole("textbox");
    fireEvent.change(champ, { target: { value: "quelqu'un@example.com" } });
    fireEvent.click(screen.getByRole("button", { name: /recevoir le lien/i }));
    await waitFor(() =>
      expect(screen.getByText(/Lien envoyé à/)).toBeInTheDocument()
    );
    expect(envoyerLienMagiqueMock).toHaveBeenCalledWith("quelqu'un@example.com");
  });

  it("🔴 un échec affiche le message d'erreur reçu, pas un succès silencieux", async () => {
    envoyerLienMagiqueMock.mockResolvedValue({ ok: false, erreur: "Email invalide." });
    await renderCompte();
    const champ = await screen.findByRole("textbox");
    fireEvent.change(champ, { target: { value: "refuse@example.com" } });
    fireEvent.click(screen.getByRole("button", { name: /recevoir le lien/i }));
    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("Email invalide."));
    expect(screen.queryByText(/Lien envoyé à/)).not.toBeInTheDocument();
  });
});
