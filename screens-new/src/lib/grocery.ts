import { supabase } from './supabase';
import { GroceryList, GroceryItem } from '@/types';
import { RealtimeChannel } from '@supabase/supabase-js';

// ─── Get or create the active grocery list for a household ───────────────────

export async function getOrCreateGroceryList(
  householdId: string
): Promise<{ list: GroceryList | null; error: string | null }> {
  // Try to get the most recent list first
  const { data, error } = await supabase
    .from('grocery_lists')
    .select('*')
    .eq('household_id', householdId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (data) return { list: data, error: null };

  // None exists — create one
  const { data: newList, error: createErr } = await supabase
    .from('grocery_lists')
    .insert({ household_id: householdId, name: 'Weekly Shop' })
    .select()
    .single();

  return {
    list: newList ?? null,
    error: createErr?.message ?? null,
  };
}

// ─── Fetch all items for a list ───────────────────────────────────────────────

export async function getGroceryItems(
  listId: string
): Promise<{ items: GroceryItem[]; error: string | null }> {
  const { data, error } = await supabase
    .from('grocery_items')
    .select('*')
    .eq('list_id', listId)
    .order('created_at', { ascending: true });

  return { items: data ?? [], error: error?.message ?? null };
}

// ─── Add a single item to a list ─────────────────────────────────────────────

export async function addGroceryItem(
  listId: string,
  name: string,
  amount?: string,
  unit?: string,
  aisle?: string
): Promise<{ item: GroceryItem | null; error: string | null }> {
  const { data, error } = await supabase
    .from('grocery_items')
    .insert({ list_id: listId, name, amount, unit, aisle, is_checked: false })
    .select()
    .single();

  return { item: data ?? null, error: error?.message ?? null };
}

// ─── Toggle checked state ─────────────────────────────────────────────────────

export async function toggleGroceryItem(
  itemId: string,
  isChecked: boolean,
  checkedBy: string | null
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('grocery_items')
    .update({ is_checked: isChecked, checked_by: isChecked ? checkedBy : null })
    .eq('id', itemId);

  return { error: error?.message ?? null };
}

// ─── Delete a single item ─────────────────────────────────────────────────────

export async function deleteGroceryItem(
  itemId: string
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('grocery_items')
    .delete()
    .eq('id', itemId);

  return { error: error?.message ?? null };
}

// ─── Clear all checked items from a list ─────────────────────────────────────

export async function clearCheckedItems(
  listId: string
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('grocery_items')
    .delete()
    .eq('list_id', listId)
    .eq('is_checked', true);

  return { error: error?.message ?? null };
}

// ─── Update item aisle ────────────────────────────────────────────────────────

export async function updateGroceryItemAisle(
  itemId: string,
  aisle: string
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('grocery_items')
    .update({ aisle })
    .eq('id', itemId);

  return { error: error?.message ?? null };
}

// ─── Real-time subscription ───────────────────────────────────────────────────
// Subscribes to all changes on grocery_items for a list.
// Returns the channel so the caller can unsubscribe on unmount.

export function subscribeToGroceryItems(
  listId: string,
  onUpdate: (items: GroceryItem[]) => void,
  getCurrentItems: () => GroceryItem[]
): RealtimeChannel {
  const channel = supabase
    .channel(`grocery_items:${listId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'grocery_items',
        filter: `list_id=eq.${listId}`,
      },
      (payload) => {
        const current = getCurrentItems();

        if (payload.eventType === 'INSERT') {
          onUpdate([...current, payload.new as GroceryItem]);
        } else if (payload.eventType === 'UPDATE') {
          onUpdate(
            current.map((item) =>
              item.id === (payload.new as GroceryItem).id
                ? (payload.new as GroceryItem)
                : item
            )
          );
        } else if (payload.eventType === 'DELETE') {
          onUpdate(current.filter((item) => item.id !== payload.old.id));
        }
      }
    )
    .subscribe();

  return channel;
}
