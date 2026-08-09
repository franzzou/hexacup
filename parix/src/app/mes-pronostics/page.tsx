import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { BET_MARKET_LABELS } from "@/lib/bet-markets";
import { computeTheoreticalRoi, groupBySummary } from "@/lib/performance";
import { prisma } from "@/lib/prisma";

import { toggleUserPick } from "../matchs/[id]/actions";

const RESULT_LABELS: Record<string, string> = {
  PENDING: "En attente",
  WON: "Réussi",
  LOST: "Raté",
  VOID: "Annulé",
};

const RESULT_CLASSES: Record<string, string> = {
  PENDING: "bg-surface-2 text-muted",
  WON: "bg-success/15 text-success",
  LOST: "bg-danger/15 text-danger",
  VOID: "bg-surface-2 text-muted",
};

export default async function MesPronosticsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/mes-pronostics");

  const picks = await prisma.userPick.findMany({
    where: { userId: session.user.id },
    include: { recommendation: { include: { match: { include: { sport: true } } } } },
    orderBy: { createdAt: "desc" },
  });

  const recs = picks.map((p) => p.recommendation);
  const summary = groupBySummary(recs, () => "all", () => "Mon bilan")[0];
  const roi = computeTheoreticalRoi(recs);

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-black tracking-tight">Mes pronostics</h1>
        <p className="mt-2 text-sm text-muted">
          Les recommandations que tu as cochées comme suivies, avec leur résultat vérifié.
        </p>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <div className="card p-5">
          <p className="text-xs uppercase tracking-wide text-muted">Mon taux de réussite</p>
          <p className="mt-1 text-3xl font-black text-accent">
            {summary?.successRate != null ? `${summary.successRate}%` : "—"}
          </p>
          <p className="mt-1 text-xs text-muted">
            {summary?.won ?? 0} réussis / {(summary?.won ?? 0) + (summary?.lost ?? 0)} tranchés
          </p>
        </div>
        <div className="card p-5">
          <p className="text-xs uppercase tracking-wide text-muted">Pronostics suivis</p>
          <p className="mt-1 text-3xl font-black">{picks.length}</p>
        </div>
        <div className="card p-5">
          <p className="text-xs uppercase tracking-wide text-muted">ROI théorique</p>
          <p className="mt-1 text-3xl font-black text-accent">
            {roi ? `${roi.roiPct > 0 ? "+" : ""}${roi.roiPct}%` : "—"}
          </p>
          <p className="mt-1 text-xs text-muted">
            {roi ? `Mise fixe 1 unité, sur ${roi.staked} paris cotés` : "Aucune cote renseignée"}
          </p>
        </div>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border text-xs text-muted">
            <tr>
              <th className="px-4 py-2">Match</th>
              <th className="px-4 py-2">Type</th>
              <th className="px-4 py-2">Résultat</th>
              <th className="px-4 py-2" />
            </tr>
          </thead>
          <tbody>
            {picks.map((pick) => (
              <tr key={pick.id} className="border-b border-border last:border-0">
                <td className="px-4 py-2">
                  <Link href={`/matchs/${pick.recommendation.matchId}`} className="hover:text-accent">
                    {pick.recommendation.match.homeTeam} - {pick.recommendation.match.awayTeam}
                  </Link>
                  <p className="text-xs text-muted">{pick.recommendation.title}</p>
                </td>
                <td className="px-4 py-2 text-muted">{BET_MARKET_LABELS[pick.recommendation.market]}</td>
                <td className="px-4 py-2">
                  <span className={`badge ${RESULT_CLASSES[pick.recommendation.result]}`}>
                    {RESULT_LABELS[pick.recommendation.result]}
                  </span>
                </td>
                <td className="px-4 py-2 text-right">
                  <form action={toggleUserPick}>
                    <input type="hidden" name="matchId" value={pick.recommendation.matchId} />
                    <input type="hidden" name="recommendationId" value={pick.recommendationId} />
                    <button type="submit" className="text-xs text-muted hover:text-danger hover:underline">
                      Retirer
                    </button>
                  </form>
                </td>
              </tr>
            ))}
            {picks.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-muted">
                  Tu n&apos;as encore suivi aucun pronostic. Va sur une fiche match et clique sur
                  "Suivre ce pari".
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
