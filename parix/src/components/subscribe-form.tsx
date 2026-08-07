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
        <fieldset className="flex flex-col gap-2 text-sm">
          <legend className="mb-1 text-xs font-medium text-muted">
            Choisis {plan.sportsRequired} sport{plan.sportsRequired! > 1 ? "s" : ""}
          </legend>
          <div className="flex flex-wrap gap-2">
            {sports.map((sport) => (
              <label key={sport.slug} className="cursor-pointer">
                <input
                  type="checkbox"
                  className="peer sr-only"
                  checked={selected.includes(sport.slug)}
                  onChange={() => toggleSport(sport.slug)}
                />
                <span className="inline-block rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted transition-colors peer-checked:border-accent peer-checked:bg-accent/15 peer-checked:text-accent">
                  {sport.name}
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      )}

      {error && <p className="text-xs text-danger">{error}</p>}

      <button
        type="button"
        onClick={handleSubscribe}
        disabled={!isValid || loading}
        className="btn-primary w-full"
      >
        {loading ? "Redirection..." : "S'abonner"}
      </button>
    </div>
  );
}
