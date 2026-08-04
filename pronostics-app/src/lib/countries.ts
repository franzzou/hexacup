const COUNTRY_FLAGS: Record<string, string> = {
  France: "🇫🇷",
  Espagne: "🇪🇸",
  Angleterre: "🏴",
  "Royaume-Uni": "🇬🇧",
  "Etats-Unis": "🇺🇸",
  Italie: "🇮🇹",
  Allemagne: "🇩🇪",
};

export function countryFlag(country: string | null | undefined) {
  if (!country) return "🌍";
  return COUNTRY_FLAGS[country] ?? "🌍";
}
