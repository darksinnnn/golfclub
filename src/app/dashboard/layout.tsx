'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { LayoutDashboard, Target, CreditCard, Heart, Dices, Trophy, Settings } from '@/components/Icons';

const sidebarLinks = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/scores', label: 'My Scores', icon: Target },
  { href: '/dashboard/subscription', label: 'Subscription', icon: CreditCard },
  { href: '/dashboard/charity', label: 'My Charity', icon: Heart },
  { href: '/dashboard/draws', label: 'Draws', icon: Dices },
  { href: '/dashboard/winnings', label: 'Winnings', icon: Trophy },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { profile } = useAuth();

  return (
    <div className="dashboard-layout">
      <aside className="dashboard-sidebar">
        <div className="sidebar-section">
          <div className="sidebar-label">Dashboard</div>
          {sidebarLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`sidebar-link ${pathname === link.href ? 'active' : ''}`}
              >
                <Icon size={18} className="sidebar-link-icon" />
                {link.label}
              </Link>
            );
          })}
        </div>

        {profile?.role === 'admin' && (
          <div className="sidebar-section">
            <div className="sidebar-label">Admin</div>
            <Link href="/admin" className="sidebar-link">
              <Settings size={18} className="sidebar-link-icon" />
              Admin Panel
            </Link>
          </div>
        )}
      </aside>

      <div className="dashboard-main">
        {children}
      </div>
    </div>
  );
}
