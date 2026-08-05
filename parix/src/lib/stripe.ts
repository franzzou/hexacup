import Stripe from "stripe";

let stripeClient: Stripe | undefined;

export function getStripe() {
  if (!stripeClient) {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      throw new Error("STRIPE_SECRET_KEY manquante dans les variables d'environnement.");
    }
    stripeClient = new Stripe(secretKey);
  }
  return stripeClient;
}
