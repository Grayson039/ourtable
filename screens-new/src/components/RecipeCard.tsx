import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, FontSize, Shadow } from '@/constants/theme';
import { Recipe } from '@/types';

// ─── Derived helpers ──────────────────────────────────────────────────────────

const CATEGORY_COLORS: Record<string, [string, string]> = {
  Dinner:    ['#7A1424', '#FC3E57'],
  Breakfast: ['#E8A33D', '#B9762A'],
  Lunch:     ['#5BC18A', '#2F7A56'],
  Dessert:   ['#C1272D', '#7A1620'],
  Snacks:    ['#8E4B6B', '#5C2F45'],
  default:   ['#FC3E57', '#5BC18A'],
};

export function categoryColors(category: string | null): [string, string] {
  return CATEGORY_COLORS[category ?? ''] ?? CATEGORY_COLORS.default;
}

export function formatCookTime(prep?: number | null, cook?: number | null): string {
  const total = (prep ?? 0) + (cook ?? 0);
  if (!total) return '—';
  if (total >= 60) return `${Math.floor(total / 60)}h ${total % 60 > 0 ? `${total % 60}m` : ''}`.trim();
  return `${total}m`;
}

// ─── Large Card ───────────────────────────────────────────────────────────────

interface LargeCardProps {
  recipe: Recipe;
  tags?: string[];
  savedByName?: string;
  onPress: () => void;
}

export function RecipeCardLarge({ recipe, tags = [], savedByName, onPress }: LargeCardProps) {
  const [c1, c2] = categoryColors(recipe.category);
  const time = formatCookTime(recipe.prep_time_minutes, recipe.cook_time_minutes);

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9} style={[styles.large, Shadow.md]}>
      <LinearGradient
        colors={[c1, c2]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.largeGrad}
      >
        {/* Top row */}
        <View style={styles.largeTop}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{recipe.category ?? 'Recipe'}</Text>
          </View>
          {recipe.rating != null && (
            <View style={styles.ratingBadge}>
              <Ionicons name="star" size={10} color={Colors.gold} />
              <Text style={styles.ratingText}>{recipe.rating}</Text>
            </View>
          )}
        </View>

        {/* Bottom */}
        <View style={styles.largeBottom}>
          {tags.slice(0, 2).map(tag => (
            <View key={tag} style={styles.dietChip}>
              <Text style={styles.dietChipText}>{tag}</Text>
            </View>
          ))}
          <Text style={styles.largeTitle}>{recipe.title}</Text>
          <View style={styles.largeMeta}>
            <Ionicons name="time-outline" size={13} color="rgba(255,255,255,0.7)" />
            <Text style={styles.largeMetaText}>{time}</Text>
            {recipe.servings != null && (
              <>
                <Text style={styles.largeDot}>·</Text>
                <Ionicons name="people-outline" size={13} color="rgba(255,255,255,0.7)" />
                <Text style={styles.largeMetaText}>{recipe.servings} servings</Text>
              </>
            )}
          </View>
          {savedByName && (
            <Text style={styles.savedBy}>Saved by {savedByName}</Text>
          )}
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

// ─── Small Card ───────────────────────────────────────────────────────────────

interface SmallCardProps {
  recipe: Recipe;
  tags?: string[];
  onPress: () => void;
}

export function RecipeCardSmall({ recipe, tags = [], onPress }: SmallCardProps) {
  const [c1, c2] = categoryColors(recipe.category);
  const time = formatCookTime(recipe.prep_time_minutes, recipe.cook_time_minutes);

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.88} style={[styles.small, Shadow.sm]}>
      <LinearGradient
        colors={[c1, c2]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.smallThumb}
      >
        <Text style={styles.smallEmoji}>🍽️</Text>
      </LinearGradient>
      <View style={styles.smallInfo}>
        <Text style={styles.smallTitle} numberOfLines={1}>{recipe.title}</Text>
        <Text style={styles.smallMeta}>{time}{recipe.category ? ` · ${recipe.category}` : ''}</Text>
        {tags.length > 0 && (
          <View style={styles.smallTags}>
            {tags.slice(0, 2).map(tag => (
              <View key={tag} style={styles.smallTag}>
                <Text style={styles.smallTagText}>{tag}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  large: { borderRadius: Radius.xl, overflow: 'hidden', height: 240, marginBottom: Spacing.md },
  largeGrad: { flex: 1, padding: Spacing.lg, justifyContent: 'space-between' },
  largeTop: { flexDirection: 'row', justifyContent: 'space-between' },
  categoryBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 10,
    paddingVertical: 4, borderRadius: Radius.full,
  },
  categoryText: { fontSize: FontSize.xs, fontWeight: '700', color: '#fff', textTransform: 'uppercase', letterSpacing: 0.8 },
  ratingBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: 'rgba(0,0,0,0.3)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: Radius.full,
  },
  ratingText: { fontSize: FontSize.xs, color: '#fff', fontWeight: '700' },
  largeBottom: { gap: 6 },
  dietChip: {
    alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.full,
  },
  dietChipText: { fontSize: FontSize.xxs, fontWeight: '700', color: 'rgba(255,255,255,0.9)' },
  largeTitle: { fontSize: FontSize.xl, fontWeight: '700', color: '#fff', lineHeight: 28 },
  largeMeta: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  largeMetaText: { fontSize: FontSize.xs, color: 'rgba(255,255,255,0.75)' },
  largeDot: { fontSize: FontSize.xs, color: 'rgba(255,255,255,0.4)' },
  savedBy: { fontSize: FontSize.xs, color: 'rgba(255,255,255,0.55)', marginTop: 2 },
  small: {
    flexDirection: 'row', backgroundColor: Colors.card, borderRadius: Radius.lg,
    overflow: 'hidden', marginBottom: Spacing.sm, borderWidth: 1, borderColor: Colors.border,
  },
  smallThumb: { width: 80, height: 80, justifyContent: 'center', alignItems: 'center' },
  smallEmoji: { fontSize: 28 },
  smallInfo: { flex: 1, padding: Spacing.md, justifyContent: 'center', gap: 3 },
  smallTitle: { fontSize: FontSize.base, fontWeight: '700', color: Colors.text },
  smallMeta: { fontSize: FontSize.xs, color: Colors.muted },
  smallTags: { flexDirection: 'row', gap: 4, marginTop: 3 },
  smallTag: { backgroundColor: Colors.chip, paddingHorizontal: 7, paddingVertical: 2, borderRadius: Radius.full },
  smallTagText: { fontSize: FontSize.xxs, color: Colors.chipText, fontWeight: '600' },
});
