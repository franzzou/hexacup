type LineupPlayer = {
  id: string;
  isStarter: boolean;
  shirtNumber: number | null;
  note: string | null;
  player: { name: string; position: string | null };
};

type Lineup = {
  id: string;
  side: "HOME" | "AWAY";
  formation: string | null;
  players: LineupPlayer[];
};

export function MatchLineups({
  lineups,
  homeTeam,
  awayTeam,
}: {
  lineups: Lineup[];
  homeTeam: string;
  awayTeam: string;
}) {
  const home = lineups.find((l) => l.side === "HOME");
  const away = lineups.find((l) => l.side === "AWAY");

  if (!home && !away) return null;

  return (
    <section className="flex flex-col gap-4 rounded-lg border border-black/10 p-4 dark:border-white/15">
      <h2 className="font-semibold">Compositions</h2>
      <div className="grid gap-6 sm:grid-cols-2">
        <LineupColumn team={homeTeam} lineup={home} />
        <LineupColumn team={awayTeam} lineup={away} />
      </div>
    </section>
  );
}

function LineupColumn({ team, lineup }: { team: string; lineup?: Lineup }) {
  if (!lineup) {
    return (
      <div>
        <h3 className="mb-2 text-sm font-medium">{team}</h3>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Composition non communiquée.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="mb-2 text-sm font-medium">
        {team}
        {lineup.formation && (
          <span className="ml-2 text-xs text-zinc-500 dark:text-zinc-400">
            ({lineup.formation})
          </span>
        )}
      </h3>
      <ul className="flex flex-col gap-2 text-sm">
        {lineup.players.map((entry) => (
          <li key={entry.id}>
            <div className="flex items-center gap-2">
              {entry.shirtNumber !== null && (
                <span className="text-zinc-400">{entry.shirtNumber}</span>
              )}
              <span className="font-medium">{entry.player.name}</span>
              {entry.player.position && (
                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                  {entry.player.position}
                </span>
              )}
              {!entry.isStarter && (
                <span className="text-xs text-zinc-400">(remplaçant)</span>
              )}
            </div>
            {entry.note && (
              <p className="ml-6 text-xs text-zinc-500 dark:text-zinc-400">{entry.note}</p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
