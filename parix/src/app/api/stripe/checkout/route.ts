import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { getPlan } from "@/lib/plans";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Connecte-toi pour t'abonner." }, { status: 401 });
  }

  const body = await request.json();
  const plan = typeof body.plan === "string" ? getPlan(body.plan) : undefined;
  const requestedSlugs: string[] = Array.isArray(body.sports)
    ? body.sports.filter((s: unknown) => typeof s === "string")
    : [];

  if (!plan) {
    return NextResponse.json({ error: "Offre inconnue." }, { status: 400 });
  }

  const allSports = await prisma.sport.findMany();
  const sports =
    plan.sportsRequired === null
      ? allSports
      : allSports.filter((s) => requestedSlugs.includes(s.slug));

  if (plan.sportsRequired !== null && sports.length !== plan.sportsRequired) {
    return NextResponse.json(
      { error: `Sélectionne exactement ${plan.sportsRequired} sport(s) pour cette offre.` },
      { status: 400 },
    );
  }

  const priceId = process.env[plan.stripePriceEnv];
  if (!priceId) {
    return NextResponse.json(
      { error: `Configuration Stripe manquante pour l'offre ${plan.name}.` },
      { status: 500 },
    );
  }

  const stripe = getStripe();

  const existingSubscription = await prisma.subscription.findUnique({
    where: { userId: session.user.id },
  });

  let stripeCustomerId = existingSubscription?.stripeCustomerId ?? undefined;
  if (!stripeCustomerId) {
    const customer = await stripe.customers.create({
      email: session.user.email ?? undefined,
      metadata: { userId: session.user.id },
    });
    stripeCustomerId = customer.id;
    await prisma.subscription.upsert({
      where: { userId: session.user.id },
      update: { stripeCustomerId },
      create: { userId: session.user.id, stripeCustomerId },
    });
  }

  const origin = request.headers.get("origin") ?? new URL(request.url).origin;
  const metadata = {
    userId: session.user.id,
    plan: plan.planType,
    sportIds: sports.map((s) => s.id).join(","),
  };

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: stripeCustomerId,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${origin}/offres?checkout=success`,
    cancel_url: `${origin}/offres?checkout=cancel`,
    metadata,
    subscription_data: { metadata },
  });

  if (!checkoutSession.url) {
    return NextResponse.json({ error: "Impossible de créer la session Stripe." }, { status: 500 });
  }

  return NextResponse.json({ url: checkoutSession.url });
}
