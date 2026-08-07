import Link from "next/link";

import { ManageSubscriptionButton } from "@/components/manage-subscription-button";
import { SubscribeForm } from "@/components/subscribe-form";
import { auth } from "@/lib/auth";
import { PLANS, getPlan } from "@/lib/plans";
import { prisma } from "@/lib/prisma";

export default async function OffresPage() {
  const session = await auth();
  const sports = await prisma.sport.findMany({ orderBy: { name: "asc" } });

  const subscription = session?.user
    ? await prisma.subscription.findUnique({
        where: { userId: session.user.id },
        include: { sports: { include: { sport: true } } },
      })
    : null;

  const hasStripeCustomer = Boolean(subscription?.stripeCustomerId);
  const currentPlan = subscription?.plan ? getPlan(subscription.plan.toLowerCase()) : undefined;

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-12">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-black tracking-tight">Nos offres</h1>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted">
          Accède aux fiches détaillées, statistiques et recommandations selon le
          sport de ton choix. Sans engagement, résiliable à tout moment.
        </p>
      </div>

      {subscription?.status === "ACTIVE" && (
        <div className="card mx-auto mb-10 flex max-w-md flex-col items-center gap-3 p-6 text-center">
          <p className="text-sm text-muted">
            Offre actuelle :{" "}
            <span className="font-semibold text-foreground">
              {currentPlan?.name ?? subscription.plan}
            </span>
            {subscription.sports.length > 0 && (
              <> — {subscription.sports.map((s) => s.sport.name).join(", ")}</>
            )}
          </p>
          <ManageSubscriptionButton />
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-3">
        {PLANS.map((plan) => (
          <div
            key={plan.slug}
            className={`relative flex flex-col gap-4 rounded-xl p-6 ${
              plan.highlighted
                ? "border-2 border-accent bg-surface shadow-[0_0_40px_-12px_var(--accent)]"
                : "card"
            }`}
          >
            {plan.highlighted && (
              <span className="absolute -top-3 left-6 rounded-full bg-accent px-3 py-1 text-xs font-bold uppercase tracking-wide text-accent-foreground">
                Recommandé
              </span>
            )}
            <h2 className="text-lg font-bold">{plan.name}</h2>
            <p className="text-sm text-muted">{plan.sportsIncluded}</p>
            <p>
              <span className="text-3xl font-black tracking-tight">{plan.price}</span>
              <span className="text-sm text-muted"> / mois</span>
            </p>
            <p className="text-sm text-muted">{plan.description}</p>
            <ul className="flex flex-1 flex-col gap-2 text-sm">
              {plan.features.map((feature) => (
                <li key={feature} className="flex gap-2">
                  <span className="font-bold text-success">✓</span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            {!session?.user ? (
              <Link href="/register?callbackUrl=/offres" className="btn-primary w-full">
                S&apos;inscrire
              </Link>
            ) : hasStripeCustomer ? (
              <p className="text-center text-xs text-muted">
                Utilise la gestion d&apos;abonnement ci-dessus pour changer d&apos;offre.
              </p>
            ) : (
              <SubscribeForm
                plan={plan}
                sports={sports.map((s) => ({ slug: s.slug, name: s.name }))}
              />
            )}
          </div>
        ))}
      </div>
    </main>
  );
}
