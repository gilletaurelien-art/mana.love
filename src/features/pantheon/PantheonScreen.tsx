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
        <p className="eyebrow">Mes univers</p>
        <h1>Le panthéon de l'amour</h1>
        <p className="lead">
          Chaque personnalité est un univers distinct, avec sa voix et son
          histoire. Les rencontres se déverrouillent au fil de vos découvertes
          — jamais au fil du temps passé devant l'écran.
        </p>
      </div>

      <div className="demo-banner" role="note">
        <span aria-hidden="true">✦</span>
        <p>
          <strong>Personnalités de démonstration.</strong> Les univers
          présentés sont des fictions originales créées pour MANA.love. Ils ne
          s'appuient sur aucun texte religieux ou culturel documenté.
        </p>
      </div>

      <ul className="pantheon__grid">
        {all.map((p) => {
          const status = unlockStatusFor(p, balance);
          return (
            <li key={p.id} className="pantheon__item">
              <article
                className={`pantheon-card surface surface--interact theme-${p.theme}${
                  status.unlocked ? "" : " pantheon-card--locked"
                }`}
              >
                <span className={`persona-orb persona-orb--lg persona-orb--${p.theme}`} aria-hidden="true" />
                <div className="pantheon-card__body">
                  <h2>{p.name}</h2>
                  <p className="eyebrow">{p.epithet}</p>
                  <p className="muted">{p.tagline}</p>
                </div>
                {status.unlocked ? (
                  <div className="pantheon-card__actions">
                    <Link to={`/parler?avec=${p.id}`} className="btn btn-primary btn-sm">
                      Parler à {p.name}
                    </Link>
                  </div>
                ) : (
                  <div className="pantheon-card__lockinfo">
                    <span className="tag tag--locked">🔒 Verrouillée</span>
                    <span className="quiet">
                      Se déverrouille à {p.unlock.kind === "mana-points" ? `${p.unlock.threshold} points` : "—"} (
                      encore {status.remaining})
                    </span>
                  </div>
                )}
                {p.id !== "mana" && (
                  <details className="pantheon-card__lore">
                    <summary className="quiet">Son histoire (fiction)</summary>
                    <p className="muted">{p.lore}</p>
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
