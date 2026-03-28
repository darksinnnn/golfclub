'use client';

import React, { useEffect, useState } from 'react';
import { useToast } from '@/components/Toast';
import type { Charity } from '@/lib/types';

export default function AdminCharitiesPage() {
  const { addToast } = useToast();
  const [charities, setCharities] = useState<Charity[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Charity | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', category: '', website: '', featured: false });

  useEffect(() => {
    fetchCharities();
  }, []);

  const fetchCharities = async () => {
    try {
      const res = await fetch('/api/charities');
      const data = await res.json();
      setCharities(data.charities || []);
    } catch {
      addToast({ type: 'error', title: 'Error', message: 'Failed to load charities.' });
    } finally {
      setLoading(false);
    }
  };

  const openModal = (charity?: Charity) => {
    if (charity) {
      setEditing(charity);
      setForm({ name: charity.name, description: charity.description || '', category: charity.category || '', website: charity.website || '', featured: charity.featured });
    } else {
      setEditing(null);
      setForm({ name: '', description: '', category: '', website: '', featured: false });
    }
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (editing) {
        const res = await fetch('/api/charities', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editing.id, ...form }),
        });
        if (!res.ok) throw new Error('Failed to update');
        addToast({ type: 'success', title: 'Updated', message: 'Charity updated successfully.' });
      } else {
        const res = await fetch('/api/charities', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        if (!res.ok) throw new Error('Failed to create');
        addToast({ type: 'success', title: 'Created', message: 'Charity added successfully.' });
      }

      setShowModal(false);
      fetchCharities();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to save';
      addToast({ type: 'error', title: 'Error', message });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      const res = await fetch(`/api/charities?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      addToast({ type: 'success', title: 'Deleted', message: 'Charity removed successfully.' });
      fetchCharities();
    } catch {
      addToast({ type: 'error', title: 'Error', message: 'Failed to delete charity.' });
    }
  };

  if (loading) {
    return <div><div className="skeleton skeleton-title" />{[1, 2, 3].map((i) => <div key={i} className="skeleton skeleton-card mb-4" />)}</div>;
  }

  return (
    <div>
      <div className="page-header-actions">
        <div className="page-header" style={{ marginBottom: 0 }}>
          <h1>Charity Management</h1>
          <p>{charities.length} charities</p>
        </div>
        <button className="btn btn-primary" onClick={() => openModal()}>+ Add Charity</button>
      </div>

      <div className="mt-6">
        <div className="card">
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Featured</th>
                  <th>Total Raised</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {charities.map((charity) => (
                  <tr key={charity.id}>
                    <td style={{ fontWeight: 600 }}>{charity.name}</td>
                    <td>
                      <span className="badge badge-info">{charity.category || 'General'}</span>
                    </td>
                    <td>
                      {charity.featured ? (
                        <span className="badge badge-premium">★ Featured</span>
                      ) : (
                        <span className="badge badge-neutral">No</span>
                      )}
                    </td>
                    <td style={{ fontWeight: 600, color: 'var(--primary-600)' }}>
                      ${Number(charity.total_raised).toLocaleString()}
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <button className="btn btn-ghost btn-sm" onClick={() => openModal(charity)}>Edit</button>
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => handleDelete(charity.id, charity.name)}
                          style={{ color: 'var(--error)' }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{editing ? 'Edit Charity' : 'Add Charity'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body">
                <div className="form-group mb-4">
                  <label className="form-label">Name</label>
                  <input className="form-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                </div>
                <div className="form-group mb-4">
                  <label className="form-label">Description</label>
                  <textarea className="form-input" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} style={{ resize: 'vertical' }} />
                </div>
                <div className="form-group mb-4">
                  <label className="form-label">Category</label>
                  <input className="form-input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="e.g. Youth Development" />
                </div>
                <div className="form-group mb-4">
                  <label className="form-label">Website URL</label>
                  <input className="form-input" type="url" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} placeholder="https://..." />
                </div>
                <div className="flex items-center gap-3">
                  <label className="toggle-switch">
                    <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} />
                    <span className="toggle-slider" />
                  </label>
                  <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>Featured Charity</span>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : editing ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
