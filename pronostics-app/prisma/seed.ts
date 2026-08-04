import bcrypt from "bcryptjs";

import { prisma } from "../src/lib/prisma";

async function main() {
  const football = await prisma.sport.upsert({
    where: { slug: "football" },
    update: {},
    create: { name: "Football", slug: "football", apiSource: "api-football" },
  });
  const basketball = await prisma.sport.upsert({
    where: { slug: "basketball" },
    update: {},
    create: { name: "Basketball", slug: "basketball", apiSource: "api-basketball" },
  });
  const tennis = await prisma.sport.upsert({
    where: { slug: "tennis" },
    update: {},
    create: { name: "Tennis", slug: "tennis", apiSource: "api-sports-tennis" },
  });

  const adminPassword = await bcrypt.hash("Admin1234!", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@pronostics.app" },
    update: {},
    create: {
      email: "admin@pronostics.app",
      name: "Admin",
      password: adminPassword,
      role: "ADMIN",
    },
  });

  const subscriberPassword = await bcrypt.hash("Abonne1234!", 12);
  const subscriber = await prisma.user.upsert({
    where: { email: "abonne@pronostics.app" },
    update: {},
    create: {
      email: "abonne@pronostics.app",
      name: "Abonné Football",
      password: subscriberPassword,
      role: "USER",
    },
  });

  const subscription = await prisma.subscription.upsert({
    where: { userId: subscriber.id },
    update: { status: "ACTIVE" },
    create: {
      userId: subscriber.id,
      status: "ACTIVE",
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });
  await prisma.subscriptionSport.upsert({
    where: { subscriptionId_sportId: { subscriptionId: subscription.id, sportId: football.id } },
    update: {},
    create: { subscriptionId: subscription.id, sportId: football.id },
  });

  const now = Date.now();
  const hours = (n: number) => new Date(now + n * 60 * 60 * 1000);

  type SeedMatch = {
    sportId: string;
    externalId: string;
    homeTeam: string;
    awayTeam: string;
    league: string;
    country: string;
    matchDate: Date;
    status: "LIVE" | "UPCOMING";
    homeScore?: number;
    awayScore?: number;
    homeForm: string;
    awayForm: string;
    h2hSummary: string;
    recommendation: { title: string; analysis: string; confidence: number };
  };

  const matches: SeedMatch[] = [
    {
      sportId: football.id,
      externalId: "demo-fb-1",
      homeTeam: "PSG",
      awayTeam: "Marseille",
      league: "Ligue 1",
      country: "France",
      matchDate: hours(-1),
      status: "LIVE",
      homeScore: 1,
      awayScore: 0,
      homeForm: "WWDWW",
      awayForm: "WDLWD",
      h2hSummary: "PSG invaincu sur les 5 dernières confrontations à domicile.",
      recommendation: {
        title: "Plus de 2.5 buts",
        analysis:
          "Les deux équipes marquent régulièrement cette saison (moyenne de 3.1 buts/match sur leurs 5 dernières rencontres). PSG doit faire sans deux titulaires en défense, ce qui ouvre des espaces.",
        confidence: 4,
      },
    },
    {
      sportId: football.id,
      externalId: "demo-fb-2",
      homeTeam: "Real Madrid",
      awayTeam: "Barcelone",
      league: "Liga",
      country: "Espagne",
      matchDate: hours(5),
      status: "UPCOMING",
      homeForm: "WWWDW",
      awayForm: "WWLWW",
      h2hSummary: "Le dernier Clasico s'est terminé 2-2.",
      recommendation: {
        title: "Les deux équipes marquent",
        analysis:
          "Sur les 8 derniers Clasicos, les deux équipes ont marqué à 7 reprises. Barcelone joue sans son gardien titulaire, suspendu.",
        confidence: 5,
      },
    },
    {
      sportId: football.id,
      externalId: "demo-fb-3",
      homeTeam: "Manchester City",
      awayTeam: "Liverpool",
      league: "Premier League",
      country: "Angleterre",
      matchDate: hours(28),
      status: "UPCOMING",
      homeForm: "WDWWW",
      awayForm: "WWWDL",
      h2hSummary: "Liverpool n'a pas gagné à l'Etihad depuis 4 ans.",
      recommendation: {
        title: "Victoire Manchester City",
        analysis:
          "City reste sur 9 victoires consécutives à domicile toutes compétitions confondues. Liverpool aborde ce match après un déplacement européen en semaine.",
        confidence: 3,
      },
    },
    {
      sportId: basketball.id,
      externalId: "demo-bb-1",
      homeTeam: "Lakers",
      awayTeam: "Celtics",
      league: "NBA",
      country: "Etats-Unis",
      matchDate: hours(-2),
      status: "LIVE",
      homeScore: 58,
      awayScore: 61,
      homeForm: "WLWWL",
      awayForm: "WWWLW",
      h2hSummary: "Celtics vainqueurs des 3 dernières confrontations.",
      recommendation: {
        title: "Plus de 215.5 points",
        analysis:
          "Les deux équipes tournent à un rythme offensif élevé sur les 10 derniers matchs (moyenne combinée de 224 points).",
        confidence: 4,
      },
    },
    {
      sportId: basketball.id,
      externalId: "demo-bb-2",
      homeTeam: "ASVEL",
      awayTeam: "Monaco",
      league: "Betclic Elite",
      country: "France",
      matchDate: hours(30),
      status: "UPCOMING",
      homeForm: "LWWLW",
      awayForm: "WWWWW",
      h2hSummary: "Monaco sur une série de 12 victoires consécutives.",
      recommendation: {
        title: "Victoire Monaco",
        analysis:
          "Monaco impressionne cette saison et aligne les victoires en déplacement. ASVEL doit composer avec deux absences majeures en attaque.",
        confidence: 3,
      },
    },
    {
      sportId: tennis.id,
      externalId: "demo-tn-1",
      homeTeam: "N. Djokovic",
      awayTeam: "C. Alcaraz",
      league: "Roland Garros",
      country: "France",
      matchDate: hours(3),
      status: "UPCOMING",
      homeForm: "WWWWL",
      awayForm: "WWWWW",
      h2hSummary: "Alcaraz mène 4 victoires à 3 dans les confrontations directes.",
      recommendation: {
        title: "Plus de 3.5 sets",
        analysis:
          "Leurs 4 dernières confrontations sur terre battue sont toutes allées à 4 ou 5 sets. Les deux joueurs sont en pleine forme physique.",
        confidence: 4,
      },
    },
    {
      sportId: tennis.id,
      externalId: "demo-tn-2",
      homeTeam: "J. Sinner",
      awayTeam: "D. Medvedev",
      league: "Wimbledon",
      country: "Royaume-Uni",
      matchDate: hours(26),
      status: "UPCOMING",
      homeForm: "WWWWW",
      awayForm: "WLWWL",
      h2hSummary: "Sinner a remporté leurs 3 dernières confrontations sur gazon.",
      recommendation: {
        title: "Victoire Sinner en 3 sets",
        analysis:
          "Sinner n'a perdu qu'un set sur les deux derniers tours. Medvedev peine historiquement sur gazon contre les serveurs puissants.",
        confidence: 3,
      },
    },
  ];

  for (const m of matches) {
    const match = await prisma.match.upsert({
      where: { sportId_externalId: { sportId: m.sportId, externalId: m.externalId } },
      update: {
        status: m.status,
        matchDate: m.matchDate,
        homeScore: m.homeScore,
        awayScore: m.awayScore,
      },
      create: {
        sportId: m.sportId,
        externalId: m.externalId,
        homeTeam: m.homeTeam,
        awayTeam: m.awayTeam,
        league: m.league,
        country: m.country,
        matchDate: m.matchDate,
        status: m.status,
        homeScore: m.homeScore,
        awayScore: m.awayScore,
      },
    });

    await prisma.matchStats.upsert({
      where: { matchId: match.id },
      update: {
        homeForm: m.homeForm,
        awayForm: m.awayForm,
        h2hSummary: m.h2hSummary,
      },
      create: {
        matchId: match.id,
        homeForm: m.homeForm,
        awayForm: m.awayForm,
        h2hSummary: m.h2hSummary,
      },
    });

    const existingRecommendation = await prisma.recommendation.findFirst({
      where: { matchId: match.id },
    });
    if (!existingRecommendation) {
      await prisma.recommendation.create({
        data: {
          matchId: match.id,
          title: m.recommendation.title,
          analysis: m.recommendation.analysis,
          confidence: m.recommendation.confidence,
          createdBy: admin.id,
        },
      });
    }
  }

  console.log("Seed terminé :", {
    sports: [football.name, basketball.name, tennis.name],
    matches: matches.length,
    admin: admin.email,
    subscriber: subscriber.email,
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
