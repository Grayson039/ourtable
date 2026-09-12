import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TouchableOpacity, Dimensions, ActivityIndicator, RefreshControl,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, FontSize, Spacing, Radius, Shadow } from '@/constants/theme';
import { categoryColors, formatCookTime } from '@/components/RecipeCard';
import { useAuth } from '@/context/AuthContext';
import { getRecipes } from '@/lib/recipes';
import { Recipe } from '@/types';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - Spacing.xl * 2 - Spacing.md) / 2;

const CATEGORIES = ['All', 'Breakfast', 'Lunch', 'Dinner', 'Dessert', 'Snacks', 'Other'];

export default function RecipeBookScreen() {
  const { household } = useAuth();

  const [recipes, setRecipes]       = useState<Recipe[]>([]);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeCategory, setActive] = useState('All');

  const load = useCallback(async (isRefresh = false) => {
    if (!household?.id) return;
    if (!isRefresh) setLoading(true);
    const { recipes: data } = await getRecipes(household.id);
    setRecipes(data);
    setLoading(false);
    setRefreshing(false);
  }, [household?.id]);

  // Reload whenever this tab comes into focus (new recipe added, etc.)
  useFocusEffect(useCallback(() => { load(); }, [load]));

  const onRefresh = () => { setRefreshing(true); load(true); };

  const filtered = activeCategory === 'All'
    ? recipes
    : recipes.filter(r => r.category === activeCategory);

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Recipe Book</Text>
          <Text style={styles.headerSub}>
            {recipes.length === 0 ? 'No recipes yet' : `${recipes.length} recipe${recipes.length !== 1 ? 's' : ''} saved`}
          </Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={() => router.push('/add-recipe')}>
          <Ionicons name="add" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Category filter pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.pillRow}
      >
        {CATEGORIES.map(cat => (
          <TouchableOpacity
            key={cat}
            onPress={() => setActive(cat)}
            style={[styles.pill, activeCategory === cat && styles.pillActive]}
          >
            <Text style={[styles.pillText, activeCategory === cat && styles.pillTextActive]}>
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.navy} />
        </View>
      ) : recipes.length === 0 ? (
        <EmptyState />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.grid}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.navy} />}
        >
          {filtered.length === 0 ? (
            <View style={styles.noResults}>
              <Text style={styles.noResultsEmoji}>🍽️</Text>
              <Text style={styles.noResultsText}>No {activeCategory.toLowerCase()} recipes yet</Text>
            </View>
          ) : (
            filtered.map(r => (
              <RecipeBookCard
                key={r.id}
                recipe={r}
                onPress={() => router.push(`/recipe/${r.id}`)}
              />
            ))
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

// ── Recipe Book Card (2-col grid) ─────────────────────────────────────────────

function RecipeBookCard({ recipe, onPress }: { recipe: Recipe; onPress: () => void }) {
  const [c1, c2] = categoryColors(recipe.category);
  const time = formatCookTime(recipe.prep_time_minutes, recipe.cook_time_minutes);

  return (
    <TouchableOpacity
      style={[styles.card, Shadow.sm]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      {/* Color hero */}
      <LinearGradient colors={[c1, c2]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.cardHero}>
        <Text style={styles.cardEmoji}>
          {recipe.category === 'Breakfast' ? '🍳'
            : recipe.category === 'Lunch' ? '🥗'
            : recipe.category === 'Dinner' ? '🍽️'
            : recipe.category === 'Dessert' ? '🍰'
            : recipe.category === 'Snacks' ? '🍎'
            : '🥘'}
        </Text>
        {recipe.rating != null && recipe.rating > 0 && (
          <View style={styles.ratingBadge}>
            <Ionicons name="star" size={9} color={Colors.gold} />
            <Text style={styles.ratingText}>{recipe.rating}</Text>
          </View>
        )}
      </LinearGradient>

      {/* Info */}
      <View style={styles.cardBody}>
        <Text style={styles.cardTitle} numberOfLines={2}>{recipe.title}</Text>
        <View style={styles.cardMeta}>
          {time ? (
            <View style={styles.metaRow}>
              <Ionicons name="time-outline" size={11} color={Colors.muted} />
              <Text style={styles.metaText}>{time}</Text>
            </View>
          ) : null}
          {recipe.servings != null && (
            <View style={styles.metaRow}>
              <Ionicons name="people-outline" size={11} color={Colors.muted} />
              <Text style={styles.metaText}>{recipe.servings}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <View style={styles.centered}>
      <Text style={{ fontSize: 64, marginBottom: Spacing.lg }}>📖</Text>
      <Text style={styles.emptyTitle}>Your recipe book is empty</Text>
      <Text style={styles.emptySub}>Import or create your first recipe{'\n'}to fill your cookbook.</Text>
      <TouchableOpacity style={styles.emptyBtn} onPress={() => router.push('/add-recipe')}>
        <Ionicons name="add" size={18} color="#fff" />
        <Text style={styles.emptyBtnText}>Add first recipe</Text>
      </TouchableOpacity>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.md,
  },
  headerTitle: {
    fontSize: FontSize.xxl,
    fontWeight: '700',
    color: Colors.text,
    fontFamily: 'PlayfairDisplay_700Bold',
  },
  headerSub: { fontSize: FontSize.sm, color: Colors.muted, marginTop: 2 },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.navy,
    justifyContent: 'center',
    alignItems: 'center',
  },

  pillRow: {
    paddingHorizontal: Spacing.xl,
    gap: Spacing.sm,
    paddingBottom: Spacing.md,
  },
  pill: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    backgroundColor: Colors.chip,
  },
  pillActive: { backgroundColor: Colors.navy },
  pillText: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.chipText },
  pillTextActive: { color: '#fff' },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.xl,
    gap: Spacing.md,
    paddingBottom: 120,
  },

  card: {
    width: CARD_WIDTH,
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardHero: {
    height: 110,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  cardEmoji: { fontSize: 36 },
  ratingBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
  ratingText: { fontSize: FontSize.xxs, fontWeight: '700', color: '#fff' },

  cardBody: { padding: Spacing.md, gap: 6 },
  cardTitle: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: Colors.text,
    lineHeight: 18,
  },
  cardMeta: { flexDirection: 'row', gap: Spacing.sm, flexWrap: 'wrap' },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  metaText: { fontSize: FontSize.xxs, color: Colors.muted },

  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.xl },
  noResults: { width: '100%', alignItems: 'center', paddingTop: 60, gap: Spacing.sm },
  noResultsEmoji: { fontSize: 48 },
  noResultsText: { fontSize: FontSize.base, color: Colors.muted },

  emptyTitle: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.text,
    fontFamily: 'PlayfairDisplay_700Bold',
    textAlign: 'center',
  },
  emptySub: { fontSize: FontSize.base, color: Colors.muted, textAlign: 'center', lineHeight: 22 },
  emptyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.navy,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: Radius.full,
    marginTop: Spacing.lg,
  },
  emptyBtnText: { fontSize: FontSize.base, fontWeight: '700', color: '#fff' },
});
