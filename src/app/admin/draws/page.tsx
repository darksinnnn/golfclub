'use client';

import React, { useEffect, useState } from 'react';
import { useToast } from '@/components/Toast';
import { Dices, RefreshCw, Megaphone, Trash2 } from '@/components/Icons';
import type { Draw } from '@/lib/types';

export default function AdminDrawsPage() {
  const { addToast } = useToast();
  const [draws, setDraws] = useState<Draw[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [simulating, setSimulating] = useState<string | null>(null);
  const [logicType, setLogicType] = useState<'random' | 'algorithmic'>('random');
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [results, setResults] = useState<Record<string, { winningNumbers: number[]; fiveMatches: number; fourMatches: number; threeMatches: number }>>({});

  useEffect(() => {
    fetchDraws();
  }, []);

  const fetchDraws = async () => {
    try {
      const res = await fetch('/api/draws');
      const data = await res.json();
      setDraws(data.draws || []);
    } catch {
      addToast({ type: 'error', title: 'Error', message: 'Failed to load draws.' });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDraw = async () => {
    setCreating(true);
    try {
      const res = await fetch('/api/draws', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create', logicType, month: selectedMonth, year: selectedYear }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      addToast({ type: 'success', title: 'Draw Created', message: `Draw for ${new Date(0, selectedMonth - 1).toLocaleString('en', { month: 'long' })} ${selectedYear} has been created.` });
      fetchDraws();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to create draw';
      addToast({ type: 'error', title: 'Error', message });
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (drawId: string) => {
    if (!confirm('Are you absolutely sure you want to permanently delete this draw? This cannot be undone.')) return;

    setSimulating(drawId);
    try {
      const res = await fetch('/api/draws', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', drawId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      addToast({ type: 'success', title: 'Draw Deleted', message: 'The draw has been permanently removed.' });
      fetchDraws();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to delete draw';
      addToast({ type: 'error', title: 'Error', message });
    } finally {
      setSimulating(null);
    }
  };

  const handleSimulate = async (drawId: string) => {
    setSimulating(drawId);
    try {
      const res = await fetch('/api/draws', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'simulate', drawId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setResults((prev) => ({ ...prev, [drawId]: data.results }));
      addToast({ type: 'success', title: 'Simulation Complete', message: `${data.results.totalWinners} winner(s) found.` });
      fetchDraws();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to simulate draw';
      addToast({ type: 'error', title: 'Error', message });
    } finally {
      setSimulating(null);
    }
  };

  const handlePublish = async (drawId: string) => {
    if (!confirm('Are you sure you want to publish this draw? This will notify all winners.')) return;

    setSimulating(drawId);
    try {
      const res = await fetch('/api/draws', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'publish', drawId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setResults((prev) => ({ ...prev, [drawId]: data.results }));
      addToast({ type: 'success', title: 'Draw Published!', message: 'Results are now visible to all users.' });
      fetchDraws();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to publish draw';
      addToast({ type: 'error', title: 'Error', message });
    } finally {
      setSimulating(null);
    }
  };

  if (loading) {
    return <div><div className="skeleton skeleton-title" /><div className="skeleton skeleton-card" style={{ height: 300 }} /></div>;
  }

  return (
    <div>
      <div className="page-header-actions">
        <div className="page-header" style={{ marginBottom: 0 }}>
          <h1>Draw Management</h1>
          <p>Create, simulate, and publish monthly prize draws</p>
        </div>
        <div className="flex items-center gap-3" style={{ flexWrap: 'wrap' }}>
          <select 
            className="form-select" 
            value={selectedMonth} 
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
          >
            {Array.from({length: 12}, (_, i) => i + 1).map(m => (
              <option key={m} value={m}>{new Date(0, m - 1).toLocaleString('en', { month: 'long' })}</option>
            ))}
          </select>
          <select 
            className="form-select" 
            value={selectedYear} 
            onChange={(e) => setSelectedYear(Number(e.target.value))}
          >
            {[2025, 2026, 2027].map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <select
            className="form-select"
            value={logicType}
            onChange={(e) => setLogicType(e.target.value as 'random' | 'algorithmic')}
          >
            <option value="random">Random Draw</option>
            <option value="algorithmic">Algorithmic Draw</option>
          </select>
          <button className="btn btn-primary" onClick={handleCreateDraw} disabled={creating}>
            {creating ? <><span className="spinner" /> Creating...</> : '+ New Draw'}
          </button>
        </div>
      </div>

      <div className="mt-6">
        {draws.length === 0 ? (
          <div className="empty-state">
            <Dices size={40} strokeWidth={1.5} />
            <h3>No Draws Yet</h3>
            <p>Create your first monthly draw to get started.</p>
          </div>
        ) : (
          draws.map((draw) => {
            const drawResults = results[draw.id];
            return (
              <div key={draw.id} className="card mb-4">
                <div className="flex items-center justify-between mb-4" style={{ flexWrap: 'wrap', gap: 'var(--space-3)' }}>
                  <div>
                    <h3 style={{ fontSize: '1.125rem' }}>
                      {new Date(0, draw.month - 1).toLocaleString('en', { month: 'long' })} {draw.year}
                    </h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                      Logic: {draw.logic_type} • {draw.total_entries} entries
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`badge ${draw.status === 'published' ? 'badge-success' : draw.status === 'simulated' ? 'badge-info' : 'badge-warning'}`}>
                      {draw.status}
                    </span>
                    {draw.status === 'pending' && (
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={() => handleSimulate(draw.id)}
                        disabled={simulating === draw.id}
                      >
                        {simulating === draw.id ? 'Simulating...' : '▶ Simulate'}
                      </button>
                    )}
                    {draw.status === 'simulated' && (
                      <div className="flex gap-2">
                        <button
                          className="btn btn-outline btn-sm"
                          onClick={() => handleSimulate(draw.id)}
                          disabled={simulating === draw.id}
                        >
                          <RefreshCw size={14} /> Re-simulate
                        </button>
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => handlePublish(draw.id)}
                          disabled={simulating === draw.id}
                        >
                          <Megaphone size={14} /> Publish
                        </button>
                      </div>
                    )}
                    <button
                      className="btn btn-outline btn-sm"
                      onClick={() => handleDelete(draw.id)}
                      disabled={simulating === draw.id}
                      title="Delete Draw"
                      style={{ borderColor: 'var(--error)', color: 'var(--error)', padding: '0 0.5rem' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Winning Numbers */}
                {draw.winning_numbers && draw.winning_numbers.length > 0 && (
                  <div style={{ padding: 'var(--space-4)', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)' }}>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: 'var(--space-3)', textAlign: 'center' }}>
                      Winning Numbers
                    </p>
                    <div className="draw-numbers mb-4">
                      {draw.winning_numbers.map((num, i) => (
                        <div key={i} className="draw-number">{num}</div>
                      ))}
                    </div>

                    {(drawResults || draw.status !== 'pending') && (
                      <div className="grid grid-3 mt-4" style={{ textAlign: 'center', fontSize: '0.875rem' }}>
                        <div>
                          <div style={{ color: 'var(--text-secondary)' }}>5-Match Winners</div>
                          <div style={{ fontWeight: 700, fontSize: '1.25rem', color: 'var(--accent-500)' }}>
                            {drawResults?.fiveMatches || 0}
                          </div>
                        </div>
                        <div>
                          <div style={{ color: 'var(--text-secondary)' }}>4-Match Winners</div>
                          <div style={{ fontWeight: 700, fontSize: '1.25rem', color: 'var(--primary-500)' }}>
                            {drawResults?.fourMatches || 0}
                          </div>
                        </div>
                        <div>
                          <div style={{ color: 'var(--text-secondary)' }}>3-Match Winners</div>
                          <div style={{ fontWeight: 700, fontSize: '1.25rem', color: 'var(--info)' }}>
                            {drawResults?.threeMatches || 0}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
