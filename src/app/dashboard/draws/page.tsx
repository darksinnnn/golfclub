'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { createClient } from '@/lib/supabase/client';
import { Dices } from '@/components/Icons';
import type { Draw, DrawEntry } from '@/lib/types';

export default function DrawsPage() {
  const { profile, loading: authLoading } = useAuth();
  const [draws, setDraws] = useState<Draw[]>([]);
  const [myEntries, setMyEntries] = useState<DrawEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!profile) { setLoading(false); return; }
    fetchData();
  }, [profile, authLoading]);

  const fetchData = async () => {
    const supabase = createClient();

    const [drawsRes, entriesRes] = await Promise.all([
      supabase.from('draws').select('*, prize_pool(*)').order('draw_date', { ascending: false }),
      supabase.from('draw_entries').select('*').eq('user_id', profile!.id),
    ]);

    setDraws(drawsRes.data || []);
    setMyEntries(entriesRes.data || []);
    setLoading(false);
  };

  const getMyEntry = (drawId: string) => myEntries.find((e) => e.draw_id === drawId);

  if (loading) {
    return <div><div className="skeleton skeleton-title" />{[1, 2, 3].map((i) => <div key={i} className="skeleton skeleton-card mb-4" />)}</div>;
  }

  const publishedDraws = draws.filter((d) => d.status === 'published');
  const upcomingDraws = draws.filter((d) => d.status === 'pending' || d.status === 'simulated');

  return (
    <div>
      <div className="page-header">
        <h1>Draws</h1>
        <p>Your monthly prize draw entries and results</p>
      </div>

      {/* Upcoming Draws */}
      {upcomingDraws.length > 0 && (
        <div className="mb-8">
          <h2 className="mb-4">Upcoming Draws</h2>
          {upcomingDraws.map((draw) => {
            const entry = getMyEntry(draw.id);
            return (
              <div key={draw.id} className="card mb-4">
                <div className="flex items-center justify-between" style={{ flexWrap: 'wrap', gap: 'var(--space-3)' }}>
                  <div>
                    <h3 style={{ fontSize: '1.125rem' }}>
                      {new Date(0, draw.month - 1).toLocaleString('en', { month: 'long' })} {draw.year} Draw
                    </h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                      Draw Date: {new Date(draw.draw_date).toLocaleDateString()} • {draw.total_entries} entries
                    </p>
                  </div>
                  <div>
                    <span className={`badge ${draw.status === 'pending' ? 'badge-warning' : 'badge-info'}`}>
                      {draw.status}
                    </span>
                  </div>
                </div>
                {entry && (
                  <div style={{ marginTop: 'var(--space-4)', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--border-color)' }}>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: 'var(--space-3)' }}>Your Numbers:</p>
                    <div className="score-display">
                      {entry.numbers.map((num, i) => (
                        <div key={i} className="score-ball">{num}</div>
                      ))}
                    </div>
                  </div>
                )}
                {!entry && (
                  <div style={{ marginTop: 'var(--space-4)', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--border-color)', color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>
                    You need an active subscription and at least one score to be entered into draws.
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Published Draws */}
      <h2 className="mb-4">Past Results</h2>
      {publishedDraws.length === 0 ? (
        <div className="empty-state">
          <Dices size={40} strokeWidth={1.5} />
          <h3>No Results Yet</h3>
          <p>Draw results will appear here after each monthly draw is published.</p>
        </div>
      ) : (
        publishedDraws.map((draw) => {
          const entry = getMyEntry(draw.id);
          const matchedNums = entry ? entry.numbers.filter((n) => draw.winning_numbers.includes(n)) : [];
          const pool = Array.isArray((draw as unknown as { prize_pool: unknown[] }).prize_pool) ? (draw as unknown as { prize_pool: Record<string, number>[] }).prize_pool[0] : (draw as unknown as { prize_pool: Record<string, number> }).prize_pool;

          return (
            <div key={draw.id} className="card mb-4">
              <div className="flex items-center justify-between mb-4" style={{ flexWrap: 'wrap', gap: 'var(--space-3)' }}>
                <h3>
                  {new Date(0, draw.month - 1).toLocaleString('en', { month: 'long' })} {draw.year}
                </h3>
                <span className="badge badge-success">Published</span>
              </div>

              {/* Winning Numbers */}
              <div style={{ textAlign: 'center', marginBottom: 'var(--space-4)' }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: 'var(--space-3)' }}>Winning Numbers</p>
                <div className="draw-numbers">
                  {draw.winning_numbers.map((num, i) => (
                    <div key={i} className={`draw-number ${matchedNums.includes(num) ? 'matched' : ''}`}>
                      {num}
                    </div>
                  ))}
                </div>
              </div>

              {/* Your Entry */}
              {entry && (
                <div style={{ padding: 'var(--space-4)', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)', marginTop: 'var(--space-4)' }}>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: 'var(--space-3)' }}>Your Numbers:</p>
                  <div className="score-display mb-4">
                    {entry.numbers.map((num, i) => (
                      <div key={i} className={`score-ball ${matchedNums.includes(num) ? 'gold' : ''}`}>
                        {num}
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-3">
                    <span style={{ fontWeight: 600 }}>
                      {matchedNums.length >= 3 ? '★' : ''} {matchedNums.length} match{matchedNums.length !== 1 ? 'es' : ''}
                    </span>
                    {matchedNums.length >= 3 && (
                      <span className="badge badge-premium">Winner!</span>
                    )}
                  </div>
                </div>
              )}

              {/* Prize Pool Info */}
              {pool && (
                <div className="grid grid-3 mt-4" style={{ fontSize: '0.8125rem', textAlign: 'center' }}>
                  <div>
                    <div style={{ color: 'var(--text-secondary)' }}>Total Pool</div>
                    <div style={{ fontWeight: 700, color: 'var(--primary-600)' }}>${Number(pool.total_pool || 0).toLocaleString()}</div>
                  </div>
                  <div>
                    <div style={{ color: 'var(--text-secondary)' }}>Entries</div>
                    <div style={{ fontWeight: 700 }}>{draw.total_entries}</div>
                  </div>
                  <div>
                    <div style={{ color: 'var(--text-secondary)' }}>Draw Type</div>
                    <div style={{ fontWeight: 700, textTransform: 'capitalize' }}>{draw.logic_type}</div>
                  </div>
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
