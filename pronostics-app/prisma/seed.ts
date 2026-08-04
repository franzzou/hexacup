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
    status: "LIVE" | "UPCOMING";
    homeScore?: number;
    awayScore?: number;
    homeForm: string;
    awayForm: string;
    h2hSummary: string;
    analysis: string;
    homeWinProbability?: number;
    drawProbability?: number;
    awayWinProbability?: number;
    recommendation: { title: string; analysis: string; confidence: number };
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
      recommendation: {
        title: "Plus de 2.5 buts",
        analysis:
          "Les deux équipes marquent régulièrement cette saison (moyenne de 3.1 buts/match sur leurs 5 dernières rencontres). PSG doit faire sans deux titulaires en défense, ce qui ouvre des espaces.",
        confidence: 4,
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
        analysis:
          "Sur les 8 derniers Clasicos, les deux équipes ont marqué à 7 reprises. Barcelone joue sans son gardien titulaire, suspendu.",
        confidence: 5,
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
      recommendation: {
        title: "Plus de 215.5 points",
        analysis:
          "Les deux équipes tournent à un rythme offensif élevé sur les 10 derniers matchs (moyenne combinée de 224 points).",
        confidence: 4,
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

    await prisma.matchStats.upsert({
      where: { matchId: match.id },
      update: {
        homeForm: m.homeForm,
        awayForm: m.awayForm,
        h2hSummary: m.h2hSummary,
        analysis: m.analysis,
        homeWinProbability: m.homeWinProbability,
        drawProbability: m.drawProbability,
        awayWinProbability: m.awayWinProbability,
      },
      create: {
        matchId: match.id,
        homeForm: m.homeForm,
        awayForm: m.awayForm,
        h2hSummary: m.h2hSummary,
        analysis: m.analysis,
        homeWinProbability: m.homeWinProbability,
        drawProbability: m.drawProbability,
        awayWinProbability: m.awayWinProbability,
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
