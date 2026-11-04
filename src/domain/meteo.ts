/**
 * Domain: météo — fenêtre d'opportunité pour une sortie.
 *
 * Logique pure, sans dépendance réseau : elle reçoit des points horaires
 * déjà mesurés (température, probabilité de pluie) et choisit la
 * meilleure fenêtre pour sortir. L'appel réseau (Open-Meteo) vit dans
 * `server/weather.ts` et `src/infrastructure/weatherService.ts`.
 */

export interface PointMeteo {
  /** Heure ISO 8601 locale du point (ex. "2026-11-03T15:00"). */
  heureISO: string;
  /** Probabilité de précipitations, en pourcentage (0-100). */
  probabilitePluie: number;
  temperatureC: number;
}

export interface FenetreMeteo extends PointMeteo {
  /** true si cette fenêtre est jugée sèche (sous le seuil). */
  seche: boolean;
}

/** Au-delà de ce seuil, une heure est considérée comme pluvieuse. */
export const SEUIL_PLUIE_POURCENT = 30;

/**
 * Choisit la meilleure fenêtre pour sortir dans les prochaines
 * `horizonHeures` heures : la plus sèche, et parmi les plus sèches, la
 * plus proche dans le temps. `null` si aucun point ne tombe dans
 * l'horizon, ou si une heure sèche n'existe nulle part dans la fenêtre.
 */
export function meilleureFenetre(
  points: readonly PointMeteo[],
  maintenantISO: string,
  horizonHeures = 6
): FenetreMeteo | null {
  const maintenant = Date.parse(maintenantISO);
  const limite = maintenant + horizonHeures * 60 * 60 * 1000;

  const dansHorizon = points.filter((p) => {
    const t = Date.parse(p.heureISO);
    return Number.isFinite(t) && t >= maintenant && t <= limite;
  });
  if (dansHorizon.length === 0) return null;

  const plusSeche = [...dansHorizon].sort((a, b) => {
    if (a.probabilitePluie !== b.probabilitePluie) {
      return a.probabilitePluie - b.probabilitePluie;
    }
    return Date.parse(a.heureISO) - Date.parse(b.heureISO);
  })[0];

  if (plusSeche.probabilitePluie > SEUIL_PLUIE_POURCENT) {
    // Aucune heure vraiment sèche dans l'horizon : pas de bonne fenêtre,
    // mieux vaut le dire que proposer la "moins pire" sans le signaler.
    return null;
  }

  return { ...plusSeche, seche: true };
}

/**
 * Phrase courte pour l'UI, dans le ton de systemPrompt.ts : factuelle,
 * jamais alarmiste. `null` en entrée = pas de bonne fenêtre trouvée.
 */
export function decrireFenetre(fenetre: FenetreMeteo | null): string {
  if (!fenetre) {
    return "Pluie probable dans les prochaines heures — pas de fenêtre sèche trouvée pour l'instant.";
  }
  // Extrait l'heure directement de la chaîne ISO plutôt que de passer par
  // `Date` : la valeur vient d'Open-Meteo en "timezone=auto" (déjà locale
  // au lieu), et la lire comme texte évite toute question d'interprétation
  // de fuseau — il n'y en a pas besoin.
  const correspondance = /T(\d{2}):(\d{2})/.exec(fenetre.heureISO);
  const heureTexte = correspondance ? `${correspondance[1]}h${correspondance[2]}` : fenetre.heureISO;
  return `Fenêtre sèche vers ${heureTexte} (${Math.round(fenetre.temperatureC)}°C, ${fenetre.probabilitePluie}% de pluie).`;
}
