import { Link } from "react-router-dom";
import { RADIO_CATALOG } from "@/infrastructure/radioCatalog";
import "./modes.css";

export default function RadioScreen() {
  return (
    <div className="mode">
      <div className="page-header">
        <p className="eyebrow">MANAradio</p>
        <h1>Écouter le monde</h1>
        <p className="lead">
          Des paysages sonores pour accompagner un moment calme — jamais en
          autoplay, toujours sous votre contrôle.
        </p>
      </div>

      <div className="demo-banner" role="note">
        <span aria-hidden="true">✦</span>
        <p>
          <strong>Catalogue en préparation.</strong> Aucun contenu audio n'est
          encore disponible : MANA.love ne diffusera que des contenus dont les
          droits sont clairement établis (licences, CC0, créations originales).
          Les entrées ci-dessous décrivent le catalogue à venir — les contrôles
          de lecture seront actifs dès qu'une ressource sera configurée.
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
              <button className="btn btn-ghost btn-sm" disabled aria-label={`Lecture indisponible pour ${track.title}`}>
                ▶ Indisponible
              </button>
            </div>
          </li>
        ))}
      </ul>

      <p className="quiet">
        Envie d'un moment calme avant de dormir ? <Link to="/sommeil">MANA Sleep</Link>
      </p>
    </div>
  );
}
