import { NavLink } from "react-router-dom";
import { useI18n } from "@/app/LanguageContext";

const ITEMS = [
  { to: "/", cle: "nav.accueil", glyph: "◇" },
  { to: "/parler", cle: "nav.parler", glyph: "☾" },
  { to: "/explorer", cle: "nav.explorer", glyph: "✧" },
  { to: "/univers", cle: "nav.univers", glyph: "✿" },
  { to: "/ecouter", cle: "nav.ecouter", glyph: "♪" },
] as const;

export default function MobileNav() {
  const { t } = useI18n();
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
          <span>{t(item.cle)}</span>
        </NavLink>
      ))}
    </nav>
  );
}
