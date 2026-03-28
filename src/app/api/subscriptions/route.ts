import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { stripe, PLANS, createCustomer, createCheckoutSession } from '@/lib/stripe';

// GET: Get user's active subscription
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    return NextResponse.json({ subscription });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch subscription';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST: Create a Stripe checkout session
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { planType } = body;

    if (!planType || !['monthly', 'yearly'].includes(planType)) {
      return NextResponse.json({ error: 'Invalid plan type' }, { status: 400 });
    }

    // Check for existing subscription
    const { data: existingSub } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    if (existingSub) {
      return NextResponse.json({ error: 'You already have an active subscription' }, { status: 400 });
    }

    // Get or create Stripe customer
    let stripeCustomerId: string;
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    // Check if user already has a customer ID from previous subscription
    const { data: prevSub } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .not('stripe_customer_id', 'is', null)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (prevSub?.stripe_customer_id) {
      stripeCustomerId = prevSub.stripe_customer_id;
    } else {
      const customer = await createCustomer(
        user.email!,
        profile?.full_name || ''
      );
      stripeCustomerId = customer.id;
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    const session = await createCheckoutSession(
      stripeCustomerId,
      planType as 'monthly' | 'yearly',
      user.id,
      `${appUrl}/dashboard/subscription?success=true&session_id={CHECKOUT_SESSION_ID}`,
      `${appUrl}/dashboard/subscription?cancelled=true`
    );

    return NextResponse.json({ url: session.url });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create checkout session';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// PATCH: Cancel subscription
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action } = body;

    if (action === 'cancel') {
      const { data: subscription } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();

      if (!subscription) {
        return NextResponse.json({ error: 'No active subscription found' }, { status: 404 });
      }

      // Cancel in Stripe if we have a subscription ID
      if (subscription.stripe_subscription_id) {
        try {
          await stripe.subscriptions.cancel(subscription.stripe_subscription_id);
        } catch {
          // Stripe subscription may not exist, continue with local cancellation
        }
      }

      // Update local subscription
      const { error } = await supabase
        .from('subscriptions')
        .update({
          status: 'cancelled',
          cancelled_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', subscription.id);

      if (error) throw error;

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update subscription';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
