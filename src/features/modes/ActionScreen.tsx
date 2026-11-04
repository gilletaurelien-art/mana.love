import { useState } from "react";
import { Link } from "react-router-dom";
import { useProgression } from "@/app/ProgressionContext";
import { useI18n } from "@/app/LanguageContext";
import type { CleI18n } from "@/i18n";
import "./modes.css";

const SUGGESTIONS: readonly { id: string; titreCle: CleI18n; corpsCle: CleI18n }[] = [
  { id: "action-sunlight", titreCle: "action.sunlightTitre", corpsCle: "action.sunlightBody" },
  { id: "action-message", titreCle: "action.messageTitre", corpsCle: "action.messageBody" },
  { id: "action-threshold", titreCle: "action.thresholdTitre", corpsCle: "action.thresholdBody" },
];

export default function ActionScreen() {
  const { reward } = useProgression();
  const { t } = useI18n();
  const [committed, setCommitted] = useState<string[]>([]);
  const index = committed.length % SUGGESTIONS.length;
  const suggestion = SUGGESTIONS[index];

  function commit() {
    if (!committed.includes(suggestion.id)) {
      reward("action:committed", `action:${suggestion.id}`);
      setCommitted((prev) => [...prev, suggestion.id]);
    }
  }

  return (
    <div className="mode">
      <div className="page-header">
        <p className="eyebrow">{t("action.eyebrow")}</p>
        <h1>{t("action.titre")}</h1>
        <p className="lead">{t("action.lead")}</p>
      </div>

      <div className="mode__stage surface surface-pad">
        <div className="stack stack-5 center">
          <span className="mode__glyph" aria-hidden="true">✦</span>
          <h2>{t(suggestion.titreCle)}</h2>
          <p className="lead center-text">{t(suggestion.corpsCle)}</p>
          {committed.includes(suggestion.id) ? (
            <div className="notice notice--info">{t("action.beauGeste")}</div>
          ) : (
            <button className="btn btn-primary btn-lg" onClick={commit}>
              {t("action.jeLeFaisAujourdhui")}
            </button>
          )}
          {committed.length > 0 && committed.length < SUGGESTIONS.length && (
            <button className="btn btn-ghost" onClick={() => setCommitted((prev) => prev)}>
              {t("action.nouvelleBientot")}
            </button>
          )}
        </div>
      </div>

      <div className="demo-banner" role="note">
        <span aria-hidden="true">✦</span>
        <p>
          <strong>{t("action.versionInitialeTitre")}</strong> {t("action.versionInitialeTexte")}
        </p>
      </div>

      <p className="quiet">
        {t("action.besoinEnParler")} <Link to="/parler">{t("action.parlerAvecMana")}</Link>
      </p>
    </div>
  );
}
