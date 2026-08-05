-- CreateEnum
CREATE TYPE "MatchSide" AS ENUM ('HOME', 'AWAY');

-- AlterTable
ALTER TABLE "MatchStats" ADD COLUMN     "analysis" TEXT;

-- CreateTable
CREATE TABLE "Player" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "position" TEXT,
    "sportId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Player_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MatchLineup" (
    "id" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "side" "MatchSide" NOT NULL,
    "formation" TEXT,

    CONSTRAINT "MatchLineup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MatchLineupPlayer" (
    "id" TEXT NOT NULL,
    "lineupId" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "isStarter" BOOLEAN NOT NULL DEFAULT true,
    "shirtNumber" INTEGER,
    "note" TEXT,

    CONSTRAINT "MatchLineupPlayer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MatchLineup_matchId_side_key" ON "MatchLineup"("matchId", "side");

-- CreateIndex
CREATE UNIQUE INDEX "MatchLineupPlayer_lineupId_playerId_key" ON "MatchLineupPlayer"("lineupId", "playerId");

-- AddForeignKey
ALTER TABLE "Player" ADD CONSTRAINT "Player_sportId_fkey" FOREIGN KEY ("sportId") REFERENCES "Sport"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchLineup" ADD CONSTRAINT "MatchLineup_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchLineupPlayer" ADD CONSTRAINT "MatchLineupPlayer_lineupId_fkey" FOREIGN KEY ("lineupId") REFERENCES "MatchLineup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchLineupPlayer" ADD CONSTRAINT "MatchLineupPlayer_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;
