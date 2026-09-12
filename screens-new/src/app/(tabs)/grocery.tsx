import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView,
  SectionList, TouchableOpacity, TextInput,
  Modal, KeyboardAvoidingView, Platform, Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, Spacing, Radius, Shadow } from '@/constants/theme';
import GroceryItemComponent from '@/components/GroceryItem';
import { useAuth } from '@/context/AuthContext';
import { GroceryItem, GroceryList } from '@/types';
import {
  getOrCreateGroceryList,
  getGroceryItems,
  addGroceryItem,
  toggleGroceryItem,
  deleteGroceryItem,
  clearCheckedItems,
  subscribeToGroceryItems,
} from '@/lib/grocery';
import { RealtimeChannel } from '@supabase/supabase-js';

const UNCATEGORISED = 'Other';

export default function GroceryScreen() {
  const { profile, household } = useAuth();

  const [list, setList]       = useState<GroceryList | null>(null);
  const [items, setItems]     = useState<GroceryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [addModal, setAddModal] = useState(false);
  const [newName, setNewName]   = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newAisle, setNewAisle]   = useState('');
  const [adding, setAdding]       = useState(false);

  // Keep a ref so the realtime callback always sees fresh items
  const itemsRef = useRef<GroceryItem[]>([]);
  itemsRef.current = items;

  const channelRef = useRef<RealtimeChannel | null>(null);

  // ─── Load list + items ──────────────────────────────────────────────────────
  const load = useCallback(async () => {
    if (!household?.id) return;
    setLoading(true);

    const { list: l, error: listErr } = await getOrCreateGroceryList(household.id);
    if (listErr || !l) {
      Alert.alert('Error', listErr ?? 'Could not load grocery list');
      setLoading(false);
      return;
    }

    setList(l);

    const { items: fetchedItems, error: itemsErr } = await getGroceryItems(l.id);
    if (itemsErr) {
      Alert.alert('Error', itemsErr);
    } else {
      setItems(fetchedItems);
    }

    setLoading(false);

    // Subscribe to real-time changes
    if (channelRef.current) {
      channelRef.current.unsubscribe();
    }
    channelRef.current = subscribeToGroceryItems(
      l.id,
      (updated) => setItems(updated),
      () => itemsRef.current
    );
  }, [household?.id]);

  useEffect(() => {
    load();
    return () => {
      channelRef.current?.unsubscribe();
    };
  }, [load]);

  // ─── Toggle ─────────────────────────────────────────────────────────────────
  const handleToggle = async (id: string, current: boolean) => {
    // Optimistic update
    setItems(prev =>
      prev.map(item => item.id === id ? { ...item, is_checked: !current } : item)
    );
    await toggleGroceryItem(id, !current, profile?.id ?? null);
  };

  // ─── Delete ─────────────────────────────────────────────────────────────────
  const handleDelete = async (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
    await deleteGroceryItem(id);
  };

  // ─── Add item ────────────────────────────────────────────────────────────────
  const handleAdd = async () => {
    if (!list || !newName.trim()) return;
    setAdding(true);
    const { item, error } = await addGroceryItem(
      list.id,
      newName.trim(),
      newAmount.trim() || undefined,
      undefined,
      newAisle.trim() || undefined
    );
    setAdding(false);

    if (error || !item) {
      Alert.alert('Error', error ?? 'Could not add item');
    } else {
      // Real-time will catch it, but add optimistically for snappiness
      setItems(prev => [...prev, item]);
      setNewName('');
      setNewAmount('');
      setNewAisle('');
      setAddModal(false);
    }
  };

  // ─── Clear checked ───────────────────────────────────────────────────────────
  const handleClearChecked = () => {
    if (!list) return;
    Alert.alert('Clear checked items?', 'This will remove all checked items.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear',
        style: 'destructive',
        onPress: async () => {
          setItems(prev => prev.filter(i => !i.is_checked));
          await clearCheckedItems(list.id);
        },
      },
    ]);
  };

  // ─── Derived data ────────────────────────────────────────────────────────────
  const aisleMap = items.reduce<Record<string, GroceryItem[]>>((acc, item) => {
    const key = item.aisle ?? UNCATEGORISED;
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  const sections = Object.entries(aisleMap).map(([title, data]) => ({ title, data }));
  const checkedCount = items.filter(i => i.is_checked).length;
  const totalCount   = items.length;
  const progress     = totalCount > 0 ? checkedCount / totalCount : 0;

  // ─── Render ──────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <SafeAreaView style={[styles.safe, styles.centered]}>
        <ActivityIndicator size="large" color={Colors.navy} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Grocery List</Text>
          <Text style={styles.sub}>{checkedCount} of {totalCount} items checked</Text>
        </View>
        <View style={styles.headerActions}>
          {checkedCount > 0 && (
            <TouchableOpacity style={styles.iconBtn} onPress={handleClearChecked}>
              <Ionicons name="trash-outline" size={18} color={Colors.error} />
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.iconBtn}>
            <Ionicons name="share-outline" size={20} color={Colors.navy} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Progress bar */}
      <View style={styles.progressWrap}>
        <View style={styles.progressBg}>
          <View style={[styles.progressFill, { width: `${progress * 100}%` as any }]} />
        </View>
        {checkedCount === totalCount && totalCount > 0 && (
          <Text style={styles.allDone}>🎉 All done!</Text>
        )}
      </View>

      {/* List */}
      {items.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>🛒</Text>
          <Text style={styles.emptyTitle}>Your list is empty</Text>
          <Text style={styles.emptySub}>Tap + to add items</Text>
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
          renderSectionHeader={({ section }) => (
            <View style={styles.aisleHeader}>
              <Ionicons name="location-outline" size={13} color={Colors.muted} />
              <Text style={styles.aisleTitle}>{section.title}</Text>
              <Text style={styles.aisleCount}>
                {section.data.filter(i => !i.is_checked).length} left
              </Text>
            </View>
          )}
          renderItem={({ item }) => (
            <GroceryItemComponent
              item={item}
              onToggle={handleToggle}
              onDelete={handleDelete}
            />
          )}
        />
      )}

      {/* FAB */}
      <TouchableOpacity style={[styles.fab, Shadow.lg]} onPress={() => setAddModal(true)}>
        <Ionicons name="add" size={26} color="#fff" />
      </TouchableOpacity>

      {/* Add Item Modal */}
      <Modal visible={addModal} transparent animationType="slide">
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={[styles.modalSheet, Shadow.lg]}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Add Item</Text>

            <TextInput
              style={styles.input}
              placeholder="Item name (e.g. Olive oil)"
              placeholderTextColor={Colors.muted}
              value={newName}
              onChangeText={setNewName}
              autoFocus
            />
            <TextInput
              style={styles.input}
              placeholder="Amount (e.g. 2 cans)"
              placeholderTextColor={Colors.muted}
              value={newAmount}
              onChangeText={setNewAmount}
            />
            <TextInput
              style={styles.input}
              placeholder="Aisle (e.g. Produce)"
              placeholderTextColor={Colors.muted}
              value={newAisle}
              onChangeText={setNewAisle}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => { setAddModal(false); setNewName(''); setNewAmount(''); setNewAisle(''); }}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.addBtn, !newName.trim() && styles.addBtnDisabled]}
                onPress={handleAdd}
                disabled={!newName.trim() || adding}
              >
                {adding
                  ? <ActivityIndicator size="small" color="#fff" />
                  : <Text style={styles.addBtnText}>Add</Text>
                }
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  centered: { justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    paddingHorizontal: Spacing.xl, paddingTop: Spacing.xl, paddingBottom: Spacing.md,
  },
  title: { fontSize: FontSize.xl, fontWeight: '700', color: Colors.text, fontFamily: 'PlayfairDisplay_700Bold' },
  sub: { fontSize: FontSize.sm, color: Colors.muted, marginTop: 3 },
  headerActions: { flexDirection: 'row', gap: Spacing.sm },
  iconBtn: {
    width: 40, height: 40, backgroundColor: Colors.chip,
    borderRadius: Radius.md, justifyContent: 'center', alignItems: 'center',
  },
  progressWrap: { paddingHorizontal: Spacing.xl, marginBottom: Spacing.md, gap: 6 },
  progressBg: { height: 6, backgroundColor: Colors.border, borderRadius: Radius.full, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: Colors.sage, borderRadius: Radius.full },
  allDone: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.sage, textAlign: 'center' },
  aisleHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: Spacing.xl, paddingTop: Spacing.lg, paddingBottom: Spacing.sm,
    backgroundColor: Colors.bg,
  },
  aisleTitle: {
    flex: 1, fontSize: FontSize.xs, fontWeight: '800',
    color: Colors.muted, textTransform: 'uppercase', letterSpacing: 0.8,
  },
  aisleCount: { fontSize: FontSize.xs, color: Colors.muted },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: Spacing.sm },
  emptyEmoji: { fontSize: 48 },
  emptyTitle: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.text },
  emptySub: { fontSize: FontSize.base, color: Colors.muted },
  fab: {
    position: 'absolute', right: Spacing.xl, bottom: 24,
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: Colors.navy, justifyContent: 'center', alignItems: 'center',
  },
  // Modal
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
  modalSheet: {
    backgroundColor: Colors.card, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: Spacing.xl, paddingBottom: 40, gap: Spacing.md,
  },
  modalHandle: {
    width: 36, height: 4, backgroundColor: Colors.border,
    borderRadius: Radius.full, alignSelf: 'center', marginBottom: Spacing.sm,
  },
  modalTitle: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.text },
  input: {
    height: 50, borderRadius: Radius.md, borderWidth: 1.5, borderColor: Colors.border,
    paddingHorizontal: Spacing.md, fontSize: FontSize.base, color: Colors.text,
    backgroundColor: Colors.bg,
  },
  modalActions: { flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.sm },
  cancelBtn: {
    flex: 1, height: 50, borderRadius: Radius.md, borderWidth: 1.5,
    borderColor: Colors.border, justifyContent: 'center', alignItems: 'center',
  },
  cancelText: { fontSize: FontSize.base, fontWeight: '600', color: Colors.muted },
  addBtn: {
    flex: 1, height: 50, borderRadius: Radius.md,
    backgroundColor: Colors.navy, justifyContent: 'center', alignItems: 'center',
  },
  addBtnDisabled: { opacity: 0.4 },
  addBtnText: { fontSize: FontSize.base, fontWeight: '700', color: '#fff' },
});
