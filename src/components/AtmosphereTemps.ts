/**
 * Phase du jour : l'atmosphère respire avec l'heure réelle de la personne.
 *
 * Nuit profonde, aube, jour, crépuscule : la teinte, la position et
 * l'intensité de la lumière suivent l'horloge locale — l'app vit dans
 * le même temps que la personne, sans géolocalisation, sans donnée
 * stockée : l'heure locale du navigateur suffit.
 */

export type Phase = "nuit" | "aube" | "jour" | "crepuscule";

/** Bornes locales approximées : aube 5–9 h, jour 9–18 h, crépuscule 18–21 h. */
export function phasePourHeure(heure: number): Phase {
  if (heure >= 5 && heure < 9) return "aube";
  if (heure >= 9 && heure < 18) return "jour";
  if (heure >= 18 && heure < 21) return "crepuscule";
  return "nuit";
}

/** Poser la phase courante sur <html> — mis à jour chaque minute. */
export function installerPhaseTempsReel(): () => void {
  const maj = () => {
    const heure = new Date().getHours();
    document.documentElement.dataset.phase = phasePourHeure(heure);
  };
  maj();
  const timer = window.setInterval(maj, 60_000);
  return () => window.clearInterval(timer);
}
