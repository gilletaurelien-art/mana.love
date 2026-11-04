import { Link } from "react-router-dom";
import { useProgression } from "@/app/ProgressionContext";
import { sortedPersonalities } from "@/domain/personalityRegistry";
import { unlockStatusFor } from "@/domain/progression";
import { useI18n } from "@/app/LanguageContext";
import "./pantheon.css";

export default function PantheonScreen() {
  const { balance } = useProgression();
  const all = sortedPersonalities();
  const { t } = useI18n();

  return (
    <div className="pantheon">
      <div className="page-header">
        <p className="eyebrow">{t("pantheon.eyebrow")}</p>
        <h1>{t("pantheon.titre")}</h1>
        <p className="lead">{t("pantheon.lead")}</p>
      </div>

      <div className="demo-banner" role="note">
        <span aria-hidden="true">✦</span>
        <p>
          <strong>{t("pantheon.demoTitre")}</strong> {t("pantheon.demoTexte")}
        </p>
      </div>

      <ul className="pantheon__grid">
        {all.map((p) => {
          const status = unlockStatusFor(p, balance);
          return (
            <li key={p.id} className="pantheon__item">
              <article
                className={`pantheon-card theme-${p.theme}${
                  status.unlocked ? "" : " pantheon-card--locked"
                }`}
              >
                <div className="pantheon-card__head">
                  <span className={`persona-orb persona-orb--${p.theme}`} aria-hidden="true" />
                  <div className="pantheon-card__body">
                    <h2>{p.name}</h2>
                    <p className="eyebrow">{p.epithet}</p>
                  </div>
                </div>

                <p className="pantheon-card__ame">{p.tagline}</p>

                {status.unlocked ? (
                  <div className="pantheon-card__actions">
                    <Link to={`/parler?avec=${p.id}`} className="btn btn-primary btn-sm">
                      {t("pantheon.parlerA", { nom: p.name })}
                    </Link>
                  </div>
                ) : (
                  <div className="pantheon-card__lockinfo">
                    <span className="tag tag--locked">{t("pantheon.verrouillee")}</span>
                    <span className="quiet">
                      {p.unlock.kind === "mana-points" ? t("pantheon.points", { n: p.unlock.threshold }) : ""}
                    </span>
                  </div>
                )}

                {p.id !== "mana" && (
                  <details className="pantheon-card__lore">
                    <summary>{t("pantheon.histoireFiction")}</summary>
                    <p>{p.lore}</p>
                  </details>
                )}
              </article>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
