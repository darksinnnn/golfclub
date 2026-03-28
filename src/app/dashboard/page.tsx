'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { createClient } from '@/lib/supabase/client';
import { CircleCheck, CircleX, Target, Heart, Trophy, ArrowRight } from '@/components/Icons';
import type { Subscription, Score, UserCharity, Winner } from '@/lib/types';

export default function DashboardPage() {
  const { profile, loading: authLoading } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [scores, setScores] = useState<Score[]>([]);
  const [charity, setCharity] = useState<UserCharity | null>(null);
  const [winnings, setWinnings] = useState<Winner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!profile) {
      setLoading(false);
      return;
    }
    fetchDashboardData();
  }, [profile, authLoading]);

  const fetchDashboardData = async () => {
    if (!profile) { setLoading(false); return; }
    try {
      const supabase = createClient();
      const [subRes, scoresRes, charityRes, winRes] = await Promise.all([
        supabase.from('subscriptions').select('*').eq('user_id', profile.id).eq('status', 'active').order('created_at', { ascending: false }).limit(1).maybeSingle(),
        fetch('/api/scores').then(res => res.json()).catch(() => ({ scores: [] })),
        supabase.from('user_charities').select('*, charity:charity_id(*)').eq('user_id', profile.id).maybeSingle(),
        supabase.from('winners').select('*').eq('user_id', profile.id),
      ]);
      setSubscription(subRes.data);
      setScores(scoresRes.scores || []);
      setCharity(charityRes.data);
      setWinnings(winRes.data || []);
    } catch {
      // Silently fail, show empty state
    } finally {
      setLoading(false);
    }
  };

  const totalWon = winnings.reduce((sum, w) => sum + (w.verification_status === 'approved' ? Number(w.prize_amount) : 0), 0);
  const pendingWins = winnings.filter((w) => w.verification_status === 'pending').length;

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner-lg" />
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>Welcome back, {profile?.full_name || 'Golfer'}!</h1>
        <p>Here&apos;s your Golf Heroes overview</p>
      </div>

      <div className="admin-stat-grid mb-8">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: subscription?.status === 'active' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', color: subscription?.status === 'active' ? '#10b981' : '#ef4444' }}>
            {subscription?.status === 'active' ? <CircleCheck size={22} /> : <CircleX size={22} />}
          </div>
          <div className="stat-label">Subscription</div>
          <div className="stat-value" style={{ fontSize: '1.5rem' }}>
            {subscription ? (
              <span className={`badge ${subscription.status === 'active' ? 'badge-success' : 'badge-error'}`}>
                {subscription.status.toUpperCase()}
              </span>
            ) : (
              <span className="badge badge-neutral">NONE</span>
            )}
          </div>
          {subscription && (
            <div className="stat-meta">
              {subscription.plan_type} • Renews {subscription.end_date ? new Date(subscription.end_date).toLocaleDateString() : 'N/A'}
            </div>
          )}
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981' }}>
            <Target size={22} />
          </div>
          <div className="stat-label">Scores Entered</div>
          <div className="stat-value">{scores.length}/5</div>
          <div style={{ marginTop: 'var(--space-2)' }}>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${(scores.length / 5) * 100}%` }} />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(236,72,153,0.1)', color: '#ec4899' }}>
            <Heart size={22} />
          </div>
          <div className="stat-label">Charity</div>
          <div className="stat-value" style={{ fontSize: '1rem' }}>
            {(charity as unknown as { charity: { name: string } })?.charity?.name || 'Not Selected'}
          </div>
          {charity && (
            <div className="stat-meta">Contributing {charity.contribution_percentage}%</div>
          )}
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(245,158,11,0.1)', color: '#f59e0b' }}>
            <Trophy size={22} />
          </div>
          <div className="stat-label">Total Winnings</div>
          <div className="stat-value">${totalWon.toFixed(2)}</div>
          {pendingWins > 0 && (
            <div className="stat-meta" style={{ color: 'var(--warning)' }}>
              {pendingWins} pending verification
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-2">
        <div className="card">
          <div className="card-header-row">
            <h2>Recent Scores</h2>
            <Link href="/dashboard/scores" className="btn btn-ghost btn-sm">
              View All <ArrowRight size={14} />
            </Link>
          </div>
          {scores.length === 0 ? (
            <div className="empty-state compact">
              <Target size={32} strokeWidth={1.5} />
              <p>No scores yet. Enter your first score!</p>
              <Link href="/dashboard/scores" className="btn btn-primary btn-sm">Add Score</Link>
            </div>
          ) : (
            <div>
              {scores.slice(0, 3).map((score) => (
                <div key={score.id} className="score-entry-row">
                  <div className="score-entry-number">{score.score}</div>
                  <div className="score-entry-details">
                    <div className="score-entry-value">{score.score} pts</div>
                    <div className="score-entry-date">{new Date(score.date_played).toLocaleDateString()}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-header-row">
            <h2>Quick Actions</h2>
          </div>
          <div className="quick-actions-grid">
            <Link href="/dashboard/scores" className="quick-action-card">
              <Target size={20} />
              <span>Enter Score</span>
            </Link>
            <Link href="/dashboard/draws" className="quick-action-card">
              <Trophy size={20} />
              <span>View Draws</span>
            </Link>
            <Link href="/dashboard/charity" className="quick-action-card">
              <Heart size={20} />
              <span>Charity</span>
            </Link>
            {!subscription && (
              <Link href="/dashboard/subscription" className="quick-action-card accent">
                <ArrowRight size={20} />
                <span>Subscribe</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
