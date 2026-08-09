import Link from "next/link";

import { BET_MARKET_LABELS } from "@/lib/bet-markets";
import { computeTheoreticalRoi, groupBySummary } from "@/lib/performance";
import { prisma } from "@/lib/prisma";

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

export default async function PerformancesPage() {
  const recommendations = await prisma.recommendation.findMany({
    include: { match: { include: { sport: true } } },
    orderBy: { createdAt: "desc" },
  });

  const global = groupBySummary(recommendations, () => "all", () => "Toutes recommandations")[0];
  const byMarket = groupBySummary(
    recommendations,
    (r) => r.market,
    (key) => BET_MARKET_LABELS[key] ?? key,
  );
  const sportBuckets = groupBySummary(
    recommendations.map((r) => ({ ...r, market: r.match.sport.name })),
    (r) => r.market,
    (key) => key,
  );
  const roi = computeTheoreticalRoi(recommendations);

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-black tracking-tight">Historique &amp; performance</h1>
        <p className="mt-2 text-sm text-muted">
          Toutes nos recommandations publiées, sans filtre — y compris les échecs. Taux de
          réussite calculé sur les paris tranchés (hors "en attente" et "annulé").
        </p>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <div className="card p-5">
          <p className="text-xs uppercase tracking-wide text-muted">Taux de réussite global</p>
          <p className="mt-1 text-3xl font-black text-accent">
            {global?.successRate !== null ? `${global.successRate}%` : "—"}
          </p>
          <p className="mt-1 text-xs text-muted">
            {global?.won ?? 0} réussies / {(global?.won ?? 0) + (global?.lost ?? 0)} tranchées
          </p>
        </div>
        <div className="card p-5">
          <p className="text-xs uppercase tracking-wide text-muted">Recommandations publiées</p>
          <p className="mt-1 text-3xl font-black">{recommendations.length}</p>
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

      <section className="mb-8">
        <h2 className="mb-3 text-lg font-bold">Par type de pari</h2>
        <div className="card overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border text-xs text-muted">
              <tr>
                <th className="px-4 py-2">Marché</th>
                <th className="px-4 py-2 text-right">Total</th>
                <th className="px-4 py-2 text-right">Réussite</th>
              </tr>
            </thead>
            <tbody>
              {byMarket.map((bucket) => (
                <tr key={bucket.key} className="border-b border-border last:border-0">
                  <td className="px-4 py-2">{bucket.label}</td>
                  <td className="px-4 py-2 text-right text-muted">{bucket.total}</td>
                  <td className="px-4 py-2 text-right font-medium">
                    {bucket.successRate !== null ? `${bucket.successRate}%` : "—"}
                  </td>
                </tr>
              ))}
              {byMarket.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-4 py-6 text-center text-muted">
                    Aucune recommandation pour le moment.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="mb-3 text-lg font-bold">Par sport</h2>
        <div className="card overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border text-xs text-muted">
              <tr>
                <th className="px-4 py-2">Sport</th>
                <th className="px-4 py-2 text-right">Total</th>
                <th className="px-4 py-2 text-right">Réussite</th>
              </tr>
            </thead>
            <tbody>
              {sportBuckets.map((bucket) => (
                <tr key={bucket.key} className="border-b border-border last:border-0">
                  <td className="px-4 py-2">{bucket.label}</td>
                  <td className="px-4 py-2 text-right text-muted">{bucket.total}</td>
                  <td className="px-4 py-2 text-right font-medium">
                    {bucket.successRate !== null ? `${bucket.successRate}%` : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-bold">Historique complet</h2>
        <div className="card overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border text-xs text-muted">
              <tr>
                <th className="px-4 py-2">Date</th>
                <th className="px-4 py-2">Match</th>
                <th className="px-4 py-2">Type</th>
                <th className="px-4 py-2 text-right">Résultat</th>
              </tr>
            </thead>
            <tbody>
              {recommendations.map((rec) => (
                <tr key={rec.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-2 whitespace-nowrap text-muted">
                    {rec.createdAt.toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                  </td>
                  <td className="px-4 py-2">
                    <Link href={`/matchs/${rec.matchId}`} className="hover:text-accent">
                      {rec.match.homeTeam} - {rec.match.awayTeam}
                    </Link>
                  </td>
                  <td className="px-4 py-2 text-muted">{BET_MARKET_LABELS[rec.market]}</td>
                  <td className="px-4 py-2 text-right">
                    <span className={`badge ${RESULT_CLASSES[rec.result]}`}>
                      {RESULT_LABELS[rec.result]}
                    </span>
                  </td>
                </tr>
              ))}
              {recommendations.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-muted">
                    Aucune recommandation pour le moment.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
