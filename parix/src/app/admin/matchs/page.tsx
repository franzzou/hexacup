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
        <h1 className="text-xl font-bold">Matchs</h1>
        <Link href="/admin/matchs/nouveau" className="btn-primary">
          + Nouveau match
        </Link>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border text-xs text-muted">
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
              <tr key={match.id} className="border-b border-border last:border-0">
                <td className="px-4 py-2">{match.sport.name}</td>
                <td className="px-4 py-2 font-medium">
                  {match.homeTeam} vs {match.awayTeam}
                </td>
                <td className="px-4 py-2 text-muted">
                  {match.matchDate.toLocaleString("fr-FR", {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </td>
                <td className="px-4 py-2">{STATUS_LABELS[match.status]}</td>
                <td className="px-4 py-2 text-right">
                  <Link href={`/admin/matchs/${match.id}`} className="font-medium text-accent hover:underline">
                    Modifier
                  </Link>
                </td>
              </tr>
            ))}
            {matches.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-muted">
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
