import { useState } from "react";
import { useI18n } from "@/app/LanguageContext";
import "./privacy.css";

export default function PrivacyScreen() {
  const { t } = useI18n();
  return (
    <article className="privacy">
      <div className="page-header">
        <p className="eyebrow">{t("common.confidentialite")}</p>
        <h1>{t("privacy.titre")}</h1>
      </div>

      <section className="stack stack-4">
        <h2>{t("privacy.stockeTitre")}</h2>
        <p className="muted">{t("privacy.stockeTexte1")}</p>
        <p className="muted">{t("privacy.stockeTexte2")}</p>
      </section>

      <section className="stack stack-4">
        <h2>{t("privacy.neFaisonsPasTitre")}</h2>
        <ul className="privacy__list">
          <li>{t("privacy.neFaisonsPas1")}</li>
          <li>{t("privacy.neFaisonsPas2")}</li>
          <li>{t("privacy.neFaisonsPas3")}</li>
          <li>{t("privacy.neFaisonsPas4")}</li>
        </ul>
      </section>

      <section className="stack stack-4">
        <h2>{t("privacy.supprimerTitre")}</h2>
        <p className="muted">{t("privacy.supprimerTexte")}</p>
        <p className="muted quiet">{t("privacy.supprimerNote")}</p>
        <DeleteAllButton />
      </section>

      <section className="stack stack-4">
        <h2>{t("privacy.securiteTitre")}</h2>
        <p className="muted">{t("privacy.securiteTexte")}</p>
      </section>
    </article>
  );
}

function DeleteAllButton() {
  const { t } = useI18n();
  const [deleted, setDeleted] = useState(false);
  const [confirming, setConfirming] = useState(false);

  function deleteAll() {
    Object.keys(localStorage)
      .filter((k) => k.startsWith("mana.love."))
      .forEach((k) => localStorage.removeItem(k));
    setDeleted(true);
    setConfirming(false);
  }

  if (deleted) {
    return <p className="notice notice--info">{t("privacy.donneesSupprimees")}</p>;
  }

  return (
    <div className="cluster">
      {confirming ? (
        <>
          <button className="btn btn-primary" onClick={deleteAll}>
            {t("privacy.confirmerSuppression")}
          </button>
          <button className="btn btn-ghost" onClick={() => setConfirming(false)}>
            {t("privacy.annuler")}
          </button>
        </>
      ) : (
        <button className="btn btn-ghost" onClick={() => setConfirming(true)}>
          {t("privacy.supprimerToutesMesDonnees")}
        </button>
      )}
    </div>
  );
}

