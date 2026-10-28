import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { useExploreData } from "@/infrastructure/persistence";
import { useProgression } from "@/app/ProgressionContext";
import "./explore.css";

export default function ExperienceDetailScreen() {
  const { experienceId } = useParams<{ experienceId: string }>();
  const { experiences, loading } = useExploreData();
  const { reward } = useProgression();

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
        <h1>Expérience introuvable</h1>
        <p className="muted">Cette expérience n'existe pas ou n'est plus disponible.</p>
        <Link to="/explorer" className="btn btn-secondary">
          ← Retour à l'exploration
        </Link>
      </div>
    );
  }

  return (
    <article className="explore-detail">
      <nav aria-label="Fil d'exploration">
        <Link to="/explorer" className="quiet explore-detail__back">
          ← Explorer
        </Link>
      </nav>
      <header className="explore-detail__header">
        <p className="eyebrow">
          Expérience · {experience.intensity}
        </p>
        <h1>{experience.title}</h1>
      </header>

      <div className="demo-banner" role="note">
        <span aria-hidden="true">✦</span>
        <p>
          <strong>Expérience de démonstration.</strong> Ce contenu est un
          exemple : sa vocation est d'inspirer, pas de décrire un lieu réel
          vérifié.
        </p>
      </div>

      <p className="lead">{experience.summary}</p>
      <p className="muted">{experience.description}</p>

      <section aria-label="Pratique" className="explore-detail__section">
        <h2>Le concours</h2>
        <ul className="cluster">
          <li className="tag">{experience.durationMinutes} minutes</li>
          {experience.tags.map((t) => (
            <li key={t} className="tag tag--demo">{t}</li>
          ))}
        </ul>
      </section>

      <section className="explore-detail__section">
        <p className="muted">
          Prêt·e à la tenter ? Parlez-en à MANA pour la transformer en petit
          plan d'action.
        </p>
        <div className="cluster">
          <Link to="/parler" className="btn btn-primary">
            Préparer cette expérience avec MANA
          </Link>
        </div>
      </section>
    </article>
  );
}
