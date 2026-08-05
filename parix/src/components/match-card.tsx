import Link from "next/link";

import { countryFlag } from "@/lib/countries";

type MatchCardData = {
  id: string;
  homeTeam: string;
  awayTeam: string;
  league: string | null;
  country: string | null;
  matchDate: Date;
  status: "LIVE" | "UPCOMING" | "FINISHED" | "POSTPONED" | "CANCELED";
  homeScore: number | null;
  awayScore: number | null;
  sport: { name: string };
};

export function MatchCard({ match }: { match: MatchCardData }) {
  return (
    <Link
      href={`/matchs/${match.id}`}
      className="flex items-center justify-between gap-4 rounded-lg border border-black/10 bg-white px-4 py-3 transition-colors hover:border-black/25 dark:border-white/15 dark:bg-black dark:hover:border-white/30"
    >
      <div className="flex flex-1 flex-col gap-1">
        <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
          <span>{match.sport.name}</span>
          <span>·</span>
          <span>
            {countryFlag(match.country)} {match.league ?? match.country}
          </span>
        </div>
        <div className="font-medium">
          {match.homeTeam} <span className="text-zinc-400">vs</span> {match.awayTeam}
        </div>
      </div>

      <div className="flex flex-col items-end gap-1">
        {match.status === "LIVE" ? (
          <span className="flex items-center gap-1.5 rounded-full bg-red-600/10 px-2.5 py-1 text-xs font-semibold text-red-600">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-600" />
            EN DIRECT
          </span>
        ) : (
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            {match.matchDate.toLocaleString("fr-FR", {
              weekday: "short",
              day: "numeric",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        )}
        {match.status === "LIVE" && match.homeScore !== null && match.awayScore !== null && (
          <span className="text-sm font-semibold">
            {match.homeScore} - {match.awayScore}
          </span>
        )}
      </div>
    </Link>
  );
}
