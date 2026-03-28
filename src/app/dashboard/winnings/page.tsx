'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/components/Toast';
import { Trophy, Clock, Target, Upload, Eye } from '@/components/Icons';
import type { Winner } from '@/lib/types';

export default function WinningsPage() {
  const { profile, loading: authLoading } = useAuth();
  const { addToast } = useToast();
  const [winners, setWinners] = useState<Winner[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!profile) { setLoading(false); return; }
    fetchWinnings();
  }, [profile, authLoading]);

  const fetchWinnings = async () => {
    try {
      const res = await fetch('/api/winners');
      const data = await res.json();
      setWinners(data.winners || []);
    } catch {
      addToast({ type: 'error', title: 'Error', message: 'Failed to load winnings.' });
    } finally {
      setLoading(false);
    }
  };

  const handleUploadProof = async (winnerId: string) => {
    setUploading(winnerId);
    // For MVP, we use a URL input. In production, use Supabase Storage
    const proofUrl = prompt('Enter the URL of your proof screenshot:');
    if (!proofUrl) {
      setUploading(null);
      return;
    }

    try {
      const res = await fetch('/api/winners', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ winnerId, proof_url: proofUrl }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      addToast({ type: 'success', title: 'Proof Uploaded', message: 'Your proof has been submitted for review.' });
      fetchWinnings();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to upload proof';
      addToast({ type: 'error', title: 'Error', message });
    } finally {
      setUploading(null);
    }
  };

  const totalWon = winners.filter((w) => w.verification_status === 'approved').reduce((sum, w) => sum + Number(w.prize_amount), 0);
  const pendingAmount = winners.filter((w) => w.verification_status === 'pending').reduce((sum, w) => sum + Number(w.prize_amount), 0);

  if (loading) {
    return <div><div className="skeleton skeleton-title" /><div className="skeleton skeleton-card" style={{ height: 200 }} /></div>;
  }

  return (
    <div>
      <div className="page-header">
        <h1>Winnings</h1>
        <p>Track your prizes and upload verification proof</p>
      </div>

      {/* Summary Cards */}
      <div className="admin-stat-grid mb-8">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981' }}><Trophy size={22} /></div>
          <div className="stat-label">Total Won (Verified)</div>
          <div className="stat-value">${totalWon.toFixed(2)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(245,158,11,0.1)', color: '#f59e0b' }}><Clock size={22} /></div>
          <div className="stat-label">Pending Verification</div>
          <div className="stat-value">${pendingAmount.toFixed(2)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(59,130,246,0.1)', color: '#3b82f6' }}><Target size={22} /></div>
          <div className="stat-label">Total Wins</div>
          <div className="stat-value">{winners.length}</div>
        </div>
      </div>

      {/* Winners List */}
      {winners.length === 0 ? (
        <div className="empty-state">
          <Trophy size={40} strokeWidth={1.5} />
          <h3>No Winnings Yet</h3>
          <p>Keep entering your scores and participating in monthly draws. Your winning moment is coming!</p>
        </div>
      ) : (
        <div className="card">
          <h3 className="mb-4">Win History</h3>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Match Type</th>
                  <th>Prize</th>
                  <th>Matched Numbers</th>
                  <th>Verification</th>
                  <th>Payment</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {winners.map((win) => (
                  <tr key={win.id}>
                    <td>
                      <span className="badge badge-premium">{win.match_type}-Number Match</span>
                    </td>
                    <td style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--primary-600)' }}>
                      ${Number(win.prize_amount).toFixed(2)}
                    </td>
                    <td>
                      <div className="score-display" style={{ gap: 'var(--space-1)' }}>
                        {win.matched_numbers.map((n, i) => (
                          <div key={i} className="score-ball gold" style={{ width: 32, height: 32, fontSize: '0.75rem' }}>{n}</div>
                        ))}
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${win.verification_status === 'approved' ? 'badge-success' : win.verification_status === 'rejected' ? 'badge-error' : 'badge-warning'}`}>
                        {win.verification_status}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${win.payment_status === 'paid' ? 'badge-success' : 'badge-neutral'}`}>
                        {win.payment_status}
                      </span>
                    </td>
                    <td>
                      {win.verification_status === 'pending' && !win.proof_url && (
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => handleUploadProof(win.id)}
                          disabled={uploading === win.id}
                        >
                          {uploading === win.id ? 'Uploading...' : 'Upload Proof'}
                        </button>
                      )}
                      {win.proof_url && (
                        <a href={win.proof_url} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm">
                          View Proof
                        </a>
                      )}
                    </td>
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
