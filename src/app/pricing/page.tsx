'use client';

import Link from 'next/link';

export default function PricingPage() {
  return (
    <>
      <section className="section" style={{ background: 'var(--gradient-hero)', color: 'white', paddingBottom: 'var(--space-12)' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <span className="section-overline" style={{ color: 'var(--accent-300)' }}>Pricing</span>
          <h1 style={{ color: 'white', marginBottom: 'var(--space-4)' }}>Simple, Transparent Pricing</h1>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.125rem', maxWidth: '600px', margin: '0 auto' }}>
            Choose the plan that works for you. Both include full access to scores, draws, and charity giving.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="grid grid-2" style={{ maxWidth: '800px', margin: '0 auto' }}>
            {/* Monthly Plan */}
            <div className="card pricing-card">
              <h3>Monthly</h3>
              <div className="pricing-price">
                $29<span>.99/mo</span>
              </div>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-4)' }}>
                Perfect for getting started
              </p>
              <ul className="pricing-features">
                <li>Full score tracking</li>
                <li>Monthly draw entry</li>
                <li>Charity contribution (10%+)</li>
                <li>Dashboard access</li>
                <li>Winner verification</li>
                <li>Cancel anytime</li>
              </ul>
              <Link href="/auth/signup?plan=monthly" className="btn btn-outline btn-block">
                Get Started
              </Link>
            </div>

            {/* Yearly Plan */}
            <div className="card pricing-card featured">
              <div className="pricing-popular">
                <span className="badge badge-premium">Save 17%</span>
              </div>
              <h3>Yearly</h3>
              <div className="pricing-price">
                $299<span>.99/yr</span>
              </div>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-4)' }}>
                Best value — save $59.89
              </p>
              <ul className="pricing-features">
                <li>Everything in Monthly</li>
                <li>Save 17% annually</li>
                <li>Priority support</li>
                <li>Early draw results</li>
                <li>Exclusive charity events</li>
                <li>Annual impact report</li>
              </ul>
              <Link href="/auth/signup?plan=yearly" className="btn btn-primary btn-block">
                Get Started
              </Link>
            </div>
          </div>

          {/* FAQ */}
          <div style={{ maxWidth: '600px', margin: 'var(--space-16) auto 0', textAlign: 'center' }}>
            <h2 className="mb-6">Frequently Asked Questions</h2>

            <div className="card mb-4" style={{ textAlign: 'left' }}>
              <h4 style={{ marginBottom: 'var(--space-2)' }}>How does the charity contribution work?</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
                A minimum of 10% of your subscription fee goes directly to your chosen charity.
                You can increase this percentage at any time from your dashboard.
              </p>
            </div>

            <div className="card mb-4" style={{ textAlign: 'left' }}>
              <h4 style={{ marginBottom: 'var(--space-2)' }}>How are draw numbers generated?</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
                Your latest 5 golf scores become your draw entry numbers. The winning numbers are drawn
                using either random generation or an algorithmic method weighted by score frequencies.
              </p>
            </div>

            <div className="card mb-4" style={{ textAlign: 'left' }}>
              <h4 style={{ marginBottom: 'var(--space-2)' }}>What happens if nobody wins the jackpot?</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
                If no one matches all 5 numbers, the 5-match prize pool carries over to the next month,
                creating a growing jackpot until someone wins!
              </p>
            </div>

            <div className="card" style={{ textAlign: 'left' }}>
              <h4 style={{ marginBottom: 'var(--space-2)' }}>Can I cancel anytime?</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
                Yes! You can cancel your subscription at any time from your dashboard. You&apos;ll retain
                access until the end of your current billing period.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
