import { supabase } from './supabase';
import { FridgeItem, FridgeItemInsert, FridgeItemUpdate } from '@/types';

// ─── Fetch fridge/pantry/freezer items ───────────────────────────────────────

export async function getFridgeItems(
  householdId: string,
  location?: FridgeItem['location']
): Promise<{ items: FridgeItem[]; error: string | null }> {
  let query = supabase
    .from('fridge_items')
    .select('*')
    .eq('household_id', householdId)
    .order('category', { ascending: true })
    .order('name',     { ascending: true });

  if (location) {
    query = query.eq('location', location);
  }

  const { data, error } = await query;
  return { items: data ?? [], error: error?.message ?? null };
}

// ─── Add a new item ───────────────────────────────────────────────────────────

export async function addFridgeItem(
  item: FridgeItemInsert
): Promise<{ item: FridgeItem | null; error: string | null }> {
  const { data, error } = await supabase
    .from('fridge_items')
    .insert(item)
    .select()
    .single();

  return { item: data ?? null, error: error?.message ?? null };
}

// ─── Update an item ───────────────────────────────────────────────────────────

export async function updateFridgeItem(
  id: string,
  updates: FridgeItemUpdate
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('fridge_items')
    .update(updates)
    .eq('id', id);

  return { error: error?.message ?? null };
}

// ─── Delete an item ───────────────────────────────────────────────────────────

export async function deleteFridgeItem(
  id: string
): Promise<{ error: string | null }> {
  const { error } = await supabase.from('fridge_items').delete().eq('id', id);
  return { error: error?.message ?? null };
}

// ─── Recipes with ingredient names — for "What Can I Make" ───────────────────
// Returns recipes plus a flat array of ingredient name strings for matching.

export interface RecipeWithIngs {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  prep_time_minutes: number | null;
  cook_time_minutes: number | null;
  servings: number | null;
  ingredientNames: string[];
}

export async function getRecipesWithIngredients(
  householdId: string
): Promise<{ recipes: RecipeWithIngs[]; error: string | null }> {
  const { data, error } = await supabase
    .from('recipes')
    .select(`
      id, title, description, category,
      prep_time_minutes, cook_time_minutes, servings,
      ingredients ( name )
    `)
    .eq('household_id', householdId)
    .order('created_at', { ascending: false });

  if (error) return { recipes: [], error: error.message };

  const recipes: RecipeWithIngs[] = (data ?? []).map((r: any) => ({
    id: r.id,
    title: r.title,
    description: r.description,
    category: r.category,
    prep_time_minutes: r.prep_time_minutes,
    cook_time_minutes: r.cook_time_minutes,
    servings: r.servings,
    ingredientNames: (r.ingredients ?? []).map((i: { name: string }) => i.name),
  }));

  return { recipes, error: null };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** How many recipe ingredients are roughly matched by what's in the fridge */
export function countIngredientMatches(
  ingredientNames: string[],
  fridgeItems: FridgeItem[]
): number {
  if (ingredientNames.length === 0) return 0;
  return ingredientNames.filter(ing => {
    const ingLower = ing.toLowerCase();
    return fridgeItems.some(fi => {
      const fridgeLower = fi.name.toLowerCase();
      // Simple substring match — good enough for MVP
      return fridgeLower.includes(ingLower.split(' ')[0]) ||
             ingLower.includes(fridgeLower);
    });
  }).length;
}
