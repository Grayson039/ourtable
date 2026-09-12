import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, Spacing, Radius, Shadow } from '@/constants/theme';
import { RecipeCardLarge, RecipeCardSmall } from '@/components/RecipeCard';
import { useAuth } from '@/context/AuthContext';
import { getRecipes } from '@/lib/recipes';
import { Recipe } from '@/types';

const CATEGORIES = ['All', 'Dinner', 'Breakfast', 'Lunch', 'Dessert', 'Snacks'];

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function HomeScreen() {
  const { profile, household } = useAuth();

  const [recipes, setRecipes]         = useState<Recipe[]>([]);
  const [loading, setLoading]         = useState(true);
  const [activeCategory, setCategory] = useState('All');

  const firstName = profile?.name?.split(' ')[0] ?? 'Chef';

  const load = useCallback(async () => {
    if (!household?.id) return;
    setLoading(true);
    const { recipes: fetched } = await getRecipes(household.id);
    setRecipes(fetched);
    setLoading(false);
  }, [household?.id]);

  useEffect(() => { load(); }, [load]);

  const filtered = activeCategory === 'All'
    ? recipes
    : recipes.filter(r => r.category === activeCategory);

  const featured = filtered[0] ?? null;
  const rest     = filtered.slice(1);

  const members = household?.members ?? [];

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{getGreeting()}, {firstName} 👋</Text>
            <Text style={styles.sub}>What's on the table tonight?</Text>
          </View>
          <View style={styles.headerRight}>
            {/* Household avatars */}
            {members.length > 0 && (
              <View style={styles.avatarStack}>
                {members.slice(0, 3).map((m, i) => (
                  <View key={m.id} style={[styles.avatar, { marginLeft: i > 0 ? -10 : 0, zIndex: 10 - i }]}>
                    <Text style={styles.avatarText}>{m.name[0].toUpperCase()}</Text>
                  </View>
                ))}
              </View>
            )}
            <TouchableOpacity style={styles.notifBtn}>
              <Ionicons name="notifications-outline" size={22} color={Colors.navy} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Search bar */}
        <TouchableOpacity
          style={[styles.searchBar, Shadow.sm]}
          onPress={() => router.push('/(tabs)/search')}
          activeOpacity={0.85}
        >
          <Ionicons name="search-outline" size={18} color={Colors.muted} />
          <Text style={styles.searchPlaceholder}>Search recipes, ingredients…</Text>
        </TouchableOpacity>

        {/* Category pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pillRow}>
          {CATEGORIES.map(cat => (
            <TouchableOpacity
              key={cat}
              onPress={() => setCategory(cat)}
              style={[styles.pill, activeCategory === cat && styles.pillActive]}
            >
              <Text style={[styles.pillText, activeCategory === cat && styles.pillTextActive]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {loading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="large" color={Colors.navy} />
          </View>
        ) : recipes.length === 0 ? (
          <>
            {/* Empty state */}
            <View style={styles.emptyWrap}>
              <Text style={styles.emptyEmoji}>🍽️</Text>
              <Text style={styles.emptyTitle}>No recipes yet</Text>
              <Text style={styles.emptySub}>Import your first recipe below</Text>
            </View>
          </>
        ) : (
          <>
            {/* Featured */}
            {featured && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Tonight's pick</Text>
                  <TouchableOpacity onPress={() => router.push('/(tabs)/search')}>
                    <Text style={styles.seeAll}>See all</Text>
                  </TouchableOpacity>
                </View>
                <RecipeCardLarge
                  recipe={featured}
                  savedByName={profile?.name ?? undefined}
                  onPress={() => router.push(`/recipe/${featured.id}`)}
                />
              </View>
            )}

            {/* Recently saved */}
            {rest.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Recently saved</Text>
                {rest.map(r => (
                  <RecipeCardSmall
                    key={r.id}
                    recipe={r}
                    onPress={() => router.push(`/recipe/${r.id}`)}
                  />
                ))}
              </View>
            )}
          </>
        )}

        {/* Import row — always visible */}
        <TouchableOpacity
          style={[styles.addRow, Shadow.sm]}
          onPress={() => router.push('/add-recipe')}
          activeOpacity={0.85}
        >
          <View style={styles.addIconWrap}>
            <Ionicons name="add" size={20} color="#fff" />
          </View>
          <View>
            <Text style={styles.addTitle}>Import a recipe</Text>
            <Text style={styles.addSub}>From URL, TikTok, Instagram, or type it in</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={Colors.muted} style={{ marginLeft: 'auto' }} />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    paddingHorizontal: Spacing.xl, paddingTop: Spacing.xl, paddingBottom: Spacing.lg,
  },
  greeting: { fontSize: FontSize.xl, fontWeight: '700', color: Colors.text, fontFamily: 'PlayfairDisplay_700Bold' },
  sub: { fontSize: FontSize.base, color: Colors.muted, marginTop: 3 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  avatarStack: { flexDirection: 'row', alignItems: 'center' },
  avatar: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: Colors.navy, justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: Colors.bg,
  },
  avatarText: { fontSize: FontSize.xs, fontWeight: '700', color: '#fff' },
  notifBtn: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    marginHorizontal: Spacing.xl, height: 48,
    backgroundColor: Colors.card, borderRadius: Radius.full,
    paddingHorizontal: Spacing.lg, borderWidth: 1, borderColor: Colors.border,
    marginBottom: Spacing.lg,
  },
  searchPlaceholder: { fontSize: FontSize.base, color: Colors.muted },
  pillRow: { paddingHorizontal: Spacing.xl, gap: Spacing.sm, marginBottom: Spacing.lg },
  pill: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, borderRadius: Radius.full, backgroundColor: Colors.chip },
  pillActive: { backgroundColor: Colors.navy },
  pillText: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.chipText },
  pillTextActive: { color: '#fff' },
  loadingWrap: { height: 200, justifyContent: 'center', alignItems: 'center' },
  emptyWrap: { alignItems: 'center', paddingVertical: Spacing.xxl, gap: Spacing.sm },
  emptyEmoji: { fontSize: 48 },
  emptyTitle: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.text },
  emptySub: { fontSize: FontSize.base, color: Colors.muted },
  section: { paddingHorizontal: Spacing.xl, marginBottom: Spacing.lg },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.text, fontFamily: 'PlayfairDisplay_700Bold' },
  seeAll: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.navyMid },
  addRow: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    marginHorizontal: Spacing.xl, marginBottom: Spacing.lg,
    backgroundColor: Colors.card, borderRadius: Radius.lg,
    padding: Spacing.lg, borderWidth: 1, borderColor: Colors.border,
  },
  addIconWrap: { width: 36, height: 36, borderRadius: 10, backgroundColor: Colors.navy, justifyContent: 'center', alignItems: 'center' },
  addTitle: { fontSize: FontSize.base, fontWeight: '700', color: Colors.text },
  addSub: { fontSize: FontSize.xs, color: Colors.muted, marginTop: 2 },
});
