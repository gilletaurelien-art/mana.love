import { Link } from "react-router-dom";
import { useProgression } from "@/app/ProgressionContext";
import { sortedPersonalities } from "@/domain/personalityRegistry";
import { unlockStatusFor } from "@/domain/progression";
import "./pantheon.css";

export default function PantheonScreen() {
  const { balance } = useProgression();
  const all = sortedPersonalities();

  return (
    <div className="pantheon">
      <div className="page-header">
        <p className="eyebrow">Univers</p>
        <h1>Le panthéon</h1>
        <p className="lead">
          Chaque déesse a sa voix et son histoire. Vos découvertes ouvrent de
          nouvelles rencontres.
        </p>
      </div>

      <div className="demo-banner" role="note">
        <span aria-hidden="true">✦</span>
        <p>
          <strong>Personnalités de démonstration.</strong> Univers de fiction,
          créés pour MANA.love.
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
                      Parler à {p.name}
                    </Link>
                  </div>
                ) : (
                  <div className="pantheon-card__lockinfo">
                    <span className="tag tag--locked">Verrouillée</span>
                    <span className="quiet">
                      {p.unlock.kind === "mana-points" ? `${p.unlock.threshold} points` : ""}
                    </span>
                  </div>
                )}

                {p.id !== "mana" && (
                  <details className="pantheon-card__lore">
                    <summary>Son histoire — fiction</summary>
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
