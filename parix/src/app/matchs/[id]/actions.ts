"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { userHasSportAccess } from "@/lib/access";
import { prisma } from "@/lib/prisma";

export async function toggleUserPick(formData: FormData) {
  const session = await auth();
  if (!session?.user) return;

  const recommendationId = String(formData.get("recommendationId") ?? "");
  const matchId = String(formData.get("matchId") ?? "");
  if (!recommendationId || !matchId) return;

  const recommendation = await prisma.recommendation.findUnique({
    where: { id: recommendationId },
    select: { match: { select: { sportId: true } } },
  });
  if (!recommendation) return;

  const hasAccess = await userHasSportAccess(session.user.id, recommendation.match.sportId);
  if (!hasAccess) return;

  const existing = await prisma.userPick.findUnique({
    where: { userId_recommendationId: { userId: session.user.id, recommendationId } },
  });

  if (existing) {
    await prisma.userPick.delete({ where: { id: existing.id } });
  } else {
    await prisma.userPick.create({ data: { userId: session.user.id, recommendationId } });
  }

  revalidatePath(`/matchs/${matchId}`);
  revalidatePath("/mes-pronostics");
}
