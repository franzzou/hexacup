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
    <section className="flex flex-col gap-3 rounded-lg border border-black/10 p-4 dark:border-white/15">
      <h2 className="font-semibold">Chances de gagner</h2>

      <div className="flex h-3 overflow-hidden rounded-full bg-black/5 dark:bg-white/10">
        <div className="bg-blue-600" style={{ width: `${home}%` }} />
        {draw !== null && <div className="bg-zinc-400" style={{ width: `${draw}%` }} />}
        <div className="bg-red-500" style={{ width: `${away}%` }} />
      </div>

      <div className="flex justify-between text-sm">
        <span>
          <span className="font-medium">{home}%</span>{" "}
          <span className="text-zinc-500 dark:text-zinc-400">{homeTeam}</span>
        </span>
        {draw !== null && (
          <span>
            <span className="font-medium">{draw}%</span>{" "}
            <span className="text-zinc-500 dark:text-zinc-400">Nul</span>
          </span>
        )}
        <span>
          <span className="font-medium">{away}%</span>{" "}
          <span className="text-zinc-500 dark:text-zinc-400">{awayTeam}</span>
        </span>
      </div>
    </section>
  );
}
