export type PerformanceRecommendation = {
  result: string;
  market: string;
  odds: number | null;
};

export type PerformanceBucket = {
  key: string;
  label: string;
  total: number;
  won: number;
  lost: number;
  successRate: number | null; // % sur les paris tranchés (won+lost), null si aucun
};

function summarize(recs: PerformanceRecommendation[]): Omit<PerformanceBucket, "key" | "label"> {
  const won = recs.filter((r) => r.result === "WON").length;
  const lost = recs.filter((r) => r.result === "LOST").length;
  const settled = won + lost;
  return {
    total: recs.length,
    won,
    lost,
    successRate: settled > 0 ? Math.round((won / settled) * 1000) / 10 : null,
  };
}

export function groupBySummary(
  recs: PerformanceRecommendation[],
  keyOf: (r: PerformanceRecommendation) => string,
  labelOf: (key: string) => string,
): PerformanceBucket[] {
  const keys = Array.from(new Set(recs.map(keyOf)));
  return keys
    .map((key) => ({
      key,
      label: labelOf(key),
      ...summarize(recs.filter((r) => keyOf(r) === key)),
    }))
    .sort((a, b) => b.total - a.total);
}

/** ROI théorique à mise fixe (1 unité), sur les paris tranchés avec une cote renseignée. */
export function computeTheoreticalRoi(recs: PerformanceRecommendation[]) {
  const settled = recs.filter((r) => (r.result === "WON" || r.result === "LOST") && r.odds !== null);
  if (settled.length === 0) return null;

  const staked = settled.length;
  const returns = settled.reduce((sum, r) => sum + (r.result === "WON" ? (r.odds ?? 0) : 0), 0);
  const profit = returns - staked;

  return { staked, profit: Math.round(profit * 100) / 100, roiPct: Math.round((profit / staked) * 1000) / 10 };
}
