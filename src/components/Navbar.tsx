'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Shield, LogOut, User, ChevronRight, LayoutDashboard, Zap } from '@/components/Icons';

export function Navbar() {
  const { user, profile, signOut, loading } = useAuth();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const isDashboard = pathname?.startsWith('/dashboard') || pathname?.startsWith('/admin');

  return (
    <header className="navbar" data-scrolled="">
      <div className="navbar-inner container">
        <Link href="/" className="navbar-brand">
          <div className="navbar-logo">
            <Zap size={20} />
          </div>
          <span className="navbar-brand-text">Golf Heroes</span>
        </Link>

        {!isDashboard && (
          <nav className="navbar-nav">
            <Link href="/how-it-works" className={`navbar-link ${pathname === '/how-it-works' ? 'active' : ''}`}>
              How It Works
            </Link>
            <Link href="/charities" className={`navbar-link ${pathname === '/charities' ? 'active' : ''}`}>
              Charities
            </Link>
            <Link href="/pricing" className={`navbar-link ${pathname === '/pricing' ? 'active' : ''}`}>
              Pricing
            </Link>
          </nav>
        )}

        <div className="navbar-actions">
          {loading ? (
            <div className="navbar-skeleton" />
          ) : user ? (
            <div className="navbar-user" onClick={() => setUserMenuOpen(!userMenuOpen)}>
              <div className="navbar-avatar">
                {profile?.full_name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <span className="navbar-username">{profile?.full_name || 'User'}</span>
              <ChevronRight size={14} style={{ transform: userMenuOpen ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />

              {userMenuOpen && (
                <div className="navbar-dropdown">
                  <Link href="/dashboard" className="navbar-dropdown-item" onClick={() => setUserMenuOpen(false)}>
                    <LayoutDashboard size={16} />
                    Dashboard
                  </Link>
                  {profile?.role === 'admin' && (
                    <Link href="/admin" className="navbar-dropdown-item" onClick={() => setUserMenuOpen(false)}>
                      <Shield size={16} />
                      Admin Panel
                    </Link>
                  )}
                  <Link href="/dashboard/scores" className="navbar-dropdown-item" onClick={() => setUserMenuOpen(false)}>
                    <User size={16} />
                    My Profile
                  </Link>
                  <div className="navbar-dropdown-divider" />
                  <button className="navbar-dropdown-item danger" onClick={() => { signOut(); setUserMenuOpen(false); }}>
                    <LogOut size={16} />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="navbar-auth">
              <Link href="/auth/login" className="btn btn-ghost btn-sm">Log In</Link>
              <Link href="/auth/signup" className="btn btn-primary btn-sm">Get Started</Link>
            </div>
          )}

          <button
            className="navbar-hamburger"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <span className={`hamburger-line ${menuOpen ? 'open' : ''}`} />
            <span className={`hamburger-line ${menuOpen ? 'open' : ''}`} />
            <span className={`hamburger-line ${menuOpen ? 'open' : ''}`} />
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="navbar-mobile-menu">
          <Link href="/how-it-works" onClick={() => setMenuOpen(false)}>How It Works</Link>
          <Link href="/charities" onClick={() => setMenuOpen(false)}>Charities</Link>
          <Link href="/pricing" onClick={() => setMenuOpen(false)}>Pricing</Link>
          {!user && (
            <>
              <Link href="/auth/login" onClick={() => setMenuOpen(false)}>Log In</Link>
              <Link href="/auth/signup" onClick={() => setMenuOpen(false)} className="btn btn-primary btn-block">Get Started</Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}
