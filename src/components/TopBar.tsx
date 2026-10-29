import { NavLink, Link } from "react-router-dom";
import { useI18n } from "@/app/LanguageContext";
import { LANGUES, type Langue } from "@/i18n";

const NAV_KEYS = [
  { to: "/", cle: "nav.accueil" as const },
  { to: "/parler", cle: "nav.parler" as const },
  { to: "/explorer", cle: "nav.explorer" as const },
  { to: "/univers", cle: "nav.univers" as const },
  { to: "/ecouter", cle: "nav.ecouter" as const },
];

export default function TopBar({ balance }: { balance: number }) {
  const { t, langue, setLangue } = useI18n();

  return (
    <header className="topbar">
      <div className="topbar__inner">
        <Link to="/" className="topbar__brand">
          <img src="/mana.svg" alt="" width={34} height={34} />
          <span className="topbar__brandtext">
            MANA<span className="topbar__dot">.love</span>
          </span>
        </Link>
        <nav aria-label="Navigation principale" className="topbar__nav">
          {NAV_KEYS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === "/"}
              className={({ isActive }) =>
                `topbar__link${isActive ? " topbar__link--active" : ""}`
              }
            >
              {t(link.cle)}
            </NavLink>
          ))}
        </nav>
        <div className="topbar__meta">
          <select
            className="topbar__langue"
            aria-label="Langue / Language"
            value={langue}
            onChange={(e) => setLangue(e.target.value as Langue)}
          >
            {LANGUES.map((l) => (
              <option key={l.code} value={l.code}>
                {l.code.toUpperCase()}
              </option>
            ))}
          </select>
          <span
            className="topbar__points"
            title="Points de progression MANA — ludiques, sans valeur monétaire"
          >
            <span aria-hidden="true">✦</span> {balance}
          </span>
        </div>
      </div>
    </header>
  );
}
