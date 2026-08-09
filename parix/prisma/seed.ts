import bcrypt from "bcryptjs";

import { computeConfidenceScore } from "../src/lib/confidence";
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
    update: { status: "ACTIVE", plan: "ECONOMIQUE" },
    create: {
      userId: subscriber.id,
      status: "ACTIVE",
      plan: "ECONOMIQUE",
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

  type SeedLineupPlayer = {
    name: string;
    position?: string;
    isStarter?: boolean;
    shirtNumber?: number;
    note?: string;
  };

  type SeedLineup = {
    side: "HOME" | "AWAY";
    formation?: string;
    players: SeedLineupPlayer[];
  };

  type SeedRecommendation = {
    title: string;
    market:
      | "MATCH_WINNER"
      | "OVER_UNDER"
      | "BOTH_TEAMS_SCORE"
      | "HANDICAP"
      | "SETS_GAMES"
      | "CORNERS_CARDS"
      | "OTHER";
    analysis: string;
    formScore?: number;
    h2hScore?: number;
    contextScore?: number;
    statsScore?: number;
    marketScore?: number;
    odds?: number;
    watchOnly?: boolean;
    result?: "PENDING" | "WON" | "LOST" | "VOID";
  };

  type SeedMatch = {
    sportId: string;
    externalId: string;
    homeTeam: string;
    awayTeam: string;
    league: string;
    country: string;
    venue?: string;
    referee?: string;
    matchDate: Date;
    status: "LIVE" | "UPCOMING" | "FINISHED";
    homeScore?: number;
    awayScore?: number;
    homeForm: string;
    awayForm: string;
    h2hSummary: string;
    analysis: string;
    homeWinProbability?: number;
    drawProbability?: number;
    awayWinProbability?: number;
    advancedStats?: Record<string, number>;
    recommendation: SeedRecommendation;
    lineups?: SeedLineup[];
  };

  const matches: SeedMatch[] = [
    {
      sportId: football.id,
      externalId: "demo-fb-1",
      homeTeam: "PSG",
      awayTeam: "Marseille",
      league: "Ligue 1",
      country: "France",
      venue: "Parc des Princes, Paris",
      referee: "Clément Turpin",
      matchDate: hours(-1),
      status: "LIVE",
      homeScore: 1,
      awayScore: 0,
      homeForm: "WWDWW",
      awayForm: "WDLWD",
      h2hSummary: "PSG invaincu sur les 5 dernières confrontations à domicile.",
      analysis:
        "PSG aligne un onze quasi type malgré deux absences en défense centrale, compensées par un repositionnement de son milieu défensif. Marseille joue un pressing haut qui a souffert face aux équipes techniques cette saison, ce qui pourrait ouvrir des espaces dans le dos de sa défense.",
      homeWinProbability: 58,
      drawProbability: 24,
      awayWinProbability: 18,
      advancedStats: { homeAvgXg: 2.1, homeAvgXga: 1.0, awayAvgXg: 1.4, awayAvgXga: 1.6 },
      recommendation: {
        title: "Plus de 2.5 buts",
        market: "OVER_UNDER",
        analysis:
          "Les deux équipes marquent régulièrement cette saison (moyenne de 3.1 buts/match sur leurs 5 dernières rencontres). PSG doit faire sans deux titulaires en défense, ce qui ouvre des espaces.",
        formScore: 80,
        h2hScore: 70,
        contextScore: 75,
        statsScore: 85,
        marketScore: 60,
        odds: 1.75,
      },
      lineups: [
        {
          side: "HOME",
          formation: "4-3-3",
          players: [
            { name: "G. Donnarumma", position: "Gardien", shirtNumber: 1 },
            { name: "A. Hakimi", position: "Défenseur", shirtNumber: 2 },
            {
              name: "Marquinhos",
              position: "Défenseur",
              shirtNumber: 5,
              note: "Capitaine, décisif dans les duels aériens sur coups de pied arrêtés",
            },
            {
              name: "K. Mbappé",
              position: "Attaquant",
              shirtNumber: 7,
              note: "Auteur de 4 buts sur ses 3 derniers matchs à domicile",
            },
            { name: "Vitinha", position: "Milieu", shirtNumber: 17 },
          ],
        },
        {
          side: "AWAY",
          formation: "4-2-3-1",
          players: [
            { name: "P. Lopez", position: "Gardien", shirtNumber: 40 },
            { name: "L. Balerdi", position: "Défenseur", shirtNumber: 4 },
            {
              name: "P.E. Aubameyang",
              position: "Attaquant",
              shirtNumber: 10,
              note: "Retour de blessure, minutes probablement limitées",
            },
            { name: "A. Harit", position: "Milieu offensif", shirtNumber: 8 },
          ],
        },
      ],
    },
    {
      sportId: football.id,
      externalId: "demo-fb-2",
      homeTeam: "Real Madrid",
      awayTeam: "Barcelone",
      league: "Liga",
      country: "Espagne",
      venue: "Santiago Bernabéu, Madrid",
      referee: "José María Sánchez",
      matchDate: hours(5),
      status: "UPCOMING",
      homeForm: "WWWDW",
      awayForm: "WWLWW",
      h2hSummary: "Le dernier Clasico s'est terminé 2-2.",
      analysis:
        "Le Real Madrid privilégie un bloc bas suivi de transitions rapides via ses ailiers, une approche qui a posé des problèmes à Barcelone lors de leurs deux derniers face-à-face. Barcelone devra gérer l'absence de son gardien titulaire, suspendu, avec une doublure qui découvre ce niveau de match.",
      homeWinProbability: 45,
      drawProbability: 26,
      awayWinProbability: 29,
      recommendation: {
        title: "Les deux équipes marquent",
        market: "BOTH_TEAMS_SCORE",
        analysis:
          "Sur les 8 derniers Clasicos, les deux équipes ont marqué à 7 reprises. Barcelone joue sans son gardien titulaire, suspendu.",
        formScore: 85,
        h2hScore: 95,
        contextScore: 80,
        statsScore: 88,
        marketScore: 70,
        odds: 1.55,
      },
      lineups: [
        {
          side: "HOME",
          formation: "4-3-3",
          players: [
            { name: "T. Courtois", position: "Gardien", shirtNumber: 1 },
            {
              name: "Jude Bellingham",
              position: "Milieu offensif",
              shirtNumber: 5,
              note: "Impliqué dans 9 buts sur ses 6 derniers Clasicos",
            },
            { name: "Vinicius Jr", position: "Attaquant", shirtNumber: 7 },
          ],
        },
        {
          side: "AWAY",
          formation: "4-3-3",
          players: [
            {
              name: "I. Peña",
              position: "Gardien",
              shirtNumber: 13,
              note: "Titulaire exceptionnel suite à la suspension du gardien numéro 1",
            },
            { name: "Pedri", position: "Milieu", shirtNumber: 8 },
            { name: "R. Lewandowski", position: "Attaquant", shirtNumber: 9 },
          ],
        },
      ],
    },
    {
      sportId: football.id,
      externalId: "demo-fb-3",
      homeTeam: "Manchester City",
      awayTeam: "Liverpool",
      league: "Premier League",
      country: "Angleterre",
      venue: "Etihad Stadium, Manchester",
      referee: "Michael Oliver",
      matchDate: hours(28),
      status: "UPCOMING",
      homeForm: "WDWWW",
      awayForm: "WWWDL",
      h2hSummary: "Liverpool n'a pas gagné à l'Etihad depuis 4 ans.",
      analysis:
        "Manchester City conserve un contrôle du ballon très élevé à domicile, ce qui limite mécaniquement les occasions concédées. Liverpool arrive après un déplacement européen en milieu de semaine et pourrait tourner sur certains postes clés.",
      homeWinProbability: 50,
      drawProbability: 24,
      awayWinProbability: 26,
      recommendation: {
        title: "Victoire Manchester City",
        market: "MATCH_WINNER",
        analysis:
          "City reste sur 9 victoires consécutives à domicile toutes compétitions confondues. Liverpool aborde ce match après un déplacement européen en semaine.",
        formScore: 65,
        h2hScore: 60,
        contextScore: 55,
        statsScore: 60,
        marketScore: 50,
        odds: 2.05,
        watchOnly: true,
      },
    },
    {
      sportId: basketball.id,
      externalId: "demo-bb-1",
      homeTeam: "Lakers",
      awayTeam: "Celtics",
      league: "NBA",
      country: "Etats-Unis",
      venue: "Crypto.com Arena, Los Angeles",
      referee: "Tony Brothers",
      matchDate: hours(-2),
      status: "LIVE",
      homeScore: 58,
      awayScore: 61,
      homeForm: "WLWWL",
      awayForm: "WWWLW",
      h2hSummary: "Celtics vainqueurs des 3 dernières confrontations.",
      analysis:
        "Rythme de jeu élevé des deux côtés depuis le début de la rencontre, avec un volume de tirs à 3 points nettement au-dessus de la moyenne de saison des deux équipes. Les bancs pèsent lourd dans ce match, notamment côté Celtics qui tourne davantage son effectif.",
      homeWinProbability: 47,
      awayWinProbability: 53,
      advancedStats: { homeOffRating: 118.2, homeDefRating: 112.4, awayOffRating: 119.5, awayDefRating: 110.1, homePace: 101.3, awayPace: 100.8 },
      recommendation: {
        title: "Plus de 215.5 points",
        market: "OVER_UNDER",
        analysis:
          "Les deux équipes tournent à un rythme offensif élevé sur les 10 derniers matchs (moyenne combinée de 224 points).",
        formScore: 75,
        h2hScore: 65,
        contextScore: 70,
        statsScore: 90,
        marketScore: 55,
        odds: 1.90,
      },
      lineups: [
        {
          side: "HOME",
          players: [
            {
              name: "L. James",
              position: "Ailier",
              shirtNumber: 23,
              note: "Gestion de charge probable en 2e mi-temps",
            },
            { name: "A. Davis", position: "Pivot", shirtNumber: 3 },
          ],
        },
        {
          side: "AWAY",
          players: [
            {
              name: "J. Tatum",
              position: "Ailier",
              shirtNumber: 0,
              note: "Meilleur marqueur des 3 dernières confrontations directes",
            },
            { name: "J. Brown", position: "Arrière", shirtNumber: 7 },
          ],
        },
      ],
    },
    {
      sportId: basketball.id,
      externalId: "demo-bb-2",
      homeTeam: "ASVEL",
      awayTeam: "Monaco",
      league: "Betclic Elite",
      country: "France",
      venue: "Astroballe, Villeurbanne",
      referee: "Amandine Coppin",
      matchDate: hours(30),
      status: "UPCOMING",
      homeForm: "LWWLW",
      awayForm: "WWWWW",
      h2hSummary: "Monaco sur une série de 12 victoires consécutives.",
      analysis:
        "Monaco s'appuie sur une défense collective très disciplinée qui limite les tirs faciles, un point faible identifié chez ASVEL ces dernières semaines. ASVEL doit composer avec deux absences majeures en attaque, ce qui réduit sensiblement ses options offensives.",
      homeWinProbability: 38,
      awayWinProbability: 62,
      recommendation: {
        title: "Victoire Monaco",
        market: "MATCH_WINNER",
        analysis:
          "Monaco impressionne cette saison et aligne les victoires en déplacement. ASVEL doit composer avec deux absences majeures en attaque.",
        formScore: 70,
        h2hScore: 60,
        contextScore: 65,
        statsScore: 55,
        marketScore: 50,
        odds: 1.65,
      },
    },
    {
      sportId: tennis.id,
      externalId: "demo-tn-1",
      homeTeam: "N. Djokovic",
      awayTeam: "C. Alcaraz",
      league: "Roland Garros",
      country: "France",
      venue: "Court Philippe-Chatrier, Paris",
      referee: "Renaud Lichtenstein (arbitre de chaise)",
      matchDate: hours(3),
      status: "UPCOMING",
      homeForm: "WWWWL",
      awayForm: "WWWWW",
      h2hSummary: "Alcaraz mène 4 victoires à 3 dans les confrontations directes.",
      analysis:
        "Les deux joueurs affichent un niveau physique élevé sur ce début de tournoi, sans set concédé de plus de 6-4. Le style d'Alcaraz, plus offensif sur les échanges courts, contraste avec l'endurance de Djokovic sur les longs points, un facteur clé sur cette surface.",
      homeWinProbability: 42,
      awayWinProbability: 58,
      advancedStats: { homeServeWinPct: 68.5, awayServeWinPct: 71.2, homeReturnWinPct: 34.0, awayReturnWinPct: 36.5 },
      recommendation: {
        title: "Plus de 3.5 sets",
        market: "SETS_GAMES",
        analysis:
          "Leurs 4 dernières confrontations sur terre battue sont toutes allées à 4 ou 5 sets. Les deux joueurs sont en pleine forme physique.",
        formScore: 78,
        h2hScore: 85,
        contextScore: 70,
        statsScore: 75,
        marketScore: 60,
        odds: 2.20,
      },
    },
    {
      sportId: tennis.id,
      externalId: "demo-tn-2",
      homeTeam: "J. Sinner",
      awayTeam: "D. Medvedev",
      league: "Wimbledon",
      country: "Royaume-Uni",
      venue: "Court Central, Londres",
      referee: "Marija Čičak (arbitre de chaise)",
      matchDate: hours(26),
      status: "UPCOMING",
      homeForm: "WWWWW",
      awayForm: "WLWWL",
      h2hSummary: "Sinner a remporté leurs 3 dernières confrontations sur gazon.",
      analysis:
        "Sinner sert particulièrement bien sur cette surface rapide, avec un pourcentage de premières balles au-dessus de sa moyenne de saison. Medvedev, positionné loin derrière la ligne de fond, peine historiquement à contrer les gros serveurs sur gazon.",
      homeWinProbability: 60,
      awayWinProbability: 40,
      recommendation: {
        title: "Victoire Sinner en 3 sets",
        market: "MATCH_WINNER",
        analysis:
          "Sinner n'a perdu qu'un set sur les deux derniers tours. Medvedev peine historiquement sur gazon contre les serveurs puissants.",
        formScore: 60,
        h2hScore: 65,
        contextScore: 60,
        statsScore: 65,
        marketScore: 45,
        odds: 1.80,
      },
    },
    // Matchs terminés, pour peupler la page /performances avec un vrai historique
    {
      sportId: football.id,
      externalId: "demo-fb-hist-1",
      homeTeam: "Lyon",
      awayTeam: "Nice",
      league: "Ligue 1",
      country: "France",
      venue: "Groupama Stadium, Lyon",
      matchDate: hours(-72),
      status: "FINISHED",
      homeScore: 3,
      awayScore: 1,
      homeForm: "WWDWL",
      awayForm: "LDWDL",
      h2hSummary: "Lyon invaincu sur les 3 dernières réceptions de Nice.",
      analysis: "Lyon avait l'avantage du terrain face à une équipe niçoise fragile en déplacement.",
      recommendation: {
        title: "Plus de 2.5 buts",
        market: "OVER_UNDER",
        analysis: "Les deux équipes affichaient une moyenne de buts élevée sur leurs derniers matchs.",
        formScore: 75,
        h2hScore: 70,
        contextScore: 65,
        statsScore: 80,
        marketScore: 55,
        odds: 1.90,
        result: "WON",
      },
    },
    {
      sportId: basketball.id,
      externalId: "demo-bb-hist-1",
      homeTeam: "Warriors",
      awayTeam: "Nuggets",
      league: "NBA",
      country: "Etats-Unis",
      venue: "Chase Center, San Francisco",
      matchDate: hours(-120),
      status: "FINISHED",
      homeScore: 104,
      awayScore: 118,
      homeForm: "LWLDL",
      awayForm: "WWWLW",
      h2hSummary: "Denver vainqueur des 2 dernières confrontations.",
      analysis: "Denver dominait statistiquement mais Golden State restait dangereux à domicile.",
      recommendation: {
        title: "Écart Warriors -4.5",
        market: "HANDICAP",
        analysis: "Golden State semblait en mesure de limiter l'écart à domicile malgré l'infériorité de niveau.",
        formScore: 45,
        h2hScore: 40,
        contextScore: 50,
        statsScore: 45,
        marketScore: 40,
        odds: 1.95,
        result: "LOST",
      },
    },
    {
      sportId: tennis.id,
      externalId: "demo-tn-hist-1",
      homeTeam: "C. Alcaraz",
      awayTeam: "A. Zverev",
      league: "Masters 1000",
      country: "France",
      venue: "Court Central, Paris",
      matchDate: hours(-48),
      status: "FINISHED",
      homeScore: 2,
      awayScore: 0,
      homeForm: "WWWWW",
      awayForm: "WLWWL",
      h2hSummary: "Alcaraz mène 5 victoires à 2 dans les confrontations directes.",
      analysis: "Alcaraz en pleine forme, supérieur sur cette surface rapide.",
      recommendation: {
        title: "Victoire Alcaraz",
        market: "MATCH_WINNER",
        analysis: "Alcaraz nettement supérieur sur cette surface et sur la forme du moment.",
        formScore: 85,
        h2hScore: 80,
        contextScore: 75,
        statsScore: 80,
        marketScore: 60,
        odds: 1.60,
        result: "WON",
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
        venue: m.venue,
        referee: m.referee,
      },
      create: {
        sportId: m.sportId,
        externalId: m.externalId,
        homeTeam: m.homeTeam,
        awayTeam: m.awayTeam,
        league: m.league,
        country: m.country,
        venue: m.venue,
        referee: m.referee,
        matchDate: m.matchDate,
        status: m.status,
        homeScore: m.homeScore,
        awayScore: m.awayScore,
      },
    });

    const statsData = {
      homeForm: m.homeForm,
      awayForm: m.awayForm,
      h2hSummary: m.h2hSummary,
      analysis: m.analysis,
      homeWinProbability: m.homeWinProbability,
      drawProbability: m.drawProbability,
      awayWinProbability: m.awayWinProbability,
      ...m.advancedStats,
    };

    await prisma.matchStats.upsert({
      where: { matchId: match.id },
      update: statsData,
      create: { matchId: match.id, ...statsData },
    });

    const existingRecommendation = await prisma.recommendation.findFirst({
      where: { matchId: match.id },
    });
    if (!existingRecommendation) {
      const scores = {
        formScore: m.recommendation.formScore,
        h2hScore: m.recommendation.h2hScore,
        contextScore: m.recommendation.contextScore,
        statsScore: m.recommendation.statsScore,
        marketScore: m.recommendation.marketScore,
      };
      await prisma.recommendation.create({
        data: {
          matchId: match.id,
          title: m.recommendation.title,
          market: m.recommendation.market,
          analysis: m.recommendation.analysis,
          odds: m.recommendation.odds,
          watchOnly: m.recommendation.watchOnly ?? false,
          result: m.recommendation.result ?? "PENDING",
          createdBy: admin.id,
          ...scores,
          confidenceScore: computeConfidenceScore(scores),
        },
      });
    }

    for (const lineup of m.lineups ?? []) {
      const matchLineup = await prisma.matchLineup.upsert({
        where: { matchId_side: { matchId: match.id, side: lineup.side } },
        update: { formation: lineup.formation },
        create: { matchId: match.id, side: lineup.side, formation: lineup.formation },
      });

      for (const p of lineup.players) {
        const existingPlayer = await prisma.player.findFirst({
          where: { name: p.name, sportId: m.sportId },
        });
        const player =
          existingPlayer ??
          (await prisma.player.create({
            data: { name: p.name, position: p.position, sportId: m.sportId },
          }));

        await prisma.matchLineupPlayer.upsert({
          where: { lineupId_playerId: { lineupId: matchLineup.id, playerId: player.id } },
          update: {
            isStarter: p.isStarter ?? true,
            shirtNumber: p.shirtNumber,
            note: p.note,
          },
          create: {
            lineupId: matchLineup.id,
            playerId: player.id,
            isStarter: p.isStarter ?? true,
            shirtNumber: p.shirtNumber,
            note: p.note,
          },
        });
      }
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
