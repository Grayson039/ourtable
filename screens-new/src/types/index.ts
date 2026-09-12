// ─── Supabase Database Type Map ───────────────────────────────────────────────
// Mirrors the Postgres schema in supabase/migrations/001_schema.sql

export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: ProfileInsert;
        Update: ProfileUpdate;
      };
      households: {
        Row: Household;
        Insert: HouseholdInsert;
        Update: HouseholdUpdate;
      };
      household_members: {
        Row: HouseholdMember;
        Insert: HouseholdMemberInsert;
        Update: HouseholdMemberUpdate;
      };
      dietary_preferences: {
        Row: DietaryPreference;
        Insert: DietaryPreferenceInsert;
        Update: DietaryPreferenceUpdate;
      };
      recipes: {
        Row: Recipe;
        Insert: RecipeInsert;
        Update: RecipeUpdate;
      };
      ingredients: {
        Row: Ingredient;
        Insert: IngredientInsert;
        Update: IngredientUpdate;
      };
      instructions: {
        Row: Instruction;
        Insert: InstructionInsert;
        Update: InstructionUpdate;
      };
      recipe_tags: {
        Row: RecipeTag;
        Insert: RecipeTagInsert;
        Update: RecipeTagUpdate;
      };
      grocery_lists: {
        Row: GroceryList;
        Insert: GroceryListInsert;
        Update: GroceryListUpdate;
      };
      grocery_items: {
        Row: GroceryItem;
        Insert: GroceryItemInsert;
        Update: GroceryItemUpdate;
      };
      fridge_items: {
        Row: FridgeItem;
        Insert: FridgeItemInsert;
        Update: FridgeItemUpdate;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      household_role: 'owner' | 'member';
      recipe_source: 'manual' | 'url' | 'tiktok' | 'instagram' | 'youtube';
      pantry_type: 'fridge' | 'pantry' | 'freezer';
    };
  };
}

// ─── Profile ──────────────────────────────────────────────────────────────────

export interface Profile {
  id: string;
  name: string;
  avatar_url: string | null;
  household_id: string | null;
  created_at: string;
  updated_at: string;
}
export type ProfileInsert = Omit<Profile, 'created_at' | 'updated_at'>;
export type ProfileUpdate = Partial<ProfileInsert>;

// ─── Household ────────────────────────────────────────────────────────────────

export interface Household {
  id: string;
  name: string;
  owner_id: string;
  created_at: string;
}
export type HouseholdInsert = Omit<Household, 'id' | 'created_at'>;
export type HouseholdUpdate = Partial<HouseholdInsert>;

// ─── Household Member ─────────────────────────────────────────────────────────

export interface HouseholdMember {
  id: string;
  household_id: string;
  profile_id: string;
  role: 'owner' | 'member';
  joined_at: string;
}
export type HouseholdMemberInsert = Omit<HouseholdMember, 'id' | 'joined_at'>;
export type HouseholdMemberUpdate = Partial<HouseholdMemberInsert>;

// ─── Dietary Preference ───────────────────────────────────────────────────────

export interface DietaryPreference {
  id: string;
  profile_id: string;
  preference: string;
}
export type DietaryPreferenceInsert = Omit<DietaryPreference, 'id'>;
export type DietaryPreferenceUpdate = Partial<DietaryPreferenceInsert>;

// ─── Recipe ───────────────────────────────────────────────────────────────────

export interface Recipe {
  id: string;
  household_id: string;
  title: string;
  description: string | null;
  source_url: string | null;
  source_type: 'manual' | 'url' | 'tiktok' | 'instagram' | 'youtube';
  image_url: string | null;
  cook_time_minutes: number | null;
  prep_time_minutes: number | null;
  servings: number | null;
  category: string | null;
  calories: number | null;
  rating: number | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}
export type RecipeInsert = Omit<Recipe, 'id' | 'created_at' | 'updated_at'>;
export type RecipeUpdate = Partial<RecipeInsert>;

// ─── Ingredient ───────────────────────────────────────────────────────────────

export interface Ingredient {
  id: string;
  recipe_id: string;
  name: string;
  amount: string | null;
  unit: string | null;
  notes: string | null;
  sort_order: number;
}
export type IngredientInsert = Omit<Ingredient, 'id'>;
export type IngredientUpdate = Partial<IngredientInsert>;

// ─── Instruction ──────────────────────────────────────────────────────────────

export interface Instruction {
  id: string;
  recipe_id: string;
  step_number: number;
  text: string;
}
export type InstructionInsert = Omit<Instruction, 'id'>;
export type InstructionUpdate = Partial<InstructionInsert>;

// ─── Recipe Tag ───────────────────────────────────────────────────────────────

export interface RecipeTag {
  id: string;
  recipe_id: string;
  tag: string;
}
export type RecipeTagInsert = Omit<RecipeTag, 'id'>;
export type RecipeTagUpdate = Partial<RecipeTagInsert>;

// ─── Grocery List ─────────────────────────────────────────────────────────────

export interface GroceryList {
  id: string;
  household_id: string;
  name: string;
  created_at: string;
}
export type GroceryListInsert = Omit<GroceryList, 'id' | 'created_at'>;
export type GroceryListUpdate = Partial<GroceryListInsert>;

// ─── Grocery Item ─────────────────────────────────────────────────────────────

export interface GroceryItem {
  id: string;
  list_id: string;
  name: string;
  amount: string | null;
  unit: string | null;
  aisle: string | null;
  recipe_id: string | null;
  is_checked: boolean;
  checked_by: string | null;
  created_at: string;
}
export type GroceryItemInsert = Omit<GroceryItem, 'id' | 'created_at'>;
export type GroceryItemUpdate = Partial<GroceryItemInsert>;

// ─── Fridge Item ──────────────────────────────────────────────────────────────

export interface FridgeItem {
  id: string;
  household_id: string;
  name: string;
  quantity: string | null;
  unit: string | null;
  expires_at: string | null;
  category: string | null;
  location: 'fridge' | 'pantry' | 'freezer';
  added_by: string;
  created_at: string;
}
export type FridgeItemInsert = Omit<FridgeItem, 'id' | 'created_at'>;
export type FridgeItemUpdate = Partial<FridgeItemInsert>;

// ─── App-level types (used in UI, not necessarily DB rows) ───────────────────

export interface RecipeWithDetails extends Recipe {
  ingredients: Ingredient[];
  instructions: Instruction[];
  tags: string[];
}

export interface ProfileWithDiet extends Profile {
  dietary_preferences: string[];
}

export interface HouseholdWithMembers extends Household {
  members: ProfileWithDiet[];
}

export type DietaryOption =
  | 'None'
  | 'Vegetarian'
  | 'Vegan'
  | 'Gluten-Free'
  | 'Dairy-Free'
  | 'Nut-Free'
  | 'Halal'
  | 'Kosher';
