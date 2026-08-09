export type ConfidenceFactors = {
  formScore?: number | null;
  h2hScore?: number | null;
  contextScore?: number | null;
  statsScore?: number | null;
  marketScore?: number | null;
};

// Pondérations indicatives (cf. doc "Pistes pour renforcer la qualité des analyses")
export const CONFIDENCE_WEIGHTS: Record<keyof ConfidenceFactors, number> = {
  formScore: 25,
  h2hScore: 20,
  contextScore: 20,
  statsScore: 25,
  marketScore: 10,
};

export const CONFIDENCE_FACTOR_LABELS: Record<keyof ConfidenceFactors, string> = {
  formScore: "Forme récente pondérée",
  h2hScore: "Historique face-à-face",
  contextScore: "Contexte (absences, enjeu)",
  statsScore: "Stats avancées",
  marketScore: "Cohérence avec le marché",
};

/**
 * Agrège les facteurs renseignés (0-100 chacun) en un score de confiance
 * pondéré. Les facteurs non renseignés sont exclus et les poids des
 * facteurs restants sont renormalisés, pour ne pas pénaliser une
 * recommandation dont un facteur n'est pas disponible.
 */
export function computeConfidenceScore(factors: ConfidenceFactors): number | null {
  const entries = (Object.keys(CONFIDENCE_WEIGHTS) as (keyof ConfidenceFactors)[])
    .map((key) => ({ value: factors[key], weight: CONFIDENCE_WEIGHTS[key] }))
    .filter((entry): entry is { value: number; weight: number } => typeof entry.value === "number");

  if (entries.length === 0) return null;

  const totalWeight = entries.reduce((sum, entry) => sum + entry.weight, 0);
  const weightedSum = entries.reduce((sum, entry) => sum + entry.value * entry.weight, 0);

  return Math.round((weightedSum / totalWeight) * 10) / 10;
}
