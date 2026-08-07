const FAQ_ITEMS = [
  {
    question: "Est-ce que je peux parier directement sur le site ?",
    answer:
      "Non. Ce site propose uniquement du contenu informatif : statistiques, analyses et recommandations. Aucun pari réel n'est possible ici.",
  },
  {
    question: "Comment sont construites les recommandations ?",
    answer:
      "Chaque recommandation est rédigée par notre équipe à partir des statistiques disponibles (forme des équipes, confrontations directes, contexte du match) et d'un niveau de confiance sur 5.",
  },
  {
    question: "Que couvre chaque abonnement ?",
    answer:
      "L'offre Économique donne accès à 1 sport, la Classique à 2 sports, et la Premium aux 3 sports (Football, Basketball, Tennis). Tu retrouves le détail sur la page Offres.",
  },
  {
    question: "Puis-je résilier à tout moment ?",
    answer:
      "Oui, l'abonnement est sans engagement et peut être résilié à tout moment depuis ton espace compte.",
  },
  {
    question: "Le taux de réussite affiché est-il fiable ?",
    answer:
      "Chaque recommandation passée est marquée comme réussie, ratée ou annulée une fois le match terminé, ce qui permet de calculer un taux de réussite réel et transparent.",
  },
];

export default function FaqPage() {
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-12">
      <h1 className="mb-8 text-3xl font-black tracking-tight">Questions fréquentes</h1>

      <div className="flex flex-col gap-3">
        {FAQ_ITEMS.map((item) => (
          <details key={item.question} className="card group p-4">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold marker:content-none">
              {item.question}
              <span className="shrink-0 text-lg text-accent transition-transform group-open:rotate-45">
                +
              </span>
            </summary>
            <p className="mt-3 text-sm text-muted">{item.answer}</p>
          </details>
        ))}
      </div>
    </main>
  );
}
