import { useState } from "react";
import "./privacy.css";

export default function PrivacyScreen() {
  return (
    <article className="privacy">
      <div className="page-header">
        <p className="eyebrow">Confidentialité & données</p>
        <h1>Vos données, en toute clarté</h1>
      </div>

      <section className="stack stack-4">
        <h2>Ce qui est stocké, aujourd'hui</h2>
        <p className="muted">
          Dans cette première version, tout reste sur votre appareil, dans le
          stockage local de votre navigateur (localStorage) : vos conversations
          par personnalité, vos lieux visités et votre registre de points MANA.
          Aucune donnée n'est envoyée vers un serveur tant qu'aucun backend
          n'est configuré.
        </p>
      </section>

      <section className="stack stack-4">
        <h2>Ce que nous ne faisons pas</h2>
        <ul className="privacy__list">
          <li>Nous ne vendons ni ne partageons vos données.</li>
          <li>Nous ne réutilisons pas le contexte d'une personnalité dans une autre sans votre accord explicite.</li>
          <li>Nous ne concevons pas de mécaniques de dépendance, de culpabilisation ou de jalousie artificielle.</li>
          <li>Nous ne récompensons ni le temps d'écran, ni le volume de messages, ni la réouverture répétée de l'app.</li>
        </ul>
      </section>

      <section className="stack stack-4">
        <h2>Supprimer vos données</h2>
        <p className="muted">
          Vous pouvez effacer l'ensemble de vos données locales à tout moment
          via le bouton ci-dessous, ou en vidant les données de site de votre
          navigateur.
        </p>
        <p className="muted quiet">
          Note honnête : dans cette version, la suppression ne concerne que le
          stockage local de ce navigateur. Quand un backend sera en place, la
          suppression s'étendra aux données serveur.
        </p>
        <DeleteAllButton />
      </section>

      <section className="stack stack-4">
        <h2>Sécurité</h2>
        <p className="muted">
          Aucun chiffrement supplémentaire n'est implémenté au-delà de celui de
          votre navigateur et de votre appareil. Nous ne prétendons pas offrir
          une protection que l'infrastructure actuelle ne fournit pas.
        </p>
      </section>
    </article>
  );
}

function DeleteAllButton() {
  const [deleted, setDeleted] = useState(false);
  const [confirming, setConfirming] = useState(false);

  function deleteAll() {
    Object.keys(localStorage)
      .filter((k) => k.startsWith("mana.love."))
      .forEach((k) => localStorage.removeItem(k));
    setDeleted(true);
    setConfirming(false);
  }

  if (deleted) {
    return (
      <p className="notice notice--info">
        Vos données locales ont été supprimées. La page d'accueil affichera un
        état neuf au prochain chargement.
      </p>
    );
  }

  return (
    <div className="cluster">
      {confirming ? (
        <>
          <button className="btn btn-primary" onClick={deleteAll}>
            Confirmer la suppression
          </button>
          <button className="btn btn-ghost" onClick={() => setConfirming(false)}>
            Annuler
          </button>
        </>
      ) : (
        <button className="btn btn-ghost" onClick={() => setConfirming(true)}>
          Supprimer toutes mes données locales
        </button>
      )}
    </div>
  );
}

