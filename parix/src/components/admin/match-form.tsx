import { toDatetimeLocalValue } from "@/lib/dates";

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: "UPCOMING", label: "À venir" },
  { value: "LIVE", label: "En direct" },
  { value: "FINISHED", label: "Terminé" },
  { value: "POSTPONED", label: "Reporté" },
  { value: "CANCELED", label: "Annulé" },
];

const inputClass =
  "rounded-md border border-black/10 px-3 py-2 text-sm dark:border-white/20 dark:bg-black";

export function MatchForm({
  action,
  sports,
  submitLabel,
  defaultValues,
}: {
  action: (formData: FormData) => void;
  sports: { id: string; name: string }[];
  submitLabel: string;
  defaultValues?: {
    id?: string;
    sportId: string;
    homeTeam: string;
    awayTeam: string;
    league: string | null;
    country: string | null;
    venue: string | null;
    referee: string | null;
    matchDate: Date;
    status: string;
    externalId?: string;
  };
}) {
  return (
    <form action={action} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {defaultValues?.id && <input type="hidden" name="matchId" value={defaultValues.id} />}
      {defaultValues?.externalId && (
        <input type="hidden" name="externalId" value={defaultValues.externalId} />
      )}

      <label className="flex flex-col gap-1 text-sm">
        Sport
        <select
          name="sportId"
          required
          defaultValue={defaultValues?.sportId}
          className={inputClass}
        >
          <option value="" disabled>
            Choisir un sport
          </option>
          {sports.map((sport) => (
            <option key={sport.id} value={sport.id}>
              {sport.name}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Statut
        <select
          name="status"
          required
          defaultValue={defaultValues?.status ?? "UPCOMING"}
          className={inputClass}
        >
          {STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Équipe/joueur à domicile
        <input
          type="text"
          name="homeTeam"
          required
          defaultValue={defaultValues?.homeTeam}
          className={inputClass}
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Équipe/joueur à l&apos;extérieur
        <input
          type="text"
          name="awayTeam"
          required
          defaultValue={defaultValues?.awayTeam}
          className={inputClass}
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Compétition / ligue
        <input
          type="text"
          name="league"
          defaultValue={defaultValues?.league ?? ""}
          className={inputClass}
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Pays
        <input
          type="text"
          name="country"
          defaultValue={defaultValues?.country ?? ""}
          className={inputClass}
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Stade / salle
        <input
          type="text"
          name="venue"
          defaultValue={defaultValues?.venue ?? ""}
          className={inputClass}
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Arbitre
        <input
          type="text"
          name="referee"
          defaultValue={defaultValues?.referee ?? ""}
          className={inputClass}
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Date et heure
        <input
          type="datetime-local"
          name="matchDate"
          required
          defaultValue={
            defaultValues?.matchDate ? toDatetimeLocalValue(defaultValues.matchDate) : ""
          }
          className={inputClass}
        />
      </label>

      <div className="sm:col-span-2">
        <button
          type="submit"
          className="rounded-full bg-foreground px-5 py-2 text-sm font-medium text-background"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
