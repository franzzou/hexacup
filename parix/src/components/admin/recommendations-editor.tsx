import { createRecommendation, updateRecommendationResult } from "@/app/admin/matchs/actions";

const inputClass = "input";

const RESULT_OPTIONS = [
  { value: "PENDING", label: "En attente" },
  { value: "WON", label: "Réussi" },
  { value: "LOST", label: "Raté" },
  { value: "VOID", label: "Annulé" },
];

type Recommendation = {
  id: string;
  title: string;
  analysis: string;
  confidence: number | null;
  result: string;
};

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
        <div key={rec.id} className="card flex flex-col gap-2 p-4">
          <div className="flex items-center justify-between gap-2">
            <h4 className="font-semibold">{rec.title}</h4>
            {rec.confidence !== null && (
              <span className="text-xs font-medium text-accent">Confiance : {rec.confidence}/5</span>
            )}
          </div>
          <p className="text-sm text-muted">{rec.analysis}</p>
          <form action={updateRecommendationResult} className="flex items-center gap-2">
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
        <label className="flex flex-col gap-1 text-sm">
          Titre
          <input type="text" name="title" required placeholder="ex: Plus de 2.5 buts" className={inputClass} />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Analyse
          <textarea name="analysis" required rows={3} className={inputClass} />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Confiance (1-5)
          <input type="number" name="confidence" min={1} max={5} className={inputClass} />
        </label>
        <button type="submit" className="btn-primary w-fit">
          Publier
        </button>
      </form>
    </div>
  );
}
