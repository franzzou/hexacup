export type PlanType = "ECONOMIQUE" | "CLASSIQUE" | "PREMIUM";

export type Plan = {
  slug: "economique" | "classique" | "premium";
  planType: PlanType;
  name: string;
  price: string;
  sportsIncluded: string;
  /** Nombre de sports à choisir. `null` = tous les sports, pas de choix à faire. */
  sportsRequired: number | null;
  description: string;
  features: string[];
  highlighted?: boolean;
  /** Nom de la variable d'environnement contenant l'ID du Price Stripe. */
  stripePriceEnv: string;
};

export const PLANS: Plan[] = [
  {
    slug: "economique",
    planType: "ECONOMIQUE",
    name: "Économique",
    price: "9,99 €",
    sportsIncluded: "1 sport au choix",
    sportsRequired: 1,
    description: "Pour suivre les recommandations sur un seul sport.",
    features: [
      "Accès aux fiches détaillées d'1 sport",
      "Statistiques et analyses par match",
      "Historique des recommandations et taux de réussite",
    ],
    stripePriceEnv: "STRIPE_PRICE_ECONOMIQUE",
  },
  {
    slug: "classique",
    planType: "CLASSIQUE",
    name: "Classique",
    price: "16,99 €",
    sportsIncluded: "2 sports au choix",
    sportsRequired: 2,
    description: "Le bon compromis pour suivre deux sports en parallèle.",
    features: [
      "Accès aux fiches détaillées de 2 sports",
      "Statistiques et analyses par match",
      "Historique des recommandations et taux de réussite",
    ],
    highlighted: true,
    stripePriceEnv: "STRIPE_PRICE_CLASSIQUE",
  },
  {
    slug: "premium",
    planType: "PREMIUM",
    name: "Premium",
    price: "24,99 €",
    sportsIncluded: "Football, Basketball et Tennis",
    sportsRequired: null,
    description: "L'accès complet à tous les sports couverts.",
    features: [
      "Accès aux fiches détaillées des 3 sports",
      "Statistiques et analyses par match",
      "Historique des recommandations et taux de réussite",
      "Nouveaux sports inclus dès leur lancement",
    ],
    stripePriceEnv: "STRIPE_PRICE_PREMIUM",
  },
];

export function getPlan(slug: string) {
  return PLANS.find((p) => p.slug === slug);
}
