import React from 'react';
import AppLayout from '@/components/AppLayout';
import HealthDashboardContent from './components/HealthDashboardContent';

export default function HealthMonitoringDashboardPage() {
  return (
    <AppLayout>
      <HealthDashboardContent />
    </AppLayout>
  );
}