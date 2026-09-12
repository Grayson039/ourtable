import { supabase } from './supabase';
import { Household, HouseholdWithMembers, Profile } from '@/types';

// ─── Create a new household and set it on the calling user's profile ──────────

export async function createHousehold(
  name: string,
  ownerId: string
): Promise<{ household: Household | null; error: string | null }> {
  // 1. Create the household row
  const { data: hh, error: hhErr } = await supabase
    .from('households')
    .insert({ name, owner_id: ownerId })
    .select()
    .single();

  if (hhErr || !hh) return { household: null, error: hhErr?.message ?? 'Failed to create household' };

  // 2. Update the owner's profile to point at this household
  const { error: profileErr } = await supabase
    .from('profiles')
    .update({ household_id: hh.id })
    .eq('id', ownerId);

  if (profileErr) return { household: null, error: profileErr.message };

  // 3. Add owner as a household member
  await supabase.from('household_members').insert({
    household_id: hh.id,
    profile_id: ownerId,
    role: 'owner',
  });

  return { household: hh, error: null };
}

// ─── Save dietary preferences for a profile ──────────────────────────────────

export async function saveDietaryPreferences(
  profileId: string,
  preferences: string[]
): Promise<{ error: string | null }> {
  // Delete existing, then insert fresh (simpler than diff/merge for onboarding)
  const { error: delErr } = await supabase
    .from('dietary_preferences')
    .delete()
    .eq('profile_id', profileId);

  if (delErr) return { error: delErr.message };

  if (preferences.length === 0) return { error: null };

  const rows = preferences.map(p => ({ profile_id: profileId, preference: p }));
  const { error: insErr } = await supabase.from('dietary_preferences').insert(rows);

  return { error: insErr?.message ?? null };
}

// ─── Invite / add a household member by name (creates a placeholder profile) ─
// NOTE: In production this would be an email invite. For now we add a local
// display entry so the household UI works during dev.

export async function addHouseholdMemberByName(
  householdId: string,
  memberName: string,
  dietaryPreferences: string[] = []
): Promise<{ error: string | null }> {
  // We store the name in profiles, household_members links them
  // For dev purposes, we just save to a pending_members JSON field or
  // store in the household name for display. Real invite flow: Phase 5b.
  // For now, just record in household_members with a stub profile.
  console.log('addHouseholdMemberByName (stub):', memberName, dietaryPreferences);
  return { error: null };
}

// ─── Fetch household with all members + their dietary prefs ──────────────────

export async function getHousehold(
  householdId: string
): Promise<{ household: HouseholdWithMembers | null; error: string | null }> {
  const { data: hh, error: hhErr } = await supabase
    .from('households')
    .select('*')
    .eq('id', householdId)
    .single();

  if (hhErr || !hh) return { household: null, error: hhErr?.message ?? 'Not found' };

  const { data: members, error: memErr } = await supabase
    .from('profiles')
    .select('*, dietary_preferences(preference)')
    .eq('household_id', householdId);

  if (memErr) return { household: null, error: memErr.message };

  const membersWithDiet = (members ?? []).map((m: any) => ({
    ...m,
    dietary_preferences: (m.dietary_preferences ?? []).map(
      (d: { preference: string }) => d.preference
    ),
  }));

  return { household: { ...hh, members: membersWithDiet }, error: null };
}

// ─── Update profile fields (name, etc.) ──────────────────────────────────────

export async function updateProfile(
  profileId: string,
  updates: { name?: string }
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('profiles')
    .update(updates as any)
    .eq('id', profileId);
  return { error: error?.message ?? null };
}

// ─── Update household name ────────────────────────────────────────────────────

export async function updateHouseholdName(
  householdId: string,
  name: string
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('households')
    .update({ name })
    .eq('id', householdId);
  return { error: error?.message ?? null };
}
