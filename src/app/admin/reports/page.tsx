'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Users, BarChart3, DollarSign, Trophy } from '@/components/Icons';

interface ReportData {
  totalUsers: number;
  activeSubscribers: number;
  totalRevenue: number;
  totalPrizePool: number;
  totalCharityContributions: number;
  totalDraws: number;
  totalWinners: number;
  totalPaidOut: number;
  monthlyData: { month: string; subscribers: number; revenue: number }[];
  topCharities: { name: string; raised: number }[];
  drawStats: { month: string; entries: number; winners: number }[];
}

export default function AdminReportsPage() {
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    const supabase = createClient();

    const [users, subs, allSubs, pools, charities, draws, winners, paidWinners] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('subscriptions').select('*', { count: 'exact', head: true }).eq('status', 'active'),
      supabase.from('subscriptions').select('amount, plan_type, created_at'),
      supabase.from('prize_pool').select('total_pool'),
      supabase.from('charities').select('name, total_raised').order('total_raised', { ascending: false }).limit(5),
      supabase.from('draws').select('month, year, total_entries, status').order('draw_date', { ascending: false }),
      supabase.from('winners').select('*', { count: 'exact', head: true }),
      supabase.from('winners').select('prize_amount').eq('payment_status', 'paid'),
    ]);

    const totalRevenue = allSubs.data?.reduce((sum, s) => sum + Number(s.amount), 0) || 0;
    const totalPool = pools.data?.reduce((sum, p) => sum + Number(p.total_pool), 0) || 0;
    const totalPaid = paidWinners.data?.reduce((sum, w) => sum + Number(w.prize_amount), 0) || 0;
    const totalCharity = charities.data?.reduce((sum, c) => sum + Number(c.total_raised), 0) || 0;

    setData({
      totalUsers: users.count || 0,
      activeSubscribers: subs.count || 0,
      totalRevenue,
      totalPrizePool: totalPool,
      totalCharityContributions: totalCharity,
      totalDraws: draws.data?.length || 0,
      totalWinners: winners.count || 0,
      totalPaidOut: totalPaid,
      monthlyData: [],
      topCharities: charities.data?.map((c) => ({ name: c.name, raised: Number(c.total_raised) })) || [],
      drawStats: draws.data?.map((d) => ({
        month: `${new Date(0, d.month - 1).toLocaleString('en', { month: 'short' })} ${d.year}`,
        entries: d.total_entries,
        winners: 0,
      })) || [],
    });
    setLoading(false);
  };

  if (loading || !data) {
    return <div><div className="skeleton skeleton-title" /><div className="admin-stat-grid mt-6">{[1, 2, 3, 4].map((i) => <div key={i} className="skeleton skeleton-card" style={{ height: 140 }} />)}</div></div>;
  }

  return (
    <div>
      <div className="page-header">
        <h1>Reports &amp; Analytics</h1>
        <p>Platform performance overview and insights</p>
      </div>

      {/* Key Metrics */}
      <div className="admin-stat-grid mb-8">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(59,130,246,0.1)', color: '#3b82f6' }}><Users size={22} /></div>
          <div className="stat-label">Total Users</div>
          <div className="stat-value">{data.totalUsers}</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981' }}><BarChart3 size={22} /></div>
          <div className="stat-label">Active Subscribers</div>
          <div className="stat-value">{data.activeSubscribers}</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(245,158,11,0.1)', color: '#f59e0b' }}><DollarSign size={22} /></div>
          <div className="stat-label">Total Revenue</div>
          <div className="stat-value">${data.totalRevenue.toLocaleString()}</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(124,58,237,0.1)', color: '#7c3aed' }}><Trophy size={22} /></div>
          <div className="stat-label">Total Paid Out</div>
          <div className="stat-value">${data.totalPaidOut.toLocaleString()}</div>
        </div>
      </div>

      <div className="grid grid-2 mb-8">
        {/* Prize Pool Stats */}
        <div className="card">
          <h3 className="mb-4">Prize Pool Summary</h3>
          <div className="grid grid-2 gap-4">
            <div style={{ padding: 'var(--space-4)', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)', textAlign: 'center' }}>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Total Prize Pool</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-500)' }}>
                ${data.totalPrizePool.toLocaleString()}
              </div>
            </div>
            <div style={{ padding: 'var(--space-4)', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)', textAlign: 'center' }}>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Total Winners</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary-600)' }}>
                {data.totalWinners}
              </div>
            </div>
            <div style={{ padding: 'var(--space-4)', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)', textAlign: 'center' }}>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Total Draws</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 800 }}>
                {data.totalDraws}
              </div>
            </div>
            <div style={{ padding: 'var(--space-4)', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)', textAlign: 'center' }}>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Charity Raised</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 800, color: 'var(--success)' }}>
                ${data.totalCharityContributions.toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* Top Charities */}
        <div className="card">
          <h3 className="mb-4">Top Charities by Raised Amount</h3>
          {data.topCharities.length === 0 ? (
            <p style={{ color: 'var(--text-tertiary)' }}>No charity data yet.</p>
          ) : (
            data.topCharities.map((charity, i) => (
              <div key={i} className="flex items-center justify-between mb-3" style={{ padding: 'var(--space-3)', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
                <div className="flex items-center gap-3">
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color: i === 0 ? 'var(--accent-500)' : 'var(--text-tertiary)', fontSize: '1.25rem', width: 30, textAlign: 'center' }}>
                    {i + 1}
                  </span>
                  <span style={{ fontWeight: 500 }}>{charity.name}</span>
                </div>
                <span style={{ fontWeight: 700, color: 'var(--primary-600)' }}>${charity.raised.toLocaleString()}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Draw History */}
      <div className="card">
        <h3 className="mb-4">Draw Statistics</h3>
        {data.drawStats.length === 0 ? (
          <p style={{ color: 'var(--text-tertiary)' }}>No draw data yet.</p>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Entries</th>
                  <th>Pool Contribution</th>
                </tr>
              </thead>
              <tbody>
                {data.drawStats.map((draw, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 600 }}>{draw.month}</td>
                    <td>{draw.entries}</td>
                    <td style={{ color: 'var(--primary-600)', fontWeight: 600 }}>
                      ${(draw.entries * 5).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
