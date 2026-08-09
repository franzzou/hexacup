type Stats = {
  homeAvgXg: number | null;
  homeAvgXga: number | null;
  awayAvgXg: number | null;
  awayAvgXga: number | null;
  homeOffRating: number | null;
  homeDefRating: number | null;
  awayOffRating: number | null;
  awayDefRating: number | null;
  homePace: number | null;
  awayPace: number | null;
  homeServeWinPct: number | null;
  awayServeWinPct: number | null;
  homeReturnWinPct: number | null;
  awayReturnWinPct: number | null;
};

export function AdvancedStats({
  sportSlug,
  stats,
  homeTeam,
  awayTeam,
}: {
  sportSlug: string;
  stats: Stats;
  homeTeam: string;
  awayTeam: string;
}) {
  let rows: { label: string; home: number | null; away: number | null }[] = [];

  if (sportSlug === "football") {
    rows = [
      { label: "xG (buts attendus/match)", home: stats.homeAvgXg, away: stats.awayAvgXg },
      { label: "xGA (buts concédés attendus/match)", home: stats.homeAvgXga, away: stats.awayAvgXga },
    ];
  } else if (sportSlug === "basketball") {
    rows = [
      { label: "Efficacité offensive", home: stats.homeOffRating, away: stats.awayOffRating },
      { label: "Efficacité défensive", home: stats.homeDefRating, away: stats.awayDefRating },
      { label: "Rythme (pace)", home: stats.homePace, away: stats.awayPace },
    ];
  } else if (sportSlug === "tennis") {
    rows = [
      { label: "% points gagnés au service", home: stats.homeServeWinPct, away: stats.awayServeWinPct },
      { label: "% points gagnés au retour", home: stats.homeReturnWinPct, away: stats.awayReturnWinPct },
    ];
  }

  rows = rows.filter((row) => row.home !== null || row.away !== null);
  if (rows.length === 0) return null;

  return (
    <section className="card flex flex-col gap-3 p-5">
      <h2 className="font-bold">Stats avancées</h2>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs text-muted">
            <th className="pb-2 font-normal" />
            <th className="pb-2 text-right font-normal">{homeTeam}</th>
            <th className="pb-2 text-right font-normal">{awayTeam}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label} className="border-t border-border">
              <td className="py-2 text-muted">{row.label}</td>
              <td className="py-2 text-right font-medium">{row.home ?? "—"}</td>
              <td className="py-2 text-right font-medium">{row.away ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
