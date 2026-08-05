import type Stripe from "stripe";

import { prisma } from "@/lib/prisma";
import type { PlanType } from "@/lib/plans";

function mapStripeStatus(status: Stripe.Subscription.Status) {
  switch (status) {
    case "active":
      return "ACTIVE" as const;
    case "trialing":
      return "TRIALING" as const;
    case "past_due":
      return "PAST_DUE" as const;
    case "canceled":
    case "incomplete_expired":
    case "unpaid":
    case "paused":
      return "CANCELED" as const;
    default:
      return "INACTIVE" as const;
  }
}

function currentPeriodEnd(subscription: Stripe.Subscription) {
  const seconds = subscription.items.data[0]?.current_period_end;
  return seconds ? new Date(seconds * 1000) : null;
}

/** Applique l'état d'un abonnement Stripe à l'utilisateur, sans toucher aux sports inclus. */
export async function syncSubscriptionStatus(subscription: Stripe.Subscription) {
  await prisma.subscription.updateMany({
    where: { stripeSubscriptionId: subscription.id },
    data: {
      status: mapStripeStatus(subscription.status),
      currentPeriodEnd: currentPeriodEnd(subscription),
    },
  });
}

/** Active l'abonnement d'un utilisateur suite à un paiement réussi et fixe les sports inclus. */
export async function activateSubscription({
  userId,
  plan,
  sportIds,
  stripeCustomerId,
  subscription,
}: {
  userId: string;
  plan: PlanType;
  sportIds: string[];
  stripeCustomerId: string;
  subscription: Stripe.Subscription;
}) {
  const data = {
    plan,
    stripeCustomerId,
    stripeSubscriptionId: subscription.id,
    status: mapStripeStatus(subscription.status),
    currentPeriodEnd: currentPeriodEnd(subscription),
  };

  const updated = await prisma.subscription.upsert({
    where: { userId },
    update: data,
    create: { userId, ...data },
  });

  await prisma.$transaction([
    prisma.subscriptionSport.deleteMany({ where: { subscriptionId: updated.id } }),
    prisma.subscriptionSport.createMany({
      data: sportIds.map((sportId) => ({ subscriptionId: updated.id, sportId })),
    }),
  ]);
}
