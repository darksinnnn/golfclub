import Stripe from 'stripe';

// Use a dummy key during Next.js Vercel build phase if the secret isn't available
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'dummy_key_for_build_bypass', {
  apiVersion: '2024-12-18.acacia' as Stripe.LatestApiVersion,
  typescript: true,
});

export const PLANS = {
  monthly: {
    name: 'Monthly Plan',
    amount: 2999, // in cents
    currency: 'usd',
    interval: 'month' as const,
    displayAmount: '$29.99',
  },
  yearly: {
    name: 'Yearly Plan',
    amount: 29999, // in cents
    currency: 'usd',
    interval: 'year' as const,
    displayAmount: '$299.99',
    savings: '17%',
  },
};

export async function createCheckoutSession(
  customerId: string,
  planType: 'monthly' | 'yearly',
  userId: string,
  successUrl: string,
  cancelUrl: string
) {
  const plan = PLANS[planType];

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ['card'],
    mode: 'subscription',
    line_items: [
      {
        price_data: {
          currency: plan.currency,
          product_data: {
            name: `Golf Heroes - ${plan.name}`,
            description: `Subscribe to Golf Heroes ${plan.name}`,
          },
          unit_amount: plan.amount,
          recurring: {
            interval: plan.interval,
          },
        },
        quantity: 1,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      userId,
      planType,
    },
  });

  return session;
}

export async function createCustomer(email: string, name: string) {
  const customer = await stripe.customers.create({
    email,
    name,
  });
  return customer;
}

export async function cancelSubscription(subscriptionId: string) {
  const subscription = await stripe.subscriptions.cancel(subscriptionId);
  return subscription;
}

export async function getSubscription(subscriptionId: string) {
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  return subscription;
}
