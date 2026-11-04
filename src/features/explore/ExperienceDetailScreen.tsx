import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { useExploreData } from "@/infrastructure/persistence";
import { useProgression } from "@/app/ProgressionContext";
import { useI18n } from "@/app/LanguageContext";
import "./explore.css";

export default function ExperienceDetailScreen() {
  const { experienceId } = useParams<{ experienceId: string }>();
  const { experiences, loading } = useExploreData();
  const { reward } = useProgression();
  const { t } = useI18n();

  const experience = experiences.find((e) => e.id === experienceId);

  useEffect(() => {
    if (!experience) return;
    reward("explore:experience-opened", `experience-open:${experience.id}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [experience?.id]);

  if (loading) {
    return (
      <div className="stack stack-3" aria-busy="true">
        <div className="skeleton-line" style={{ width: "70%" }} />
        <div className="skeleton-line" style={{ width: "50%" }} />
      </div>
    );
  }

  if (!experience) {
    return (
      <div className="stack stack-4">
        <h1>{t("experienceDetail.introuvableTitre")}</h1>
        <p className="muted">{t("experienceDetail.introuvableTexte")}</p>
        <Link to="/explorer" className="btn btn-secondary">
          {t("exploreDetail.retourExplorationLien")}
        </Link>
      </div>
    );
  }

  return (
    <article className="explore-detail">
      <nav aria-label={t("exploreDetail.filAria")}>
        <Link to="/explorer" className="quiet explore-detail__back">
          {t("exploreDetail.retourExplorer")}
        </Link>
      </nav>
      <header className="explore-detail__header">
        <p className="eyebrow">
          {t("experienceDetail.eyebrow", { intensite: experience.intensity })}
        </p>
        <h1>{experience.title}</h1>
      </header>

      <div className="demo-banner" role="note">
        <span aria-hidden="true">✦</span>
        <p>
          <strong>{t("experienceDetail.demoTitre")}</strong> {t("experienceDetail.demoTexte")}
        </p>
      </div>

      <p className="lead">{experience.summary}</p>
      <p className="muted">{experience.description}</p>

      <section aria-label={t("experienceDetail.pratiqueAria")} className="explore-detail__section">
        <h2>{t("experienceDetail.leConcours")}</h2>
        <ul className="cluster">
          <li className="tag">{t("experienceDetail.minutes", { n: experience.durationMinutes })}</li>
          {experience.tags.map((tag) => (
            <li key={tag} className="tag tag--demo">{tag}</li>
          ))}
        </ul>
      </section>

      <section className="explore-detail__section">
        <p className="muted">{t("experienceDetail.pretTexte")}</p>
        <div className="cluster">
          <Link to="/parler" className="btn btn-primary">
            {t("experienceDetail.preparerAvecMana")}
          </Link>
        </div>
      </section>
    </article>
  );
}
