import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const globalAppDataClient = globalThis as typeof globalThis & {
  __mediclaimAppDataSupabaseClient?: SupabaseClient;
};

export type VitalStatus = 'normal' | 'warning' | 'critical';

export interface ProfileData {
  name: string;
  email: string;
  memberId: string;
  plan: string;
  phone?: string;
}

export interface VitalMetricData {
  id: string;
  label: string;
  value: string;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  trendValue: string;
  status: VitalStatus;
  normalRange: string;
  lastUpdated: string;
}

export interface VitalsHistoryPoint {
  date: string;
  heart: number;
  bp: number;
  spo2: number;
}

export interface ActivityPoint {
  day: string;
  steps: number;
  goal: number;
}

export interface PrescriptionItem {
  name: string;
  dosage: string;
  refill: string;
  status: 'On track' | 'Updated' | 'Completed';
  accent: 'positive' | 'info' | 'warning';
}

export interface PolicyItem {
  name: string;
  sumInsured: string;
  cover: string;
  network: string;
  renewal: string;
  status: 'Active' | 'Grace period';
  accent: 'text-positive' | 'text-info' | 'text-warning';
}

export interface AppData {
  profile: ProfileData;
  vitals: VitalMetricData[];
  vitalsHistory: VitalsHistoryPoint[];
  activity: ActivityPoint[];
  prescriptions: PrescriptionItem[];
  policies: PolicyItem[];
}

export const APP_DATA_KEY = 'mediclaim-app-data';

const defaultData: AppData = {
  profile: {
    name: 'Arjun Mehta',
    email: 'arjun.mehta@mediclaim.app',
    memberId: 'MC-2026-1842',
    plan: 'Premium Health Care',
    phone: '+91 98765 43210',
  },
  vitals: [
    {
      id: 'vital-hr',
      label: 'Heart Rate',
      value: '76',
      unit: 'bpm',
      trend: 'stable',
      trendValue: '+2 bpm vs yesterday',
      status: 'normal',
      normalRange: '60–100 bpm',
      lastUpdated: '6 min ago',
    },
    {
      id: 'vital-bp',
      label: 'Blood Pressure',
      value: '128/83',
      unit: 'mmHg',
      trend: 'up',
      trendValue: '+3 vs 7-day avg',
      status: 'warning',
      normalRange: '<120/80 mmHg',
      lastUpdated: '6 min ago',
    },
    {
      id: 'vital-spo2',
      label: 'SpO₂',
      value: '97',
      unit: '%',
      trend: 'stable',
      trendValue: 'Stable 3 days',
      status: 'normal',
      normalRange: '95–100%',
      lastUpdated: '6 min ago',
    },
    {
      id: 'vital-glucose',
      label: 'Blood Glucose',
      value: '112',
      unit: 'mg/dL',
      trend: 'down',
      trendValue: '−8 vs yesterday',
      status: 'warning',
      normalRange: '70–99 mg/dL',
      lastUpdated: '2 hrs ago',
    },
    {
      id: 'vital-bmi',
      label: 'BMI',
      value: '26.4',
      unit: 'kg/m²',
      trend: 'down',
      trendValue: '−0.3 this month',
      status: 'warning',
      normalRange: '18.5–24.9',
      lastUpdated: 'Today',
    },
    {
      id: 'vital-sleep',
      label: 'Sleep Duration',
      value: '6.8',
      unit: 'hrs',
      trend: 'up',
      trendValue: '+0.5 hrs vs last week',
      status: 'normal',
      normalRange: '7–9 hrs/night',
      lastUpdated: 'This morning',
    },
  ],
  vitalsHistory: [
    { date: '05 Aug', heart: 74, bp: 118, spo2: 97 },
    { date: '08 Aug', heart: 76, bp: 121, spo2: 98 },
    { date: '11 Aug', heart: 71, bp: 117, spo2: 99 },
    { date: '14 Aug', heart: 78, bp: 126, spo2: 97 },
    { date: '17 Aug', heart: 73, bp: 120, spo2: 98 },
    { date: '20 Aug', heart: 75, bp: 123, spo2: 98 },
    { date: '23 Aug', heart: 80, bp: 129, spo2: 96 },
    { date: '26 Aug', heart: 77, bp: 124, spo2: 97 },
    { date: '29 Aug', heart: 76, bp: 122, spo2: 98 },
  ],
  activity: [
    { day: 'Mon', steps: 7420, goal: 8000 },
    { day: 'Tue', steps: 9150, goal: 8000 },
    { day: 'Wed', steps: 5830, goal: 8000 },
    { day: 'Thu', steps: 8640, goal: 8000 },
    { day: 'Fri', steps: 6290, goal: 8000 },
    { day: 'Sat', steps: 11200, goal: 8000 },
    { day: 'Sun', steps: 4180, goal: 8000 },
  ],
  prescriptions: [
    {
      name: 'Atorvastatin 20mg',
      dosage: '1 tablet daily',
      refill: 'Refill due in 6 days',
      status: 'On track',
      accent: 'positive',
    },
    {
      name: 'Vitamin D3 60K IU',
      dosage: '1 capsule weekly',
      refill: 'Refill due in 14 days',
      status: 'On track',
      accent: 'positive',
    },
    {
      name: 'Metformin 500mg',
      dosage: '1 tablet twice daily',
      refill: 'Filled 2 days ago',
      status: 'Updated',
      accent: 'info',
    },
    {
      name: 'Cough Syrup',
      dosage: '5 ml after meals',
      refill: 'Completed',
      status: 'Completed',
      accent: 'warning',
    },
  ],
  policies: [
    {
      name: 'MediCare Plus',
      sumInsured: '₹10,00,000',
      cover: '90%',
      network: 'In-network coverage',
      renewal: 'Renews in 18 days',
      status: 'Active',
      accent: 'text-positive',
    },
    {
      name: 'Secure Health Pro',
      sumInsured: '₹7,50,000',
      cover: '85%',
      network: 'Hospitalization benefit',
      renewal: 'Renews in 76 days',
      status: 'Active',
      accent: 'text-info',
    },
    {
      name: 'Family Care Shield',
      sumInsured: '₹5,00,000',
      cover: '78%',
      network: 'Cashless available',
      renewal: 'Renews in 120 days',
      status: 'Grace period',
      accent: 'text-warning',
    },
  ],
};

function isDummySupabaseValue(value?: string) {
  if (!value) return true;
  return /dummy|your-|replace/i.test(value);
}

function getSupabaseClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key || isDummySupabaseValue(url) || isDummySupabaseValue(key)) {
    return null;
  }

  if (!globalAppDataClient.__mediclaimAppDataSupabaseClient) {
    try {
      globalAppDataClient.__mediclaimAppDataSupabaseClient = createClient(url, key);
    } catch {
      return null;
    }
  }

  return globalAppDataClient.__mediclaimAppDataSupabaseClient;
}

function mergeAppData(partial?: Partial<AppData> | null): AppData {
  return {
    ...defaultData,
    ...partial,
    profile: { ...defaultData.profile, ...(partial?.profile ?? {}) },
    vitals: partial?.vitals?.length ? partial.vitals : defaultData.vitals,
    vitalsHistory: partial?.vitalsHistory?.length ? partial.vitalsHistory : defaultData.vitalsHistory,
    activity: partial?.activity?.length ? partial.activity : defaultData.activity,
    prescriptions: partial?.prescriptions?.length ? partial.prescriptions : defaultData.prescriptions,
    policies: partial?.policies?.length ? partial.policies : defaultData.policies,
  };
}

export function getLocalAppData(): AppData {
  if (typeof window === 'undefined') {
    return defaultData;
  }

  const saved = window.localStorage.getItem(APP_DATA_KEY);

  if (!saved) {
    window.localStorage.setItem(APP_DATA_KEY, JSON.stringify(defaultData));
    return defaultData;
  }

  try {
    return mergeAppData(JSON.parse(saved) as Partial<AppData>);
  } catch {
    window.localStorage.setItem(APP_DATA_KEY, JSON.stringify(defaultData));
    return defaultData;
  }
}

export async function loadAppData(): Promise<AppData> {
  const client = getSupabaseClient();

  if (client) {
    try {
      const tables = ['app_data', 'mediclaim_app_data'];

      for (const table of tables) {
        const { data, error } = await client.from(table).select('data').limit(1).maybeSingle();

        if (!error && data?.data) {
          const normalized = mergeAppData(data.data as Partial<AppData>);
          if (typeof window !== 'undefined') {
            window.localStorage.setItem(APP_DATA_KEY, JSON.stringify(normalized));
          }
          return normalized;
        }
      }
    } catch {
      // fall through to local persistence when Supabase is not configured or table is unavailable
    }
  }

  return getLocalAppData();
}

export function saveAppData(data: AppData) {
  if (typeof window === 'undefined') {
    return data;
  }

  window.localStorage.setItem(APP_DATA_KEY, JSON.stringify(data));

  const client = getSupabaseClient();
  if (!client) {
    return data;
  }

  void Promise.resolve(
    client
      .from('app_data')
      .upsert({ id: 'dashboard-data', data }, { onConflict: 'id' })
  ).catch(() => undefined);

  return data;
}

export function getInitialAppData(): AppData {
  return getLocalAppData();
}

export async function updateAppData(mutator: (current: AppData) => AppData) {
  const current = await loadAppData();
  const next = mutator(current);
  return saveAppData(next);
}
