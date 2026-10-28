import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { useExploreData, useVisitedPlaces } from "@/infrastructure/persistence";
import { useProgression } from "@/app/ProgressionContext";
import "./explore.css";

export default function PlaceDetailScreen() {
  const { placeId } = useParams<{ placeId: string }>();
  const { places, source, loading, error } = useExploreData();
  const { visited, toggleVisited } = useVisitedPlaces();
  const { reward } = useProgression();

  const place = places.find((p) => p.id === placeId);
  const isSample = source === "sample";

  useEffect(() => {
    if (!place) return;
    reward("explore:place-opened", `place-open:${place.id}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [place?.id]);

  if (loading) {
    return (
      <div className="stack stack-3" aria-busy="true">
        <div className="skeleton-line" style={{ width: "70%" }} />
        <div className="skeleton-line" style={{ width: "50%" }} />
      </div>
    );
  }

  if (!place) {
    return (
      <div className="stack stack-4">
        <h1>Lieu introuvable</h1>
        <p className="muted">
          {error ?? "Ce lieu n'existe pas ou n'est plus disponible."}
        </p>
        <Link to="/explorer" className="btn btn-secondary">
          ← Retour à l'exploration
        </Link>
      </div>
    );
  }

  const isVisited = visited.includes(place.id);

  return (
    <article className="explore-detail">
      <nav aria-label="Fil d'exploration">
        <Link to="/explorer" className="quiet explore-detail__back">
          ← Explorer
        </Link>
      </nav>
      <header className="explore-detail__header">
        <p className="eyebrow">{place.region || "OpenStreetMap"}</p>
        <h1>{place.name}</h1>
      </header>

      {isSample ? (
        <div className="demo-banner" role="note">
          <span aria-hidden="true">✦</span>
          <p>
            <strong>Fiche de démonstration.</strong> Aucune information réelle
            (adresse, horaires, accès) n'est affichée.
          </p>
        </div>
      ) : (
        <div className="notice notice--info" role="status">
          <strong>Lieu réel</strong> — données © OpenStreetMap contributors
          (ODbL).
          {place.location
            ? ` Coordonnées : ${place.location.lat.toFixed(4)}, ${place.location.lng.toFixed(4)}.`
            : ""}
        </div>
      )}

      <p className="lead">{place.summary}</p>
      <p className="muted">{place.description}</p>

      {place.bestMoments.length > 0 && (
        <section aria-label="Moments recommandés" className="explore-detail__section">
          <h2>Bons moments</h2>
          <ul className="cluster">
            {place.bestMoments.map((m) => (
              <li key={m} className="tag">{m}</li>
            ))}
          </ul>
        </section>
      )}

      <section aria-label="Actions" className="explore-detail__section">
        <h2>Et maintenant ?</h2>
        <p className="muted">
          {isVisited
            ? "Vous avez déjà marqué ce lieu comme visité — merci pour cette découverte."
            : "Vous avez visité ce lieu ? Marquez-le pour garder une trace de vos découvertes."}
        </p>
        <div className="cluster">
          <button
            className={isVisited ? "btn btn-ghost" : "btn btn-primary"}
            onClick={() => {
              if (!isVisited) {
                reward("explore:place-visited", `place-visited:${place.id}`, place.id);
              }
              toggleVisited(place.id);
            }}
          >
            {isVisited ? "Lieu visité ✓" : "Marquer comme visité"}
          </button>
          <Link to="/parler" className="btn btn-secondary">
            En parler avec MANA
          </Link>
        </div>
      </section>
    </article>
  );
}
