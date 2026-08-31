'use client';

import React, { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { createClient, type Session, type User } from '@supabase/supabase-js';

interface AuthContextType { user: User | null; session: Session | null; loading: boolean; configured: boolean; signUp: (email: string, password: string) => Promise<{ user: User | null; error: Error | null }>; signIn: (email: string, password: string) => Promise<{ user: User | null; error: Error | null }>; signOut: () => Promise<void> }
const AuthContext = createContext<AuthContextType | undefined>(undefined);
const globalClient = globalThis as typeof globalThis & { __mediclaimSupabaseClient?: ReturnType<typeof createClient> };
function getSupabaseClient() { const url = process.env.NEXT_PUBLIC_SUPABASE_URL; const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY; if (!url || !key || /dummy|your-|replace/i.test(url) || /dummy|your-|replace/i.test(key)) return null; if (!globalClient.__mediclaimSupabaseClient) globalClient.__mediclaimSupabaseClient = createClient(url, key); return globalClient.__mediclaimSupabaseClient; }
function safeAuthError(error: unknown) { const message = error instanceof Error ? error.message : ''; if (/confirm|not confirmed|email_not_confirmed/i.test(message)) return new Error('Please confirm your email before signing in.'); if (/rate limit|too many requests/i.test(message)) return new Error('Too many attempts. Please try again later.'); if (/invalid|credential|password|email/i.test(message)) return new Error('Invalid email or password.'); return new Error('Authentication failed. Please try again.'); }

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null); const [session, setSession] = useState<Session | null>(null); const [loading, setLoading] = useState(true);
  const supabase = useMemo(() => getSupabaseClient(), []); const configured = Boolean(supabase);
  useEffect(() => { if (!supabase) { setLoading(false); return; } let active = true; void supabase.auth.getSession().then(({ data }) => { if (active) { setSession(data.session); setUser(data.session?.user ?? null); setLoading(false); } }); const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => { setSession(nextSession); setUser(nextSession?.user ?? null); }); return () => { active = false; listener.subscription.unsubscribe(); }; }, [supabase]);
  const signUp = async (email: string, password: string) => { if (!supabase) return { user: null, error: new Error('Authentication is not configured.') }; try { const { data, error } = await supabase.auth.signUp({ email: email.trim().toLowerCase(), password, options: { emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/auth/callback` } }); if (error) throw error; return { user: data.user, error: null }; } catch (error) { return { user: null, error: safeAuthError(error) }; } };
  const signIn = async (email: string, password: string) => { if (!supabase) return { user: null, error: new Error('Authentication is not configured.') }; try { const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password }); if (error) throw error; return { user: data.user, error: null }; } catch (error) { return { user: null, error: safeAuthError(error) }; } };
  const signOut = async () => { if (supabase) await supabase.auth.signOut(); setUser(null); setSession(null); };
  return <AuthContext.Provider value={{ user, session, loading, configured, signUp, signIn, signOut }}>{children}</AuthContext.Provider>;
}
export function useAuth() { const context = useContext(AuthContext); if (!context) throw new Error('useAuth must be used within an AuthProvider'); return context; }
export async function signInWithGoogle() { const supabase = getSupabaseClient(); if (!supabase) throw new Error('Authentication is not configured.'); return supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/auth/callback` } }); }
