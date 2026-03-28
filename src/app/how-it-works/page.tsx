import Link from 'next/link';

export const metadata = {
  title: 'How It Works — Golf Heroes',
  description: 'Learn how Golf Heroes works: subscribe, enter scores, compete in monthly draws, and support charities.',
};

export default function HowItWorksPage() {
  return (
    <>
      <section className="section" style={{ background: 'var(--gradient-hero)', color: 'white', paddingBottom: 'var(--space-16)' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <span className="section-overline" style={{ color: 'var(--accent-300)' }}>How It Works</span>
          <h1 style={{ color: 'white', marginBottom: 'var(--space-4)' }}>Simple. Exciting. Impactful.</h1>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.125rem', maxWidth: '600px', margin: '0 auto' }}>
            Golf Heroes combines the thrill of golf with the joy of giving. Here&apos;s how it all works.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {/* Step 1 */}
          <div className="flex gap-8 mb-12" style={{ flexWrap: 'wrap', alignItems: 'flex-start' }}>
            <div style={{ flex: '0 0 64px' }}>
              <div className="step-circle" style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 800, color: 'white', marginTop: '4px' }}>1</div>
            </div>
            <div style={{ flex: 1, minWidth: '300px' }}>
              <h2>Choose Your Plan & Charity</h2>
              <p style={{ color: 'var(--text-secondary)', marginTop: 'var(--space-3)', lineHeight: 1.7 }}>
                Sign up and choose between our monthly ($29.99/mo) or yearly ($299.99/yr — save 17%) plan.
                During signup, select a charity you want to support. At least 10% of your subscription goes
                directly to your chosen charity — and you can always increase that percentage.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex gap-8 mb-12" style={{ flexWrap: 'wrap', alignItems: 'flex-start' }}>
            <div style={{ flex: '0 0 64px' }}>
              <div className="step-circle" style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--gradient-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 800, color: 'var(--gray-900)', marginTop: '4px' }}>2</div>
            </div>
            <div style={{ flex: 1, minWidth: '300px' }}>
              <h2>Enter Your Golf Scores</h2>
              <p style={{ color: 'var(--text-secondary)', marginTop: 'var(--space-3)', lineHeight: 1.7 }}>
                After each round, enter your Stableford score (1–45). We keep your latest 5 scores on a rolling basis.
                When you add a 6th score, the oldest is automatically replaced. Your scores are used to generate
                your draw entry numbers.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex gap-8 mb-12" style={{ flexWrap: 'wrap', alignItems: 'flex-start' }}>
            <div style={{ flex: '0 0 64px' }}>
              <div className="step-circle" style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 800, color: 'white', marginTop: '4px' }}>3</div>
            </div>
            <div style={{ flex: 1, minWidth: '300px' }}>
              <h2>Monthly Prize Draws</h2>
              <p style={{ color: 'var(--text-secondary)', marginTop: 'var(--space-3)', lineHeight: 1.7 }}>
                Every month, 5 winning numbers are drawn. Match 3, 4, or 5 numbers to win a share of the
                prize pool. The pool size grows with subscribers: 40% goes to 5-number matches (with jackpot rollover),
                35% for 4-number matches, and 25% for 3-number matches.
              </p>
            </div>
          </div>

          {/* Step 4 */}
          <div className="flex gap-8 mb-12" style={{ flexWrap: 'wrap', alignItems: 'flex-start' }}>
            <div style={{ flex: '0 0 64px' }}>
              <div className="step-circle" style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--gradient-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 800, color: 'var(--gray-900)', marginTop: '4px' }}>4</div>
            </div>
            <div style={{ flex: 1, minWidth: '300px' }}>
              <h2>Win & Verify</h2>
              <p style={{ color: 'var(--text-secondary)', marginTop: 'var(--space-3)', lineHeight: 1.7 }}>
                If you win, upload a screenshot of your golf scores as proof. Our admin team verifies your
                submission and releases your winnings. Simple and transparent.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section" style={{ background: 'var(--bg-secondary)' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h2>Ready to Get Started?</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: 'var(--space-3)', marginBottom: 'var(--space-6)' }}>
            Join Golf Heroes today and start your journey.
          </p>
          <Link href="/auth/signup" className="btn btn-primary btn-lg">
            Subscribe Now
          </Link>
        </div>
      </section>
    </>
  );
}
