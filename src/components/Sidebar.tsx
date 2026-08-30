'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import AppLogo from '@/components/ui/AppLogo';
import {
  LayoutDashboard,
  Heart,
  Hospital,
  FileText,
  ShieldCheck,
  Activity,
  Settings,
  ChevronLeft,
  ChevronRight,
  Bell,
  LogOut,
  User,
  ClipboardList,
  Stethoscope,
  Calculator,
  Send,
} from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: number;
  section?: string;
}

const navItems: NavItem[] = [
  {
    id: 'nav-overview',
    label: 'Overview',
    href: '/',
    icon: <LayoutDashboard size={18} />,
    section: 'main',
  },
  {
    id: 'nav-health',
    label: 'Health Monitoring',
    href: '/health-monitoring-dashboard',
    icon: <Heart size={18} />,
    section: 'main',
  },
  {
    id: 'nav-hospitals',
    label: 'Hospital Finder',
    href: '/smart-hospital-recommendation',
    icon: <Hospital size={18} />,
    section: 'main',
  },
  {
    id: 'nav-documents',
    label: 'My Documents',
    href: '/medical-documents',
    icon: <FileText size={18} />,
    badge: 2,
    section: 'main',
  },
  {
    id: 'nav-claims',
    label: 'Claims',
    href: '/claims',
    icon: <ClipboardList size={18} />,
    badge: 1,
    section: 'main',
  },
  {
    id: 'nav-claims-workflow',
    label: 'Submit a Claim',
    href: '/claims-workflow',
    icon: <Send size={18} />,
    section: 'main',
  },
  {
    id: 'nav-coverage-calc',
    label: 'Coverage Calculator',
    href: '/coverage-calculator',
    icon: <Calculator size={18} />,
    section: 'insurance',
  },
  {
    id: 'nav-coverage',
    label: 'Coverage',
    href: '/coverage',
    icon: <ShieldCheck size={18} />,
    section: 'insurance',
  },
  {
    id: 'nav-vitals',
    label: 'Vitals History',
    href: '/vitals',
    icon: <Activity size={18} />,
    section: 'insurance',
  },
  {
    id: 'nav-prescriptions',
    label: 'Prescriptions',
    href: '/prescriptions',
    icon: <Stethoscope size={18} />,
    section: 'insurance',
  },
  {
    id: 'nav-settings',
    label: 'Settings',
    href: '/settings',
    icon: <Settings size={18} />,
    section: 'account',
  },
];

const sections = [
  { id: 'main', label: 'Patient Portal' },
  { id: 'insurance', label: 'Health & Insurance' },
  { id: 'account', label: 'Account' },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <aside
      className={`sidebar-transition flex-shrink-0 h-screen bg-card border-r border-border flex flex-col overflow-hidden ${
        collapsed ? 'w-16' : 'w-60'
      }`}
    >
      {/* Logo */}
      <div className="flex items-center h-16 px-3 border-b border-border flex-shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <AppLogo size={32} />
          {!collapsed && (
            <span className="font-bold text-base text-foreground tracking-tight truncate">
              MediClaim
            </span>
          )}
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto scrollbar-thin py-3 px-2">
        {sections.map((section) => {
          const items = navItems.filter((n) => n.section === section.id);
          return (
            <div key={`section-${section.id}`} className="mb-4">
              {!collapsed && (
                <p className="section-label px-3 mb-1.5">{section.label}</p>
              )}
              {items.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    title={collapsed ? item.label : undefined}
                    className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl mb-0.5 transition-all duration-150 ${
                      isActive
                        ? 'bg-primary/10 text-primary font-semibold' :'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    <span className="flex-shrink-0">{item.icon}</span>
                    {!collapsed && (
                      <span className="text-sm truncate flex-1">{item.label}</span>
                    )}
                    {!collapsed && item.badge !== undefined && item.badge > 0 && (
                      <span className="ml-auto flex-shrink-0 w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center tabular-nums">
                        {item.badge}
                      </span>
                    )}
                    {collapsed && item.badge !== undefined && item.badge > 0 && (
                      <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-primary" />
                    )}
                    {/* Tooltip for collapsed */}
                    {collapsed && (
                      <div className="pointer-events-none absolute left-full ml-3 z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-150 whitespace-nowrap bg-foreground text-primary-foreground text-xs font-medium px-2.5 py-1.5 rounded-lg shadow-elevated">
                        {item.label}
                        <span className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-foreground" />
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          );
        })}
      </nav>

      {/* User + Collapse */}
      <div className="border-t border-border p-2 flex-shrink-0">
        {!collapsed && (
          <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-muted transition-colors cursor-pointer mb-1">
            <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center flex-shrink-0">
              <User size={14} className="text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-foreground truncate">Arjun Mehta</p>
              <p className="text-xs text-muted-foreground truncate">Patient</p>
            </div>
            <button className="btn-ghost p-1 rounded-lg">
              <Bell size={14} />
            </button>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="btn-ghost w-full justify-center rounded-xl"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={16} /> : (
            <span className="flex items-center gap-2 text-xs font-medium">
              <ChevronLeft size={16} /> Collapse
            </span>
          )}
        </button>
        {!collapsed && (
          <button className="btn-ghost w-full justify-start mt-1 text-negative hover:bg-negative/10 hover:text-negative rounded-xl">
            <LogOut size={14} />
            <span className="text-xs font-medium">Sign Out</span>
          </button>
        )}
      </div>
    </aside>
  );
}