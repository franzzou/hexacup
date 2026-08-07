import { notFound } from "next/navigation";

import { LineupEditor } from "@/components/admin/lineup-editor";
import { MatchForm } from "@/components/admin/match-form";
import { RecommendationsEditor } from "@/components/admin/recommendations-editor";
import { prisma } from "@/lib/prisma";

import { updateMatch, upsertMatchStats } from "../actions";

const inputClass =
  "rounded-md border border-black/10 px-3 py-2 text-sm dark:border-white/20 dark:bg-black";

export default async function AdminMatchPage(props: PageProps<"/admin/matchs/[id]">) {
  const { id } = await props.params;

  const [match, sports] = await Promise.all([
    prisma.match.findUnique({
      where: { id },
      include: {
        stats: true,
        recommendations: { orderBy: { createdAt: "desc" } },
        lineups: {
          include: { players: { include: { player: true }, orderBy: [{ isStarter: "desc" }] } },
        },
      },
    }),
    prisma.sport.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!match) notFound();

  const homeLineup = match.lineups.find((l) => l.side === "HOME");
  const awayLineup = match.lineups.find((l) => l.side === "AWAY");

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="mb-4 text-xl font-semibold">
          {match.homeTeam} vs {match.awayTeam}
        </h1>
        <MatchForm
          action={updateMatch}
          sports={sports}
          submitLabel="Enregistrer les informations"
          defaultValues={{
            id: match.id,
            sportId: match.sportId,
            homeTeam: match.homeTeam,
            awayTeam: match.awayTeam,
            league: match.league,
            country: match.country,
            venue: match.venue,
            referee: match.referee,
            matchDate: match.matchDate,
            status: match.status,
            externalId: match.externalId,
          }}
        />
      </div>

      <div>
        <h2 className="mb-3 text-lg font-semibold">Statistiques &amp; analyse</h2>
        <form action={upsertMatchStats} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <input type="hidden" name="matchId" value={match.id} />

          <label className="flex flex-col gap-1 text-sm">
            Forme {match.homeTeam}
            <input type="text" name="homeForm" placeholder="ex: WWDLW" defaultValue={match.stats?.homeForm ?? ""} className={inputClass} />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Forme {match.awayTeam}
            <input type="text" name="awayForm" placeholder="ex: WDLWD" defaultValue={match.stats?.awayForm ?? ""} className={inputClass} />
          </label>

          <label className="flex flex-col gap-1 text-sm sm:col-span-2">
            Résumé des confrontations
            <textarea name="h2hSummary" rows={2} defaultValue={match.stats?.h2hSummary ?? ""} className={inputClass} />
          </label>

          <label className="flex flex-col gap-1 text-sm sm:col-span-2">
            Analyse générale
            <textarea name="analysis" rows={4} defaultValue={match.stats?.analysis ?? ""} className={inputClass} />
          </label>

          <label className="flex flex-col gap-1 text-sm">
            Chances de victoire {match.homeTeam} (%)
            <input type="number" name="homeWinProbability" min={0} max={100} defaultValue={match.stats?.homeWinProbability ?? ""} className={inputClass} />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Chances de match nul (%)
            <input type="number" name="drawProbability" min={0} max={100} defaultValue={match.stats?.drawProbability ?? ""} className={inputClass} />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Chances de victoire {match.awayTeam} (%)
            <input type="number" name="awayWinProbability" min={0} max={100} defaultValue={match.stats?.awayWinProbability ?? ""} className={inputClass} />
          </label>

          <div className="sm:col-span-2">
            <button type="submit" className="rounded-full bg-foreground px-5 py-2 text-sm font-medium text-background">
              Enregistrer les statistiques
            </button>
          </div>
        </form>
      </div>

      <div>
        <h2 className="mb-3 text-lg font-semibold">Compositions</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <LineupEditor matchId={match.id} side="HOME" team={match.homeTeam} lineup={homeLineup} />
          <LineupEditor matchId={match.id} side="AWAY" team={match.awayTeam} lineup={awayLineup} />
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-lg font-semibold">Recommandations</h2>
        <RecommendationsEditor matchId={match.id} recommendations={match.recommendations} />
      </div>
    </div>
  );
}
