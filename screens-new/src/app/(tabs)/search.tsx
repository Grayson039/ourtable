import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, TextInput,
  ScrollView, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, Spacing, Radius, Shadow } from '@/constants/theme';
import { RecipeCardSmall } from '@/components/RecipeCard';
import { useAuth } from '@/context/AuthContext';
import { searchRecipes, getRecipes } from '@/lib/recipes';
import { Recipe } from '@/types';

const FILTER_TAGS = ['All', 'Dinner', 'Breakfast', 'Lunch', 'Dessert', 'Snacks'];

export default function SearchScreen() {
  const { household } = useAuth();

  const [query, setQuery]         = useState('');
  const [activeTag, setActiveTag] = useState('All');
  const [results, setResults]     = useState<Recipe[]>([]);
  const [recent, setRecent]       = useState<Recipe[]>([]);  // most recent 5 for "trending"
  const [searching, setSearching] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load recent recipes once for the idle state
  useEffect(() => {
    if (!household?.id) return;
    getRecipes(household.id).then(({ recipes }) => setRecent(recipes.slice(0, 5)));
  }, [household?.id]);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!query.trim() || !household?.id) {
      setResults([]);
      setSearching(false);
      return;
    }

    setSearching(true);
    debounceRef.current = setTimeout(async () => {
      const { recipes } = await searchRecipes(household.id, query.trim(), activeTag);
      setResults(recipes);
      setSearching(false);
    }, 350);

    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query, activeTag, household?.id]);

  const handleClear = () => { setQuery(''); setResults([]); };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Search bar */}
      <View style={styles.searchWrap}>
        <View style={[styles.searchBar, Shadow.sm]}>
          <Ionicons name="search-outline" size={18} color={Colors.muted} />
          <TextInput
            style={styles.input}
            placeholder="Search recipes, ingredients, tags…"
            placeholderTextColor={Colors.muted}
            value={query}
            onChangeText={setQuery}
            autoFocus
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={handleClear}>
              <Ionicons name="close-circle" size={18} color={Colors.muted} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.cancelBtn}>Cancel</Text>
        </TouchableOpacity>
      </View>

      {/* Filter pills */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pillRow}>
        {FILTER_TAGS.map(tag => (
          <TouchableOpacity
            key={tag}
            onPress={() => setActiveTag(tag)}
            style={[styles.pill, activeTag === tag && styles.pillActive]}
          >
            <Text style={[styles.pillText, activeTag === tag && styles.pillTextActive]}>{tag}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        {searching ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator color={Colors.navy} />
          </View>
        ) : query.length === 0 ? (
          /* Idle state — show recent recipes */
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {recent.length > 0 ? 'Recently saved' : 'Your library is empty'}
            </Text>
            {recent.length > 0 ? (
              recent.map(r => (
                <RecipeCardSmall
                  key={r.id}
                  recipe={r}
                  onPress={() => router.push(`/recipe/${r.id}`)}
                />
              ))
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyEmoji}>🍽️</Text>
                <Text style={styles.emptySub}>Import your first recipe to get started</Text>
                <TouchableOpacity style={styles.importBtn} onPress={() => router.push('/add-recipe')}>
                  <Text style={styles.importBtnText}>Import a recipe</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ) : results.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{results.length} result{results.length !== 1 ? 's' : ''}</Text>
            {results.map(r => (
              <RecipeCardSmall
                key={r.id}
                recipe={r}
                onPress={() => router.push(`/recipe/${r.id}`)}
              />
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🔍</Text>
            <Text style={styles.emptyTitle}>No results for "{query}"</Text>
            <Text style={styles.emptySub}>Try a different name or tag</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  searchWrap: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    paddingHorizontal: Spacing.xl, paddingTop: Spacing.xl, paddingBottom: Spacing.md,
  },
  searchBar: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    backgroundColor: Colors.card, borderRadius: Radius.full,
    paddingHorizontal: Spacing.lg, height: 46,
    borderWidth: 1, borderColor: Colors.border,
  },
  input: { flex: 1, fontSize: FontSize.base, color: Colors.text },
  cancelBtn: { fontSize: FontSize.base, fontWeight: '600', color: Colors.navyMid },
  pillRow: { paddingHorizontal: Spacing.xl, gap: Spacing.sm, paddingBottom: Spacing.md },
  pill: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, borderRadius: Radius.full, backgroundColor: Colors.chip },
  pillActive: { backgroundColor: Colors.navy },
  pillText: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.chipText },
  pillTextActive: { color: '#fff' },
  section: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.sm },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.text, marginBottom: Spacing.md, fontFamily: 'PlayfairDisplay_700Bold' },
  loadingWrap: { paddingTop: 60, alignItems: 'center' },
  emptyState: { alignItems: 'center', paddingTop: 60, gap: Spacing.sm },
  emptyEmoji: { fontSize: 48, marginBottom: Spacing.sm },
  emptyTitle: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.text },
  emptySub: { fontSize: FontSize.base, color: Colors.muted },
  importBtn: {
    marginTop: Spacing.md, backgroundColor: Colors.navy,
    paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md, borderRadius: Radius.full,
  },
  importBtnText: { fontSize: FontSize.base, fontWeight: '700', color: '#fff' },
});
