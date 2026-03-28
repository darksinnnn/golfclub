'use client';

import React, { useEffect, useState } from 'react';
import { useToast } from '@/components/Toast';
import { Trophy, Check, X, DollarSign } from '@/components/Icons';
import type { Winner } from '@/lib/types';

export default function AdminWinnersPage() {
  const { addToast } = useToast();
  const [winners, setWinners] = useState<Winner[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchWinners();
  }, []);

  const fetchWinners = async () => {
    try {
      const res = await fetch('/api/winners?all=true');
      const data = await res.json();
      setWinners(data.winners || []);
    } catch {
      addToast({ type: 'error', title: 'Error', message: 'Failed to load winners.' });
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (winnerId: string, action: 'approve' | 'reject' | 'mark_paid') => {
    try {
      const res = await fetch('/api/winners', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ winnerId, action }),
      });
      if (!res.ok) throw new Error('Failed');
      addToast({ type: 'success', title: 'Updated', message: `Winner ${action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'marked as paid'}.` });
      fetchWinners();
    } catch {
      addToast({ type: 'error', title: 'Error', message: 'Failed to update winner.' });
    }
  };

  const filtered = winners.filter((w) => {
    if (filter === 'pending') return w.verification_status === 'pending';
    if (filter === 'approved') return w.verification_status === 'approved';
    if (filter === 'unpaid') return w.payment_status === 'pending' && w.verification_status === 'approved';
    return true;
  });

  if (loading) {
    return <div><div className="skeleton skeleton-title" /><div className="skeleton skeleton-card" style={{ height: 400 }} /></div>;
  }

  return (
    <div>
      <div className="page-header-actions">
        <div className="page-header" style={{ marginBottom: 0 }}>
          <h1>Winners Management</h1>
          <p>{winners.length} total winners</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="tabs mt-6">
        {['all', 'pending', 'approved', 'unpaid'].map((f) => (
          <button
            key={f}
            className={`tab ${filter === f ? 'active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
            {f === 'pending' && winners.filter((w) => w.verification_status === 'pending').length > 0 && (
              <span className="notification-badge" style={{ position: 'static', marginLeft: 6 }}>
                {winners.filter((w) => w.verification_status === 'pending').length}
              </span>
            )}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <Trophy size={40} strokeWidth={1.5} />
          <h3>No Winners</h3>
          <p>No winners match the current filter.</p>
        </div>
      ) : (
        <div className="card">
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Winner</th>
                  <th>Match</th>
                  <th>Prize</th>
                  <th>Numbers</th>
                  <th>Verification</th>
                  <th>Proof</th>
                  <th>Payment</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((win) => {
                  const profile = win.profile as unknown as { full_name: string; email: string } | undefined;
                  return (
                    <tr key={win.id}>
                      <td>
                        <div>
                          <div style={{ fontWeight: 600 }}>{(profile as { full_name: string })?.full_name || 'Unknown'}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{(profile as { email: string })?.email}</div>
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-premium">{win.match_type}-Match</span>
                      </td>
                      <td style={{ fontWeight: 700, color: 'var(--primary-600)' }}>
                        ${Number(win.prize_amount).toFixed(2)}
                      </td>
                      <td>
                        <div className="score-display" style={{ gap: 4 }}>
                          {win.matched_numbers.map((n, i) => (
                            <div key={i} className="score-ball gold" style={{ width: 28, height: 28, fontSize: '0.7rem' }}>{n}</div>
                          ))}
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${win.verification_status === 'approved' ? 'badge-success' : win.verification_status === 'rejected' ? 'badge-error' : 'badge-warning'}`}>
                          {win.verification_status}
                        </span>
                      </td>
                      <td>
                        {win.proof_url ? (
                          <a href={win.proof_url} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm">
                            View
                          </a>
                        ) : (
                          <span style={{ color: 'var(--text-tertiary)', fontSize: '0.8125rem' }}>Not uploaded</span>
                        )}
                      </td>
                      <td>
                        <span className={`badge ${win.payment_status === 'paid' ? 'badge-success' : 'badge-neutral'}`}>
                          {win.payment_status}
                        </span>
                      </td>
                      <td>
                        <div className="flex gap-2" style={{ flexWrap: 'wrap' }}>
                          {win.verification_status === 'pending' && (
                            <>
                              <button className="btn btn-primary btn-sm" onClick={() => handleAction(win.id, 'approve')}><Check size={14} /> Approve</button>
                              <button className="btn btn-danger btn-sm" style={{ fontSize: '0.75rem', padding: '4px 8px' }} onClick={() => handleAction(win.id, 'reject')}><X size={14} /> Reject</button>
                            </>
                          )}
                          {win.verification_status === 'approved' && win.payment_status === 'pending' && (
                            <button className="btn btn-accent btn-sm" onClick={() => handleAction(win.id, 'mark_paid')}><DollarSign size={14} /> Mark Paid</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
