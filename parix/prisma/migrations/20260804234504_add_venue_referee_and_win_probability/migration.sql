-- AlterTable
ALTER TABLE "Match" ADD COLUMN     "referee" TEXT,
ADD COLUMN     "venue" TEXT;

-- AlterTable
ALTER TABLE "MatchStats" ADD COLUMN     "awayWinProbability" DOUBLE PRECISION,
ADD COLUMN     "drawProbability" DOUBLE PRECISION,
ADD COLUMN     "homeWinProbability" DOUBLE PRECISION;
