import { prisma } from "@/lib/prisma";

export async function userHasSportAccess(userId: string, sportId: string) {
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
    include: { sports: true },
  });

  if (!subscription || subscription.status !== "ACTIVE") return false;
  return subscription.sports.some((s) => s.sportId === sportId);
}
