import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Connecte-toi pour gérer ton abonnement." }, { status: 401 });
  }

  const subscription = await prisma.subscription.findUnique({
    where: { userId: session.user.id },
  });

  if (!subscription?.stripeCustomerId) {
    return NextResponse.json({ error: "Aucun abonnement à gérer." }, { status: 400 });
  }

  const origin = request.headers.get("origin") ?? new URL(request.url).origin;
  const stripe = getStripe();

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: subscription.stripeCustomerId,
    return_url: `${origin}/offres`,
  });

  return NextResponse.json({ url: portalSession.url });
}
