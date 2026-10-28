import { NavLink, Link } from "react-router-dom";

const NAV_LINKS = [
  { to: "/", label: "Accueil" },
  { to: "/parler", label: "Parler" },
  { to: "/explorer", label: "Explorer" },
  { to: "/univers", label: "Mes univers" },
  { to: "/ecouter", label: "Écouter" },
];

export default function TopBar({ balance }: { balance: number }) {
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
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === "/"}
              className={({ isActive }) =>
                `topbar__link${isActive ? " topbar__link--active" : ""}`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="topbar__meta">
          <span className="topbar__points" title="Points de progression MANA — ludiques, sans valeur monétaire">
            <span aria-hidden="true">✦</span> {balance}
          </span>
        </div>
      </div>
    </header>
  );
}
