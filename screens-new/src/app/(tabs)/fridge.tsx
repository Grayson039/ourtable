import React, { useState, useCallback, useEffect } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TouchableOpacity, SectionList, Modal, TextInput,
  ActivityIndicator, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { Colors, FontSize, Spacing, Radius, Shadow } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import {
  getFridgeItems, addFridgeItem, deleteFridgeItem,
  getRecipesWithIngredients, countIngredientMatches,
  RecipeWithIngs,
} from '@/lib/fridge';
import { FridgeItem } from '@/types';

// ─── Constants ────────────────────────────────────────────────────────────────

const TABS = ['Fridge', 'Pantry', 'What Can I Make'];

const ITEM_CATEGORIES = ['Produce', 'Dairy', 'Protein', 'Grains', 'Condiments', 'Leftovers', 'Other'];

const CATEGORY_EMOJI: Record<string, string> = {
  Produce:    '🥦',
  Dairy:      '🧀',
  Protein:    '🥩',
  Meat:       '🥩',
  Seafood:    '🐟',
  Grains:     '🌾',
  Condiments: '🍯',
  Leftovers:  '🍱',
  Beverages:  '🥤',
  Frozen:     '❄️',
  Other:      '📦',
};

// ─── Expiry helpers ───────────────────────────────────────────────────────────

function daysUntilExpiry(expiresAt: string | null): number | null {
  if (!expiresAt) return null;
  const diff = Math.ceil(
    (new Date(expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );
  return diff;
}

function formatExpiry(expiresAt: string | null): string {
  const days = daysUntilExpiry(expiresAt);
  if (days === null)  return 'No expiry';
  if (days < 0)       return 'Expired';
  if (days === 0)     return 'Today';
  if (days === 1)     return 'Tomorrow';
  return `${days} days`;
}

function expiryColor(expiresAt: string | null): string {
  const days = daysUntilExpiry(expiresAt);
  if (days === null) return Colors.muted;
  if (days <= 1)     return Colors.error;
  if (days <= 4)     return Colors.warning;
  return Colors.success;
}

// ─── Group items into SectionList sections ────────────────────────────────────

function groupByCategory(items: FridgeItem[]) {
  const map: Record<string, FridgeItem[]> = {};
  items.forEach(item => {
    const key = item.category ?? 'Other';
    if (!map[key]) map[key] = [];
    map[key].push(item);
  });
  return Object.entries(map).map(([title, data]) => ({ title, data }));
}

// ─── Add Item bottom sheet ────────────────────────────────────────────────────

interface AddItemSheetProps {
  visible: boolean;
  defaultLocation: FridgeItem['location'];
  householdId: string;
  addedBy: string;
  onClose: () => void;
  onSaved: (item: FridgeItem) => void;
}

function AddItemSheet({ visible, defaultLocation, householdId, addedBy, onClose, onSaved }: AddItemSheetProps) {
  const [name, setName]         = useState('');
  const [quantity, setQty]      = useState('');
  const [unit, setUnit]         = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState<FridgeItem['location']>(defaultLocation);
  const [expiry, setExpiry]     = useState('');
  const [saving, setSaving]     = useState(false);

  // Reset when opened
  useEffect(() => {
    if (visible) {
      setName(''); setQty(''); setUnit('');
      setCategory(''); setLocation(defaultLocation); setExpiry('');
    }
  }, [visible, defaultLocation]);

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const { item, error } = await addFridgeItem({
      household_id: householdId,
      name: name.trim(),
      quantity: quantity.trim() || null,
      unit: unit.trim() || null,
      category: category || null,
      location,
      expires_at: expiry.trim() ? new Date(expiry.trim()).toISOString() : null,
      added_by: addedBy,
    });

    setSaving(false);

    if (error || !item) {
      Alert.alert('Could not add item', error ?? 'Unknown error');
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onSaved(item);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={sheet.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <TouchableOpacity style={sheet.backdrop} onPress={onClose} activeOpacity={1} />

        <View style={sheet.container}>
          {/* Handle */}
          <View style={sheet.handle} />
          <View style={sheet.header}>
            <Text style={sheet.title}>Add item</Text>
            <TouchableOpacity onPress={onClose} style={sheet.closeBtn}>
              <Ionicons name="close" size={20} color={Colors.navy} />
            </TouchableOpacity>
          </View>

          <ScrollView
            contentContainerStyle={sheet.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Name */}
            <View style={sheet.field}>
              <Text style={sheet.label}>Name *</Text>
              <TextInput
                style={sheet.input}
                placeholder="e.g. Milk"
                placeholderTextColor={Colors.muted}
                value={name}
                onChangeText={setName}
                autoFocus
                returnKeyType="next"
              />
            </View>

            {/* Qty + Unit */}
            <View style={sheet.row2}>
              <View style={{ flex: 1 }}>
                <Text style={sheet.label}>Quantity</Text>
                <TextInput
                  style={sheet.input}
                  placeholder="2"
                  placeholderTextColor={Colors.muted}
                  value={quantity}
                  onChangeText={setQty}
                  keyboardType="numbers-and-punctuation"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={sheet.label}>Unit</Text>
                <TextInput
                  style={sheet.input}
                  placeholder="cups"
                  placeholderTextColor={Colors.muted}
                  value={unit}
                  onChangeText={setUnit}
                />
              </View>
            </View>

            {/* Category */}
            <View style={sheet.field}>
              <Text style={sheet.label}>Category</Text>
              <View style={sheet.chipRow}>
                {ITEM_CATEGORIES.map(cat => (
                  <TouchableOpacity
                    key={cat}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setCategory(prev => prev === cat ? '' : cat);
                    }}
                    style={[sheet.chip, category === cat && sheet.chipActive]}
                  >
                    <Text style={[sheet.chipText, category === cat && sheet.chipTextActive]}>
                      {CATEGORY_EMOJI[cat] ?? '📦'} {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Location */}
            <View style={sheet.field}>
              <Text style={sheet.label}>Location</Text>
              <View style={sheet.locRow}>
                {(['fridge', 'pantry', 'freezer'] as FridgeItem['location'][]).map(loc => (
                  <TouchableOpacity
                    key={loc}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setLocation(loc);
                    }}
                    style={[sheet.locBtn, location === loc && sheet.locBtnActive]}
                  >
                    <Text style={[sheet.locText, location === loc && sheet.locTextActive]}>
                      {loc === 'fridge' ? '🧊' : loc === 'pantry' ? '🥫' : '❄️'} {loc.charAt(0).toUpperCase() + loc.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Expiry */}
            <View style={sheet.field}>
              <Text style={sheet.label}>Use by (YYYY-MM-DD)</Text>
              <TextInput
                style={sheet.input}
                placeholder="e.g. 2026-06-15"
                placeholderTextColor={Colors.muted}
                value={expiry}
                onChangeText={setExpiry}
                keyboardType="numbers-and-punctuation"
              />
            </View>

            {saving ? (
              <View style={sheet.savingRow}>
                <ActivityIndicator color={Colors.navy} size="small" />
                <Text style={sheet.savingText}>Saving…</Text>
              </View>
            ) : (
              <TouchableOpacity
                style={[sheet.saveBtn, !name.trim() && sheet.saveBtnDisabled]}
                onPress={handleSave}
                disabled={!name.trim()}
              >
                <Text style={sheet.saveBtnText}>Add to {location.charAt(0).toUpperCase() + location.slice(1)}</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const sheet = StyleSheet.create({
  overlay:        { flex: 1, justifyContent: 'flex-end' },
  backdrop:       { ...StyleSheet.absoluteFillObject, backgroundColor: Colors.overlay },
  container:      { backgroundColor: Colors.card, borderTopLeftRadius: Radius.xl, borderTopRightRadius: Radius.xl, maxHeight: '85%' },
  handle:         { width: 36, height: 4, borderRadius: 2, backgroundColor: Colors.border, alignSelf: 'center', marginTop: Spacing.sm },
  header:         { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md },
  title:          { fontSize: FontSize.lg, fontWeight: '700', color: Colors.text, fontFamily: 'PlayfairDisplay_700Bold' },
  closeBtn:       { width: 32, height: 32, backgroundColor: Colors.chip, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  scroll:         { padding: Spacing.xl, gap: Spacing.lg, paddingBottom: 40 },
  field:          { gap: 6 },
  label:          { fontSize: FontSize.sm, fontWeight: '700', color: Colors.text },
  input: {
    height: 48, borderRadius: Radius.md, borderWidth: 1.5, borderColor: Colors.border,
    paddingHorizontal: Spacing.md, fontSize: FontSize.base, color: Colors.text,
    backgroundColor: Colors.bg,
  },
  row2:           { flexDirection: 'row', gap: Spacing.sm },
  chipRow:        { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  chip: {
    paddingHorizontal: Spacing.md, paddingVertical: 7, borderRadius: Radius.full,
    backgroundColor: Colors.chip, borderWidth: 1.5, borderColor: Colors.border,
  },
  chipActive:     { backgroundColor: Colors.navy, borderColor: Colors.navy },
  chipText:       { fontSize: FontSize.sm, fontWeight: '600', color: Colors.chipText },
  chipTextActive: { color: '#fff' },
  locRow:         { flexDirection: 'row', gap: Spacing.sm },
  locBtn: {
    flex: 1, paddingVertical: Spacing.md, borderRadius: Radius.md,
    backgroundColor: Colors.chip, borderWidth: 1.5, borderColor: Colors.border,
    alignItems: 'center',
  },
  locBtnActive:   { backgroundColor: Colors.navy, borderColor: Colors.navy },
  locText:        { fontSize: FontSize.sm, fontWeight: '600', color: Colors.chipText },
  locTextActive:  { color: '#fff' },
  savingRow:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.md, paddingVertical: Spacing.md },
  savingText:     { fontSize: FontSize.base, color: Colors.muted },
  saveBtn: {
    backgroundColor: Colors.navy, borderRadius: Radius.full,
    paddingVertical: Spacing.md, alignItems: 'center',
  },
  saveBtnDisabled: { opacity: 0.4 },
  saveBtnText:    { fontSize: FontSize.base, fontWeight: '700', color: '#fff' },
});

// ─── Item row ─────────────────────────────────────────────────────────────────

function FridgeRow({
  item,
  onDelete,
}: {
  item: FridgeItem;
  onDelete: (id: string) => void;
}) {
  const emoji = CATEGORY_EMOJI[item.category ?? ''] ?? '📦';
  const col   = expiryColor(item.expires_at);
  const label = formatExpiry(item.expires_at);
  const qty   = [item.quantity, item.unit].filter(Boolean).join(' ');

  const confirmDelete = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert('Remove item', `Remove "${item.name}" from your ${item.location}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => onDelete(item.id) },
    ]);
  };

  return (
    <View style={[row.wrap, Shadow.sm]}>
      <Text style={row.emoji}>{emoji}</Text>
      <View style={row.info}>
        <Text style={row.name}>{item.name}</Text>
        {qty ? <Text style={row.qty}>{qty}</Text> : null}
      </View>
      {item.expires_at ? (
        <View style={[row.badge, { borderColor: col + '50' }]}>
          <View style={[row.dot, { backgroundColor: col }]} />
          <Text style={[row.badgeText, { color: col }]}>{label}</Text>
        </View>
      ) : null}
      <TouchableOpacity onPress={confirmDelete} style={row.deleteBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        <Ionicons name="trash-outline" size={15} color={Colors.muted} />
      </TouchableOpacity>
    </View>
  );
}

const row = StyleSheet.create({
  wrap: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    marginHorizontal: Spacing.xl, marginBottom: Spacing.sm,
    backgroundColor: Colors.card, borderRadius: Radius.lg,
    padding: Spacing.md, borderWidth: 1, borderColor: Colors.border,
  },
  emoji:      { fontSize: 24, width: 32, textAlign: 'center' },
  info:       { flex: 1 },
  name:       { fontSize: FontSize.base, fontWeight: '600', color: Colors.text },
  qty:        { fontSize: FontSize.xs, color: Colors.muted, marginTop: 2 },
  badge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 8, paddingVertical: 4,
    borderRadius: Radius.full, borderWidth: 1, backgroundColor: '#fff',
  },
  dot:        { width: 6, height: 6, borderRadius: 3 },
  badgeText:  { fontSize: FontSize.xxs, fontWeight: '700' },
  deleteBtn:  { padding: 4 },
});

// ─── What Can I Make card ─────────────────────────────────────────────────────

function CanMakeCard({ recipe, allFridgeItems }: { recipe: RecipeWithIngs; allFridgeItems: FridgeItem[] }) {
  const matched = countIngredientMatches(recipe.ingredientNames, allFridgeItems);
  const total   = recipe.ingredientNames.length;
  const pct     = total > 0 ? Math.round((matched / total) * 100) : 0;

  const totalMins = (recipe.prep_time_minutes ?? 0) + (recipe.cook_time_minutes ?? 0);
  const timeStr   = totalMins > 0 ? `${totalMins} min` : null;

  return (
    <TouchableOpacity
      style={[canMake.card, Shadow.sm]}
      onPress={() => router.push(`/recipe/${recipe.id}`)}
      activeOpacity={0.85}
    >
      <LinearGradient
        colors={['#2C5D69', '#3D7A8A']}
        style={canMake.thumb}
      >
        <Text style={{ fontSize: 28 }}>🍽️</Text>
      </LinearGradient>
      <View style={canMake.info}>
        <Text style={canMake.name} numberOfLines={1}>{recipe.title}</Text>
        {(timeStr || recipe.category) ? (
          <Text style={canMake.meta}>
            {[timeStr, recipe.category].filter(Boolean).join(' · ')}
          </Text>
        ) : null}
        {total > 0 ? (
          <View style={canMake.matchBadge}>
            <Text style={canMake.matchText}>
              ✓ {matched}/{total} ingredients on hand
            </Text>
          </View>
        ) : (
          <View style={canMake.matchBadge}>
            <Text style={canMake.matchText}>No ingredients listed yet</Text>
          </View>
        )}
      </View>
      {pct >= 70 && (
        <View style={canMake.readyBadge}>
          <Text style={canMake.readyText}>Ready!</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const canMake = StyleSheet.create({
  card: {
    flexDirection: 'row', backgroundColor: Colors.card, borderRadius: Radius.lg,
    overflow: 'hidden', borderWidth: 1, borderColor: Colors.border,
  },
  thumb:      { width: 90, height: 90, justifyContent: 'center', alignItems: 'center' },
  info:       { flex: 1, padding: Spacing.md, justifyContent: 'center', gap: 4 },
  name:       { fontSize: FontSize.base, fontWeight: '700', color: Colors.text },
  meta:       { fontSize: FontSize.xs, color: Colors.muted },
  matchBadge: { alignSelf: 'flex-start', backgroundColor: '#EAF2E6', paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.full },
  matchText:  { fontSize: FontSize.xxs, fontWeight: '700', color: Colors.success },
  readyBadge: { position: 'absolute', top: 8, right: 8, backgroundColor: Colors.sage, paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.full },
  readyText:  { fontSize: FontSize.xxs, fontWeight: '700', color: '#fff' },
});

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function FridgeScreen() {
  const { profile, household } = useAuth();

  const [activeTab,  setActiveTab]  = useState(0);
  const [fridgeItems, setFridgeItems] = useState<FridgeItem[]>([]);
  const [pantryItems, setPantryItems] = useState<FridgeItem[]>([]);
  const [recipes,    setRecipes]    = useState<RecipeWithIngs[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [showAdd,    setShowAdd]    = useState(false);

  const load = useCallback(async () => {
    if (!household?.id) return;
    setLoading(true);

    const [fridgeRes, pantryRes, recipeRes] = await Promise.all([
      getFridgeItems(household.id, 'fridge'),
      // Combine pantry + freezer under the Pantry tab
      getFridgeItems(household.id),
      getRecipesWithIngredients(household.id),
    ]);

    setFridgeItems(fridgeRes.items.filter(i => i.location === 'fridge'));
    setPantryItems(pantryRes.items.filter(i => i.location === 'pantry' || i.location === 'freezer'));
    setRecipes(recipeRes.recipes);
    setLoading(false);
  }, [household?.id]);

  useEffect(() => { load(); }, [load]);

  // All fridge + pantry combined, for ingredient matching
  const allItems = [...fridgeItems, ...pantryItems];

  const handleDelete = async (id: string) => {
    const { error } = await deleteFridgeItem(id);
    if (error) { Alert.alert('Error', error); return; }
    setFridgeItems(prev => prev.filter(i => i.id !== id));
    setPantryItems(prev => prev.filter(i => i.id !== id));
  };

  const handleSaved = (item: FridgeItem) => {
    if (item.location === 'fridge') {
      setFridgeItems(prev => [item, ...prev]);
    } else {
      setPantryItems(prev => [item, ...prev]);
    }
  };

  const activeItems  = activeTab === 0 ? fridgeItems : pantryItems;
  const sections     = groupByCategory(activeItems);

  const expiringSoon = activeItems.filter(i => {
    const days = daysUntilExpiry(i.expires_at);
    return days !== null && days >= 0 && days <= 3;
  });

  const defaultLocation: FridgeItem['location'] = activeTab === 0 ? 'fridge' : 'pantry';

  const recipesSorted = [...recipes].sort((a, b) =>
    countIngredientMatches(b.ingredientNames, allItems) -
    countIngredientMatches(a.ingredientNames, allItems)
  );

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Fridge & Pantry</Text>
        <TouchableOpacity style={styles.scanBtn} onPress={() => router.push('/add-recipe')}>
          <Ionicons name="scan-outline" size={20} color={Colors.navy} />
          <Text style={styles.scanText}>Scan</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabRow}>
        {TABS.map((tab, i) => (
          <TouchableOpacity
            key={tab}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setActiveTab(i); }}
            style={[styles.tab, activeTab === i && styles.tabActive]}
          >
            <Text style={[styles.tabText, activeTab === i && styles.tabTextActive]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={Colors.navy} />
        </View>
      ) : (
        <>
          {/* ── Tab 0 & 1: Fridge / Pantry ── */}
          {activeTab < 2 && (
            activeItems.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyEmoji}>{activeTab === 0 ? '🧊' : '🥫'}</Text>
                <Text style={styles.emptyTitle}>{activeTab === 0 ? 'Fridge is empty' : 'Pantry is empty'}</Text>
                <Text style={styles.emptySub}>
                  {activeTab === 0
                    ? "Add what you have — we'll tell you what to cook"
                    : 'Add staples like olive oil, pasta, and spices'}
                </Text>
                <TouchableOpacity
                  style={styles.emptyBtn}
                  onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setShowAdd(true); }}
                >
                  <Ionicons name="add" size={16} color="#fff" />
                  <Text style={styles.emptyBtnText}>Add items</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <SectionList
                sections={sections}
                keyExtractor={item => item.id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 100 }}
                ListHeaderComponent={
                  expiringSoon.length > 0 ? (
                    <View style={[styles.expiryBanner, Shadow.sm]}>
                      <Ionicons name="warning-outline" size={18} color={Colors.warning} />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.expiryTitle}>Use these soon</Text>
                        <Text style={styles.expirySub}>
                          {expiringSoon.map(i => i.name).join(', ')}
                        </Text>
                      </View>
                    </View>
                  ) : null
                }
                renderSectionHeader={({ section }) => (
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>
                      {CATEGORY_EMOJI[section.title] ?? '📦'} {section.title}
                    </Text>
                  </View>
                )}
                renderItem={({ item }) => (
                  <FridgeRow item={item} onDelete={handleDelete} />
                )}
              />
            )
          )}

          {/* ── Tab 2: What Can I Make ── */}
          {activeTab === 2 && (
            recipes.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyEmoji}>🍳</Text>
                <Text style={styles.emptyTitle}>No recipes yet</Text>
                <Text style={styles.emptySub}>Add some recipes first, then we'll match them to your fridge</Text>
                <TouchableOpacity style={styles.emptyBtn} onPress={() => router.push('/add-recipe')}>
                  <Ionicons name="add" size={16} color="#fff" />
                  <Text style={styles.emptyBtnText}>Add a recipe</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <ScrollView contentContainerStyle={{ padding: Spacing.xl, gap: Spacing.md, paddingBottom: 100 }}>
                <Text style={styles.canMakeTitle}>Based on what you have…</Text>
                {allItems.length === 0 && (
                  <View style={styles.noFridgeNote}>
                    <Ionicons name="information-circle-outline" size={16} color={Colors.navyMid} />
                    <Text style={styles.noFridgeText}>
                      Add items to your fridge or pantry to see ingredient matches
                    </Text>
                  </View>
                )}
                {recipesSorted.map(r => (
                  <CanMakeCard key={r.id} recipe={r} allFridgeItems={allItems} />
                ))}
              </ScrollView>
            )
          )}
        </>
      )}

      {/* FAB — only show on Fridge/Pantry tabs */}
      {activeTab < 2 && (
        <TouchableOpacity
          style={[styles.fab, Shadow.lg]}
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setShowAdd(true); }}
        >
          <Ionicons name="add" size={26} color="#fff" />
        </TouchableOpacity>
      )}

      {/* Add Item Sheet */}
      {household?.id && profile?.id && (
        <AddItemSheet
          visible={showAdd}
          defaultLocation={defaultLocation}
          householdId={household.id}
          addedBy={profile.id}
          onClose={() => setShowAdd(false)}
          onSaved={handleSaved}
        />
      )}
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe:         { flex: 1, backgroundColor: Colors.bg },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.xl, paddingTop: Spacing.xl, paddingBottom: Spacing.lg,
  },
  title:        { fontSize: FontSize.xl, fontWeight: '700', color: Colors.text, fontFamily: 'PlayfairDisplay_700Bold' },
  scanBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: Colors.chip, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
    borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.border,
  },
  scanText:     { fontSize: FontSize.sm, fontWeight: '700', color: Colors.navy },
  tabRow: {
    flexDirection: 'row', marginHorizontal: Spacing.xl, marginBottom: Spacing.lg,
    backgroundColor: Colors.chip, borderRadius: Radius.md, padding: 3,
  },
  tab:          { flex: 1, paddingVertical: Spacing.sm, borderRadius: Radius.md - 2, alignItems: 'center' },
  tabActive:    { backgroundColor: '#fff', ...Shadow.sm },
  tabText:      { fontSize: FontSize.sm, fontWeight: '600', color: Colors.muted },
  tabTextActive:{ color: Colors.navy },
  loadingWrap:  { flex: 1, justifyContent: 'center', alignItems: 'center' },
  expiryBanner: {
    flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.md,
    marginHorizontal: Spacing.xl, marginBottom: Spacing.md,
    backgroundColor: '#FFF8EC', borderRadius: Radius.lg,
    padding: Spacing.lg, borderWidth: 1, borderColor: '#F0D8A0',
  },
  expiryTitle:  { fontSize: FontSize.sm, fontWeight: '700', color: Colors.text },
  expirySub:    { fontSize: FontSize.xs, color: Colors.muted, marginTop: 2 },
  sectionHeader:{
    paddingHorizontal: Spacing.xl, paddingTop: Spacing.md, paddingBottom: Spacing.sm,
    backgroundColor: Colors.bg,
  },
  sectionTitle: { fontSize: FontSize.xs, fontWeight: '800', color: Colors.muted, textTransform: 'uppercase', letterSpacing: 0.8 },
  emptyState:   { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md, padding: Spacing.xl },
  emptyEmoji:   { fontSize: 56 },
  emptyTitle:   { fontSize: FontSize.xl, fontWeight: '700', color: Colors.text },
  emptySub:     { fontSize: FontSize.base, color: Colors.muted, textAlign: 'center' },
  emptyBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: Colors.navy, paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md,
    borderRadius: Radius.full, marginTop: Spacing.sm,
  },
  emptyBtnText: { fontSize: FontSize.base, fontWeight: '700', color: '#fff' },
  canMakeTitle: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.text, fontFamily: 'PlayfairDisplay_700Bold', marginBottom: Spacing.sm },
  noFridgeNote: {
    flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm,
    backgroundColor: Colors.chip, borderRadius: Radius.lg,
    padding: Spacing.md, borderWidth: 1, borderColor: Colors.border,
    marginBottom: Spacing.sm,
  },
  noFridgeText: { flex: 1, fontSize: FontSize.sm, color: Colors.navyMid, lineHeight: 18 },
  fab: {
    position: 'absolute', right: Spacing.xl, bottom: 24,
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: Colors.navy, justifyContent: 'center', alignItems: 'center',
  },
});
