import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createServerClient } from '@supabase/ssr';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const sig = request.headers.get('stripe-signature')!;

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Webhook signature verification failed:', message);
    return NextResponse.json({ error: `Webhook Error: ${message}` }, { status: 400 });
  }

  // Use service role to bypass RLS
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() { return []; },
        setAll() {},
      },
    }
  );

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      const userId = session.metadata?.userId;
      const planType = session.metadata?.planType;
      const subscriptionId = session.subscription as string;
      const customerId = session.customer as string;

      if (userId && planType) {
        const amount = planType === 'monthly' ? 29.99 : 299.99;
        const endDate = new Date();
        if (planType === 'monthly') {
          endDate.setMonth(endDate.getMonth() + 1);
        } else {
          endDate.setFullYear(endDate.getFullYear() + 1);
        }

        await supabase.from('subscriptions').insert({
          user_id: userId,
          plan_type: planType,
          status: 'active',
          amount,
          stripe_customer_id: customerId,
          stripe_subscription_id: subscriptionId,
          start_date: new Date().toISOString(),
          end_date: endDate.toISOString(),
        });

        // Create notification
        await supabase.from('notifications').insert({
          user_id: userId,
          title: 'Subscription Active!',
          message: `Your ${planType} subscription is now active. Welcome to Golf Heroes!`,
          type: 'success',
        });
      }
      break;
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object;
      const subId = subscription.id;

      await supabase
        .from('subscriptions')
        .update({
          status: 'cancelled',
          cancelled_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('stripe_subscription_id', subId);

      break;
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as unknown as { subscription?: string };
      const subId = invoice.subscription;

      if (subId) {
        await supabase
          .from('subscriptions')
          .update({
            status: 'past_due',
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_subscription_id', subId);
      }
      break;
    }

    case 'invoice.paid': {
      const invoice = event.data.object as unknown as { subscription?: string };
      const subId = invoice.subscription;

      if (subId) {
        const endDate = new Date();
        const { data: sub } = await supabase
          .from('subscriptions')
          .select('plan_type')
          .eq('stripe_subscription_id', subId)
          .single();

        if (sub?.plan_type === 'monthly') {
          endDate.setMonth(endDate.getMonth() + 1);
        } else {
          endDate.setFullYear(endDate.getFullYear() + 1);
        }

        await supabase
          .from('subscriptions')
          .update({
            status: 'active',
            end_date: endDate.toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_subscription_id', subId);
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
