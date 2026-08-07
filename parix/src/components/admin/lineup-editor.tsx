import {
  addLineupPlayer,
  removeLineupPlayer,
  setLineupFormation,
} from "@/app/admin/matchs/actions";

const inputClass = "input py-1.5";

type LineupPlayer = {
  id: string;
  isStarter: boolean;
  shirtNumber: number | null;
  note: string | null;
  player: { name: string; position: string | null };
};

type Lineup = {
  side: "HOME" | "AWAY";
  formation: string | null;
  players: LineupPlayer[];
};

export function LineupEditor({
  matchId,
  side,
  team,
  lineup,
}: {
  matchId: string;
  side: "HOME" | "AWAY";
  team: string;
  lineup?: Lineup;
}) {
  return (
    <div className="card flex flex-col gap-3 p-4">
      <h3 className="font-semibold">{team}</h3>

      <form action={setLineupFormation} className="flex items-end gap-2">
        <input type="hidden" name="matchId" value={matchId} />
        <input type="hidden" name="side" value={side} />
        <label className="flex flex-1 flex-col gap-1 text-xs text-muted">
          Formation
          <input
            type="text"
            name="formation"
            placeholder="ex: 4-3-3"
            defaultValue={lineup?.formation ?? ""}
            className={inputClass}
          />
        </label>
        <button type="submit" className="btn-secondary px-3 py-1.5 text-xs">
          Enregistrer
        </button>
      </form>

      <ul className="flex flex-col gap-2 text-sm">
        {lineup?.players.map((entry) => (
          <li key={entry.id} className="flex items-center justify-between gap-2 border-b border-border pb-2 last:border-0">
            <span>
              {entry.shirtNumber !== null && (
                <span className="font-bold text-accent">{entry.shirtNumber} </span>
              )}
              {entry.player.name}
              {entry.player.position && (
                <span className="text-xs text-muted"> — {entry.player.position}</span>
              )}
              {!entry.isStarter && <span className="text-xs text-muted"> (remplaçant)</span>}
              {entry.note && <p className="text-xs text-muted">{entry.note}</p>}
            </span>
            <form action={removeLineupPlayer}>
              <input type="hidden" name="matchId" value={matchId} />
              <input type="hidden" name="lineupPlayerId" value={entry.id} />
              <button type="submit" className="text-xs font-medium text-danger hover:underline">
                Retirer
              </button>
            </form>
          </li>
        ))}
        {(!lineup || lineup.players.length === 0) && (
          <li className="text-xs text-muted">Aucun joueur ajouté.</li>
        )}
      </ul>

      <form action={addLineupPlayer} className="grid grid-cols-2 gap-2 border-t border-border pt-3 text-xs">
        <input type="hidden" name="matchId" value={matchId} />
        <input type="hidden" name="side" value={side} />
        <input type="text" name="name" placeholder="Nom du joueur" required className={`${inputClass} col-span-2`} />
        <input type="text" name="position" placeholder="Poste" className={inputClass} />
        <input type="number" name="shirtNumber" placeholder="N°" className={inputClass} />
        <input type="text" name="note" placeholder="Note (ex: retour de blessure)" className={`${inputClass} col-span-2`} />
        <label className="col-span-2 flex items-center gap-1.5 text-muted">
          <input type="checkbox" name="isStarter" defaultChecked />
          Titulaire
        </label>
        <button type="submit" className="btn-secondary col-span-2 py-1.5">
          + Ajouter le joueur
        </button>
      </form>
    </div>
  );
}
