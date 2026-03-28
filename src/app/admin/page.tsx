'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { Users, CircleCheck, DollarSign, Heart, Dices, Trophy } from '@/components/Icons';

interface Stats {
  totalUsers: number;
  activeSubscribers: number;
  totalCharities: number;
  totalDraws: number;
  totalPrizePool: number;
  totalCharityRaised: number;
  pendingVerifications: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    activeSubscribers: 0,
    totalCharities: 0,
    totalDraws: 0,
    totalPrizePool: 0,
    totalCharityRaised: 0,
    pendingVerifications: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/stats', { cache: 'no-store' });
      const data = await res.json();
      if (res.ok && data.stats) {
        setStats(data.stats);
      }
    } catch (err) {
      console.error('Failed to load admin stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div>
        <div className="skeleton skeleton-title" />
        <div className="admin-stat-grid mt-6">
          {[1, 2, 3, 4].map((i) => <div key={i} className="skeleton skeleton-card" style={{ height: 140 }} />)}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h1>Admin Dashboard</h1>
        <p>Overview of the Golf Heroes platform</p>
      </div>

      <div className="admin-stat-grid mb-8">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(59,130,246,0.1)', color: '#3b82f6' }}><Users size={22} /></div>
          <div className="stat-label">Total Users</div>
          <div className="stat-value">{stats.totalUsers}</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981' }}><CircleCheck size={22} /></div>
          <div className="stat-label">Active Subscribers</div>
          <div className="stat-value">{stats.activeSubscribers}</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(245,158,11,0.1)', color: '#f59e0b' }}><DollarSign size={22} /></div>
          <div className="stat-label">Total Prize Pool</div>
          <div className="stat-value">${stats.totalPrizePool.toLocaleString()}</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(236,72,153,0.1)', color: '#ec4899' }}><Heart size={22} /></div>
          <div className="stat-label">Charity Contributions</div>
          <div className="stat-value">${stats.totalCharityRaised.toLocaleString()}</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-3 mb-8">
        <Link href="/admin/draws" className="card" style={{ textAlign: 'center', cursor: 'pointer' }}>
          <div className="feature-card-icon" style={{ margin: '0 auto var(--space-3)' }}><Dices size={24} /></div>
          <h3>Draw Management</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            {stats.totalDraws} draws • Configure, simulate, and publish
          </p>
        </Link>
        <Link href="/admin/winners" className="card" style={{ textAlign: 'center', cursor: 'pointer' }}>
          <div className="feature-card-icon" style={{ background: 'rgba(245,158,11,0.1)', color: '#f59e0b', margin: '0 auto var(--space-3)' }}><Trophy size={24} /></div>
          <h3>Winner Verification</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            {stats.pendingVerifications} pending verifications
          </p>
          {stats.pendingVerifications > 0 && (
            <span className="badge badge-warning mt-2">Action Required</span>
          )}
        </Link>
        <Link href="/admin/charities" className="card" style={{ textAlign: 'center', cursor: 'pointer' }}>
          <div className="feature-card-icon" style={{ background: 'rgba(236,72,153,0.1)', color: '#ec4899', margin: '0 auto var(--space-3)' }}><Heart size={24} /></div>
          <h3>Charities</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            {stats.totalCharities} charities • Add, edit, manage
          </p>
        </Link>
      </div>

      {/* Platform Health */}
      <div className="card">
        <h2 style={{ fontSize: '1.25rem', marginBottom: 'var(--space-4)' }}>Platform Summary</h2>
        <div className="grid grid-2">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Subscriber Growth</span>
              <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{stats.activeSubscribers} active</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${Math.min(stats.activeSubscribers * 10, 100)}%` }} />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Prize Pool</span>
              <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>${stats.totalPrizePool.toLocaleString()}</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill gold" style={{ width: `${Math.min(stats.totalPrizePool / 100, 100)}%` }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
