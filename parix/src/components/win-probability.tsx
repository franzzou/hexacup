export function WinProbability({
  homeTeam,
  awayTeam,
  home,
  draw,
  away,
}: {
  homeTeam: string;
  awayTeam: string;
  home: number | null;
  draw: number | null;
  away: number | null;
}) {
  if (home === null || away === null) return null;

  return (
    <section className="card flex flex-col gap-3 p-5">
      <h2 className="font-bold">Chances de gagner</h2>

      <div className="flex h-2.5 overflow-hidden rounded-full bg-surface-2">
        <div className="bg-accent" style={{ width: `${home}%` }} />
        {draw !== null && <div className="bg-muted/50" style={{ width: `${draw}%` }} />}
        <div className="bg-foreground" style={{ width: `${away}%` }} />
      </div>

      <div className="flex justify-between text-sm">
        <span>
          <span className="font-bold text-accent">{home}%</span>{" "}
          <span className="text-muted">{homeTeam}</span>
        </span>
        {draw !== null && (
          <span>
            <span className="font-bold">{draw}%</span> <span className="text-muted">Nul</span>
          </span>
        )}
        <span>
          <span className="font-bold">{away}%</span> <span className="text-muted">{awayTeam}</span>
        </span>
      </div>
    </section>
  );
}
