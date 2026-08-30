'use client';

import React from 'react';
import {
  Bell,
  Camera,
  ChevronRight,
  CreditCard,
  KeyRound,
  Lock,
  MoonStar,
  ShieldCheck,
  Smartphone,
  UserCircle2,
  Volume2,
} from 'lucide-react';

const profile = {
  name: 'Arjun Mehta',
  email: 'arjun.mehta@mediclaim.app',
  memberId: 'MC-2026-1842',
  plan: 'Premium Health Care',
};

const settingsSections = [
  {
    title: 'Profile',
    items: [
      { label: 'Personal details', value: 'Edit profile', icon: <UserCircle2 size={16} /> },
      { label: 'Profile photo', value: 'Update', icon: <Camera size={16} /> },
      { label: 'Password', value: 'Change', icon: <KeyRound size={16} /> },
    ],
  },
  {
    title: 'Preferences',
    items: [
      { label: 'Notifications', value: 'Enabled', icon: <Bell size={16} /> },
      { label: 'Theme', value: 'Light mode', icon: <MoonStar size={16} /> },
      { label: 'Sound alerts', value: 'On', icon: <Volume2 size={16} /> },
    ],
  },
  {
    title: 'Security',
    items: [
      { label: 'Privacy', value: 'Managed', icon: <Lock size={16} /> },
      { label: 'Two-factor auth', value: 'Enabled', icon: <ShieldCheck size={16} /> },
      { label: 'Connected devices', value: '3 active', icon: <Smartphone size={16} /> },
    ],
  },
  {
    title: 'Billing',
    items: [
      { label: 'Payment method', value: 'Visa •••• 4812', icon: <CreditCard size={16} /> },
      { label: 'Invoice history', value: 'View', icon: <CreditCard size={16} /> },
    ],
  },
];

export default function SettingsContent() {
  return (
    <div className="px-6 py-6 xl:px-10 2xl:px-16 max-w-screen-2xl mx-auto">
      <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
        <div>
          <p className="section-label mb-2">Account</p>
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        </div>
        <button className="btn-primary">Save changes</button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_0.8fr] gap-4 mb-6">
        <div className="card p-5">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center text-white font-bold text-lg">
              AM
            </div>
            <div>
              <p className="text-xl font-bold text-foreground">{profile.name}</p>
              <p className="text-sm text-muted-foreground">{profile.email}</p>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <span className="badge badge-positive">{profile.plan}</span>
                <span className="badge-muted">ID: {profile.memberId}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="card p-5">
          <p className="section-label mb-3">Quick status</p>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Profile completeness</span>
              <span className="font-semibold text-foreground">92%</span>
            </div>
            <div className="h-2 rounded-full bg-muted">
              <div className="h-2 rounded-full bg-primary" style={{ width: '92%' }} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">ID verification</span>
              <span className="text-positive font-semibold">Verified</span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {settingsSections.map((section) => (
          <div key={section.title} className="card p-5">
            <h2 className="text-base font-semibold text-foreground mb-4">{section.title}</h2>
            <div className="space-y-3">
              {section.items.map((item) => (
                <button
                  key={item.label}
                  className="w-full flex items-center justify-between gap-3 rounded-xl border border-border bg-muted/20 px-3 py-3 text-left transition-colors hover:bg-muted/40"
                  type="button"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-card border border-border flex items-center justify-center text-muted-foreground">
                      {item.icon}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.value}</p>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-muted-foreground" />
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
