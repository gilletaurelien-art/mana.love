import { useState, type FormEvent } from "react";
import { useAuth, useAuthActions } from "@/app/AuthContext";
import { envoyerLienMagique } from "@/infrastructure/supabaseAuth";
import { useI18n } from "@/app/LanguageContext";
import "./account.css";

type EtatEnvoi = "repos" | "envoi" | "envoye" | "erreur";

export default function AccountScreen() {
  const { configure, session, chargement } = useAuth();
  const { seDeconnecter } = useAuthActions();
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [etat, setEtat] = useState<EtatEnvoi>("repos");
  const [erreur, setErreur] = useState<string | null>(null);

  if (!configure) {
    return (
      <div className="stack stack-4 account">
        <div className="page-header">
          <p className="eyebrow">{t("account.eyebrow")}</p>
          <h1>{t("account.pasEncoreDisponible")}</h1>
        </div>
        <div className="demo-banner" role="note">
          <span aria-hidden="true">✦</span>
          <p>
            <strong>{t("account.nonConfigureTitre")}</strong> {t("account.nonConfigureTexte")}
          </p>
        </div>
      </div>
    );
  }

  if (chargement) {
    return (
      <div className="stack stack-3 account" aria-busy="true">
        <div className="skeleton-line" style={{ width: "60%" }} />
        <div className="skeleton-line" style={{ width: "40%" }} />
      </div>
    );
  }

  if (session) {
    return (
      <div className="stack stack-4 account">
        <div className="page-header">
          <p className="eyebrow">{t("account.eyebrow")}</p>
          <h1>{t("account.connecte")}</h1>
        </div>
        <p className="lead">{session.user.email}</p>
        <button
          className="btn btn-secondary"
          type="button"
          onClick={() => void seDeconnecter()}
        >
          {t("account.seDeconnecter")}
        </button>
      </div>
    );
  }

  async function envoyer(e: FormEvent): Promise<void> {
    e.preventDefault();
    setEtat("envoi");
    setErreur(null);
    const resultat = await envoyerLienMagique(email.trim());
    if (resultat.ok) {
      setEtat("envoye");
    } else {
      setEtat("erreur");
      setErreur(resultat.erreur ?? t("account.echecEnvoi"));
    }
  }

  return (
    <div className="stack stack-4 account">
      <div className="page-header">
        <p className="eyebrow">{t("account.eyebrow")}</p>
        <h1>{t("account.seConnecter")}</h1>
        <p className="lead">{t("account.lienTexte")}</p>
      </div>

      {etat === "envoye" ? (
        <p className="muted">
          {t("account.lienEnvoyeAvant")}
          <strong>{email}</strong>
          {t("account.lienEnvoyeApres")}
        </p>
      ) : (
        <form className="stack stack-3 account__form" onSubmit={envoyer}>
          <label htmlFor="account-email">{t("account.emailLabel")}</label>
          <input
            id="account-email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button className="btn btn-primary" type="submit" disabled={etat === "envoi"}>
            {etat === "envoi" ? t("account.envoiEnCours") : t("account.recevoirLeLien")}
          </button>
          {etat === "erreur" && erreur && (
            <p className="muted" role="alert">
              {erreur}
            </p>
          )}
        </form>
      )}
    </div>
  );
}
