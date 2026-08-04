import Link from "next/link";
import { notFound } from "next/navigation";

import { countryFlag } from "@/lib/countries";
import { auth } from "@/lib/auth";
import { userHasSportAccess } from "@/lib/access";
import { prisma } from "@/lib/prisma";
import { MatchLineups } from "@/components/match-lineups";

const RESULT_LABELS: Record<string, string> = {
  PENDING: "En attente",
  WON: "Réussi",
  LOST: "Raté",
  VOID: "Annulé",
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
      <div className="mb-6 flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
        <span>{match.sport.name}</span>
        <span>·</span>
        <span>
          {countryFlag(match.country)} {match.league ?? match.country}
        </span>
      </div>

      <h1 className="mb-2 text-2xl font-semibold">
        {match.homeTeam} <span className="text-zinc-400">vs</span> {match.awayTeam}
      </h1>

      <p className="mb-8 text-sm text-zinc-500 dark:text-zinc-400">
        {match.status === "LIVE"
          ? `En direct${
              match.homeScore !== null && match.awayScore !== null
                ? ` — ${match.homeScore} - ${match.awayScore}`
                : ""
            }`
          : match.matchDate.toLocaleString("fr-FR", {
              weekday: "long",
              day: "numeric",
              month: "long",
              hour: "2-digit",
              minute: "2-digit",
            })}
      </p>

      {hasAccess ? (
        <div className="flex flex-col gap-8">
          {match.stats && (
            <section className="flex flex-col gap-2 rounded-lg border border-black/10 p-4 dark:border-white/15">
              <h2 className="font-semibold">Statistiques</h2>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <dt className="text-zinc-500 dark:text-zinc-400">Forme {match.homeTeam}</dt>
                <dd>{match.stats.homeForm ?? "—"}</dd>
                <dt className="text-zinc-500 dark:text-zinc-400">Forme {match.awayTeam}</dt>
                <dd>{match.stats.awayForm ?? "—"}</dd>
              </dl>
              {match.stats.h2hSummary && (
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  {match.stats.h2hSummary}
                </p>
              )}
            </section>
          )}

          {match.stats?.analysis && (
            <section className="flex flex-col gap-2 rounded-lg border border-black/10 p-4 dark:border-white/15">
              <h2 className="font-semibold">Analyse</h2>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">{match.stats.analysis}</p>
            </section>
          )}

          <MatchLineups
            lineups={match.lineups}
            homeTeam={match.homeTeam}
            awayTeam={match.awayTeam}
          />

          <section className="flex flex-col gap-4">
            <h2 className="font-semibold">Recommandations</h2>
            {match.recommendations.length === 0 && (
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Aucune recommandation publiée pour ce match pour le moment.
              </p>
            )}
            {match.recommendations.map((rec) => (
              <article
                key={rec.id}
                className="flex flex-col gap-2 rounded-lg border border-black/10 p-4 dark:border-white/15"
              >
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-medium">{rec.title}</h3>
                  <span className="rounded-full bg-black/5 px-2.5 py-1 text-xs font-medium dark:bg-white/10">
                    {RESULT_LABELS[rec.result]}
                  </span>
                </div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">{rec.analysis}</p>
                {rec.confidence !== null && (
                  <p className="text-xs text-zinc-500 dark:text-zinc-500">
                    Confiance : {rec.confidence}/5
                  </p>
                )}
              </article>
            ))}
          </section>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4 rounded-lg border border-black/10 p-8 text-center dark:border-white/15">
          <p className="text-lg font-medium">
            Les statistiques et recommandations de ce match sont réservées aux abonnés{" "}
            {match.sport.name}.
          </p>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {session?.user
              ? "Ton abonnement actuel ne couvre pas ce sport."
              : "Connecte-toi ou crée un compte pour accéder à nos offres."}
          </p>
          <div className="flex gap-3">
            {session?.user ? (
              <Link
                href="/offres"
                className="rounded-full bg-foreground px-5 py-2 text-sm font-medium text-background"
              >
                Voir les offres
              </Link>
            ) : (
              <>
                <Link
                  href={`/login?callbackUrl=/matchs/${match.id}`}
                  className="rounded-full border border-black/10 px-5 py-2 text-sm font-medium dark:border-white/20"
                >
                  Se connecter
                </Link>
                <Link
                  href="/offres"
                  className="rounded-full bg-foreground px-5 py-2 text-sm font-medium text-background"
                >
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
