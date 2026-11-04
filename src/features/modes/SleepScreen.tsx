import { useState } from "react";
import { Link } from "react-router-dom";
import { useProgression } from "@/app/ProgressionContext";
import { useI18n } from "@/app/LanguageContext";
import type { CleI18n } from "@/i18n";
import "./modes.css";

const STEPS: readonly { titreCle: CleI18n; corpsCle: CleI18n; seconds: number }[] = [
  { titreCle: "sleep.step1Titre", corpsCle: "sleep.step1Body", seconds: 40 },
  { titreCle: "sleep.step2Titre", corpsCle: "sleep.step2Body", seconds: 45 },
  { titreCle: "sleep.step3Titre", corpsCle: "sleep.step3Body", seconds: 50 },
];

export default function SleepScreen() {
  const { reward } = useProgression();
  const { t } = useI18n();
  const [stepIndex, setStepIndex] = useState<number | null>(null);
  const [done, setDone] = useState(false);

  function start() {
    setStepIndex(0);
    setDone(false);
  }

  function next() {
    const i = stepIndex;
    if (i === null) return;
    if (i + 1 >= STEPS.length) {
      setStepIndex(null);
      setDone(true);
      reward("sleep:session-completed", `sleep:${new Date().toISOString().slice(0, 13)}`);
    } else {
      setStepIndex(i + 1);
    }
  }

  const step = stepIndex !== null ? STEPS[stepIndex] : null;

  return (
    <div className="mode">
      <div className="page-header">
        <p className="eyebrow">{t("sleep.eyebrow")}</p>
        <h1>{t("sleep.titre")}</h1>
        <p className="lead">{t("sleep.lead")}</p>
      </div>

      <div className="mode__stage surface surface-pad">
        {done ? (
          <div className="stack stack-4 center">
            <h2>{t("sleep.bonneNuit")}</h2>
            <div className="cluster center">
              <button className="btn btn-secondary" onClick={start}>
                {t("sleep.recommencer")}
              </button>
              <Link to="/parler?avec=luna" className="btn btn-ghost">
                {t("sleep.parlerALuna")}
              </Link>
            </div>
          </div>
        ) : step && stepIndex !== null ? (
          <div className="stack stack-5 center">
            <p className="quiet">
              {t("sleep.etapeCompteur", {
                n: stepIndex + 1,
                total: STEPS.length,
                secondes: step.seconds,
              })}
            </p>
            <h2>{t(step.titreCle)}</h2>
            <p className="lead center-text">{t(step.corpsCle)}</p>
            <button className="btn btn-primary btn-lg" onClick={next}>
              {stepIndex + 1 >= STEPS.length ? t("sleep.terminer") : t("sleep.continuer")}
            </button>
          </div>
        ) : (
          <div className="stack stack-5 center">
            <span className="mode__glyph" aria-hidden="true">☾</span>
            <p className="lead center-text">{t("sleep.introTexte")}</p>
            <button className="btn btn-primary btn-lg" onClick={start}>
              {t("sleep.commencer")}
            </button>
          </div>
        )}
      </div>

      <div className="demo-banner" role="note">
        <span aria-hidden="true">✦</span>
        <p>
          <strong>{t("sleep.bientotTitre")}</strong> {t("sleep.bientotTexte")}
        </p>
      </div>
    </div>
  );
}
