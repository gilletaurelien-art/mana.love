import { useState, type FormEvent } from "react";
import { useI18n } from "@/app/LanguageContext";
import { themeAstral, type PositionAstrale, type CorpsCeleste } from "@/domain/themeAstral";
import "./astrologie.css";

const GLYPHE_CORPS: Record<CorpsCeleste, string> = {
  soleil: "☉",
  lune: "☾",
  mercure: "☿",
  venus: "♀",
  mars: "♂",
  jupiter: "♃",
  saturne: "♄",
};

const GLYPHE_SIGNE: Record<PositionAstrale["signe"], string> = {
  belier: "♈",
  taureau: "♉",
  gemeaux: "♊",
  cancer: "♋",
  lion: "♌",
  vierge: "♍",
  balance: "♎",
  scorpion: "♏",
  sagittaire: "♐",
  capricorne: "♑",
  verseau: "♒",
  poissons: "♓",
};

export default function ThemeAstralScreen() {
  const { t } = useI18n();
  const [date, setDate] = useState("");
  const [heure, setHeure] = useState("12:00");
  const [heureInconnue, setHeureInconnue] = useState(false);
  const [theme, setTheme] = useState<readonly PositionAstrale[] | null>(null);

  function calculer(e: FormEvent): void {
    e.preventDefault();
    if (!date) return;
    const heureEffective = heureInconnue ? "12:00" : heure || "12:00";
    const instant = new Date(`${date}T${heureEffective}:00Z`);
    if (Number.isNaN(instant.getTime())) return;
    setTheme(themeAstral(instant));
  }

  return (
    <div className="theme-astral">
      <div className="page-header">
        <p className="eyebrow">{t("themeAstral.eyebrow")}</p>
        <h1>{t("themeAstral.titre")}</h1>
        <p className="lead">{t("themeAstral.lead")}</p>
      </div>

      <div className="notice notice--info" role="note">
        <strong>{t("themeAstral.cadreTitre")}</strong> {t("themeAstral.cadreTexte")}
      </div>

      <form className="stack stack-3 theme-astral__form" onSubmit={calculer}>
        <div className="cluster">
          <div>
            <label htmlFor="theme-date">{t("themeAstral.dateLabel")}</label>
            <input
              id="theme-date"
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="theme-heure">{t("themeAstral.heureLabel")}</label>
            <input
              id="theme-heure"
              type="time"
              value={heure}
              disabled={heureInconnue}
              onChange={(e) => setHeure(e.target.value)}
            />
          </div>
        </div>
        <label className="theme-astral__case">
          <input
            type="checkbox"
            checked={heureInconnue}
            onChange={(e) => setHeureInconnue(e.target.checked)}
          />
          {t("themeAstral.heureInconnue")}
        </label>
        <div>
          <button className="btn btn-primary" type="submit" disabled={!date}>
            {t("themeAstral.calculer")}
          </button>
        </div>
      </form>

      {theme && (
        <section className="theme-astral__resultats" aria-label={t("themeAstral.resultatTitre")}>
          <h2>{t("themeAstral.resultatTitre")}</h2>
          <ul className="theme-astral__liste">
            {theme.map((p) => (
              <li key={p.corps} className="surface surface-pad theme-astral__ligne">
                <span className="theme-astral__glyphe" aria-hidden="true">
                  {GLYPHE_CORPS[p.corps]}
                </span>
                <span className="theme-astral__nom">{t(`corps.${p.corps}`)}</span>
                <span className="theme-astral__signe">
                  <span aria-hidden="true">{GLYPHE_SIGNE[p.signe]}</span> {t(`signe.${p.signe}`)}
                </span>
                <span className="quiet">
                  {t("themeAstral.degre", { n: Math.round(p.degreDansSigne) })}
                </span>
              </li>
            ))}
          </ul>
          <p className="quiet theme-astral__note">{t("themeAstral.ascendantNote")}</p>
        </section>
      )}
    </div>
  );
}
