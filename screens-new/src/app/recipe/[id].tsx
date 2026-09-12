import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TouchableOpacity, Dimensions, ActivityIndicator, Alert,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors, FontSize, Spacing, Radius, Shadow } from '@/constants/theme';
import { categoryColors, formatCookTime } from '@/components/RecipeCard';
import { getRecipeById, addIngredientsToGrocery, rateRecipe } from '@/lib/recipes';
import { getOrCreateGroceryList } from '@/lib/grocery';
import { useAuth } from '@/context/AuthContext';
import { RecipeWithDetails, Ingredient, Instruction, HouseholdWithMembers } from '@/types';

// ── Dietary conflict detection ────────────────────────────────────────────────

const CONFLICT_KEYWORDS: Record<string, string[]> = {
  vegetarian:   ['chicken', 'beef', 'pork', 'fish', 'salmon', 'tuna', 'shrimp', 'seafood', 'bacon', 'ham', 'turkey', 'lamb', 'sausage', 'anchovy', 'prosciutto', 'pancetta', 'lard', 'pepperoni'],
  vegan:        ['chicken', 'beef', 'pork', 'fish', 'salmon', 'tuna', 'shrimp', 'seafood', 'bacon', 'ham', 'turkey', 'lamb', 'sausage', 'anchovy', 'milk', 'cheese', 'butter', 'cream', 'egg', 'eggs', 'honey', 'yogurt', 'parmesan', 'ghee', 'whey'],
  'gluten-free':['flour', 'wheat', 'bread', 'pasta', 'soy sauce', 'barley', 'rye', 'breadcrumbs', 'panko', 'couscous', 'crouton'],
  'dairy-free': ['milk', 'cheese', 'butter', 'cream', 'yogurt', 'whey', 'ghee', 'parmesan', 'mozzarella', 'cheddar', 'brie', 'ricotta', 'mascarpone'],
  'nut-free':   ['almond', 'walnut', 'pecan', 'cashew', 'pistachio', 'peanut', 'hazelnut', 'macadamia', 'pine nut', 'nut butter'],
  halal:        ['pork', 'bacon', 'ham', 'alcohol', 'wine', 'beer', 'lard', 'prosciutto'],
  kosher:       ['pork', 'bacon', 'ham', 'shrimp', 'crab', 'lobster', 'clam', 'oyster', 'shellfish'],
};

function getConflicts(ingredients: Ingredient[], household: HouseholdWithMembers | null): string[] {
  if (!household || ingredients.length === 0) return [];
  const names = ingredients.map(i => i.name.toLowerCase());
  const conflicts: string[] = [];
  for (const member of household.members) {
    for (const pref of member.dietary_preferences) {
      const keywords = CONFLICT_KEYWORDS[pref] ?? [];
      if (keywords.some(kw => names.some(n => n.includes(kw)))) {
        if (!conflicts.includes(member.name)) conflicts.push(member.name);
        break;
      }
    }
  }
  return conflicts;
}

const { width } = Dimensions.get('window');
const TABS = ['Overview', 'Ingredients', 'Instructions'];

export default function RecipeDetailScreen() {
  const { id }   = useLocalSearchParams<{ id: string }>();
  const { profile, household } = useAuth();

  const [recipe, setRecipe]           = useState<RecipeWithDetails | null>(null);
  const conflicts = recipe ? getConflicts(recipe.ingredients, household) : [];
  const [loading, setLoading]         = useState(true);
  const [activeTab, setTab]           = useState(0);
  const [cookingMode, setCookingMode] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [addingToList, setAddingToList] = useState(false);
  const [userRating, setUserRating] = useState(0);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getRecipeById(id).then(({ recipe: r, error }) => {
      if (error || !r) {
        Alert.alert('Error', error ?? 'Recipe not found');
        router.back();
      } else {
        setRecipe(r);
        setUserRating(r.rating ?? 0);
      }
      setLoading(false);
    });
  }, [id]);

  const handleAddToGrocery = async () => {
    if (!recipe || !household?.id) return;
    setAddingToList(true);
    const { list, error: listErr } = await getOrCreateGroceryList(household.id);
    if (listErr || !list) {
      Alert.alert('Error', listErr ?? 'Could not get grocery list');
      setAddingToList(false);
      return;
    }
    const { error } = await addIngredientsToGrocery(list.id, recipe.id, recipe.ingredients);
    setAddingToList(false);
    if (error) {
      Alert.alert('Error', error);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Added!', `${recipe.ingredients.length} ingredients added to your grocery list.`);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.safe, styles.centered]}>
        <ActivityIndicator size="large" color={Colors.navy} />
      </SafeAreaView>
    );
  }

  if (!recipe) return null;

  const [c1, c2] = categoryColors(recipe.category);
  const time = formatCookTime(recipe.prep_time_minutes, recipe.cook_time_minutes);

  if (cookingMode) {
    return (
      <CookingMode
        recipe={recipe}
        heroColors={[c1, c2]}
        currentStep={currentStep}
        setCurrentStep={setCurrentStep}
        onExit={() => setCookingMode(false)}
      />
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Hero */}
        <LinearGradient colors={[c1, c2]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>

          <View style={styles.heroContent}>
            {recipe.tags.slice(0, 2).map(tag => (
              <View key={tag} style={styles.dietChip}>
                <Text style={styles.dietChipText}>{tag}</Text>
              </View>
            ))}
            <Text style={styles.heroTitle}>{recipe.title}</Text>
            {recipe.description ? (
              <Text style={styles.heroDesc}>{recipe.description}</Text>
            ) : null}

            {/* Stats row */}
            <View style={styles.statsRow}>
              <View style={styles.stat}>
                <Ionicons name="time-outline" size={14} color="rgba(255,255,255,0.7)" />
                <Text style={styles.statText}>{time}</Text>
              </View>
              {recipe.servings != null && (
                <View style={styles.stat}>
                  <Ionicons name="people-outline" size={14} color="rgba(255,255,255,0.7)" />
                  <Text style={styles.statText}>{recipe.servings} servings</Text>
                </View>
              )}
              {recipe.rating != null && (
                <View style={styles.stat}>
                  <Ionicons name="star" size={14} color={Colors.gold} />
                  <Text style={styles.statText}>{recipe.rating}</Text>
                </View>
              )}
            </View>
          </View>
        </LinearGradient>

        {/* Saved by row */}
        <View style={styles.savedByRow}>
          <View style={styles.avatarSmall}>
            <Text style={styles.avatarSmallText}>{profile?.name?.[0]?.toUpperCase() ?? '?'}</Text>
          </View>
          <Text style={styles.savedByText}>
            Saved by <Text style={{ fontWeight: '700', color: Colors.text }}>{profile?.name ?? 'You'}</Text>
          </Text>
          {recipe.ingredients.length > 0 && household && (
            conflicts.length > 0 ? (
              <View style={styles.conflictBadgeWarn}>
                <Ionicons name="warning-outline" size={14} color="#92400E" />
                <Text style={styles.conflictTextWarn}>
                  {conflicts.length === 1
                    ? `${conflicts[0]} · possible conflict`
                    : `${conflicts.join(', ')} · conflicts`}
                </Text>
              </View>
            ) : (
              <View style={styles.conflictBadge}>
                <Ionicons name="checkmark-circle" size={14} color={Colors.sage} />
                <Text style={styles.conflictText}>Works for everyone</Text>
              </View>
            )
          )}
        </View>

        {/* Tab bar */}
        <View style={styles.tabRow}>
          {TABS.map((tab, i) => (
            <TouchableOpacity key={tab} onPress={() => setTab(i)} style={[styles.tab, activeTab === i && styles.tabActive]}>
              <Text style={[styles.tabText, activeTab === i && styles.tabTextActive]}>{tab}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Overview */}
        {activeTab === 0 && (
          <View style={styles.tabContent}>
            {/* Star rating */}
            <View>
              <Text style={styles.contentLabel}>Your rating</Text>
              <View style={styles.starRow}>
                {[1, 2, 3, 4, 5].map(star => (
                  <TouchableOpacity
                    key={star}
                    onPress={async () => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setUserRating(star);
                      const { error } = await rateRecipe(recipe.id, star);
                      if (error) {
                        setUserRating(userRating); // revert on failure
                        Alert.alert('Error', error);
                      }
                    }}
                    hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
                  >
                    <Ionicons
                      name={star <= userRating ? 'star' : 'star-outline'}
                      size={28}
                      color={star <= userRating ? Colors.gold : Colors.border}
                    />
                  </TouchableOpacity>
                ))}
                {userRating > 0 && (
                  <TouchableOpacity
                    onPress={async () => {
                      setUserRating(0);
                      await rateRecipe(recipe.id, 0);
                    }}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Text style={styles.clearRating}>Clear</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {recipe.calories != null && (
              <>
                <Text style={styles.contentLabel}>Nutrition per serving</Text>
                <View style={styles.nutritionRow}>
                  <View style={[styles.nutritionCard, Shadow.sm]}>
                    <Text style={styles.nutritionVal}>{recipe.calories}</Text>
                    <Text style={styles.nutritionLabel}>Calories</Text>
                  </View>
                  {recipe.prep_time_minutes != null && (
                    <View style={[styles.nutritionCard, Shadow.sm]}>
                      <Text style={styles.nutritionVal}>{recipe.prep_time_minutes}m</Text>
                      <Text style={styles.nutritionLabel}>Prep</Text>
                    </View>
                  )}
                  {recipe.cook_time_minutes != null && (
                    <View style={[styles.nutritionCard, Shadow.sm]}>
                      <Text style={styles.nutritionVal}>{recipe.cook_time_minutes}m</Text>
                      <Text style={styles.nutritionLabel}>Cook</Text>
                    </View>
                  )}
                  {recipe.servings != null && (
                    <View style={[styles.nutritionCard, Shadow.sm]}>
                      <Text style={styles.nutritionVal}>{recipe.servings}</Text>
                      <Text style={styles.nutritionLabel}>Servings</Text>
                    </View>
                  )}
                </View>
              </>
            )}

            {recipe.tags.length > 0 && (
              <>
                <Text style={styles.contentLabel}>Tags</Text>
                <View style={styles.tagRow}>
                  {recipe.tags.map(tag => (
                    <View key={tag} style={styles.tag}>
                      <Text style={styles.tagText}>{tag}</Text>
                    </View>
                  ))}
                </View>
              </>
            )}

            {recipe.source_url ? (
              <>
                <Text style={styles.contentLabel}>Source</Text>
                <Text style={styles.sourceUrl} numberOfLines={1}>{recipe.source_url}</Text>
              </>
            ) : null}
          </View>
        )}

        {/* Ingredients */}
        {activeTab === 1 && (
          <View style={styles.tabContent}>
            <View style={styles.servingRow}>
              <Text style={styles.contentLabel}>
                Ingredients{recipe.ingredients.length > 0 ? ` (${recipe.ingredients.length})` : ''}
              </Text>
            </View>
            {recipe.ingredients.length === 0 ? (
              <Text style={styles.emptyTabText}>No ingredients added yet.</Text>
            ) : (
              recipe.ingredients.map(ing => (
                <View key={ing.id} style={styles.ingRow}>
                  <View style={styles.ingDot} />
                  <Text style={styles.ingAmount}>{[ing.amount, ing.unit].filter(Boolean).join(' ')}</Text>
                  <Text style={styles.ingName}>{ing.name}{ing.notes ? ` (${ing.notes})` : ''}</Text>
                </View>
              ))
            )}
            {recipe.ingredients.length > 0 && (
              <TouchableOpacity
                style={[styles.addToListBtn, Shadow.sm]}
                onPress={handleAddToGrocery}
                disabled={addingToList}
              >
                {addingToList
                  ? <ActivityIndicator size="small" color={Colors.navy} />
                  : <Ionicons name="cart-outline" size={18} color={Colors.navy} />
                }
                <Text style={styles.addToListText}>Add ingredients to grocery list</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Instructions */}
        {activeTab === 2 && (
          <View style={styles.tabContent}>
            {recipe.instructions.length === 0 ? (
              <Text style={styles.emptyTabText}>No instructions added yet.</Text>
            ) : (
              recipe.instructions.map(inst => (
                <View key={inst.id} style={styles.stepRow}>
                  <View style={styles.stepNum}>
                    <Text style={styles.stepNumText}>{inst.step_number}</Text>
                  </View>
                  <Text style={styles.stepText}>{inst.text}</Text>
                </View>
              ))
            )}
          </View>
        )}
      </ScrollView>

      {/* CTA */}
      {recipe.instructions.length > 0 && (
        <View style={styles.ctaBar}>
          <TouchableOpacity style={[styles.ctaBtn, Shadow.lg]} onPress={() => { setCurrentStep(0); setCookingMode(true); }}>
            <Ionicons name="flame-outline" size={20} color="#fff" />
            <Text style={styles.ctaBtnText}>Start Cooking</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

// ── Cooking Mode ──────────────────────────────────────────────────────────────

interface CookingProps {
  recipe: RecipeWithDetails;
  heroColors: [string, string];
  currentStep: number;
  setCurrentStep: React.Dispatch<React.SetStateAction<number>>;
  onExit: () => void;
}

function CookingMode({ recipe, heroColors, currentStep, setCurrentStep, onExit }: CookingProps) {
  const instructions: Instruction[] = recipe.instructions;
  const totalSteps = instructions.length;
  const step       = instructions[currentStep];
  const isDone     = currentStep >= totalSteps;

  return (
    <View style={cooking.wrap}>
      <LinearGradient colors={heroColors} style={cooking.bg}>
        <SafeAreaView style={{ flex: 1 }}>
          <View style={cooking.header}>
            <TouchableOpacity onPress={onExit} style={cooking.exitBtn}>
              <Ionicons name="close" size={22} color="rgba(255,255,255,0.7)" />
            </TouchableOpacity>
            <Text style={cooking.headerTitle}>{recipe.title}</Text>
            <Text style={cooking.headerMeta}>{isDone ? '✓ Done' : `Step ${currentStep + 1} of ${totalSteps}`}</Text>
          </View>

          <View style={cooking.progressBg}>
            <View style={[cooking.progressFill, { width: `${(currentStep / totalSteps) * 100}%` as any }]} />
          </View>

          <View style={cooking.content}>
            {isDone ? (
              <View style={cooking.doneWrap}>
                <Text style={cooking.doneEmoji}>🎉</Text>
                <Text style={cooking.doneTitle}>You're done!</Text>
                <Text style={cooking.doneSub}>Enjoy your {recipe.title}. Don't forget to rate this recipe.</Text>
              </View>
            ) : (
              <>
                <View style={cooking.stepBadge}>
                  <Text style={cooking.stepBadgeText}>STEP {step.step_number}</Text>
                </View>
                <Text style={cooking.stepText}>{step.text}</Text>
              </>
            )}
          </View>

          <View style={cooking.nav}>
            <TouchableOpacity
              style={[cooking.navBtn, currentStep === 0 && cooking.navBtnDisabled]}
              onPress={() => setCurrentStep(s => Math.max(0, s - 1))}
              disabled={currentStep === 0}
            >
              <Ionicons name="arrow-back" size={22} color={currentStep === 0 ? 'rgba(255,255,255,0.3)' : '#fff'} />
              <Text style={[cooking.navText, currentStep === 0 && { opacity: 0.3 }]}>Back</Text>
            </TouchableOpacity>

            <View style={cooking.stepDots}>
              {instructions.map((_, i) => (
                <View key={i} style={[cooking.dot, i === currentStep && cooking.dotActive]} />
              ))}
            </View>

            <TouchableOpacity
              style={cooking.navBtn}
              onPress={() => setCurrentStep(s => Math.min(totalSteps, s + 1))}
            >
              <Text style={cooking.navText}>{currentStep === totalSteps - 1 ? 'Finish' : 'Next'}</Text>
              <Ionicons name="arrow-forward" size={22} color="#fff" />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  centered: { justifyContent: 'center', alignItems: 'center' },
  hero: { height: 320, padding: Spacing.xl, justifyContent: 'flex-end' },
  backBtn: {
    position: 'absolute', top: Spacing.xl, left: Spacing.xl,
    width: 40, height: 40, backgroundColor: 'rgba(0,0,0,0.25)',
    borderRadius: 20, justifyContent: 'center', alignItems: 'center',
  },
  heroContent: { gap: 8 },
  dietChip: {
    alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.full,
  },
  dietChipText: { fontSize: FontSize.xxs, fontWeight: '700', color: 'rgba(255,255,255,0.9)' },
  heroTitle: { fontSize: FontSize.xxl, fontWeight: '700', color: '#fff', fontFamily: 'PlayfairDisplay_700Bold', lineHeight: 32 },
  heroDesc: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.75)', lineHeight: 18 },
  statsRow: { flexDirection: 'row', gap: Spacing.lg, marginTop: 4, flexWrap: 'wrap' },
  stat: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statText: { fontSize: FontSize.xs, color: 'rgba(255,255,255,0.75)' },
  savedByRow: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  avatarSmall: {
    width: 26, height: 26, borderRadius: 13,
    backgroundColor: Colors.navy, justifyContent: 'center', alignItems: 'center',
  },
  avatarSmallText: { fontSize: FontSize.xs, fontWeight: '700', color: '#fff' },
  savedByText: { flex: 1, fontSize: FontSize.sm, color: Colors.muted },
  conflictBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#EAF2E6', paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.full,
  },
  conflictText: { fontSize: FontSize.xxs, fontWeight: '700', color: Colors.sage },
  conflictBadgeWarn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#FEF3C7', paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.full,
  },
  conflictTextWarn: { fontSize: FontSize.xxs, fontWeight: '700', color: '#92400E' },
  tabRow: {
    flexDirection: 'row', paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md, gap: Spacing.xl, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  tab: { paddingBottom: Spacing.md },
  tabActive: { borderBottomWidth: 2, borderBottomColor: Colors.navy },
  tabText: { fontSize: FontSize.base, fontWeight: '600', color: Colors.muted },
  tabTextActive: { color: Colors.navy },
  tabContent: { padding: Spacing.xl, gap: Spacing.lg },
  contentLabel: { fontSize: FontSize.xs, fontWeight: '800', color: Colors.muted, textTransform: 'uppercase', letterSpacing: 0.8 },
  nutritionRow: { flexDirection: 'row', gap: Spacing.sm, flexWrap: 'wrap' },
  nutritionCard: {
    flex: 1, minWidth: 70, backgroundColor: Colors.card, borderRadius: Radius.lg,
    padding: Spacing.md, alignItems: 'center', gap: 3,
    borderWidth: 1, borderColor: Colors.border,
  },
  nutritionVal: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.navy },
  nutritionLabel: { fontSize: FontSize.xxs, color: Colors.muted, textTransform: 'uppercase', letterSpacing: 0.5 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  tag: { backgroundColor: Colors.chip, paddingHorizontal: Spacing.md, paddingVertical: 6, borderRadius: Radius.full },
  tagText: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.chipText },
  sourceUrl: { fontSize: FontSize.sm, color: Colors.navyMid },
  servingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  emptyTabText: { fontSize: FontSize.base, color: Colors.muted, textAlign: 'center', paddingVertical: Spacing.xl },
  ingRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingVertical: Spacing.sm, borderBottomWidth: 1, borderBottomColor: Colors.border },
  ingDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.sage, flexShrink: 0 },
  ingAmount: { fontSize: FontSize.base, fontWeight: '700', color: Colors.navy, minWidth: 60 },
  ingName: { flex: 1, fontSize: FontSize.base, color: Colors.text },
  addToListBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm,
    backgroundColor: Colors.chip, borderRadius: Radius.full, paddingVertical: Spacing.md,
    borderWidth: 1, borderColor: Colors.border, marginTop: Spacing.sm,
  },
  addToListText: { fontSize: FontSize.base, fontWeight: '600', color: Colors.navy },
  stepRow: { flexDirection: 'row', gap: Spacing.md, paddingBottom: Spacing.lg, borderBottomWidth: 1, borderBottomColor: Colors.border },
  stepNum: {
    width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.navy,
    justifyContent: 'center', alignItems: 'center', flexShrink: 0, marginTop: 2,
  },
  stepNumText: { fontSize: FontSize.sm, fontWeight: '700', color: '#fff' },
  stepText: { flex: 1, fontSize: FontSize.base, color: Colors.text, lineHeight: 22 },
  ctaBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: Colors.bg, padding: Spacing.xl,
    borderTopWidth: 1, borderTopColor: Colors.border,
  },
  ctaBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: Spacing.sm, backgroundColor: Colors.navy, height: 54, borderRadius: Radius.full,
  },
  ctaBtnText: { fontSize: FontSize.md, fontWeight: '700', color: '#fff' },
  starRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginTop: 6 },
  clearRating: { fontSize: FontSize.sm, color: Colors.muted, marginLeft: 4, textDecorationLine: 'underline' },
});

const cooking = StyleSheet.create({
  wrap: { flex: 1 },
  bg: { flex: 1 },
  header: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.xl, paddingBottom: Spacing.md, gap: 4 },
  exitBtn: { width: 36, height: 36, justifyContent: 'center' },
  headerTitle: { fontSize: FontSize.lg, fontWeight: '700', color: '#fff', fontFamily: 'PlayfairDisplay_700Bold' },
  headerMeta: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.6)' },
  progressBg: { height: 3, backgroundColor: 'rgba(255,255,255,0.2)', marginHorizontal: Spacing.xl, borderRadius: Radius.full },
  progressFill: { height: '100%', backgroundColor: '#fff', borderRadius: Radius.full },
  content: { flex: 1, padding: Spacing.xl, justifyContent: 'center', gap: Spacing.lg },
  stepBadge: {
    alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12, paddingVertical: 5, borderRadius: Radius.full,
  },
  stepBadgeText: { fontSize: FontSize.xs, fontWeight: '800', color: '#fff', letterSpacing: 1 },
  stepText: { fontSize: FontSize.xl, color: '#fff', lineHeight: 32, fontFamily: 'PlayfairDisplay_700Bold' },
  doneWrap: { alignItems: 'center', gap: Spacing.lg },
  doneEmoji: { fontSize: 72 },
  doneTitle: { fontSize: FontSize.xxl, fontWeight: '700', color: '#fff', fontFamily: 'PlayfairDisplay_700Bold' },
  doneSub: { fontSize: FontSize.base, color: 'rgba(255,255,255,0.75)', textAlign: 'center', lineHeight: 22 },
  nav: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl, paddingBottom: Spacing.xxl,
  },
  navBtn: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, minWidth: 80 },
  navBtnDisabled: { opacity: 0.4 },
  navText: { fontSize: FontSize.md, fontWeight: '700', color: '#fff' },
  stepDots: { flexDirection: 'row', gap: 5 },
  dot: { width: 5, height: 5, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.3)' },
  dotActive: { backgroundColor: '#fff', width: 16 },
});
