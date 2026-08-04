import { MatchCard } from "@/components/match-card";
import { MatchFilters } from "@/components/match-filters";
import { prisma } from "@/lib/prisma";

export default async function Home(props: PageProps<"/">) {
  const searchParams = await props.searchParams;
  const sportSlug = typeof searchParams.sport === "string" ? searchParams.sport : undefined;
  const country = typeof searchParams.country === "string" ? searchParams.country : undefined;

  const [sports, countryRows, liveMatches, upcomingMatches] = await Promise.all([
    prisma.sport.findMany({ orderBy: { name: "asc" } }),
    prisma.match.findMany({
      where: { country: { not: null } },
      select: { country: true },
      distinct: ["country"],
      orderBy: { country: "asc" },
    }),
    prisma.match.findMany({
      where: {
        status: "LIVE",
        sport: sportSlug ? { slug: sportSlug } : undefined,
        country: country || undefined,
      },
      include: { sport: true },
      orderBy: { matchDate: "asc" },
    }),
    prisma.match.findMany({
      where: {
        status: "UPCOMING",
        sport: sportSlug ? { slug: sportSlug } : undefined,
        country: country || undefined,
      },
      include: { sport: true },
      orderBy: { matchDate: "asc" },
    }),
  ]);

  const hasMatches = liveMatches.length > 0 || upcomingMatches.length > 0;

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10">
      <div className="mb-8 flex flex-col gap-4">
        <h1 className="text-2xl font-semibold">Les matchs du moment</h1>
        <MatchFilters
          sports={sports.map((s) => ({ value: s.slug, label: s.name }))}
          countries={countryRows
            .filter((c): c is { country: string } => Boolean(c.country))
            .map((c) => ({ value: c.country, label: c.country }))}
        />
      </div>

      {!hasMatches && (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Aucun match ne correspond à ces filtres pour le moment.
        </p>
      )}

      {liveMatches.length > 0 && (
        <section className="mb-8 flex flex-col gap-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            En direct
          </h2>
          {liveMatches.map((match) => (
            <MatchCard key={match.id} match={match} />
          ))}
        </section>
      )}

      {upcomingMatches.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            À venir
          </h2>
          {upcomingMatches.map((match) => (
            <MatchCard key={match.id} match={match} />
          ))}
        </section>
      )}
    </main>
  );
}
