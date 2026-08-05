"use client";

import { useState } from "react";

import type { Plan } from "@/lib/plans";

export function SubscribeForm({
  plan,
  sports,
}: {
  plan: Plan;
  sports: { slug: string; name: string }[];
}) {
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const needsSelection = plan.sportsRequired !== null;
  const isValid = !needsSelection || selected.length === plan.sportsRequired;

  function toggleSport(slug: string) {
    setSelected((prev) => {
      if (prev.includes(slug)) return prev.filter((s) => s !== slug);
      if (plan.sportsRequired !== null && prev.length >= plan.sportsRequired) {
        return [...prev.slice(1), slug];
      }
      return [...prev, slug];
    });
  }

  async function handleSubscribe() {
    setLoading(true);
    setError(null);

    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan: plan.slug, sports: selected }),
    });
    const data = await res.json().catch(() => ({}));

    if (!res.ok || !data.url) {
      setError(data.error ?? "Une erreur est survenue.");
      setLoading(false);
      return;
    }

    window.location.href = data.url;
  }

  return (
    <div className="flex flex-col gap-3">
      {needsSelection && (
        <fieldset className="flex flex-col gap-1.5 text-sm">
          <legend className="mb-1 text-xs text-zinc-500 dark:text-zinc-400">
            Choisis {plan.sportsRequired} sport{plan.sportsRequired! > 1 ? "s" : ""}
          </legend>
          {sports.map((sport) => (
            <label key={sport.slug} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={selected.includes(sport.slug)}
                onChange={() => toggleSport(sport.slug)}
              />
              {sport.name}
            </label>
          ))}
        </fieldset>
      )}

      {error && <p className="text-xs text-red-600">{error}</p>}

      <button
        type="button"
        onClick={handleSubscribe}
        disabled={!isValid || loading}
        className="rounded-full bg-foreground px-5 py-2 text-center text-sm font-medium text-background disabled:opacity-50"
      >
        {loading ? "Redirection..." : "S'abonner"}
      </button>
    </div>
  );
}
