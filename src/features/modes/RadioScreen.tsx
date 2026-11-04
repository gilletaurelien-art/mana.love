import { Link } from "react-router-dom";
import { RADIO_CATALOG } from "@/infrastructure/radioCatalog";
import { useI18n } from "@/app/LanguageContext";
import "./modes.css";

export default function RadioScreen() {
  const { t } = useI18n();
  return (
    <div className="mode">
      <div className="page-header">
        <p className="eyebrow">{t("radio.eyebrow")}</p>
        <h1>{t("radio.titre")}</h1>
        <p className="lead">{t("radio.lead")}</p>
      </div>

      <div className="demo-banner" role="note">
        <span aria-hidden="true">✦</span>
        <p>
          <strong>{t("radio.bientotTitre")}</strong> {t("radio.bientotTexte")}
        </p>
      </div>

      <ul className="radio__list">
        {RADIO_CATALOG.tracks.map((track) => (
          <li key={track.id} className="surface surface-pad radio__item">
            <div>
              <strong>{track.title}</strong>
              <p className="quiet">
                {track.kind} · {track.durationLabel} · {track.sourceAttribution}
              </p>
            </div>
            <div className="radio__controls">
              <button
                className="btn btn-ghost btn-sm"
                disabled
                aria-label={t("radio.lectureIndisponible", { titre: track.title })}
              >
                {t("radio.indisponible")}
              </button>
            </div>
          </li>
        ))}
      </ul>

      <p className="quiet">
        {t("radio.envieMomentCalme")} <Link to="/sommeil">{t("radio.manaSleep")}</Link>
      </p>
    </div>
  );
}
