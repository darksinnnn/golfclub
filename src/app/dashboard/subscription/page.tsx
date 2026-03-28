'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/components/Toast';
import { CreditCard } from '@/components/Icons';
import { useSearchParams } from 'next/navigation';
import type { Subscription } from '@/lib/types';

export default function SubscriptionPageWrapper() {
  return (
    <Suspense fallback={<div><div className="skeleton skeleton-title" /><div className="skeleton skeleton-card" style={{ height: 200 }} /></div>}>
      <SubscriptionPage />
    </Suspense>
  );
}

function SubscriptionPage() {
  const { profile, loading: authLoading } = useAuth();
  const { addToast } = useToast();
  const searchParams = useSearchParams();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [allSubs, setAllSubs] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!profile) { setLoading(false); return; }
    fetchSubscription();
  }, [profile, authLoading]);

  useEffect(() => {
    if (searchParams.get('success') === 'true') {
      addToast({ type: 'success', title: 'Subscription Active!', message: 'Welcome to Golf Heroes! Your subscription is now active.' });
      fetchSubscription();
    }
    if (searchParams.get('cancelled') === 'true') {
      addToast({ type: 'warning', title: 'Checkout Cancelled', message: 'You cancelled the checkout process.' });
    }
  }, [searchParams]);

  useEffect(() => {
    // Auto-trigger checkout if plan param is passed from pricing page signup
    const plan = searchParams.get('plan');
    if (plan === 'monthly' || plan === 'yearly') {
      const timer = setTimeout(() => {
        handleSubscribe(plan as 'monthly' | 'yearly');
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  const fetchSubscription = async () => {
    if (!profile) { setLoading(false); return; }
    try {
      const supabase = createClient();
      const { data: activeSub } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', profile.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      const { data: history } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false });

      setSubscription(activeSub);
      setAllSubs(history || []);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (planType: 'monthly' | 'yearly') => {
    setSubscribing(true);
    try {
      const res = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planType }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      if (data.url) {
        window.location.href = data.url; // Redirect to Stripe checkout
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to start checkout';
      addToast({ type: 'error', title: 'Error', message });
      setSubscribing(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel your subscription? You will retain access until the end of your current billing period.')) return;
    setCancelling(true);

    try {
      const res = await fetch('/api/subscriptions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'cancel' }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      addToast({ type: 'success', title: 'Subscription Cancelled', message: 'Your subscription has been cancelled.' });
      fetchSubscription();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to cancel subscription';
      addToast({ type: 'error', title: 'Error', message });
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div>
        <div className="skeleton skeleton-title" />
        <div className="skeleton skeleton-card" style={{ height: 200 }} />
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h1>Subscription</h1>
        <p>Manage your Golf Heroes subscription plan</p>
      </div>

      {subscription ? (
        <>
          {/* Active Subscription Card */}
          <div className="card card-highlight mb-6">
            <div className="flex items-center justify-between" style={{ flexWrap: 'wrap', gap: 'var(--space-4)' }}>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h2 style={{ fontSize: '1.25rem' }}>{subscription.plan_type === 'monthly' ? 'Monthly' : 'Yearly'} Plan</h2>
                  <span className="badge badge-success">ACTIVE</span>
                </div>
                <p style={{ color: 'var(--text-secondary)' }}>
                  ${Number(subscription.amount).toFixed(2)} / {subscription.plan_type === 'monthly' ? 'month' : 'year'}
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                  Started: {new Date(subscription.start_date).toLocaleDateString()}
                </div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                  Next renewal: {subscription.end_date ? new Date(subscription.end_date).toLocaleDateString() : 'N/A'}
                </div>
              </div>
            </div>

            <div style={{ marginTop: 'var(--space-4)', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--border-color)' }}>
              <div className="flex items-center justify-between">
                <div>
                  <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Charity contribution: </span>
                  <strong>{subscription.charity_percentage}%</strong>
                </div>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={handleCancel}
                  disabled={cancelling}
                  style={{ color: 'var(--error)' }}
                >
                  {cancelling ? 'Cancelling...' : 'Cancel Subscription'}
                </button>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="card">
            <h3 className="mb-4">Your Plan Includes</h3>
            <ul className="pricing-features">
              <li>Full score tracking (5 rolling scores)</li>
              <li>Monthly draw entry (automatic)</li>
              <li>Charity contribution ({subscription.charity_percentage}%+)</li>
              <li>Full dashboard access</li>
              <li>Winner verification & payouts</li>
              <li>Priority support</li>
            </ul>
          </div>
        </>
      ) : (
        <>
          {/* No Active Subscription */}
          <div className="card mb-6" style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
            <div style={{ marginBottom: 'var(--space-4)' }}><CreditCard size={48} strokeWidth={1.5} style={{ color: 'var(--primary-500)', margin: '0 auto' }} /></div>
            <h2>No Active Subscription</h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', margin: 'var(--space-3) auto var(--space-6)' }}>
              Subscribe to access score tracking, monthly draws, and support a charity you care about.
            </p>
          </div>

          <div className="grid grid-2" style={{ maxWidth: '700px' }}>
            <div className="card pricing-card">
              <h3>Monthly</h3>
              <div className="pricing-price">$29<span>.99/mo</span></div>
              <ul className="pricing-features">
                <li>Full score tracking</li>
                <li>Monthly draw entry</li>
                <li>Charity contribution</li>
                <li>Cancel anytime</li>
              </ul>
              <button
                className="btn btn-outline btn-block"
                onClick={() => handleSubscribe('monthly')}
                disabled={subscribing}
              >
                {subscribing ? <><span className="spinner" /> Processing...</> : 'Choose Monthly'}
              </button>
            </div>

            <div className="card pricing-card featured">
              <div className="pricing-popular">
                <span className="badge badge-premium">Save 17%</span>
              </div>
              <h3>Yearly</h3>
              <div className="pricing-price">$299<span>.99/yr</span></div>
              <ul className="pricing-features">
                <li>Everything in Monthly</li>
                <li>Save $59.89/year</li>
                <li>Priority support</li>
                <li>Annual impact report</li>
              </ul>
              <button
                className="btn btn-primary btn-block"
                onClick={() => handleSubscribe('yearly')}
                disabled={subscribing}
              >
                {subscribing ? <><span className="spinner" /> Processing...</> : 'Choose Yearly'}
              </button>
            </div>
          </div>
        </>
      )}

      {/* Billing History */}
      {allSubs.length > 0 && (
        <div className="card mt-8">
          <h3 className="mb-4">Billing History</h3>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Plan</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                </tr>
              </thead>
              <tbody>
                {allSubs.map((sub) => (
                  <tr key={sub.id}>
                    <td style={{ fontWeight: 600 }}>{sub.plan_type}</td>
                    <td>${Number(sub.amount).toFixed(2)}</td>
                    <td>
                      <span className={`badge ${sub.status === 'active' ? 'badge-success' : sub.status === 'cancelled' ? 'badge-error' : 'badge-warning'}`}>
                        {sub.status}
                      </span>
                    </td>
                    <td>{new Date(sub.start_date).toLocaleDateString()}</td>
                    <td>{sub.end_date ? new Date(sub.end_date).toLocaleDateString() : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
