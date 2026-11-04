import { useState } from "react";
import { Link } from "react-router-dom";
import { useExploreData } from "@/infrastructure/persistence";
import type { Place, Experience } from "@/domain/exploration";
import { useI18n } from "@/app/LanguageContext";
import "./explore.css";

export default function ExploreScreen() {
  const {
    places,
    experiences,
    source,
    locality,
    loading,
    error,
    useRealLocation,
  } = useExploreData();
  const [query, setQuery] = useState("");
  const { t } = useI18n();

  if (loading) {
    return (
      <div className="page-header">
        <h1>{t("explore.titre")}</h1>
        <div className="stack stack-3" aria-busy="true" aria-label={t("explore.chargementAria")}>
          <div className="skeleton-line" style={{ width: "80%" }} />
          <div className="skeleton-line" style={{ width: "60%" }} />
          <div className="skeleton-line" style={{ width: "70%" }} />
        </div>
      </div>
    );
  }

  const q = query.trim().toLowerCase();
  const filteredPlaces = q
    ? places.filter((p) =>
        [p.name, p.region, ...p.tags].join(" ").toLowerCase().includes(q)
      )
    : places;
  const filteredExperiences = q
    ? experiences.filter((e) =>
        [e.title, ...e.tags].join(" ").toLowerCase().includes(q)
      )
    : experiences;
  const isOsm = source === "openstreetmap";

  return (
    <div className="explore">
      <div className="page-header">
        <p className="eyebrow">{t("explore.eyebrow")}</p>
        <h1>{t("explore.titre")}</h1>
        <p className="lead">{t("explore.lead")}</p>
      </div>

      {isOsm ? (
        <div className="notice notice--info" role="status">
          <strong>{t("explore.lieuxReelsTitre")}</strong>
          {" "}
          {locality ? t("explore.procheDe", { lieu: locality }) : ""} {t("explore.odbl")}
        </div>
      ) : (
        <div className="demo-banner" role="note">
          <span aria-hidden="true">✦</span>
          <div className="stack stack-3">
            <p>
              <strong>{t("explore.demoTitre")}</strong> {t("explore.demoTexte")}
            </p>
            <p>
              <button className="btn btn-secondary btn-sm" onClick={useRealLocation}>
                {t("explore.decouvrirReels")}
              </button>
            </p>
          </div>
        </div>
      )}

      {error && (
        <p className="notice" role="alert">
          {error}
        </p>
      )}

      <div className="explore__search">
        <label htmlFor="explore-search" className="field-label">
          {t("explore.rechercherLabel")}
        </label>
        <input
          id="explore-search"
          type="search"
          className="text-input"
          placeholder={t("explore.recherchePlaceholder")}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <section aria-labelledby="places-heading">
        <h2 id="places-heading" className="explore__section-title">
          {t("explore.lieuxTitre")} {isOsm && <span className="tag">OpenStreetMap</span>}
        </h2>
        {filteredPlaces.length === 0 ? (
          <p className="notice">
            {isOsm ? t("explore.aucunLieuOsm") : t("explore.aucunResultat")}
          </p>
        ) : (
          <ul className="explore__grid">
            {filteredPlaces.map((p) => (
              <li key={p.id}>
                <PlaceCard place={p} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="exp-heading">
        <h2 id="exp-heading" className="explore__section-title">{t("explore.experiencesTitre")}</h2>
        {filteredExperiences.length === 0 ? (
          <p className="notice">{t("explore.aucunResultat")}</p>
        ) : (
          <ul className="explore__grid">
            {filteredExperiences.map((e) => (
              <li key={e.id}>
                <ExperienceCard experience={e} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function PlaceCard({ place }: { place: Place }) {
  return (
    <Link
      to={`/explorer/lieu/${place.id}`}
      className="explore-card surface surface--interact"
    >
      <span className={`explore-card__pict kind-${place.kind}`} aria-hidden="true" />
      <span className="explore-card__body">
        <strong className="explore-card__title">{place.name}</strong>
        <span className="quiet">{place.region || "OpenStreetMap"}</span>
        <span className="explore-card__summary">{place.summary}</span>
      </span>
    </Link>
  );
}

function ExperienceCard({ experience }: { experience: Experience }) {
  return (
    <Link
      to={`/explorer/experience/${experience.id}`}
      className="explore-card surface surface--interact"
    >
      <span className="explore-card__pict kind-experience" aria-hidden="true" />
      <span className="explore-card__body">
        <strong className="explore-card__title">{experience.title}</strong>
        <span className="quiet">
          {experience.durationMinutes} min · {experience.intensity}
        </span>
        <span className="explore-card__summary">{experience.summary}</span>
      </span>
    </Link>
  );
}
