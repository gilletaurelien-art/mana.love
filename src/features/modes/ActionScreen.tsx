import { useState } from "react";
import { Link } from "react-router-dom";
import { useProgression } from "@/app/ProgressionContext";
import "./modes.css";

const SUGGESTIONS = [
  {
    id: "action-sunlight",
    title: "Trois minutes de vrai soleil",
    body: "Sortez trois minutes, sans téléphone, et laissez la lumière du jour vous trouver. C'est tout.",
  },
  {
    id: "action-message",
    title: "Un message que vous repoussez",
    body: "Cette personne à qui vous pensez depuis des semaines sans lui écrire ? Trente secondes, deux lignes, envoyé.",
  },
  {
    id: "action-threshold",
    title: "Un seuil à franchir",
    body: "Marchez jusqu'au bout de votre rue, puis un carrefour de plus. Revenez par un chemin différent.",
  },
] as const;

export default function ActionScreen() {
  const { reward } = useProgression();
  const [committed, setCommitted] = useState<string[]>([]);
  const index = committed.length % SUGGESTIONS.length;
  const suggestion = SUGGESTIONS[index];

  function commit() {
    if (!committed.includes(suggestion.id)) {
      reward("action:committed", `action:${suggestion.id}`);
      setCommitted((prev) => [...prev, suggestion.id]);
    }
  }

  return (
    <div className="mode">
      <div className="page-header">
        <p className="eyebrow">MANA Action</p>
        <h1>Un petit geste qui compte</h1>
        <p className="lead">
          MANA ne cherche pas à vous garder ici. Une action, aujourd'hui, dans
          le monde réel — même toute petite.
        </p>
      </div>

      <div className="mode__stage surface surface-pad">
        <div className="stack stack-5 center">
          <span className="mode__glyph" aria-hidden="true">✦</span>
          <h2>{suggestion.title}</h2>
          <p className="lead center-text">{suggestion.body}</p>
          {committed.includes(suggestion.id) ? (
            <div className="notice notice--info">
              Beau geste. À vous de le vivre, dehors.
            </div>
          ) : (
            <button className="btn btn-primary btn-lg" onClick={commit}>
              Je le fais aujourd'hui
            </button>
          )}
          {committed.length > 0 && committed.length < SUGGESTIONS.length && (
            <button className="btn btn-ghost" onClick={() => setCommitted((prev) => prev)}>
              Une nouvelle proposition arrive bientôt.
            </button>
          )}
        </div>
      </div>

      <div className="demo-banner" role="note">
        <span aria-hidden="true">✦</span>
        <p>
          <strong>Version initiale.</strong> Les propositions d'action seront
          bientôt personnalisées par MANA en fonction de vos conversations et
          découvertes.
        </p>
      </div>

      <p className="quiet">
        Besoin d'en parler avant ? <Link to="/parler">Parler avec MANA</Link>
      </p>
    </div>
  );
}
