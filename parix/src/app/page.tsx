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
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10">
      <div className="mb-8 flex flex-col gap-5">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Les matchs du moment</h1>
          <p className="mt-1 text-sm text-muted">
            Stats, analyses et recommandations — football, basketball, tennis.
          </p>
        </div>
        <MatchFilters
          sports={sports.map((s) => ({ value: s.slug, label: s.name }))}
          countries={countryRows
            .filter((c): c is { country: string } => Boolean(c.country))
            .map((c) => ({ value: c.country, label: c.country }))}
        />
      </div>

      {!hasMatches && (
        <p className="rounded-lg border border-border bg-surface px-4 py-6 text-center text-sm text-muted">
          Aucun match ne correspond à ces filtres pour le moment.
        </p>
      )}

      {liveMatches.length > 0 && (
        <section className="mb-8 flex flex-col gap-3">
          <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-foreground">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
            En direct
          </h2>
          <div className="flex flex-col gap-2">
            {liveMatches.map((match) => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        </section>
      )}

      {upcomingMatches.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-muted">À venir</h2>
          <div className="flex flex-col gap-2">
            {upcomingMatches.map((match) => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
