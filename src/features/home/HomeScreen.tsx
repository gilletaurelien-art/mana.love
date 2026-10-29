import { Link } from "react-router-dom";
import { useProgression } from "@/app/ProgressionContext";
import { useI18n } from "@/app/LanguageContext";
import { sortedPersonalities } from "@/domain/personalityRegistry";
import { unlockStatusFor } from "@/domain/progression";

export default function HomeScreen() {
  const { balance, unlockedPersonalities } = useProgression();
  const { t } = useI18n();
  const nextGoddess = sortedPersonalities().find(
    (p) => p.unlock.kind === "mana-points" && !unlockStatusFor(p, balance).unlocked
  );
  const nextStatus = nextGoddess ? unlockStatusFor(nextGoddess, balance) : null;

  return (
    <div className="home">
      <section className="home__hero">
        <h1 className="display">
          {t("home.promise").replace(" la vie.", "")} <em>la vie.</em>
        </h1>
      </section>

      <section aria-label="Deux portes" className="home__doors">
        <Link to="/parler" className="door door--night">
          <span className="door__title">{t("home.door.talk")}</span>
          <span className="door__desc">{t("home.door.talkDesc")}</span>
          <span className="door__cta">{t("home.door.commencer")} →</span>
        </Link>
        <Link to="/explorer" className="door door--dawn">
          <span className="door__title">{t("home.door.explore")}</span>
          <span className="door__desc">{t("home.door.exploreDesc")}</span>
          <span className="door__cta">{t("home.door.decouvrir")} →</span>
        </Link>
      </section>

      <section aria-label="Moments MANA" className="home__moments">
        <Link to="/sommeil" className="moment-card surface surface--interact">
          <span className="moment-card__glyph" aria-hidden="true">☾</span>
          <span>
            <strong>{t("home.moments.sommeil")}</strong>
            <span className="muted">{t("home.moments.sommeilDesc")}</span>
          </span>
        </Link>
        <Link to="/action" className="moment-card surface surface--interact">
          <span className="moment-card__glyph" aria-hidden="true">✦</span>
          <span>
            <strong>{t("home.moments.action")}</strong>
            <span className="muted">{t("home.moments.actionDesc")}</span>
          </span>
        </Link>
        <Link to="/ecouter" className="moment-card surface surface--interact">
          <span className="moment-card__glyph" aria-hidden="true">♪</span>
          <span>
            <strong>{t("home.moments.radio")}</strong>
            <span className="muted">{t("home.moments.radioDesc")}</span>
          </span>
        </Link>
      </section>

      <section aria-label="Votre progression" className="home__progress surface surface-pad">
        <div className="spread">
          <div>
            <p className="eyebrow">{t("home.progression")}</p>
            <h2>{t("home.pantheon.titre")}</h2>
          </div>
          <p className="home__balance">
            <span aria-hidden="true">✦</span> {balance} {t("home.points")}
          </p>
        </div>
        {nextGoddess && nextStatus ? (
          <>
            <div
              className="progress"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={nextGoddess.unlock.kind === "mana-points" ? nextGoddess.unlock.threshold : 0}
              aria-valuenow={balance}
              aria-label={t("home.progression.suivante", { nom: nextGoddess.name, points: nextStatus.remaining })}
            >
              <div
                className="progress__fill"
                style={{
                  width:
                    nextGoddess.unlock.kind === "mana-points"
                      ? `${Math.min(100, (balance / nextGoddess.unlock.threshold) * 100)}%`
                      : "100%",
                }}
              />
            </div>
            <p className="quiet">
              {t("home.progression.suivante", { nom: nextGoddess.name, points: nextStatus.remaining })}
            </p>
          </>
        ) : (
          <p className="quiet">
            {t("home.progression.rencontrees", { n: unlockedPersonalities.length })}
          </p>
        )}
        <p>
          <Link to="/univers" className="btn btn-ghost btn-sm">
            {t("nav.univers")}
          </Link>
        </p>
      </section>

      <section aria-label="Invitation" className="home__invite">
        <h2>{t("home.invite.title")}</h2>
        <p className="lead">{t("home.invite.desc")}</p>
        <p>
          <Link to="/explorer/experience/sample-exp-1" className="btn btn-primary">
            {t("home.door.decouvrir")}
          </Link>
        </p>
      </section>
    </div>
  );
}
