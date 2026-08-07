import Link from "next/link";

import { prisma } from "@/lib/prisma";

const STATUS_LABELS: Record<string, string> = {
  UPCOMING: "À venir",
  LIVE: "En direct",
  FINISHED: "Terminé",
  POSTPONED: "Reporté",
  CANCELED: "Annulé",
};

export default async function AdminMatchsPage() {
  const matches = await prisma.match.findMany({
    include: { sport: true },
    orderBy: { matchDate: "desc" },
    take: 100,
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Matchs</h1>
        <Link
          href="/admin/matchs/nouveau"
          className="rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background"
        >
          + Nouveau match
        </Link>
      </div>

      <div className="overflow-x-auto rounded-lg border border-black/10 dark:border-white/15">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-black/10 text-xs text-zinc-500 dark:border-white/15 dark:text-zinc-400">
            <tr>
              <th className="px-4 py-2">Sport</th>
              <th className="px-4 py-2">Match</th>
              <th className="px-4 py-2">Date</th>
              <th className="px-4 py-2">Statut</th>
              <th className="px-4 py-2" />
            </tr>
          </thead>
          <tbody>
            {matches.map((match) => (
              <tr key={match.id} className="border-b border-black/5 last:border-0 dark:border-white/10">
                <td className="px-4 py-2">{match.sport.name}</td>
                <td className="px-4 py-2">
                  {match.homeTeam} vs {match.awayTeam}
                </td>
                <td className="px-4 py-2 text-zinc-500 dark:text-zinc-400">
                  {match.matchDate.toLocaleString("fr-FR", {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </td>
                <td className="px-4 py-2">{STATUS_LABELS[match.status]}</td>
                <td className="px-4 py-2 text-right">
                  <Link href={`/admin/matchs/${match.id}`} className="underline">
                    Modifier
                  </Link>
                </td>
              </tr>
            ))}
            {matches.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-zinc-500 dark:text-zinc-400">
                  Aucun match pour le moment.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
