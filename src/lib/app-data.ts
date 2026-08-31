'use client';

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { useCallback, useEffect, useState } from 'react';

export type VitalStatus = 'normal' | 'warning' | 'critical';
export interface ProfileData { name: string; email: string; memberId: string; plan: string; phone?: string }
export interface VitalMetricData { id: string; label: string; value: string; unit: string; trend: 'up' | 'down' | 'stable'; trendValue: string; status: VitalStatus; normalRange: string; lastUpdated: string }
export interface VitalsHistoryPoint { date: string; heart: number; bp: number; spo2: number }
export interface ActivityPoint { day: string; steps: number; goal: number }
export interface PrescriptionItem { id: string; name: string; dosage: string; refill: string; status: 'On track' | 'Updated' | 'Completed'; accent: 'positive' | 'info' | 'warning' }
export interface PolicyItem { id: string; name: string; sumInsured: string; cover: string; network: string; renewal: string; status: 'Active' | 'Grace period'; accent: 'text-positive' | 'text-info' | 'text-warning' }
export interface AppData { profile: ProfileData; vitals: VitalMetricData[]; vitalsHistory: VitalsHistoryPoint[]; activity: ActivityPoint[]; prescriptions: PrescriptionItem[]; policies: PolicyItem[] }

export const APP_DATA_KEY = 'mediclaim-app-data';
const emptyData: AppData = { profile: { name: '', email: '', memberId: '', plan: '', phone: '' }, vitals: [], vitalsHistory: [], activity: [], prescriptions: [], policies: [] };
const globalClient = globalThis as typeof globalThis & { __mediclaimAppDataClient?: SupabaseClient };

function getClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key || /dummy|your-|replace/i.test(url) || /dummy|your-|replace/i.test(key)) return null;
  if (!globalClient.__mediclaimAppDataClient) globalClient.__mediclaimAppDataClient = createClient(url, key);
  return globalClient.__mediclaimAppDataClient;
}

function normalize(value?: Partial<AppData> | null): AppData {
  return {
    ...emptyData, ...value,
    profile: { ...emptyData.profile, ...(value?.profile ?? {}) },
    vitals: Array.isArray(value?.vitals) ? value.vitals : [],
    vitalsHistory: Array.isArray(value?.vitalsHistory) ? value.vitalsHistory : [],
    activity: Array.isArray(value?.activity) ? value.activity : [],
    prescriptions: Array.isArray(value?.prescriptions) ? value.prescriptions.map((item, index) => ({ ...item, id: item.id || `prescription-${index}` })) : [],
    policies: Array.isArray(value?.policies) ? value.policies.map((item, index) => ({ ...item, id: item.id || `policy-${index}` })) : [],
  };
}

export function getLocalAppData(): AppData {
  if (typeof window === 'undefined') return emptyData;
  try { const saved = window.localStorage.getItem(APP_DATA_KEY); return saved ? normalize(JSON.parse(saved)) : emptyData; } catch { return emptyData; }
}

export async function loadAppData(): Promise<AppData> {
  const client = getClient();
  if (client) {
    const { data: auth } = await client.auth.getUser();
    if (auth.user) {
      const { data, error } = await client.from('app_data').select('data').eq('user_id', auth.user.id).maybeSingle();
      if (!error && data?.data) { const normalized = normalize(data.data); window.localStorage.setItem(APP_DATA_KEY, JSON.stringify(normalized)); return normalized; }
    }
  }
  return getLocalAppData();
}

export async function saveAppData(data: AppData): Promise<AppData> {
  const normalized = normalize(data);
  if (typeof window !== 'undefined') window.localStorage.setItem(APP_DATA_KEY, JSON.stringify(normalized));
  const client = getClient();
  if (client) {
    const { data: auth } = await client.auth.getUser();
    if (auth.user) { const { error } = await client.from('app_data').upsert({ user_id: auth.user.id, data: normalized, updated_at: new Date().toISOString() }, { onConflict: 'user_id' }); if (error) throw error; }
  }
  return normalized;
}

export function getInitialAppData() { return getLocalAppData(); }
export async function updateAppData(mutator: (current: AppData) => AppData) { return saveAppData(mutator(await loadAppData())); }

export function useAppData() {
  const [data, setDataState] = useState<AppData>(emptyData);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const refresh = useCallback(async () => { setIsLoading(true); setError(null); try { setDataState(await loadAppData()); } catch { setError('Unable to load your data. Your offline copy is still available.'); setDataState(getLocalAppData()); } finally { setIsLoading(false); } }, []);
  useEffect(() => { void refresh(); }, [refresh]);
  const setData = useCallback(async (next: AppData | ((current: AppData) => AppData)) => { const resolved = typeof next === 'function' ? next(data) : next; setDataState(normalize(resolved)); setIsSaving(true); setError(null); try { await saveAppData(resolved); } catch { setError('Could not save changes. Check your connection and try again.'); } finally { setIsSaving(false); } }, [data]);
  return { data, setData, refresh, isLoading, isSaving, error };
}
