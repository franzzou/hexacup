import Link from "next/link";
import { notFound } from "next/navigation";

import { countryFlag } from "@/lib/countries";
import { auth } from "@/lib/auth";
import { userHasSportAccess } from "@/lib/access";
import { prisma } from "@/lib/prisma";
import { MatchLineups } from "@/components/match-lineups";
import { WinProbability } from "@/components/win-probability";

const RESULT_LABELS: Record<string, string> = {
  PENDING: "En attente",
  WON: "Réussi",
  LOST: "Raté",
  VOID: "Annulé",
};

const RESULT_CLASSES: Record<string, string> = {
  PENDING: "bg-surface-2 text-muted",
  WON: "bg-success/15 text-success",
  LOST: "bg-danger/15 text-danger",
  VOID: "bg-surface-2 text-muted",
};

export default async function MatchPage(props: PageProps<"/matchs/[id]">) {
  const { id } = await props.params;

  const match = await prisma.match.findUnique({
    where: { id },
    include: {
      sport: true,
      stats: true,
      recommendations: { orderBy: { createdAt: "desc" } },
      lineups: {
        include: {
          players: {
            include: { player: true },
            orderBy: [{ isStarter: "desc" }],
          },
        },
      },
    },
  });

  if (!match) notFound();

  const session = await auth();
  const hasAccess = session?.user
    ? await userHasSportAccess(session.user.id, match.sportId)
    : false;

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10">
      <div className="mb-6 flex items-center gap-2 text-xs">
        <span className="font-semibold uppercase tracking-wide text-muted/80">
          {match.sport.name}
        </span>
        <span className="text-muted">·</span>
        <span className="text-muted">
          {countryFlag(match.country)} {match.league ?? match.country}
        </span>
      </div>

      <h1 className="mb-2 text-3xl font-black tracking-tight">
        {match.homeTeam} <span className="text-muted">vs</span> {match.awayTeam}
      </h1>

      <div className="mb-1 flex items-center gap-2">
        {match.status === "LIVE" ? (
          <span className="badge-live">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
            En direct
          </span>
        ) : (
          <p className="text-sm font-medium text-muted">
            {match.matchDate.toLocaleString("fr-FR", {
              weekday: "long",
              day: "numeric",
              month: "long",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        )}
        {match.status === "LIVE" && match.homeScore !== null && match.awayScore !== null && (
          <span className="text-lg font-black">
            {match.homeScore} - {match.awayScore}
          </span>
        )}
      </div>
      <p className="mb-8 text-sm text-muted">
        {[match.venue, match.referee && `Arbitre : ${match.referee}`].filter(Boolean).join(" · ")}
      </p>

      {hasAccess ? (
        <div className="flex flex-col gap-6">
          {match.stats && (
            <section className="card flex flex-col gap-3 p-5">
              <h2 className="font-bold">Statistiques</h2>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <dt className="text-muted">Forme {match.homeTeam}</dt>
                <dd className="font-medium">{match.stats.homeForm ?? "—"}</dd>
                <dt className="text-muted">Forme {match.awayTeam}</dt>
                <dd className="font-medium">{match.stats.awayForm ?? "—"}</dd>
              </dl>
              {match.stats.h2hSummary && (
                <p className="border-t border-border pt-3 text-sm text-muted">
                  {match.stats.h2hSummary}
                </p>
              )}
            </section>
          )}

          {match.stats?.analysis && (
            <section className="card flex flex-col gap-2 p-5">
              <h2 className="font-bold">Analyse</h2>
              <p className="text-sm text-muted">{match.stats.analysis}</p>
            </section>
          )}

          <WinProbability
            homeTeam={match.homeTeam}
            awayTeam={match.awayTeam}
            home={match.stats?.homeWinProbability ?? null}
            draw={match.stats?.drawProbability ?? null}
            away={match.stats?.awayWinProbability ?? null}
          />

          <MatchLineups
            lineups={match.lineups}
            homeTeam={match.homeTeam}
            awayTeam={match.awayTeam}
          />

          <section className="flex flex-col gap-3">
            <h2 className="font-bold">Recommandations</h2>
            {match.recommendations.length === 0 && (
              <p className="text-sm text-muted">
                Aucune recommandation publiée pour ce match pour le moment.
              </p>
            )}
            {match.recommendations.map((rec) => (
              <article key={rec.id} className="card flex flex-col gap-2 p-5">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-semibold">{rec.title}</h3>
                  <span className={`badge ${RESULT_CLASSES[rec.result]}`}>
                    {RESULT_LABELS[rec.result]}
                  </span>
                </div>
                <p className="text-sm text-muted">{rec.analysis}</p>
                {rec.confidence !== null && (
                  <p className="text-xs font-medium text-accent">
                    Confiance : {rec.confidence}/5
                  </p>
                )}
              </article>
            ))}
          </section>
        </div>
      ) : (
        <div className="card flex flex-col items-center gap-4 p-10 text-center">
          <span className="text-3xl">🔒</span>
          <p className="text-lg font-bold">
            Les statistiques et recommandations de ce match sont réservées aux abonnés{" "}
            {match.sport.name}.
          </p>
          <p className="text-sm text-muted">
            {session?.user
              ? "Ton abonnement actuel ne couvre pas ce sport."
              : "Connecte-toi ou crée un compte pour accéder à nos offres."}
          </p>
          <div className="flex gap-3">
            {session?.user ? (
              <Link href="/offres" className="btn-primary">
                Voir les offres
              </Link>
            ) : (
              <>
                <Link href={`/login?callbackUrl=/matchs/${match.id}`} className="btn-secondary">
                  Se connecter
                </Link>
                <Link href="/offres" className="btn-primary">
                  Voir les offres
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
