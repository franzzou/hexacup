"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

function str(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function optStr(formData: FormData, key: string) {
  const value = str(formData, key);
  return value === "" ? null : value;
}

function optFloat(formData: FormData, key: string) {
  const value = str(formData, key);
  if (value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function optInt(formData: FormData, key: string) {
  const value = str(formData, key);
  if (value === "") return null;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : null;
}

function matchFieldsFromForm(formData: FormData) {
  return {
    sportId: str(formData, "sportId"),
    homeTeam: str(formData, "homeTeam"),
    awayTeam: str(formData, "awayTeam"),
    league: optStr(formData, "league"),
    country: optStr(formData, "country"),
    venue: optStr(formData, "venue"),
    referee: optStr(formData, "referee"),
    matchDate: new Date(str(formData, "matchDate")),
    status: str(formData, "status") as
      | "UPCOMING"
      | "LIVE"
      | "FINISHED"
      | "POSTPONED"
      | "CANCELED",
    externalId: str(formData, "externalId"),
  };
}

export async function createMatch(formData: FormData) {
  await requireAdmin();

  const fields = matchFieldsFromForm(formData);
  const match = await prisma.match.create({
    data: {
      ...fields,
      externalId: fields.externalId || `manual-${Date.now()}`,
    },
  });

  revalidatePath("/admin/matchs");
  redirect(`/admin/matchs/${match.id}`);
}

export async function updateMatch(formData: FormData) {
  await requireAdmin();

  const matchId = str(formData, "matchId");
  const fields = matchFieldsFromForm(formData);

  await prisma.match.update({
    where: { id: matchId },
    data: fields,
  });

  revalidatePath("/admin/matchs");
  revalidatePath(`/admin/matchs/${matchId}`);
  revalidatePath(`/matchs/${matchId}`);
}

export async function upsertMatchStats(formData: FormData) {
  await requireAdmin();

  const matchId = str(formData, "matchId");
  const data = {
    homeForm: optStr(formData, "homeForm"),
    awayForm: optStr(formData, "awayForm"),
    h2hSummary: optStr(formData, "h2hSummary"),
    analysis: optStr(formData, "analysis"),
    homeWinProbability: optFloat(formData, "homeWinProbability"),
    drawProbability: optFloat(formData, "drawProbability"),
    awayWinProbability: optFloat(formData, "awayWinProbability"),
  };

  await prisma.matchStats.upsert({
    where: { matchId },
    update: data,
    create: { matchId, ...data },
  });

  revalidatePath(`/admin/matchs/${matchId}`);
  revalidatePath(`/matchs/${matchId}`);
}

export async function setLineupFormation(formData: FormData) {
  await requireAdmin();

  const matchId = str(formData, "matchId");
  const side = str(formData, "side") as "HOME" | "AWAY";
  const formation = optStr(formData, "formation");

  await prisma.matchLineup.upsert({
    where: { matchId_side: { matchId, side } },
    update: { formation },
    create: { matchId, side, formation },
  });

  revalidatePath(`/admin/matchs/${matchId}`);
  revalidatePath(`/matchs/${matchId}`);
}

export async function addLineupPlayer(formData: FormData) {
  await requireAdmin();

  const matchId = str(formData, "matchId");
  const side = str(formData, "side") as "HOME" | "AWAY";
  const name = str(formData, "name");
  const position = optStr(formData, "position");
  const shirtNumber = optInt(formData, "shirtNumber");
  const isStarter = formData.get("isStarter") === "on";
  const note = optStr(formData, "note");

  if (!name) return;

  const match = await prisma.match.findUniqueOrThrow({
    where: { id: matchId },
    select: { sportId: true },
  });

  const lineup = await prisma.matchLineup.upsert({
    where: { matchId_side: { matchId, side } },
    update: {},
    create: { matchId, side },
  });

  const player =
    (await prisma.player.findFirst({ where: { name, sportId: match.sportId } })) ??
    (await prisma.player.create({ data: { name, position, sportId: match.sportId } }));

  await prisma.matchLineupPlayer.upsert({
    where: { lineupId_playerId: { lineupId: lineup.id, playerId: player.id } },
    update: { isStarter, shirtNumber, note },
    create: { lineupId: lineup.id, playerId: player.id, isStarter, shirtNumber, note },
  });

  revalidatePath(`/admin/matchs/${matchId}`);
  revalidatePath(`/matchs/${matchId}`);
}

export async function removeLineupPlayer(formData: FormData) {
  await requireAdmin();

  const matchId = str(formData, "matchId");
  const lineupPlayerId = str(formData, "lineupPlayerId");

  await prisma.matchLineupPlayer.delete({ where: { id: lineupPlayerId } });

  revalidatePath(`/admin/matchs/${matchId}`);
  revalidatePath(`/matchs/${matchId}`);
}

export async function createRecommendation(formData: FormData) {
  const session = await requireAdmin();

  const matchId = str(formData, "matchId");
  const title = str(formData, "title");
  const analysis = str(formData, "analysis");
  const confidence = optInt(formData, "confidence");

  if (!title || !analysis || !session?.user?.id) return;

  await prisma.recommendation.create({
    data: { matchId, title, analysis, confidence, createdBy: session.user.id },
  });

  revalidatePath(`/admin/matchs/${matchId}`);
  revalidatePath(`/matchs/${matchId}`);
}

export async function updateRecommendationResult(formData: FormData) {
  await requireAdmin();

  const matchId = str(formData, "matchId");
  const recommendationId = str(formData, "recommendationId");
  const result = str(formData, "result") as "PENDING" | "WON" | "LOST" | "VOID";

  await prisma.recommendation.update({
    where: { id: recommendationId },
    data: { result },
  });

  revalidatePath(`/admin/matchs/${matchId}`);
  revalidatePath(`/matchs/${matchId}`);
}
