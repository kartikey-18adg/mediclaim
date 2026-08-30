'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { createClient } from '@supabase/supabase-js';
import type { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  configured: boolean;
  signUp: (email: string, password: string) => Promise<{ user: User | null; error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ user: User | null; error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const DEMO_SESSION_KEY = 'mediclaim-demo-session';
const globalSupabaseClient = globalThis as typeof globalThis & {
  __mediclaimSupabaseClient?: ReturnType<typeof createClient>;
};

function getSupabaseClient(url?: string, key?: string) {
  if (!url || !key || isDummySupabaseValue(url) || isDummySupabaseValue(key)) {
    return null;
  }

  if (!globalSupabaseClient.__mediclaimSupabaseClient) {
    globalSupabaseClient.__mediclaimSupabaseClient = createClient(url, key);
  }

  return globalSupabaseClient.__mediclaimSupabaseClient;
}

const demoUsers: Record<string, { email: string; password: string; role: string; name: string }> = {
  'arjun.mehta@mediclaim.in': {
    email: 'arjun.mehta@mediclaim.in',
    password: 'Patient@2026',
    role: 'patient',
    name: 'Arjun Mehta',
  },
  'admin@apollomumbai.mediclaim.in': {
    email: 'admin@apollomumbai.mediclaim.in',
    password: 'HospAdmin@2026',
    role: 'hospital',
    name: 'Apollo Mumbai Admin',
  },
  'analyst@starhealth.mediclaim.in': {
    email: 'analyst@starhealth.mediclaim.in',
    password: 'Insurer@2026',
    role: 'insurer',
    name: 'Star Health Analyst',
  },
};

function isDummySupabaseValue(value?: string) {
  if (!value) return true;
  return /dummy|your-|replace/i.test(value);
}

function createDemoUser(email: string) {
  const profile = demoUsers[email.toLowerCase()];
  if (!profile) return null;

  return {
    id: `demo-${profile.role}-${Date.now()}`,
    email: profile.email,
    app_metadata: { provider: 'demo', role: profile.role },
    user_metadata: { full_name: profile.name, role: profile.role },
    aud: 'authenticated',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  } as User;
}

function readDemoSession(): { user: User; session: Session } | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw = window.localStorage.getItem(DEMO_SESSION_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as { user?: User; session?: Session };
    if (!parsed.user || !parsed.session) return null;

    return { user: parsed.user, session: parsed.session };
  } catch {
    return null;
  }
}

function writeDemoSession(user: User, session: Session) {
  if (typeof window === 'undefined') return;

  window.localStorage.setItem(
    DEMO_SESSION_KEY,
    JSON.stringify({ user, session }),
  );
}

function clearDemoSession() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(DEMO_SESSION_KEY);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const supabase = React.useMemo(() => getSupabaseClient(supabaseUrl, supabaseKey), [supabaseUrl, supabaseKey]);

  const configured = Boolean(supabase);

  useEffect(() => {
    const demoSession = readDemoSession();
    if (!supabase) {
      if (demoSession) {
        setSession(demoSession.session);
        setUser(demoSession.user);
      }
      setLoading(false);
      return;
    }

    // Check for existing session on mount
    const checkSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (data.session) {
          setSession(data.session);
          setUser(data.session.user);
        } else if (demoSession) {
          setSession(demoSession.session);
          setUser(demoSession.user);
        }
      } catch (error) {
        console.error('Session check failed:', error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [supabase]);

  const signUp = async (email: string, password: string) => {
    const normalizedEmail = email.trim().toLowerCase();
    const directMatch = demoUsers[normalizedEmail];

    if (directMatch && directMatch.password === password) {
      const demoUser = createDemoUser(normalizedEmail);
      if (demoUser) {
        const demoSession = {
          access_token: 'demo-access-token',
          refresh_token: 'demo-refresh-token',
          expires_in: 3600,
          expires_at: Math.floor(Date.now() / 1000) + 3600,
          token_type: 'bearer',
          user: demoUser,
        } as Session;

        setUser(demoUser);
        setSession(demoSession);
        writeDemoSession(demoUser, demoSession);
        return { user: demoUser, error: null };
      }
    }

    if (!supabase) {
      return { user: null, error: new Error('Supabase not configured') };
    }

    try {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      return { user: data.user, error: null };
    } catch (error) {
      return { user: null, error: error instanceof Error ? error : new Error('Sign up failed') };
    }
  };

  const signIn = async (email: string, password: string) => {
    const normalizedEmail = email.trim().toLowerCase();
    const demoUserConfig = demoUsers[normalizedEmail];

    if (demoUserConfig && demoUserConfig.password === password) {
      const demoUser = createDemoUser(normalizedEmail);
      if (demoUser) {
        const demoSession = {
          access_token: 'demo-access-token',
          refresh_token: 'demo-refresh-token',
          expires_in: 3600,
          expires_at: Math.floor(Date.now() / 1000) + 3600,
          token_type: 'bearer',
          user: demoUser,
        } as Session;

        setUser(demoUser);
        setSession(demoSession);
        writeDemoSession(demoUser, demoSession);
        return { user: demoUser, error: null };
      }
    }

    if (!supabase) {
      return { user: null, error: new Error('Supabase not configured') };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      return { user: data.user, error: null };
    } catch (error) {
      return { user: null, error: error instanceof Error ? error : new Error('Sign in failed') };
    }
  };

  const signOut = async () => {
    clearDemoSession();

    if (!supabase) {
      setUser(null);
      setSession(null);
      return;
    }

    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      setSession(null);
    } catch (error) {
      console.error('Sign out failed:', error);
      setUser(null);
      setSession(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, configured, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export async function signInWithGoogle() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const supabase = getSupabaseClient(supabaseUrl, supabaseKey);

  if (!supabase) {
    throw new Error('Supabase not configured');
  }

  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${typeof window !== 'undefined' ? window.location.origin : ''}`,
      },
    });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error : new Error('Google sign in failed') };
  }
}
