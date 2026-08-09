/*
  Warnings:

  - You are about to drop the column `confidence` on the `Recommendation` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "BetMarket" AS ENUM ('MATCH_WINNER', 'OVER_UNDER', 'BOTH_TEAMS_SCORE', 'HANDICAP', 'SETS_GAMES', 'CORNERS_CARDS', 'OTHER');

-- AlterTable
ALTER TABLE "MatchStats" ADD COLUMN     "awayAvgXg" DOUBLE PRECISION,
ADD COLUMN     "awayAvgXga" DOUBLE PRECISION,
ADD COLUMN     "awayDefRating" DOUBLE PRECISION,
ADD COLUMN     "awayOffRating" DOUBLE PRECISION,
ADD COLUMN     "awayPace" DOUBLE PRECISION,
ADD COLUMN     "awayReturnWinPct" DOUBLE PRECISION,
ADD COLUMN     "awayServeWinPct" DOUBLE PRECISION,
ADD COLUMN     "homeAvgXg" DOUBLE PRECISION,
ADD COLUMN     "homeAvgXga" DOUBLE PRECISION,
ADD COLUMN     "homeDefRating" DOUBLE PRECISION,
ADD COLUMN     "homeOffRating" DOUBLE PRECISION,
ADD COLUMN     "homePace" DOUBLE PRECISION,
ADD COLUMN     "homeReturnWinPct" DOUBLE PRECISION,
ADD COLUMN     "homeServeWinPct" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "Recommendation" DROP COLUMN "confidence",
ADD COLUMN     "confidenceScore" DOUBLE PRECISION,
ADD COLUMN     "contextScore" INTEGER,
ADD COLUMN     "formScore" INTEGER,
ADD COLUMN     "h2hScore" INTEGER,
ADD COLUMN     "market" "BetMarket" NOT NULL DEFAULT 'OTHER',
ADD COLUMN     "marketScore" INTEGER,
ADD COLUMN     "odds" DOUBLE PRECISION,
ADD COLUMN     "statsScore" INTEGER,
ADD COLUMN     "watchOnly" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "Recommendation_market_idx" ON "Recommendation"("market");
