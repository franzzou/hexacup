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
    <section className="card flex flex-col gap-4 p-5">
      <h2 className="font-bold">Compositions</h2>
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
        <h3 className="mb-2 text-sm font-semibold">{team}</h3>
        <p className="text-sm text-muted">Composition non communiquée.</p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="mb-2 text-sm font-semibold">
        {team}
        {lineup.formation && <span className="ml-2 text-xs font-normal text-muted">({lineup.formation})</span>}
      </h3>
      <ul className="flex flex-col gap-2.5 text-sm">
        {lineup.players.map((entry) => (
          <li key={entry.id}>
            <div className="flex items-center gap-2">
              {entry.shirtNumber !== null && (
                <span className="w-4 shrink-0 text-right text-xs font-bold text-accent">
                  {entry.shirtNumber}
                </span>
              )}
              <span className="font-medium">{entry.player.name}</span>
              {entry.player.position && (
                <span className="text-xs text-muted">{entry.player.position}</span>
              )}
              {!entry.isStarter && <span className="text-xs text-muted">(remplaçant)</span>}
            </div>
            {entry.note && <p className="ml-6 text-xs text-muted">{entry.note}</p>}
          </li>
        ))}
      </ul>
    </div>
  );
}
