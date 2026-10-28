import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="footer">
      <p className="footer__tagline">
        MANA.love — <em>Aimer la vie.</em>
      </p>
      <p className="footer__legal">
        MANA est une intelligence artificielle — chaleureuse, jamais surnaturelle.
        Les points MANA sont des points de progression ludiques, sans valeur
        monétaire, distincts des unités MANA d'Alliance.
      </p>
      <p className="footer__links">
        <Link to="/confidentialite">Confidentialité & données</Link>
      </p>
    </footer>
  );
}
