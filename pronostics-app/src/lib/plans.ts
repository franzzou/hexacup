export type Plan = {
  slug: "economique" | "classique" | "premium";
  name: string;
  price: string;
  sportsIncluded: string;
  description: string;
  features: string[];
  highlighted?: boolean;
};

export const PLANS: Plan[] = [
  {
    slug: "economique",
    name: "Économique",
    price: "9,99 €",
    sportsIncluded: "1 sport au choix",
    description: "Pour suivre les recommandations sur un seul sport.",
    features: [
      "Accès aux fiches détaillées d'1 sport",
      "Statistiques et analyses par match",
      "Historique des recommandations et taux de réussite",
    ],
  },
  {
    slug: "classique",
    name: "Classique",
    price: "16,99 €",
    sportsIncluded: "2 sports au choix",
    description: "Le bon compromis pour suivre deux sports en parallèle.",
    features: [
      "Accès aux fiches détaillées de 2 sports",
      "Statistiques et analyses par match",
      "Historique des recommandations et taux de réussite",
    ],
    highlighted: true,
  },
  {
    slug: "premium",
    name: "Premium",
    price: "24,99 €",
    sportsIncluded: "Football, Basketball et Tennis",
    description: "L'accès complet à tous les sports couverts.",
    features: [
      "Accès aux fiches détaillées des 3 sports",
      "Statistiques et analyses par match",
      "Historique des recommandations et taux de réussite",
      "Nouveaux sports inclus dès leur lancement",
    ],
  },
];
