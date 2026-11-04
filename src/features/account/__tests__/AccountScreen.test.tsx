import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AuthProvider } from "@/app/AuthContext";
import { LanguageProvider } from "@/app/LanguageContext";
import AccountScreen from "../AccountScreen";

/**
 * Aucun mock ici : l'environnement de test ne pose jamais
 * VITE_SUPABASE_URL/ANON_KEY, donc compteConfigure() est réellement false.
 * Voir AccountScreen.configure.test.tsx pour le chemin configuré (mocké
 * dans un fichier séparé — vi.mock se hoiste au niveau du fichier entier).
 */
describe("AccountScreen — sans configuration (état réel des tests)", () => {
  it("affiche le bandeau honnête, jamais un formulaire inerte", () => {
    render(
      <MemoryRouter>
        <LanguageProvider>
          <AuthProvider>
            <AccountScreen />
          </AuthProvider>
        </LanguageProvider>
      </MemoryRouter>
    );
    expect(screen.getByText(/Compte non configuré/)).toBeInTheDocument();
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  });
});
