import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Target, Dices, Heart, Award, ArrowRight, Zap, Shield, Users } from '@/components/Icons';

export default async function HomePage() {
  let charityCount = 0;
  try {
    const supabase = await createClient();
    const { count } = await supabase.from('charities').select('*', { count: 'exact', head: true });
    charityCount = count || 10;
  } catch {
    charityCount = 10;
  }

  return (
    <>
      {/* HERO SECTION */}
      <section className="hero-section">
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ maxWidth: 720, margin: '0 auto' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', background: 'rgba(255,255,255,0.1)', borderRadius: 'var(--radius-full)', fontSize: '0.8125rem', fontWeight: 500, color: 'rgba(255,255,255,0.8)', marginBottom: 'var(--space-6)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <Zap size={14} /> The Modern Golf Community Platform
            </div>
            <h1>
              Play Golf.<br />
              <span style={{ color: 'var(--accent-400)' }}>Win Prizes.</span><br />
              Give Back.
            </h1>
            <p style={{ fontSize: '1.125rem', color: 'rgba(255,255,255,0.65)', maxWidth: 560, margin: '0 auto var(--space-8)', lineHeight: 1.7 }}>
              Join a community where every swing counts. Track your Stableford scores,
              compete in monthly prize draws, and make a real impact through
              charitable giving.
            </p>
            <div style={{ display: 'flex', gap: 'var(--space-4)', justifyContent: 'center', flexWrap: 'wrap', marginBottom: 'var(--space-12)' }}>
              <Link href="/auth/signup" className="btn btn-accent" style={{ padding: '12px 28px', fontSize: '0.9375rem' }}>
                Start Your Journey <ArrowRight size={16} />
              </Link>
              <Link href="/how-it-works" className="btn" style={{ padding: '12px 28px', fontSize: '0.9375rem', background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)' }}>
                Learn More
              </Link>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-6)', maxWidth: 480, margin: '0 auto' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 800, color: 'white', letterSpacing: '-0.03em' }}>$50K+</div>
                <div style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.5)' }}>Prize Money</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 800, color: 'white', letterSpacing: '-0.03em' }}>{charityCount}+</div>
                <div style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.5)' }}>Charities</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 800, color: 'white', letterSpacing: '-0.03em' }}>1,200+</div>
                <div style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.5)' }}>Members</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="section">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 'var(--space-12)' }}>
            <p style={{ fontSize: '0.8125rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--primary-500)', marginBottom: 'var(--space-3)' }}>How It Works</p>
            <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', marginBottom: 'var(--space-3)' }}>Four Simple Steps</h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: 480, margin: '0 auto' }}>
              Join, play, and win — while making a real difference to charities you care about.
            </p>
          </div>

          <div className="feature-grid">
            <div className="feature-card">
              <div className="feature-card-icon"><CreditCardIcon size={24} /></div>
              <h3>Subscribe</h3>
              <p>Choose monthly ($29.99) or yearly ($299.99). A portion goes directly to your chosen charity.</p>
            </div>
            <div className="feature-card">
              <div className="feature-card-icon"><Target size={24} /></div>
              <h3>Enter Scores</h3>
              <p>Log your Stableford golf scores. Keep your best 5 — they become your draw numbers.</p>
            </div>
            <div className="feature-card">
              <div className="feature-card-icon"><Dices size={24} /></div>
              <h3>Monthly Draws</h3>
              <p>Every month, winning numbers are drawn. Match 3, 4, or 5 to win from the prize pool.</p>
            </div>
          </div>
        </div>
      </section>

      {/* PRIZE POOL */}
      <section className="section" style={{ background: 'var(--bg-secondary)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 'var(--space-12)' }}>
            <p style={{ fontSize: '0.8125rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--accent-500)', marginBottom: 'var(--space-3)' }}>Prize Pool</p>
            <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', marginBottom: 'var(--space-3)' }}>Real Prizes, Real Winners</h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: 480, margin: '0 auto' }}>
              Our prize pool grows with every subscriber. Three tiers of winning — plus jackpot rollover!
            </p>
          </div>

          <div className="grid grid-3">
            <div className="card" style={{ textAlign: 'center', padding: '2.5rem 1.5rem' }}>
              <div className="feature-card-icon" style={{ background: 'rgba(245,158,11,0.1)', color: '#f59e0b', margin: '0 auto var(--space-4)' }}><Award size={24} /></div>
              <h3>5-Number Match</h3>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', fontWeight: 800, color: 'var(--accent-500)', margin: '0.5rem 0', letterSpacing: '-0.03em' }}>40%</div>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', fontSize: '0.875rem' }}>of the prize pool</p>
              <span className="badge badge-premium">Jackpot Rollover</span>
            </div>
            <div className="card" style={{ textAlign: 'center', padding: '2.5rem 1.5rem' }}>
              <div className="feature-card-icon" style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981', margin: '0 auto var(--space-4)' }}><Shield size={24} /></div>
              <h3>4-Number Match</h3>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', fontWeight: 800, color: 'var(--primary-500)', margin: '0.5rem 0', letterSpacing: '-0.03em' }}>35%</div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>of the prize pool</p>
            </div>
            <div className="card" style={{ textAlign: 'center', padding: '2.5rem 1.5rem' }}>
              <div className="feature-card-icon" style={{ background: 'rgba(59,130,246,0.1)', color: '#3b82f6', margin: '0 auto var(--space-4)' }}><Users size={24} /></div>
              <h3>3-Number Match</h3>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', fontWeight: 800, color: 'var(--info)', margin: '0.5rem 0', letterSpacing: '-0.03em' }}>25%</div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>of the prize pool</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="hero-section" style={{ padding: 'var(--space-16) 0' }}>
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <h2 style={{ color: 'white', marginBottom: 'var(--space-4)', fontSize: 'clamp(1.5rem, 3vw, 2rem)' }}>Ready to Make Every Round Count?</h2>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '1.0625rem', maxWidth: 480, margin: '0 auto var(--space-8)' }}>
            Join thousands of golfers who play with purpose. Subscribe today.
          </p>
          <Link href="/auth/signup" className="btn btn-accent" style={{ padding: '12px 28px', fontSize: '0.9375rem' }}>
            Subscribe Now — From $29.99/mo
          </Link>
        </div>
      </section>
    </>
  );
}

// Inline icon to avoid using emoji for CreditCard
function CreditCardIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="14" x="2" y="5" rx="2"/>
      <line x1="2" x2="22" y1="10" y2="10"/>
    </svg>
  );
}
