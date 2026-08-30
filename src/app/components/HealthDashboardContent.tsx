'use client';

import React, { useEffect, useState } from 'react';
import {
  Heart, Droplets, Wind, Activity, Scale, Moon,
  TrendingUp, TrendingDown, AlertTriangle, RefreshCw,
  ChevronDown, Upload, Calendar,
} from 'lucide-react';
import VitalMetricCard from './VitalMetricCard';
import VitalsTrendChart from './VitalsTrendChart';
import WeeklyActivityChart from './WeeklyActivityChart';
import CoverageRadialChart from './CoverageRadialChart';
import ExerciseRecommendations from './ExerciseRecommendations';
import MedicationTimeline from './MedicationTimeline';
import ClaimStatusStrip from './ClaimStatusStrip';
import { loadAppData, getInitialAppData } from '@/lib/app-data';

const iconMap = {
  'Heart Rate': <Heart size={18} className="text-negative" />,
  'Blood Pressure': <Activity size={18} className="text-warning" />,
  'SpO₂': <Wind size={18} className="text-info" />,
  'Blood Glucose': <Droplets size={18} className="text-warning" />,
  BMI: <Scale size={18} className="text-warning" />,
  'Sleep Duration': <Moon size={18} className="text-accent" />,
};

export default function HealthDashboardContent() {
  const [dateRange, setDateRange] = useState('30d');
  const [appData, setAppData] = useState(getInitialAppData());

  useEffect(() => {
    void (async () => {
      setAppData(await loadAppData());
    })();
  }, []);

  return (
    <div className="px-6 py-6 xl:px-10 2xl:px-16 max-w-screen-2xl mx-auto">
      {/* Page Header */}
      <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Health Monitoring</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Good morning, Arjun — your health score is{' '}
            <span className="font-semibold text-warning">72/100</span> · 2 vitals need attention
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 bg-warning/10 text-warning text-xs font-semibold px-3 py-1.5 rounded-full">
            <AlertTriangle size={12} />
            BP &amp; Glucose elevated
          </div>
          <button className="btn-secondary text-xs">
            <RefreshCw size={13} />
            Sync Devices
          </button>
          <button className="btn-primary text-xs">
            <Upload size={13} />
            Upload Report
          </button>
        </div>
      </div>

      {/* Date Range Selector */}
      <div className="flex items-center gap-2 mb-6">
        <p className="text-xs text-muted-foreground font-medium">View period:</p>
        {['7d', '30d', '90d', '6m'].map((range) => (
          <button
            key={`range-${range}`}
            onClick={() => setDateRange(range)}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all duration-150 ${
              dateRange === range
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-secondary'
            }`}
          >
            {range}
          </button>
        ))}
        <div className="flex items-center gap-1.5 ml-auto text-xs text-muted-foreground">
          <span className="w-1.5 h-1.5 rounded-full bg-positive animate-pulse" />
          Live sync · Updated 06:47 AM
        </div>
      </div>

      {/* Health Score Hero + Coverage */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-4 gap-4 mb-6">
        {/* Health Score — spans 2 cols */}
        <div className="card p-5 xl:col-span-2 gradient-primary text-white relative overflow-hidden">
          <div className="blob-teal absolute -right-8 -top-8 w-32 h-32 opacity-30" />
          <div className="relative z-10">
            <p className="text-xs font-semibold uppercase tracking-widest text-white/70 mb-1">
              AI Health Score
            </p>
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-5xl font-bold tabular-nums">72</span>
              <span className="text-xl font-medium text-white/70">/ 100</span>
            </div>
            <p className="text-sm text-white/80 mb-4">
              Moderate — BP and glucose are borderline elevated. Follow today&apos;s exercise plan.
            </p>
            <div className="w-full bg-white/20 rounded-full h-2 mb-3">
              <div className="bg-white rounded-full h-2 transition-all duration-500" style={{ width: '72%' }} />
            </div>
            <div className="flex items-center gap-4 text-xs text-white/70">
              <span className="flex items-center gap-1"><TrendingDown size={11} /> Down 3pts from last week</span>
              <span className="flex items-center gap-1"><Calendar size={11} /> Next checkup: 05 Sep</span>
            </div>
          </div>
        </div>

        {/* Steps Today */}
        <div className="card p-5 gradient-card-info">
          <p className="section-label mb-1">Steps Today</p>
          <div className="flex items-baseline gap-1.5 mb-2">
            <span className="metric-value tabular-nums">4,180</span>
            <span className="text-sm text-muted-foreground">steps</span>
          </div>
          <div className="w-full bg-muted rounded-full h-1.5 mb-1">
            <div className="bg-info rounded-full h-1.5" style={{ width: '52%' }} />
          </div>
          <p className="text-xs text-muted-foreground">52% of 8,000 goal · 3,820 remaining</p>
          <p className="text-xs text-info font-medium mt-2 flex items-center gap-1">
            <TrendingDown size={11} /> Below target — take a 20min walk
          </p>
        </div>

        {/* Coverage Utilization */}
        <div className="card p-5">
          <p className="section-label mb-1">Policy Coverage</p>
          <CoverageRadialChart />
          <div className="flex items-center justify-between mt-1">
            <div>
              <p className="text-xs text-muted-foreground">Used</p>
              <p className="text-sm font-bold tabular-nums text-foreground">₹3,10,000</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Remaining</p>
              <p className="text-sm font-bold tabular-nums text-positive">₹1,90,000</p>
            </div>
          </div>
        </div>
      </div>

      {/* Vitals Grid — 6 cards in 3×2 */}
      <div className="mb-6">
        <h2 className="text-base font-semibold text-foreground mb-3">Current Vitals</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-6 gap-3">
          {appData.vitals.map((vital) => (
            <VitalMetricCard
              key={vital.id}
              {...vital}
              icon={iconMap[vital.label as keyof typeof iconMap] ?? <Activity size={18} className="text-primary" />}
            />
          ))}
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-5 2xl:grid-cols-5 gap-4 mb-6">
        {/* Vitals Trend — 3 cols */}
        <div className="card p-5 xl:col-span-3">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold text-foreground">Vitals Trend</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Heart rate, BP, SpO₂ — last 30 days</p>
            </div>
            <button className="btn-ghost text-xs flex items-center gap-1">
              Aug 2026 <ChevronDown size={12} />
            </button>
          </div>
          <VitalsTrendChart data={appData.vitalsHistory} />
        </div>

        {/* Weekly Activity — 2 cols */}
        <div className="card p-5 xl:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold text-foreground">Weekly Steps</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Goal: 8,000/day</p>
            </div>
            <span className="badge-muted text-xs">This Week</span>
          </div>
          <WeeklyActivityChart data={appData.activity} />
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-border text-xs text-muted-foreground">
            <span>Weekly avg: <span className="font-semibold text-foreground tabular-nums">7,530</span> steps</span>
            <span className="text-positive font-semibold flex items-center gap-1">
              <TrendingUp size={11} /> 3 of 7 goals met
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Section: Exercise + Medication + Claims */}
      <div className="grid grid-cols-1 xl:grid-cols-3 2xl:grid-cols-3 gap-4">
        <ExerciseRecommendations />
        <MedicationTimeline />
        <ClaimStatusStrip />
      </div>
    </div>
  );
}