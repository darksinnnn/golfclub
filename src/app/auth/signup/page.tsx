'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/components/Toast';
import { Zap } from '@/components/Icons';
import type { Charity } from '@/lib/types';

export default function SignupPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [charityId, setCharityId] = useState('');
  const [charities, setCharities] = useState<Charity[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { addToast } = useToast();

  useEffect(() => {
    const fetchCharities = async () => {
      try {
        const res = await fetch('/api/charities');
        const data = await res.json();
        setCharities(data.charities || []);
      } catch {
        // Silent fail
      }
    };
    fetchCharities();
  }, []);

  const searchParams = useSearchParams();
  const plan = searchParams.get('plan');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      addToast({ type: 'error', title: 'Invalid Password', message: 'Password must be at least 6 characters.' });
      return;
    }
    setLoading(true);

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) {
        addToast({ type: 'error', title: 'Signup Failed', message: error.message });
        setLoading(false);
        return;
      }

      // If charity selected, save the user-charity link
      if (data.user && charityId) {
        await supabase.from('user_charities').upsert({
          user_id: data.user.id,
          charity_id: charityId,
          contribution_percentage: 10,
        });
      }

      addToast({ type: 'success', title: 'Account Created!', message: 'Welcome to Golf Heroes!' });
      
      if (plan) {
        router.push(`/dashboard/subscription?plan=${plan}`);
      } else {
        router.push('/dashboard');
      }
      
      router.refresh();
    } catch {
      addToast({ type: 'error', title: 'Error', message: 'Something went wrong. Please try again.' });
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: 'calc(100vh - 70px)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-secondary)', padding: 'var(--space-6)' }}>
      <div className="card" style={{ width: '100%', maxWidth: '480px', padding: 'var(--space-8)' }}>
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-8)' }}>
          <div className="navbar-logo" style={{ width: 48, height: 48, margin: '0 auto var(--space-3)', borderRadius: 'var(--radius-xl)' }}><Zap size={22} /></div>
          <h1 style={{ fontSize: '1.75rem', marginBottom: 'var(--space-2)' }}>Join Golf Heroes</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Create your account and start your journey</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group mb-4">
            <label className="form-label" htmlFor="signup-name">Full Name</label>
            <input
              id="signup-name"
              type="text"
              className="form-input"
              placeholder="John Doe"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>

          <div className="form-group mb-4">
            <label className="form-label" htmlFor="signup-email">Email</label>
            <input
              id="signup-email"
              type="email"
              className="form-input"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group mb-4">
            <label className="form-label" htmlFor="signup-password">Password</label>
            <input
              id="signup-password"
              type="password"
              className="form-input"
              placeholder="Min 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          <div className="form-group mb-6">
            <label className="form-label" htmlFor="signup-charity">Choose a Charity to Support</label>
            <select
              id="signup-charity"
              className="form-select w-full"
              value={charityId}
              onChange={(e) => setCharityId(e.target.value)}
            >
              <option value="">Select a charity (optional at signup)</option>
              {charities.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <small style={{ color: 'var(--text-tertiary)', fontSize: '0.8125rem' }}>
              At least 10% of your subscription goes to your chosen charity.
            </small>
          </div>

          <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading}>
            {loading ? <><span className="spinner" /> Creating Account...</> : 'Create Account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 'var(--space-6)', color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
          Already have an account?{' '}
          <Link href="/auth/login" style={{ color: 'var(--primary-600)', fontWeight: 600 }}>Log in</Link>
        </p>
      </div>
    </div>
  );
}
