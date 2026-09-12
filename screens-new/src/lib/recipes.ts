import { supabase } from './supabase';
import {
  Recipe, RecipeInsert, RecipeUpdate,
  Ingredient, IngredientInsert,
  Instruction, InstructionInsert,
  RecipeWithDetails,
} from '@/types';

// ─── Fetch all recipes for a household ───────────────────────────────────────

export async function getRecipes(householdId: string): Promise<{
  recipes: Recipe[];
  error: string | null;
}> {
  const { data, error } = await supabase
    .from('recipes')
    .select('*')
    .eq('household_id', householdId)
    .order('created_at', { ascending: false });

  return { recipes: data ?? [], error: error?.message ?? null };
}

// ─── Fetch a single recipe with full detail (ingredients, instructions, tags) ─

export async function getRecipeById(recipeId: string): Promise<{
  recipe: RecipeWithDetails | null;
  error: string | null;
}> {
  const { data, error } = await supabase
    .from('recipes')
    .select(`
      *,
      ingredients ( * ),
      instructions ( * ),
      recipe_tags ( tag )
    `)
    .eq('id', recipeId)
    .single();

  if (error || !data) return { recipe: null, error: error?.message ?? 'Not found' };

  const recipe: RecipeWithDetails = {
    ...data,
    ingredients: (data.ingredients ?? []).sort(
      (a: Ingredient, b: Ingredient) => a.sort_order - b.sort_order
    ),
    instructions: (data.instructions ?? []).sort(
      (a: Instruction, b: Instruction) => a.step_number - b.step_number
    ),
    tags: (data.recipe_tags ?? []).map((t: { tag: string }) => t.tag),
  };

  return { recipe, error: null };
}

// ─── Create a recipe with ingredients + instructions ──────────────────────────

export async function createRecipe(
  recipeData: RecipeInsert,
  ingredients: Omit<IngredientInsert, 'recipe_id'>[],
  instructions: Omit<InstructionInsert, 'recipe_id'>[],
  tags: string[] = []
): Promise<{ recipe: Recipe | null; error: string | null }> {
  // 1. Insert recipe
  const { data: recipe, error: recipeErr } = await supabase
    .from('recipes')
    .insert(recipeData)
    .select()
    .single();

  if (recipeErr || !recipe) {
    return { recipe: null, error: recipeErr?.message ?? 'Failed to create recipe' };
  }

  // 2. Insert ingredients
  if (ingredients.length > 0) {
    const rows = ingredients.map((ing, i) => ({
      ...ing,
      recipe_id: recipe.id,
      sort_order: ing.sort_order ?? i,
    }));
    const { error: ingErr } = await supabase.from('ingredients').insert(rows);
    if (ingErr) console.warn('Ingredient insert error:', ingErr.message);
  }

  // 3. Insert instructions
  if (instructions.length > 0) {
    const rows = instructions.map((step, i) => ({
      ...step,
      recipe_id: recipe.id,
      step_number: step.step_number ?? i + 1,
    }));
    const { error: stepErr } = await supabase.from('instructions').insert(rows);
    if (stepErr) console.warn('Instruction insert error:', stepErr.message);
  }

  // 4. Insert tags
  if (tags.length > 0) {
    const rows = tags.map(tag => ({ recipe_id: recipe.id, tag }));
    const { error: tagErr } = await supabase.from('recipe_tags').insert(rows);
    if (tagErr) console.warn('Tag insert error:', tagErr.message);
  }

  return { recipe, error: null };
}

// ─── Update recipe metadata ───────────────────────────────────────────────────

export async function updateRecipe(
  recipeId: string,
  updates: RecipeUpdate
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('recipes')
    .update(updates)
    .eq('id', recipeId);
  return { error: error?.message ?? null };
}

// ─── Delete a recipe (cascades to ingredients, instructions, tags) ────────────

export async function deleteRecipe(recipeId: string): Promise<{ error: string | null }> {
  const { error } = await supabase.from('recipes').delete().eq('id', recipeId);
  return { error: error?.message ?? null };
}

// ─── Toggle recipe rating ─────────────────────────────────────────────────────

export async function rateRecipe(
  recipeId: string,
  rating: number
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('recipes')
    .update({ rating })
    .eq('id', recipeId);
  return { error: error?.message ?? null };
}

// ─── Search recipes by title or tag ──────────────────────────────────────────

export async function searchRecipes(
  householdId: string,
  query: string,
  category?: string
): Promise<{ recipes: Recipe[]; error: string | null }> {
  let q = supabase
    .from('recipes')
    .select('*')
    .eq('household_id', householdId)
    .ilike('title', `%${query}%`);

  if (category && category !== 'All') {
    q = q.eq('category', category);
  }

  const { data, error } = await q.order('created_at', { ascending: false });
  return { recipes: data ?? [], error: error?.message ?? null };
}

// ─── Add ingredients to grocery list from a recipe ────────────────────────────

export async function addIngredientsToGrocery(
  listId: string,
  recipeId: string,
  ingredients: Ingredient[]
): Promise<{ error: string | null }> {
  const rows = ingredients.map(ing => ({
    list_id: listId,
    name: ing.name,
    amount: ing.amount,
    unit: ing.unit,
    recipe_id: recipeId,
    is_checked: false,
    aisle: null,
    checked_by: null,
  }));

  const { error } = await supabase.from('grocery_items').insert(rows);
  return { error: error?.message ?? null };
}
