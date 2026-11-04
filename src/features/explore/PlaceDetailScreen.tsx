import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  useExploreData,
  useVisitedPlaces,
  readLastCoords,
} from "@/infrastructure/persistence";
import { osmGeoService } from "@/infrastructure/osmExploreService";
import { fenetreMeteo } from "@/infrastructure/weatherService";
import { decrireFenetre, type FenetreMeteo } from "@/domain/meteo";
import { useProgression } from "@/app/ProgressionContext";
import { useI18n } from "@/app/LanguageContext";
import "./explore.css";

type EtatMeteo =
  | { statut: "chargement" }
  | { statut: "indisponible" }
  | { statut: "ok"; fenetre: FenetreMeteo | null };

export default function PlaceDetailScreen() {
  const { placeId } = useParams<{ placeId: string }>();
  const { places, source, loading, error } = useExploreData();
  const { visited, toggleVisited } = useVisitedPlaces();
  const { reward } = useProgression();
  const { t } = useI18n();
  const [meteo, setMeteo] = useState<EtatMeteo>({ statut: "chargement" });
  const [walkMinutes, setWalkMinutes] = useState<number | null>(null);

  const place = places.find((p) => p.id === placeId);
  const isSample = source === "sample";

  useEffect(() => {
    if (!place) return;
    reward("explore:place-opened", `place-open:${place.id}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [place?.id]);

  useEffect(() => {
    if (!place?.location) return;
    let cancelled = false;
    // "cancelled" évite qu'un résultat tardif (navigation vers un autre
    // lieu pendant la requête) écrase l'état courant — pas de reset
    // synchrone en tête d'effet (même piège React dans les deux effets).
    fenetreMeteo(place.location).then((fenetre) => {
      if (cancelled) return;
      setMeteo(
        fenetre === undefined ? { statut: "indisponible" } : { statut: "ok", fenetre }
      );
    });
    return () => {
      cancelled = true;
    };
  }, [place?.location]);

  useEffect(() => {
    if (!place?.location) return;
    const from = readLastCoords();
    if (!from) return;
    let cancelled = false;
    osmGeoService.estimateRouteTime(from, place.location, "walk").then((minutes) => {
      if (!cancelled) setWalkMinutes(minutes);
    });
    return () => {
      cancelled = true;
    };
  }, [place?.location]);

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
        <h1>{t("exploreDetail.lieuIntrouvableTitre")}</h1>
        <p className="muted">
          {error ?? t("exploreDetail.lieuIntrouvableTexte")}
        </p>
        <Link to="/explorer" className="btn btn-secondary">
          {t("exploreDetail.retourExplorationLien")}
        </Link>
      </div>
    );
  }

  const isVisited = visited.includes(place.id);

  return (
    <article className="explore-detail">
      <nav aria-label={t("exploreDetail.filAria")}>
        <Link to="/explorer" className="quiet explore-detail__back">
          {t("exploreDetail.retourExplorer")}
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
            <strong>{t("exploreDetail.demoTitre")}</strong> {t("exploreDetail.demoTexte")}
          </p>
        </div>
      ) : (
        <div className="notice notice--info" role="status">
          <strong>{t("exploreDetail.lieuReelTitre")}</strong>
          {t("exploreDetail.odblSuffixe")}
          {place.location
            ? t("exploreDetail.coordonnees", {
                lat: place.location.lat.toFixed(4),
                lng: place.location.lng.toFixed(4),
              })
            : ""}
          {walkMinutes !== null ? t("exploreDetail.minutesAPied", { n: walkMinutes }) : ""}
          {meteo.statut === "ok" ? ` ${decrireFenetre(meteo.fenetre)}` : ""}
        </div>
      )}

      <p className="lead">{place.summary}</p>
      <p className="muted">{place.description}</p>

      {place.bestMoments.length > 0 && (
        <section aria-label={t("exploreDetail.bonsMomentsAria")} className="explore-detail__section">
          <h2>{t("exploreDetail.bonsMomentsTitre")}</h2>
          <ul className="cluster">
            {place.bestMoments.map((m) => (
              <li key={m} className="tag">{m}</li>
            ))}
          </ul>
        </section>
      )}

      <section aria-label={t("exploreDetail.actionsAria")} className="explore-detail__section">
        <h2>{t("exploreDetail.plu")}</h2>
        <p className="muted">
          {isVisited ? t("exploreDetail.dejaDecouvert") : t("exploreDetail.pasEncoreDecouvert")}
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
            {isVisited ? t("exploreDetail.decouvert") : t("exploreDetail.jeLaiDecouvert")}
          </button>
          <Link to="/parler" className="btn btn-secondary">
            {t("exploreDetail.enParlerAvecMana")}
          </Link>
        </div>
      </section>
    </article>
  );
}
