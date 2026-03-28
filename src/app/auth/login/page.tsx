'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/components/Toast';
import { Zap } from '@/components/Icons';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { addToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        addToast({ type: 'error', title: 'Login Failed', message: error.message });
        setLoading(false);
        return;
      }

      addToast({ type: 'success', title: 'Welcome back!', message: 'Login successful.' });
      router.push('/dashboard');
      router.refresh();
    } catch {
      addToast({ type: 'error', title: 'Error', message: 'Something went wrong. Please try again.' });
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: 'calc(100vh - 70px)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-secondary)', padding: 'var(--space-6)' }}>
      <div className="card" style={{ width: '100%', maxWidth: '440px', padding: 'var(--space-8)' }}>
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-8)' }}>
          <div className="navbar-logo" style={{ width: 48, height: 48, margin: '0 auto var(--space-3)', borderRadius: 'var(--radius-xl)' }}><Zap size={22} /></div>
          <h1 style={{ fontSize: '1.75rem', marginBottom: 'var(--space-2)' }}>Welcome Back</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Log in to your Golf Heroes account</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group mb-4">
            <label className="form-label" htmlFor="login-email">Email</label>
            <input
              id="login-email"
              type="email"
              className="form-input"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group mb-6">
            <label className="form-label" htmlFor="login-password">Password</label>
            <input
              id="login-password"
              type="password"
              className="form-input"
              placeholder="Your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading}>
            {loading ? <><span className="spinner" /> Logging in...</> : 'Log In'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 'var(--space-6)', color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
          Don&apos;t have an account?{' '}
          <Link href="/auth/signup" style={{ color: 'var(--primary-600)', fontWeight: 600 }}>Sign up</Link>
        </p>
      </div>
    </div>
  );
}
