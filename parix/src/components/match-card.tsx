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
      className="group flex items-center justify-between gap-4 rounded-lg border border-border bg-surface px-4 py-3.5 transition-colors hover:border-accent/50 hover:bg-surface-2"
    >
      <div className="flex flex-1 flex-col gap-1">
        <div className="flex items-center gap-2 text-xs text-muted">
          <span className="font-semibold uppercase tracking-wide text-muted/80">
            {match.sport.name}
          </span>
          <span>·</span>
          <span>
            {countryFlag(match.country)} {match.league ?? match.country}
          </span>
        </div>
        <div className="font-semibold text-foreground">
          {match.homeTeam} <span className="text-muted">vs</span> {match.awayTeam}
        </div>
      </div>

      <div className="flex flex-col items-end gap-1">
        {match.status === "LIVE" ? (
          <span className="badge-live">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
            En direct
          </span>
        ) : (
          <span className="text-xs font-medium text-muted">
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
          <span className="text-sm font-bold text-foreground">
            {match.homeScore} - {match.awayScore}
          </span>
        )}
      </div>
    </Link>
  );
}
