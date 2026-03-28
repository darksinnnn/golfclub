'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/components/Toast';
import { Target, Trash2, Plus } from '@/components/Icons';
import type { Score } from '@/lib/types';

export default function ScoresPage() {
  const { profile, loading: authLoading } = useAuth();
  const { addToast } = useToast();
  const [scores, setScores] = useState<Score[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [newScore, setNewScore] = useState('');
  const [datePlayed, setDatePlayed] = useState(new Date().toISOString().split('T')[0]);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!profile) { setLoading(false); return; }
    fetchScores();
  }, [profile, authLoading]);

  const fetchScores = async () => {
    try {
      const res = await fetch('/api/scores');
      const data = await res.json();
      if (res.ok) {
        setScores(data.scores || []);
      }
    } catch (err) {
      console.error('Failed to fetch scores:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddScore = async (e: React.FormEvent) => {
    e.preventDefault();
    const scoreVal = parseInt(newScore);

    if (isNaN(scoreVal) || scoreVal < 1 || scoreVal > 45) {
      addToast({ type: 'error', title: 'Invalid Score', message: 'Score must be between 1 and 45 (Stableford format).' });
      return;
    }

    setAdding(true);
    try {
      const res = await fetch('/api/scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ score: scoreVal, date_played: datePlayed }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      addToast({ type: 'success', title: 'Score Added!', message: `Score of ${scoreVal} recorded.` });
      setNewScore('');
      setShowForm(false);
      fetchScores();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to add score';
      addToast({ type: 'error', title: 'Error', message });
    } finally {
      setAdding(false);
    }
  };

  const handleDeleteScore = async (scoreId: string) => {
    if (!confirm('Remove this score?')) return;

    try {
      const res = await fetch(`/api/scores?id=${scoreId}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      addToast({ type: 'success', title: 'Score Removed', message: 'Score has been deleted.' });
      fetchScores();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to delete score';
      addToast({ type: 'error', title: 'Error', message });
    }
  };

  if (loading) {
    return (
      <div>
        <div className="skeleton skeleton-title" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="skeleton" style={{ height: 70, marginBottom: 12 }} />
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="page-header-actions">
        <div className="page-header" style={{ marginBottom: 0 }}>
          <h1>My Scores</h1>
          <p>Your latest 5 Stableford scores (1–45). New scores replace the oldest.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : <><Plus size={16} /> Add Score</>}
        </button>
      </div>

      {/* Score counter */}
      <div className="flex items-center gap-4 mb-6 mt-6">
        <div className="progress-bar" style={{ flex: 1 }}>
          <div className="progress-fill" style={{ width: `${(scores.length / 5) * 100}%` }} />
        </div>
        <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
          {scores.length}/5 scores
        </span>
      </div>

      {/* Add Score Form */}
      {showForm && (
        <div className="card mb-6" style={{ animation: 'slideDown 0.3s ease' }}>
          <h3 style={{ marginBottom: 'var(--space-4)' }}>Enter New Score</h3>
          <form onSubmit={handleAddScore}>
            <div className="flex gap-4" style={{ flexWrap: 'wrap' }}>
              <div className="form-group" style={{ flex: 1, minWidth: '150px' }}>
                <label className="form-label" htmlFor="score-input">Stableford Score (1-45)</label>
                <input
                  id="score-input"
                  type="number"
                  className="form-input"
                  placeholder="Enter score..."
                  min={1}
                  max={45}
                  value={newScore}
                  onChange={(e) => setNewScore(e.target.value)}
                  required
                />
              </div>
              <div className="form-group" style={{ flex: 1, minWidth: '150px' }}>
                <label className="form-label" htmlFor="date-input">Date Played</label>
                <input
                  id="date-input"
                  type="date"
                  className="form-input"
                  value={datePlayed}
                  onChange={(e) => setDatePlayed(e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
              <div className="form-group" style={{ justifyContent: 'flex-end' }}>
                <button type="submit" className="btn btn-primary" disabled={adding}>
                  {adding ? <><span className="spinner" /> Saving...</> : 'Save Score'}
                </button>
              </div>
            </div>
            {scores.length >= 5 && (
              <p style={{ marginTop: 'var(--space-3)', fontSize: '0.8125rem', color: 'var(--warning)' }}>
                ⚠ You have 5 scores. Adding a new one will replace the oldest score.
              </p>
            )}
          </form>
        </div>
      )}

      {/* Draw Numbers Display */}
      {scores.length > 0 && (
        <div className="card mb-6" style={{ textAlign: 'center' }}>
          <h3 style={{ marginBottom: 'var(--space-4)' }}>Your Draw Numbers</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-4)', fontSize: '0.875rem' }}>
            These scores are your entry numbers for the monthly draw
          </p>
          <div className="draw-numbers">
            {scores.map((score, i) => (
              <div key={score.id} className="draw-number" style={{ animationDelay: `${i * 0.1}s` }}>
                {score.score}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Scores List */}
      {scores.length === 0 ? (
        <div className="empty-state">
          <Target size={40} strokeWidth={1.5} />
          <h3>No Scores Yet</h3>
          <p>Enter your first Stableford score to get started with draws!</p>
          <button className="btn btn-primary mt-4" onClick={() => setShowForm(true)}>
            Add Your First Score
          </button>
        </div>
      ) : (
        <div>
          <h3 className="mb-4">Score History</h3>
          {scores.map((score, index) => (
            <div key={score.id} className="score-entry-row" style={{ animation: `fadeInUp 0.3s ease ${index * 0.05}s backwards` }}>
              <div className="score-entry-number">{score.score}</div>
              <div className="score-entry-details" style={{ flex: 1 }}>
                <div className="score-entry-value">{score.score} points</div>
                <div className="score-entry-date">
                  Played on {new Date(score.date_played).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <span className="badge badge-info">#{index + 1}</span>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => handleDeleteScore(score.id)}
                  title="Remove score"
                  style={{ color: 'var(--error)' }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
