import { useEffect, useMemo, useState } from "react";
import { useI18n } from "@/app/LanguageContext";
import { chargerCatalogueCiel, type CatalogueCiel } from "@/infrastructure/cielCatalogue";
import { etoilesVisibles, projeterSurDome, positionHorizon, type Lieu } from "@/domain/ciel";
import { phaseLunaire } from "@/domain/lune";
import { MoonIcon } from "./MoonIcon";
import "./ciel.css";

/** Paris — lieu de démonstration explicite, jamais une position supposée réelle. */
const LIEU_DEMO: Lieu = { latitude: 48.8566, longitude: 2.3522 };
const RAYON = 220;
const RAFRAICHISSEMENT_MS = 60_000;

export default function CielScreen() {
  const { t } = useI18n();
  const [catalogue, setCatalogue] = useState<CatalogueCiel | null>(null);
  const [lieu, setLieu] = useState<Lieu | null>(null);
  const [erreurGeo, setErreurGeo] = useState<string | null>(null);
  const [maintenant, setMaintenant] = useState(() => new Date());

  useEffect(() => {
    let cancelled = false;
    chargerCatalogueCiel().then((c) => {
      if (!cancelled) setCatalogue(c);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => setMaintenant(new Date()), RAFRAICHISSEMENT_MS);
    return () => window.clearInterval(id);
  }, []);

  function demanderPosition() {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setErreurGeo(t("ciel.geoIndisponible"));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLieu({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
        setErreurGeo(null);
      },
      (err) => setErreurGeo(err.message)
    );
  }

  const lieuEffectif = lieu ?? LIEU_DEMO;
  const estDemo = lieu === null;
  const lune = useMemo(() => phaseLunaire(maintenant), [maintenant]);

  const visibles = useMemo(() => {
    if (!catalogue) return [];
    return etoilesVisibles(catalogue.etoiles, lieuEffectif, maintenant);
  }, [catalogue, lieuEffectif, maintenant]);

  const lignesProjetees = useMemo(() => {
    if (!catalogue) return [];
    return catalogue.lignes
      .map((c) => ({
        id: c.id,
        chemins: c.segments
          .map((segment) => {
            const points = segment.map(([ra, dec]) => {
              const pos = positionHorizon({ ra, dec }, lieuEffectif, maintenant);
              return projeterSurDome(pos, RAYON);
            });
            // Un segment avec un bout sous l'horizon est écarté entier :
            // le tracer coupé donnerait une ligne fausse, pas une ligne
            // incomplète honnête.
            if (points.some((p) => p === null)) return null;
            return points as { x: number; y: number }[];
          })
          .filter((p): p is { x: number; y: number }[] => p !== null),
      }))
      .filter((c) => c.chemins.length > 0);
  }, [catalogue, lieuEffectif, maintenant]);

  return (
    <div className="ciel">
      <div className="page-header">
        <p className="eyebrow">{t("ciel.eyebrow")}</p>
        <h1>{t("ciel.titre")}</h1>
        <p className="lead">{t("ciel.lead")}</p>
      </div>

      {estDemo ? (
        <div className="demo-banner" role="note">
          <span aria-hidden="true">✦</span>
          <div className="stack stack-3">
            <p>
              <strong>{t("ciel.demoTitre")}</strong> {t("ciel.demoTexte")}
            </p>
            <p>
              <button className="btn btn-secondary btn-sm" onClick={demanderPosition}>
                {t("ciel.voirMonCiel")}
              </button>
            </p>
            {erreurGeo && <p className="notice" role="alert">{erreurGeo}</p>}
          </div>
        </div>
      ) : (
        <div className="notice notice--info" role="status">
          <strong>{t("ciel.cielReelTitre")}</strong>
        </div>
      )}

      <div className="ciel__lune">
        <MoonIcon illumination={lune.illumination} croissante={lune.croissante} />
        <div>
          <strong>{t(`lune.${lune.id}`)}</strong>
          <p className="quiet">{t("ciel.illumination", { n: Math.round(lune.illumination * 100) })}</p>
        </div>
      </div>

      <div className="ciel__dome-wrap">
        <svg
          className="ciel__dome"
          viewBox={`${-RAYON - 26} ${-RAYON - 26} ${2 * RAYON + 52} ${2 * RAYON + 52}`}
          role="img"
          aria-label={t("ciel.domeAria")}
        >
          <circle className="ciel__horizon" cx={0} cy={0} r={RAYON} />
          <text className="ciel__point-cardinal" x={0} y={-RAYON - 14}>N</text>
          <text className="ciel__point-cardinal" x={RAYON + 16} y={4}>E</text>
          <text className="ciel__point-cardinal" x={0} y={RAYON + 20}>S</text>
          <text className="ciel__point-cardinal" x={-RAYON - 16} y={4}>O</text>

          {lignesProjetees.map((c) => (
            <g key={c.id} className="ciel__constellation">
              {c.chemins.map((pts, i) => (
                <polyline
                  key={i}
                  points={pts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ")}
                />
              ))}
            </g>
          ))}

          {visibles.map((e) => {
            const p = projeterSurDome({ altitude: e.altitude, azimut: e.azimut }, RAYON);
            if (!p) return null;
            const rayon = Math.max(0.5, 2.6 - e.mag * 0.4);
            return <circle key={e.id} className="ciel__etoile" cx={p.x} cy={p.y} r={rayon} />;
          })}
        </svg>
      </div>

      <p className="quiet ciel__attribution">{t("ciel.attribution")}</p>
    </div>
  );
}
