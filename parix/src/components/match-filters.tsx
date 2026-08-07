"use client";

import { useRouter, useSearchParams } from "next/navigation";

type Option = { value: string; label: string };

export function MatchFilters({
  sports,
  countries,
}: {
  sports: Option[];
  countries: Option[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap gap-3">
      <select
        value={searchParams.get("sport") ?? ""}
        onChange={(e) => updateParam("sport", e.target.value)}
        className="input w-auto py-2 font-medium"
      >
        <option value="">Tous les sports</option>
        {sports.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>

      <select
        value={searchParams.get("country") ?? ""}
        onChange={(e) => updateParam("country", e.target.value)}
        className="input w-auto py-2 font-medium"
      >
        <option value="">Tous les pays</option>
        {countries.map((c) => (
          <option key={c.value} value={c.value}>
            {c.label}
          </option>
        ))}
      </select>
    </div>
  );
}
