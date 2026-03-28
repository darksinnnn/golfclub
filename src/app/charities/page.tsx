'use client';

import { useEffect, useState } from 'react';
import { Heart, Star, Search } from '@/components/Icons';
import type { Charity } from '@/lib/types';

export default function CharitiesPage() {
  const [charities, setCharities] = useState<Charity[]>([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCharities();
  }, []);

  const fetchCharities = async () => {
    try {
      const res = await fetch('/api/charities');
      const data = await res.json();
      setCharities(data.charities || []);
    } catch {
      // silent fail
    } finally {
      setLoading(false);
    }
  };

  const categories: string[] = ['all', ...new Set(charities.map((c) => c.category).filter((c): c is string => Boolean(c)))];

  const filtered = charities.filter((c) => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.description?.toLowerCase().includes(search.toLowerCase());
    const matchCategory = category === 'all' || c.category === category;
    return matchSearch && matchCategory;
  });

  return (
    <>
      <section className="hero-section" style={{ paddingBottom: 'var(--space-12)' }}>
        <div className="container" style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <p style={{ fontSize: '0.8125rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--accent-400)', marginBottom: 'var(--space-3)' }}>Charity Directory</p>
          <h1 style={{ color: 'white', marginBottom: 'var(--space-4)' }}>Causes That Matter</h1>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '1.0625rem', maxWidth: '560px', margin: '0 auto' }}>
            Browse our partner charities. When you subscribe, at least 10% of your fee supports the charity you choose.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {/* Filters */}
          <div className="flex gap-4 mb-8" style={{ flexWrap: 'wrap', alignItems: 'center' }}>
            <div className="search-bar" style={{ flex: 1, minWidth: '250px' }}>
              <Search size={16} className="search-bar-icon" />
              <input
                type="text"
                placeholder="Search charities..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select
              className="form-select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={{ minWidth: '180px' }}
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === 'all' ? 'All Categories' : cat}
                </option>
              ))}
            </select>
          </div>

          {/* Charity Grid */}
          {loading ? (
            <div className="grid grid-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="skeleton-card skeleton" style={{ height: 280 }} />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <Heart size={40} strokeWidth={1.5} />
              <h3>No Charities Found</h3>
              <p>Try adjusting your search or filter criteria.</p>
            </div>
          ) : (
            <div className="grid grid-3">
              {filtered.map((charity) => (
                <div key={charity.id} className="charity-card">
                  <div className="charity-card-image">
                    {charity.featured ? <Star size={40} strokeWidth={1.5} color="var(--accent-500)" /> : <Heart size={40} strokeWidth={1.5} color="var(--primary-500)" />}
                    {charity.featured && (
                      <div className="charity-card-featured">
                        <span className="badge badge-premium">Featured</span>
                      </div>
                    )}
                  </div>
                  <div className="charity-card-body">
                    {charity.category && (
                      <div className="charity-card-category">{charity.category}</div>
                    )}
                    <h3 className="charity-card-name">{charity.name}</h3>
                    <p className="charity-card-description">{charity.description}</p>
                    <div className="charity-card-raised">
                      <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Total Raised</span>
                      <span className="charity-raised-amount">${Number(charity.total_raised).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
