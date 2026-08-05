import { NextResponse } from "next/server";
import type Stripe from "stripe";

import type { PlanType } from "@/lib/plans";
import { getStripe } from "@/lib/stripe";
import { activateSubscription, syncSubscriptionStatus } from "@/lib/subscription-sync";

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    return NextResponse.json({ error: "Webhook non configuré." }, { status: 400 });
  }

  const stripe = getStripe();
  const rawBody = await request.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch {
    return NextResponse.json({ error: "Signature invalide." }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const { userId, plan, sportIds } = session.metadata ?? {};
      const customerId =
        typeof session.customer === "string" ? session.customer : session.customer?.id;
      const subscriptionId =
        typeof session.subscription === "string" ? session.subscription : session.subscription?.id;

      if (userId && plan && customerId && subscriptionId) {
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        await activateSubscription({
          userId,
          plan: plan as PlanType,
          sportIds: sportIds ? sportIds.split(",").filter(Boolean) : [],
          stripeCustomerId: customerId,
          subscription,
        });
      }
      break;
    }

    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      await syncSubscriptionStatus(subscription);
      break;
    }

    default:
      break;
  }

  return NextResponse.json({ received: true });
}
