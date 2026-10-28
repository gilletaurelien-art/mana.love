import { NavLink } from "react-router-dom";

const ITEMS = [
  { to: "/", label: "Accueil", glyph: "◇" },
  { to: "/parler", label: "Parler", glyph: "☾" },
  { to: "/explorer", label: "Explorer", glyph: "✧" },
  { to: "/univers", label: "Univers", glyph: "✿" },
  { to: "/ecouter", label: "Écouter", glyph: "♪" },
];

export default function MobileNav() {
  return (
    <nav aria-label="Navigation mobile" className="mobilenav">
      {ITEMS.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === "/"}
          className={({ isActive }) =>
            `mobilenav__item${isActive ? " mobilenav__item--active" : ""}`
          }
        >
          <span aria-hidden="true" className="mobilenav__glyph">{item.glyph}</span>
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
