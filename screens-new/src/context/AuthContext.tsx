import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { Profile, HouseholdWithMembers } from '@/types';

// ─── Types ────────────────────────────────────────────────────────────────────

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  household: HouseholdWithMembers | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (
    email: string,
    password: string,
    name: string
  ) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  refreshHousehold: () => Promise<void>;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [household, setHousehold] = useState<HouseholdWithMembers | null>(null);
  const [loading, setLoading] = useState(true);

  // ── Bootstrap: listen for auth state changes ────────────────────────────────
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Subscribe to future changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchProfile(session.user.id);
        } else {
          setProfile(null);
          setHousehold(null);
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // ── Fetch profile + household ────────────────────────────────────────────────
  async function fetchProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error || !data) {
        setProfile(null);
        setHousehold(null);
        return;
      }

      setProfile(data);

      if (data.household_id) {
        await fetchHousehold(data.household_id);
      }
    } finally {
      setLoading(false);
    }
  }

  async function fetchHousehold(householdId: string) {
    const { data: hh } = await supabase
      .from('households')
      .select('*')
      .eq('id', householdId)
      .single();

    if (!hh) return;

    // Fetch all members with their dietary prefs
    const { data: members } = await supabase
      .from('profiles')
      .select('*, dietary_preferences(preference)')
      .eq('household_id', householdId);

    setHousehold({
      ...hh,
      members: (members ?? []).map((m: any) => ({
        ...m,
        dietary_preferences: (m.dietary_preferences ?? []).map(
          (d: { preference: string }) => d.preference
        ),
      })),
    });
  }

  // ── Auth actions ─────────────────────────────────────────────────────────────

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  }

  async function signUp(email: string, password: string, name: string) {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) return { error: error.message };

    // Create profile row (trigger handles this in prod, but we do it manually as fallback)
    if (data.user) {
      await supabase.from('profiles').upsert({
        id: data.user.id,
        name,
        avatar_url: null,
        household_id: null,
      });
    }

    return { error: null };
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  async function refreshProfile() {
    if (user) await fetchProfile(user.id);
  }

  async function refreshHousehold() {
    if (profile?.household_id) await fetchHousehold(profile.household_id);
  }

  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        profile,
        household,
        loading,
        signIn,
        signUp,
        signOut,
        refreshProfile,
        refreshHousehold,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
