import { useState } from "react";
import { Link } from "react-router-dom";
import { useExploreData } from "@/infrastructure/persistence";
import type { Place, Experience } from "@/domain/exploration";
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

  if (loading) {
    return (
      <div className="page-header">
        <h1>Explorer le monde</h1>
        <div className="stack stack-3" aria-busy="true" aria-label="Chargement des découvertes">
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
        <p className="eyebrow">Exploration</p>
        <h1>Explorer le monde</h1>
        <p className="lead">
          Des lieux, des chemins et des expériences à vivre dehors. La
          curiosité est le seul bagage nécessaire.
        </p>
      </div>

      {isOsm ? (
        <div className="notice notice--info" role="status">
          <strong>Lieux réels autour de vous</strong>
          {locality ? ` — proche de ${locality}.` : "."} Données ©
          OpenStreetMap contributors (ODbL).
        </div>
      ) : (
        <div className="demo-banner" role="note">
          <span aria-hidden="true">✦</span>
          <div className="stack stack-3">
            <p>
              <strong>Contenu de démonstration.</strong> Les fiches
              ci-dessous sont des exemples illustratifs : elles ne
              contiennent ni localisation, ni horaires, ni itinéraires
              réels.
            </p>
            <p>
              <button className="btn btn-secondary btn-sm" onClick={useRealLocation}>
                Découvrir des lieux réels autour de moi (OpenStreetMap)
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
          Rechercher un lieu, une ambiance, une expérience
        </label>
        <input
          id="explore-search"
          type="search"
          className="text-input"
          placeholder="ex. : aube, marche, jardin…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <section aria-labelledby="places-heading">
        <h2 id="places-heading" className="explore__section-title">
          Lieux à découvrir {isOsm && <span className="tag">OpenStreetMap</span>}
        </h2>
        {filteredPlaces.length === 0 ? (
          <p className="notice">
            {isOsm
              ? "Aucun lieu naturel trouvé dans un rayon de 3 km. Élargissez votre recherche ou explorez une autre zone."
              : "Aucun lieu ne correspond à cette recherche."}
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
        <h2 id="exp-heading" className="explore__section-title">Expériences à vivre</h2>
        {filteredExperiences.length === 0 ? (
          <p className="notice">Aucune expérience ne correspond à cette recherche.</p>
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
