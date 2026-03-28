'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/components/Toast';
import { Search } from '@/components/Icons';
import type { Profile, Subscription } from '@/lib/types';

interface UserWithSub extends Profile {
  subscriptions?: Subscription[];
}

export default function AdminUsersPage() {
  const { addToast } = useToast();
  const [users, setUsers] = useState<UserWithSub[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<UserWithSub | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from('profiles')
      .select('*, subscriptions(*)')
      .order('created_at', { ascending: false });

    setUsers(data || []);
    setLoading(false);
  };

  const handleUpdateRole = async (userId: string, newRole: string) => {
    const supabase = createClient();
    const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', userId);
    if (error) {
      addToast({ type: 'error', title: 'Error', message: 'Failed to update user role.' });
    } else {
      addToast({ type: 'success', title: 'Updated', message: `User role changed to ${newRole}.` });
      fetchUsers();
    }
  };

  const filteredUsers = users.filter((u) =>
    u.full_name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const getActiveSub = (user: UserWithSub) => {
    return user.subscriptions?.find((s) => s.status === 'active');
  };

  if (loading) {
    return <div><div className="skeleton skeleton-title" /><div className="skeleton skeleton-card" style={{ height: 400 }} /></div>;
  }

  return (
    <div>
      <div className="page-header-actions">
        <div className="page-header" style={{ marginBottom: 0 }}>
          <h1>User Management</h1>
          <p>{users.length} total users</p>
        </div>
      </div>

      <div className="search-bar mb-6 mt-6">
        <Search size={16} className="search-bar-icon" />
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Role</th>
                <th>Subscription</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => {
                const activeSub = getActiveSub(user);
                return (
                  <tr key={user.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="navbar-avatar" style={{ width: 32, height: 32, fontSize: '0.75rem' }}>
                          {user.full_name?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <span style={{ fontWeight: 600 }}>{user.full_name || 'Unknown'}</span>
                      </div>
                    </td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`badge ${user.role === 'admin' ? 'badge-premium' : 'badge-neutral'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td>
                      {activeSub ? (
                        <span className="badge badge-success">
                          {activeSub.plan_type} • Active
                        </span>
                      ) : (
                        <span className="badge badge-neutral">None</span>
                      )}
                    </td>
                    <td style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => setEditingUser(user)}
                        >
                          View
                        </button>
                        {user.role !== 'admin' ? (
                          <button
                            className="btn btn-ghost btn-sm"
                            onClick={() => handleUpdateRole(user.id, 'admin')}
                            style={{ color: 'var(--primary-600)' }}
                          >
                            Make Admin
                          </button>
                        ) : (
                          <button
                            className="btn btn-ghost btn-sm"
                            onClick={() => handleUpdateRole(user.id, 'user')}
                            style={{ color: 'var(--warning)' }}
                          >
                            Remove Admin
                          </button>
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

      {/* User Detail Modal */}
      {editingUser && (
        <div className="modal-overlay" onClick={() => setEditingUser(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">User Details</h3>
              <button className="modal-close" onClick={() => setEditingUser(null)}>×</button>
            </div>
            <div className="modal-body">
              <div className="flex items-center gap-4 mb-6">
                <div className="navbar-avatar" style={{ width: 56, height: 56, fontSize: '1.5rem' }}>
                  {editingUser.full_name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div>
                  <h3>{editingUser.full_name}</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{editingUser.email}</p>
                </div>
              </div>
              <div className="grid grid-2 gap-4" style={{ fontSize: '0.875rem' }}>
                <div>
                  <span style={{ color: 'var(--text-secondary)' }}>Role</span>
                  <p style={{ fontWeight: 600 }}>{editingUser.role}</p>
                </div>
                <div>
                  <span style={{ color: 'var(--text-secondary)' }}>Country</span>
                  <p style={{ fontWeight: 600 }}>{editingUser.country || 'N/A'}</p>
                </div>
                <div>
                  <span style={{ color: 'var(--text-secondary)' }}>Joined</span>
                  <p style={{ fontWeight: 600 }}>{new Date(editingUser.created_at).toLocaleDateString()}</p>
                </div>
                <div>
                  <span style={{ color: 'var(--text-secondary)' }}>Subscription</span>
                  <p style={{ fontWeight: 600 }}>
                    {getActiveSub(editingUser) ? `${getActiveSub(editingUser)!.plan_type} (Active)` : 'None'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
