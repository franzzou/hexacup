export const BET_MARKET_LABELS: Record<string, string> = {
  MATCH_WINNER: "Vainqueur du match",
  OVER_UNDER: "Plus/Moins de buts ou points",
  BOTH_TEAMS_SCORE: "Les deux équipes marquent",
  HANDICAP: "Écart de points/buts",
  SETS_GAMES: "Nombre de jeux/sets",
  CORNERS_CARDS: "Corners / cartons",
  OTHER: "Autre",
};

export const BET_MARKET_OPTIONS = Object.entries(BET_MARKET_LABELS).map(([value, label]) => ({
  value,
  label,
}));
