'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/components/Toast';
import { Heart, Star, Search } from '@/components/Icons';
import type { Charity, UserCharity } from '@/lib/types';

export default function CharityPage() {
  const { profile, loading: authLoading } = useAuth();
  const { addToast } = useToast();
  const [charities, setCharities] = useState<Charity[]>([]);
  const [userCharity, setUserCharity] = useState<(UserCharity & { charity?: Charity }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [percentage, setPercentage] = useState(10);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (authLoading) return;
    if (!profile) { setLoading(false); return; }
    fetchData();
  }, [profile, authLoading]);

  const fetchData = async () => {
    const supabase = createClient();

    const [charitiesRes, ucRes] = await Promise.all([
      supabase.from('charities').select('*').order('name'),
      supabase.from('user_charities').select('*, charity:charity_id(*)').eq('user_id', profile!.id).maybeSingle(),
    ]);

    setCharities(charitiesRes.data || []);
    if (ucRes.data) {
      setUserCharity(ucRes.data as UserCharity & { charity?: Charity });
      setPercentage(ucRes.data.contribution_percentage);
    }
    setLoading(false);
  };

  const handleSelectCharity = async (charityId: string) => {
    setSaving(true);
    try {
      const supabase = createClient();

      await supabase.from('user_charities').upsert({
        user_id: profile!.id,
        charity_id: charityId,
        contribution_percentage: percentage,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });

      addToast({ type: 'success', title: 'Charity Updated', message: 'Your charity selection has been saved.' });
      fetchData();
    } catch {
      addToast({ type: 'error', title: 'Error', message: 'Failed to update charity selection.' });
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePercentage = async () => {
    if (!userCharity) return;
    if (percentage < 10) {
      addToast({ type: 'error', title: 'Invalid', message: 'Minimum contribution is 10%.' });
      return;
    }

    setSaving(true);
    try {
      const supabase = createClient();
      await supabase
        .from('user_charities')
        .update({ contribution_percentage: percentage, updated_at: new Date().toISOString() })
        .eq('user_id', profile!.id);

      addToast({ type: 'success', title: 'Updated', message: `Contribution set to ${percentage}%.` });
      fetchData();
    } catch {
      addToast({ type: 'error', title: 'Error', message: 'Failed to update percentage.' });
    } finally {
      setSaving(false);
    }
  };

  const filtered = charities.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.description?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return <div><div className="skeleton skeleton-title" /><div className="skeleton skeleton-card" style={{ height: 200 }} /></div>;
  }

  return (
    <div>
      <div className="page-header">
        <h1>My Charity</h1>
        <p>Choose a charity to support. At least 10% of your subscription goes to your chosen cause.</p>
      </div>

      {/* Current Selection */}
      {userCharity?.charity && (
        <div className="card card-highlight mb-6">
          <div className="flex items-center gap-4" style={{ flexWrap: 'wrap' }}>
            <div style={{ width: 64, height: 64, borderRadius: 'var(--radius-xl)', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Heart size={28} color="white" /></div>
            <div style={{ flex: 1 }}>
              <h3>{userCharity.charity.name}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{userCharity.charity.category}</p>
            </div>
            <div>
              <span className="badge badge-success">Selected</span>
            </div>
          </div>

          <div style={{ marginTop: 'var(--space-4)', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--border-color)' }}>
            <div className="flex items-center gap-4" style={{ flexWrap: 'wrap' }}>
              <div className="form-group" style={{ flex: 1, minWidth: '200px' }}>
                <label className="form-label">Contribution Percentage (min 10%)</label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={10}
                    max={50}
                    value={percentage}
                    onChange={(e) => setPercentage(Number(e.target.value))}
                    style={{ flex: 1 }}
                  />
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.5rem', color: 'var(--primary-600)', minWidth: '50px' }}>
                    {percentage}%
                  </span>
                </div>
              </div>
              <button className="btn btn-primary btn-sm" onClick={handleUpdatePercentage} disabled={saving}>
                {saving ? 'Saving...' : 'Update'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Browse Charities */}
      <h2 className="mb-4">{userCharity ? 'Change Charity' : 'Select a Charity'}</h2>

      <div className="search-bar mb-6">
        <Search size={16} className="search-bar-icon" />
        <input
          type="text"
          placeholder="Search charities..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="grid grid-2">
        {filtered.map((charity) => (
          <div
            key={charity.id}
            className={`card ${userCharity?.charity_id === charity.id ? 'card-highlight' : ''}`}
            style={{ cursor: 'pointer' }}
            onClick={() => handleSelectCharity(charity.id)}
          >
            <div className="flex items-center gap-4">
              <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-lg)', background: charity.featured ? 'var(--gradient-accent)' : 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {charity.featured ? <Star size={20} color="#92400e" /> : <Heart size={20} color="white" />}
              </div>
              <div style={{ flex: 1 }}>
                <h4>{charity.name}</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem', marginTop: 2 }}>{charity.category}</p>
              </div>
              {userCharity?.charity_id === charity.id && (
                <span className="badge badge-success">Current</span>
              )}
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: 'var(--space-3)', lineHeight: 1.5 }}>
              {charity.description?.slice(0, 120)}...
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
