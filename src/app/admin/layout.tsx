'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, Dices, Heart, Trophy, BarChart3, Home } from '@/components/Icons';

const adminLinks = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/draws', label: 'Draws', icon: Dices },
  { href: '/admin/charities', label: 'Charities', icon: Heart },
  { href: '/admin/winners', label: 'Winners', icon: Trophy },
  { href: '/admin/reports', label: 'Reports', icon: BarChart3 },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="dashboard-layout">
      <aside className="dashboard-sidebar">
        <div className="sidebar-section">
          <div className="sidebar-label">Admin Panel</div>
          {adminLinks.map((link) => {
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

        <div className="sidebar-section">
          <div className="sidebar-label">Quick Links</div>
          <Link href="/dashboard" className="sidebar-link">
            <Home size={18} className="sidebar-link-icon" />
            User Dashboard
          </Link>
        </div>
      </aside>
      <div className="dashboard-main">
        {children}
      </div>
    </div>
  );
}
