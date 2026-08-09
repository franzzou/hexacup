import {
  createRecommendation,
  updateRecommendationDetails,
  updateRecommendationResult,
} from "@/app/admin/matchs/actions";
import { BET_MARKET_LABELS, BET_MARKET_OPTIONS } from "@/lib/bet-markets";
import { CONFIDENCE_FACTOR_LABELS } from "@/lib/confidence";

const inputClass = "input";

const RESULT_OPTIONS = [
  { value: "PENDING", label: "En attente" },
  { value: "WON", label: "Réussi" },
  { value: "LOST", label: "Raté" },
  { value: "VOID", label: "Annulé" },
];

const SCORE_FIELDS = Object.keys(CONFIDENCE_FACTOR_LABELS) as (keyof typeof CONFIDENCE_FACTOR_LABELS)[];

type Recommendation = {
  id: string;
  title: string;
  market: string;
  analysis: string;
  formScore: number | null;
  h2hScore: number | null;
  contextScore: number | null;
  statsScore: number | null;
  marketScore: number | null;
  confidenceScore: number | null;
  odds: number | null;
  watchOnly: boolean;
  result: string;
};

function RecommendationFields({ defaults }: { defaults?: Partial<Recommendation> }) {
  return (
    <>
      <label className="flex flex-col gap-1 text-sm">
        Titre
        <input
          type="text"
          name="title"
          required
          placeholder="ex: Plus de 2.5 buts"
          defaultValue={defaults?.title}
          className={inputClass}
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Type de pari
        <select name="market" defaultValue={defaults?.market ?? "OTHER"} className={inputClass}>
          {BET_MARKET_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Analyse (2-3 phrases expliquant le raisonnement)
        <textarea name="analysis" required rows={3} defaultValue={defaults?.analysis} className={inputClass} />
      </label>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted">
          Indice de confiance — facteurs (0-100, optionnels)
        </legend>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {SCORE_FIELDS.map((field) => (
            <label key={field} className="flex flex-col gap-1 text-xs">
              {CONFIDENCE_FACTOR_LABELS[field]}
              <input
                type="number"
                name={field}
                min={0}
                max={100}
                defaultValue={defaults?.[field] ?? ""}
                className={inputClass}
              />
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grid grid-cols-2 gap-2">
        <label className="flex flex-col gap-1 text-sm">
          Cote (pour le ROI théorique)
          <input type="number" step="0.01" name="odds" defaultValue={defaults?.odds ?? ""} className={inputClass} />
        </label>
        <label className="mt-6 flex items-center gap-1.5 text-sm text-muted">
          <input type="checkbox" name="watchOnly" defaultChecked={defaults?.watchOnly} />
          À surveiller (tendance pas encore confirmée)
        </label>
      </div>
    </>
  );
}

export function RecommendationsEditor({
  matchId,
  recommendations,
}: {
  matchId: string;
  recommendations: Recommendation[];
}) {
  return (
    <div className="flex flex-col gap-4">
      {recommendations.map((rec) => (
        <div key={rec.id} className="card flex flex-col gap-3 p-4">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="badge-neutral">{BET_MARKET_LABELS[rec.market]}</span>
            {rec.watchOnly && <span className="badge bg-warning/15 text-warning">À surveiller</span>}
            {rec.confidenceScore !== null && (
              <span className="font-semibold text-accent">
                Indice de confiance : {rec.confidenceScore}/100
              </span>
            )}
          </div>

          <form action={updateRecommendationDetails} className="flex flex-col gap-3">
            <input type="hidden" name="matchId" value={matchId} />
            <input type="hidden" name="recommendationId" value={rec.id} />
            <RecommendationFields defaults={rec} />
            <button type="submit" className="btn-secondary w-fit px-4 py-1.5 text-xs">
              Enregistrer les modifications
            </button>
          </form>

          <form action={updateRecommendationResult} className="flex items-center gap-2 border-t border-border pt-3">
            <input type="hidden" name="matchId" value={matchId} />
            <input type="hidden" name="recommendationId" value={rec.id} />
            <select name="result" defaultValue={rec.result} className={`${inputClass} py-1.5`}>
              {RESULT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <button type="submit" className="btn-secondary px-3 py-1.5 text-xs">
              Mettre à jour le résultat
            </button>
          </form>
        </div>
      ))}
      {recommendations.length === 0 && (
        <p className="text-sm text-muted">Aucune recommandation publiée pour ce match.</p>
      )}

      <form action={createRecommendation} className="card flex flex-col gap-3 p-4">
        <input type="hidden" name="matchId" value={matchId} />
        <h4 className="font-semibold">Publier une recommandation</h4>
        <RecommendationFields />
        <button type="submit" className="btn-primary w-fit">
          Publier
        </button>
      </form>
    </div>
  );
}
