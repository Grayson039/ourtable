import React, { useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TouchableOpacity, TextInput, ActivityIndicator, Alert,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors, FontSize, Spacing, Radius, Shadow } from '@/constants/theme';
import Button from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { createRecipe } from '@/lib/recipes';

// ─── Local types ──────────────────────────────────────────────────────────────

type IngredientRow = { name: string; amount: string; unit: string };
type InstructionRow = { text: string };

const CATEGORIES = ['Dinner', 'Breakfast', 'Lunch', 'Dessert', 'Snacks'];
const COMMON_TAGS = ['Quick', 'Easy', 'Family Favourite', 'Meal Prep', 'Vegetarian', 'Gluten-Free', 'Dairy-Free'];
const TOTAL_STEPS = 4;
const STEP_LABELS = ['Details', 'Ingredients', 'Instructions', 'Finishing touches'];

// ─── Step progress dots ───────────────────────────────────────────────────────

function StepDots({ step }: { step: number }) {
  return (
    <View style={dotStyles.row}>
      {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
        <View
          key={i}
          style={[
            dotStyles.dot,
            i + 1 === step && dotStyles.dotActive,
            i + 1 < step && dotStyles.dotDone,
          ]}
        />
      ))}
    </View>
  );
}

const dotStyles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 6, justifyContent: 'center', paddingVertical: Spacing.md },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.border },
  dotActive: { width: 24, backgroundColor: Colors.navy },
  dotDone: { backgroundColor: Colors.navyMid },
});

// ─── Field wrapper ────────────────────────────────────────────────────────────

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={fieldStyles.wrap}>
      <Text style={fieldStyles.label}>{label}</Text>
      {children}
    </View>
  );
}

const fieldStyles = StyleSheet.create({
  wrap: { gap: 6 },
  label: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.text },
});

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function ManualRecipeScreen() {
  const { profile, household } = useAuth();

  const [step, setStep]     = useState(1);
  const [saving, setSaving] = useState(false);

  // Step 1 — Basic info
  const [title, setTitle]         = useState('');
  const [description, setDesc]    = useState('');
  const [category, setCategory]   = useState('');
  const [prepTime, setPrepTime]   = useState('');
  const [cookTime, setCookTime]   = useState('');
  const [servings, setServings]   = useState('');

  // Step 2 — Ingredients
  const [ingredients, setIngredients] = useState<IngredientRow[]>([
    { name: '', amount: '', unit: '' },
  ]);

  // Step 3 — Instructions
  const [instructions, setInstructions] = useState<InstructionRow[]>([
    { text: '' },
  ]);

  // Step 4 — Tags
  const [tags, setTags] = useState<string[]>([]);

  // ── Navigation ───────────────────────────────────────────────────────────────

  const goNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setStep(s => Math.min(s + 1, TOTAL_STEPS));
  };

  const goBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (step === 1) router.back();
    else setStep(s => s - 1);
  };

  const step1Valid = title.trim().length > 0;

  // ── Ingredient helpers ────────────────────────────────────────────────────────

  const addIngredient = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIngredients(prev => [...prev, { name: '', amount: '', unit: '' }]);
  };

  const updateIngredient = (i: number, field: keyof IngredientRow, val: string) =>
    setIngredients(prev => prev.map((row, idx) => idx === i ? { ...row, [field]: val } : row));

  const removeIngredient = (i: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIngredients(prev => prev.filter((_, idx) => idx !== i));
  };

  // ── Instruction helpers ───────────────────────────────────────────────────────

  const addInstruction = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setInstructions(prev => [...prev, { text: '' }]);
  };

  const updateInstruction = (i: number, val: string) =>
    setInstructions(prev => prev.map((row, idx) => idx === i ? { text: val } : row));

  const removeInstruction = (i: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setInstructions(prev => prev.filter((_, idx) => idx !== i));
  };

  // ── Tag helpers ───────────────────────────────────────────────────────────────

  const toggleTag = (tag: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  // ── Save ──────────────────────────────────────────────────────────────────────

  const handleSave = async () => {
    if (!household?.id || !profile?.id) {
      Alert.alert('Error', 'No household found. Please set up your household first.');
      return;
    }

    setSaving(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const { recipe, error } = await createRecipe(
      {
        title: title.trim(),
        description: description.trim() || null,
        household_id: household.id,
        created_by: profile.id,
        source_type: 'manual',
        source_url: null,
        image_url: null,
        category: category || null,
        prep_time_minutes: prepTime ? parseInt(prepTime, 10) : null,
        cook_time_minutes: cookTime ? parseInt(cookTime, 10) : null,
        servings: servings ? parseInt(servings, 10) : null,
        calories: null,
        rating: null,
      },
      ingredients
        .filter(ing => ing.name.trim())
        .map((ing, i) => ({
          name: ing.name.trim(),
          amount: ing.amount.trim() || null,
          unit: ing.unit.trim() || null,
          notes: null,
          sort_order: i,
        })),
      instructions
        .filter(inst => inst.text.trim())
        .map((inst, i) => ({
          text: inst.text.trim(),
          step_number: i + 1,
        })),
      tags,
    );

    setSaving(false);

    if (error) {
      Alert.alert('Could not save recipe', error);
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    if (recipe) {
      router.replace(`/recipe/${recipe.id}`);
    } else {
      router.replace('/');
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Handle bar */}
        <View style={styles.handle} />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={goBack} style={styles.navBtn}>
            <Ionicons name="arrow-back" size={20} color={Colors.navy} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{STEP_LABELS[step - 1]}</Text>
          <TouchableOpacity onPress={() => router.back()} style={styles.navBtn}>
            <Ionicons name="close" size={20} color={Colors.navy} />
          </TouchableOpacity>
        </View>

        <StepDots step={step} />

        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ── Step 1: Basic Info ─────────────────────────────────────────── */}
          {step === 1 && (
            <View style={styles.stepWrap}>
              <Text style={styles.stepTitle}>What's the recipe?</Text>

              <Field label="Recipe title *">
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Grandma's Lasagna"
                  placeholderTextColor={Colors.muted}
                  value={title}
                  onChangeText={setTitle}
                  returnKeyType="next"
                  autoFocus
                />
              </Field>

              <Field label="Description">
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="A short description…"
                  placeholderTextColor={Colors.muted}
                  value={description}
                  onChangeText={setDesc}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </Field>

              <Field label="Category">
                <View style={styles.chipRow}>
                  {CATEGORIES.map(cat => (
                    <TouchableOpacity
                      key={cat}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setCategory(prev => prev === cat ? '' : cat);
                      }}
                      style={[styles.chip, category === cat && styles.chipActive]}
                    >
                      <Text style={[styles.chipText, category === cat && styles.chipTextActive]}>
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </Field>

              <View style={styles.row3}>
                <View style={{ flex: 1 }}>
                  <Field label="Prep (min)">
                    <TextInput
                      style={styles.input}
                      placeholder="20"
                      placeholderTextColor={Colors.muted}
                      value={prepTime}
                      onChangeText={setPrepTime}
                      keyboardType="number-pad"
                    />
                  </Field>
                </View>
                <View style={{ flex: 1 }}>
                  <Field label="Cook (min)">
                    <TextInput
                      style={styles.input}
                      placeholder="30"
                      placeholderTextColor={Colors.muted}
                      value={cookTime}
                      onChangeText={setCookTime}
                      keyboardType="number-pad"
                    />
                  </Field>
                </View>
                <View style={{ flex: 1 }}>
                  <Field label="Servings">
                    <TextInput
                      style={styles.input}
                      placeholder="4"
                      placeholderTextColor={Colors.muted}
                      value={servings}
                      onChangeText={setServings}
                      keyboardType="number-pad"
                    />
                  </Field>
                </View>
              </View>

              <Button label="Next: Ingredients →" onPress={goNext} disabled={!step1Valid} />
            </View>
          )}

          {/* ── Step 2: Ingredients ────────────────────────────────────────── */}
          {step === 2 && (
            <View style={styles.stepWrap}>
              <Text style={styles.stepTitle}>What goes in it?</Text>
              <Text style={styles.stepSub}>Amount and unit are optional.</Text>

              {ingredients.map((ing, i) => (
                <View key={i} style={[styles.ingCard, Shadow.sm]}>
                  <View style={styles.ingMain}>
                    <TextInput
                      style={styles.input}
                      placeholder={`Ingredient ${i + 1}`}
                      placeholderTextColor={Colors.muted}
                      value={ing.name}
                      onChangeText={v => updateIngredient(i, 'name', v)}
                    />
                    <View style={styles.ingSubRow}>
                      <TextInput
                        style={[styles.input, styles.ingAmount]}
                        placeholder="Amt"
                        placeholderTextColor={Colors.muted}
                        value={ing.amount}
                        onChangeText={v => updateIngredient(i, 'amount', v)}
                      />
                      <TextInput
                        style={[styles.input, styles.ingUnit]}
                        placeholder="Unit"
                        placeholderTextColor={Colors.muted}
                        value={ing.unit}
                        onChangeText={v => updateIngredient(i, 'unit', v)}
                      />
                    </View>
                  </View>
                  {ingredients.length > 1 && (
                    <TouchableOpacity onPress={() => removeIngredient(i)} style={styles.removeBtn}>
                      <Ionicons name="close-circle" size={22} color={Colors.muted} />
                    </TouchableOpacity>
                  )}
                </View>
              ))}

              <TouchableOpacity style={[styles.addItemBtn, Shadow.sm]} onPress={addIngredient}>
                <Ionicons name="add-circle-outline" size={20} color={Colors.navy} />
                <Text style={styles.addItemText}>Add ingredient</Text>
              </TouchableOpacity>

              <Button label="Next: Instructions →" onPress={goNext} />
              <Button label="Skip" onPress={goNext} variant="ghost" />
            </View>
          )}

          {/* ── Step 3: Instructions ───────────────────────────────────────── */}
          {step === 3 && (
            <View style={styles.stepWrap}>
              <Text style={styles.stepTitle}>How do you make it?</Text>
              <Text style={styles.stepSub}>Add each step in order.</Text>

              {instructions.map((inst, i) => (
                <View key={i} style={styles.instRow}>
                  <View style={styles.stepNumBadge}>
                    <Text style={styles.stepNumText}>{i + 1}</Text>
                  </View>
                  <TextInput
                    style={[styles.input, styles.instInput]}
                    placeholder={`Step ${i + 1}…`}
                    placeholderTextColor={Colors.muted}
                    value={inst.text}
                    onChangeText={v => updateInstruction(i, v)}
                    multiline
                    textAlignVertical="top"
                  />
                  {instructions.length > 1 && (
                    <TouchableOpacity onPress={() => removeInstruction(i)} style={styles.removeBtn}>
                      <Ionicons name="close-circle" size={22} color={Colors.muted} />
                    </TouchableOpacity>
                  )}
                </View>
              ))}

              <TouchableOpacity style={[styles.addItemBtn, Shadow.sm]} onPress={addInstruction}>
                <Ionicons name="add-circle-outline" size={20} color={Colors.navy} />
                <Text style={styles.addItemText}>Add step</Text>
              </TouchableOpacity>

              <Button label="Next: Finishing touches →" onPress={goNext} />
              <Button label="Skip" onPress={goNext} variant="ghost" />
            </View>
          )}

          {/* ── Step 4: Tags + Save ────────────────────────────────────────── */}
          {step === 4 && (
            <View style={styles.stepWrap}>
              <Text style={styles.stepTitle}>Almost done!</Text>
              <Text style={styles.stepSub}>Add tags to make this recipe easy to find.</Text>

              {/* Recipe summary card */}
              <View style={[styles.summaryCard, Shadow.sm]}>
                <Text style={styles.summaryTitle}>{title}</Text>
                {category ? <Text style={styles.summaryCategory}>{category}</Text> : null}
                <View style={styles.summaryStats}>
                  {(prepTime || cookTime) && (
                    <View style={styles.statPill}>
                      <Ionicons name="time-outline" size={12} color={Colors.navyMid} />
                      <Text style={styles.statText}>
                        {[prepTime && `${prepTime}m prep`, cookTime && `${cookTime}m cook`]
                          .filter(Boolean)
                          .join(' · ')}
                      </Text>
                    </View>
                  )}
                  {servings ? (
                    <View style={styles.statPill}>
                      <Ionicons name="people-outline" size={12} color={Colors.navyMid} />
                      <Text style={styles.statText}>{servings} servings</Text>
                    </View>
                  ) : null}
                  <View style={styles.statPill}>
                    <Ionicons name="list-outline" size={12} color={Colors.navyMid} />
                    <Text style={styles.statText}>
                      {ingredients.filter(i => i.name.trim()).length} ingredients
                    </Text>
                  </View>
                  <View style={styles.statPill}>
                    <Ionicons name="document-text-outline" size={12} color={Colors.navyMid} />
                    <Text style={styles.statText}>
                      {instructions.filter(i => i.text.trim()).length} steps
                    </Text>
                  </View>
                </View>
              </View>

              <Field label="Tags (optional)">
                <View style={styles.chipRow}>
                  {COMMON_TAGS.map(tag => (
                    <TouchableOpacity
                      key={tag}
                      onPress={() => toggleTag(tag)}
                      style={[styles.chip, tags.includes(tag) && styles.chipActive]}
                    >
                      <Text style={[styles.chipText, tags.includes(tag) && styles.chipTextActive]}>
                        {tag}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </Field>

              {saving ? (
                <View style={styles.savingRow}>
                  <ActivityIndicator color={Colors.navy} />
                  <Text style={styles.savingText}>Saving recipe…</Text>
                </View>
              ) : (
                <Button label="Save Recipe 🎉" onPress={handleSave} />
              )}
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe:         { flex: 1, backgroundColor: Colors.bg },
  handle:       { width: 36, height: 4, borderRadius: 2, backgroundColor: Colors.border, alignSelf: 'center', marginTop: Spacing.sm },
  header:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md },
  headerTitle:  { fontSize: FontSize.lg, fontWeight: '700', color: Colors.text, fontFamily: 'PlayfairDisplay_700Bold' },
  navBtn:       { width: 36, height: 36, backgroundColor: Colors.chip, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  scroll:       { padding: Spacing.xl, paddingBottom: 60 },
  stepWrap:     { gap: Spacing.lg },
  stepTitle:    { fontSize: FontSize.xl, fontWeight: '700', color: Colors.text, fontFamily: 'PlayfairDisplay_700Bold' },
  stepSub:      { fontSize: FontSize.sm, color: Colors.muted, lineHeight: 19, marginTop: -Spacing.sm },
  row3:         { flexDirection: 'row', gap: Spacing.sm },
  input: {
    height: 48, borderRadius: Radius.md, borderWidth: 1.5, borderColor: Colors.border,
    paddingHorizontal: Spacing.md, fontSize: FontSize.base, color: Colors.text,
    backgroundColor: Colors.card,
  },
  textArea:     { height: 80, paddingTop: Spacing.sm, paddingBottom: Spacing.sm },
  chipRow:      { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  chip: {
    paddingHorizontal: Spacing.md, paddingVertical: 8, borderRadius: Radius.full,
    backgroundColor: Colors.chip, borderWidth: 1.5, borderColor: Colors.border,
  },
  chipActive:     { backgroundColor: Colors.navy, borderColor: Colors.navy },
  chipText:       { fontSize: FontSize.sm, fontWeight: '600', color: Colors.chipText },
  chipTextActive: { color: '#fff' },
  ingCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm,
    backgroundColor: Colors.card, borderRadius: Radius.lg,
    padding: Spacing.md, borderWidth: 1, borderColor: Colors.border,
  },
  ingMain:    { flex: 1, gap: Spacing.sm },
  ingSubRow:  { flexDirection: 'row', gap: Spacing.sm },
  ingAmount:  { flex: 1 },
  ingUnit:    { flex: 1 },
  removeBtn:  { paddingTop: 12 },
  addItemBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm,
    paddingVertical: Spacing.md, borderRadius: Radius.lg,
    backgroundColor: Colors.card, borderWidth: 1.5, borderColor: Colors.border,
    borderStyle: 'dashed',
  },
  addItemText:  { fontSize: FontSize.base, fontWeight: '600', color: Colors.navy },
  instRow:      { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm },
  stepNumBadge: { width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.navy, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  stepNumText:  { fontSize: FontSize.xs, fontWeight: '700', color: '#fff' },
  instInput:    { flex: 1, height: 72, paddingTop: Spacing.sm },
  summaryCard: {
    backgroundColor: Colors.card, borderRadius: Radius.xl,
    padding: Spacing.lg, gap: Spacing.sm, borderWidth: 1, borderColor: Colors.border,
  },
  summaryTitle:    { fontSize: FontSize.lg, fontWeight: '700', color: Colors.text, fontFamily: 'PlayfairDisplay_700Bold' },
  summaryCategory: { fontSize: FontSize.sm, color: Colors.navyMid, fontWeight: '600' },
  summaryStats:    { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  statPill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: Colors.chip, borderRadius: Radius.full,
    paddingHorizontal: Spacing.sm, paddingVertical: 4,
  },
  statText:   { fontSize: FontSize.xs, color: Colors.navyMid, fontWeight: '600' },
  savingRow:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.md, paddingVertical: Spacing.lg },
  savingText: { fontSize: FontSize.base, color: Colors.muted },
});
