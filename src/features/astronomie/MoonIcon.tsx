/**
 * Icône SVG de la phase lunaire — deux arcs (bord fixe + terminateur),
 * la technique classique. Vérifiée visuellement : les 8 phases rendues
 * côte à côte reproduisent la progression réelle (nouvelle → croissant
 * montant → premier quartier → gibbeuse montante → pleine → …).
 */
export function MoonIcon({
  illumination,
  croissante,
  rayon = 18,
}: {
  illumination: number;
  croissante: boolean;
  rayon?: number;
}) {
  const rx = Math.abs(1 - 2 * illumination) * rayon;
  const coteMonte = illumination < 0.5;
  const sweepExterieur = croissante ? 1 : 0;
  const sweepInterieur = coteMonte ? (croissante ? 0 : 1) : croissante ? 1 : 0;
  const chemin = `M 0 ${-rayon} A ${rayon} ${rayon} 0 0 ${sweepExterieur} 0 ${rayon} A ${rx} ${rayon} 0 0 ${sweepInterieur} 0 ${-rayon} Z`;

  return (
    <svg
      className="ciel__lune-icone"
      width={rayon * 2}
      height={rayon * 2}
      viewBox={`${-rayon} ${-rayon} ${rayon * 2} ${rayon * 2}`}
      aria-hidden="true"
    >
      <circle cx={0} cy={0} r={rayon} className="ciel__lune-sombre" />
      <path d={chemin} className="ciel__lune-claire" />
      <circle cx={0} cy={0} r={rayon} className="ciel__lune-contour" />
    </svg>
  );
}
