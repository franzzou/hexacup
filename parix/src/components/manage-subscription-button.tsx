"use client";

import { useState } from "react";

export function ManageSubscriptionButton({ className }: { className?: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setError(null);

    const res = await fetch("/api/stripe/portal", { method: "POST" });
    const data = await res.json().catch(() => ({}));

    if (!res.ok || !data.url) {
      setError(data.error ?? "Impossible d'ouvrir la gestion d'abonnement.");
      setLoading(false);
      return;
    }

    window.location.href = data.url;
  }

  return (
    <div className="flex flex-col items-center gap-1">
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className={className ?? "rounded-full bg-foreground px-5 py-2 text-sm font-medium text-background disabled:opacity-50"}
      >
        {loading ? "Redirection..." : "Gérer mon abonnement"}
      </button>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
