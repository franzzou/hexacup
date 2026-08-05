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
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10">
      <div className="mb-10 text-center">
        <h1 className="text-2xl font-semibold">Nos offres</h1>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          Accède aux fiches détaillées, statistiques et recommandations selon le
          sport de ton choix. Sans engagement, résiliable à tout moment.
        </p>
      </div>

      {subscription?.status === "ACTIVE" && (
        <div className="mx-auto mb-10 flex max-w-md flex-col items-center gap-3 rounded-xl border border-black/10 p-6 text-center dark:border-white/15">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Offre actuelle : <span className="font-medium">{currentPlan?.name ?? subscription.plan}</span>
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
            className={`flex flex-col gap-4 rounded-xl border p-6 ${
              plan.highlighted
                ? "border-foreground shadow-sm"
                : "border-black/10 dark:border-white/15"
            }`}
          >
            {plan.highlighted && (
              <span className="w-fit rounded-full bg-foreground px-3 py-1 text-xs font-medium text-background">
                Recommandé
              </span>
            )}
            <h2 className="text-lg font-semibold">{plan.name}</h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">{plan.sportsIncluded}</p>
            <p>
              <span className="text-3xl font-semibold">{plan.price}</span>
              <span className="text-sm text-zinc-500 dark:text-zinc-400"> / mois</span>
            </p>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">{plan.description}</p>
            <ul className="flex flex-1 flex-col gap-2 text-sm">
              {plan.features.map((feature) => (
                <li key={feature} className="flex gap-2">
                  <span>✓</span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            {!session?.user ? (
              <Link
                href="/register?callbackUrl=/offres"
                className="rounded-full bg-foreground px-5 py-2 text-center text-sm font-medium text-background"
              >
                S&apos;inscrire
              </Link>
            ) : hasStripeCustomer ? (
              <p className="text-center text-xs text-zinc-500 dark:text-zinc-400">
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
