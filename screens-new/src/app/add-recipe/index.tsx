import React, { useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TouchableOpacity, TextInput, ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors, FontSize, Spacing, Radius, Shadow } from '@/constants/theme';
import Button from '@/components/ui/Button';

type ImportMethod = 'url' | 'social' | 'manual' | null;

const SOCIAL_SOURCES = [
  { id: 'tiktok',    label: 'TikTok',    icon: '▶', color: '#FF2D55', bg: '#FF2D5515' },
  { id: 'instagram', label: 'Instagram', icon: '◈', color: '#C13584', bg: '#C1358415' },
  { id: 'youtube',   label: 'YouTube',   icon: '▷', color: '#FF0000', bg: '#FF000015' },
];

export default function AddRecipeScreen() {
  const [method, setMethod]   = useState<ImportMethod>(null);
  const [url, setUrl]         = useState('');
  const [parsing, setParsing] = useState(false);
  const [parsed, setParsed]   = useState(false);

  const handlePaste = () => {
    if (!url.trim()) return;
    setParsing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Simulate parsing delay
    setTimeout(() => {
      setParsing(false);
      setParsed(true);
    }, 1800);
  };

  const handleSave = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.back();
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Handle bar (modal style) */}
      <View style={styles.handle} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Add a Recipe</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
          <Ionicons name="close" size={22} color={Colors.navy} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {method === null && (
          <>
            <Text style={styles.subtitle}>How would you like to add it?</Text>

            {/* Method cards */}
            <View style={styles.methodGrid}>
              {[
                { id: 'url' as ImportMethod,    icon: 'link-outline',   label: 'From URL',      sub: 'Paste any recipe link' },
                { id: 'social' as ImportMethod, icon: 'logo-tiktok',    label: 'Social Import', sub: 'TikTok, Instagram, YouTube' },
                { id: 'manual' as ImportMethod, icon: 'create-outline', label: 'Type it in',    sub: 'Enter details manually' },
              ].map(m => (
                <TouchableOpacity
                  key={m.id}
                  style={[styles.methodCard, Shadow.sm]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    if (m.id === 'manual') {
                      router.push('/add-recipe/manual');
                    } else {
                      setMethod(m.id);
                    }
                  }}
                  activeOpacity={0.85}
                >
                  <View style={styles.methodIcon}>
                    <Ionicons name={m.icon as any} size={24} color={Colors.navy} />
                  </View>
                  <Text style={styles.methodLabel}>{m.label}</Text>
                  <Text style={styles.methodSub}>{m.sub}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Recent imports */}
            <View style={styles.recentSection}>
              <Text style={styles.recentTitle}>Recent imports</Text>
              {['Tuscan Salmon — from www.foodnetwork.com', 'Thai Green Curry — from TikTok @cookingwithmax'].map(r => (
                <View key={r} style={styles.recentRow}>
                  <Ionicons name="time-outline" size={14} color={Colors.muted} />
                  <Text style={styles.recentText}>{r}</Text>
                </View>
              ))}
            </View>
          </>
        )}

        {/* URL import */}
        {method === 'url' && !parsed && (
          <View style={styles.importSection}>
            <TouchableOpacity style={styles.backRow} onPress={() => setMethod(null)}>
              <Ionicons name="arrow-back" size={18} color={Colors.navyMid} />
              <Text style={styles.backText}>Back</Text>
            </TouchableOpacity>
            <Text style={styles.importTitle}>Paste a recipe URL</Text>
            <Text style={styles.importSub}>Works with NYT Cooking, Food Network, Tasty, Bon Appétit, and most recipe sites.</Text>
            <View style={[styles.urlRow, Shadow.sm]}>
              <Ionicons name="link-outline" size={18} color={Colors.muted} style={{ marginLeft: Spacing.md }} />
              <TextInput
                style={styles.urlInput}
                placeholder="https://www.example.com/recipe..."
                placeholderTextColor={Colors.muted}
                value={url}
                onChangeText={setUrl}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="url"
              />
            </View>
            {parsing ? (
              <View style={styles.parsingRow}>
                <ActivityIndicator color={Colors.navy} size="small" />
                <Text style={styles.parsingText}>Parsing recipe…</Text>
              </View>
            ) : (
              <Button label="Import Recipe" onPress={handlePaste} disabled={!url.trim()} />
            )}
          </View>
        )}

        {/* URL parsed preview */}
        {method === 'url' && parsed && (
          <View style={styles.importSection}>
            <View style={[styles.previewCard, Shadow.md]}>
              <View style={styles.previewThumb}>
                <Text style={{ fontSize: 40 }}>🍽️</Text>
              </View>
              <View style={styles.previewInfo}>
                <View style={styles.previewSuccess}>
                  <Ionicons name="checkmark-circle" size={14} color={Colors.success} />
                  <Text style={styles.previewSuccessText}>Recipe found!</Text>
                </View>
                <Text style={styles.previewTitle}>Tuscan Butter Salmon</Text>
                <Text style={styles.previewMeta}>25 min · 4 servings · Medium</Text>
                <Text style={styles.previewSource}>foodnetwork.com</Text>
              </View>
            </View>
            <View style={styles.conflictWarn}>
              <Ionicons name="warning-outline" size={16} color={Colors.warning} />
              <Text style={styles.conflictWarnText}>Contains dairy — conflicts with Sarah's restrictions</Text>
            </View>
            <Button label="Save to Library" onPress={handleSave} />
            <Button label="Edit before saving" onPress={() => {}} variant="ghost" />
          </View>
        )}

        {/* Social import */}
        {method === 'social' && (
          <View style={styles.importSection}>
            <TouchableOpacity style={styles.backRow} onPress={() => setMethod(null)}>
              <Ionicons name="arrow-back" size={18} color={Colors.navyMid} />
              <Text style={styles.backText}>Back</Text>
            </TouchableOpacity>
            <Text style={styles.importTitle}>Import from social media</Text>
            <Text style={styles.importSub}>Paste a video link or share directly from the app.</Text>
            <View style={styles.socialGrid}>
              {SOCIAL_SOURCES.map(s => (
                <TouchableOpacity key={s.id} style={[styles.socialCard, { backgroundColor: s.bg }, Shadow.sm]}>
                  <Text style={[styles.socialIcon, { color: s.color }]}>{s.icon}</Text>
                  <Text style={[styles.socialLabel, { color: s.color }]}>{s.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={[styles.urlRow, Shadow.sm]}>
              <Ionicons name="link-outline" size={18} color={Colors.muted} style={{ marginLeft: Spacing.md }} />
              <TextInput
                style={styles.urlInput}
                placeholder="Paste video URL here…"
                placeholderTextColor={Colors.muted}
                value={url}
                onChangeText={setUrl}
                autoCapitalize="none"
                keyboardType="url"
              />
            </View>
            <Button label="Analyse Video" onPress={handlePaste} disabled={!url.trim()} />
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  handle: {
    width: 36, height: 4, borderRadius: 2, backgroundColor: Colors.border,
    alignSelf: 'center', marginTop: Spacing.sm,
  },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.xl, paddingTop: Spacing.md, paddingBottom: Spacing.sm,
  },
  title: { fontSize: FontSize.xl, fontWeight: '700', color: Colors.text, fontFamily: 'PlayfairDisplay_700Bold' },
  closeBtn: { width: 36, height: 36, backgroundColor: Colors.chip, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  scroll: { padding: Spacing.xl, gap: Spacing.lg, paddingBottom: 40 },
  subtitle: { fontSize: FontSize.base, color: Colors.muted },
  methodGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  methodCard: {
    width: '47%', backgroundColor: Colors.card, borderRadius: Radius.xl,
    padding: Spacing.lg, gap: Spacing.sm, borderWidth: 1, borderColor: Colors.border,
  },
  methodIcon: {
    width: 44, height: 44, backgroundColor: Colors.chip,
    borderRadius: Radius.md, justifyContent: 'center', alignItems: 'center',
  },
  methodLabel: { fontSize: FontSize.base, fontWeight: '700', color: Colors.text, marginTop: Spacing.xs },
  methodSub: { fontSize: FontSize.xs, color: Colors.muted },
  recentSection: { gap: Spacing.sm },
  recentTitle: { fontSize: FontSize.xs, fontWeight: '800', color: Colors.muted, textTransform: 'uppercase', letterSpacing: 0.8 },
  recentRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingVertical: Spacing.sm },
  recentText: { fontSize: FontSize.sm, color: Colors.muted },
  importSection: { gap: Spacing.lg },
  backRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  backText: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.navyMid },
  importTitle: { fontSize: FontSize.xl, fontWeight: '700', color: Colors.text, fontFamily: 'PlayfairDisplay_700Bold' },
  importSub: { fontSize: FontSize.sm, color: Colors.muted, lineHeight: 19 },
  urlRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.card, borderRadius: Radius.md,
    borderWidth: 1.5, borderColor: Colors.border, height: 50, overflow: 'hidden',
  },
  urlInput: { flex: 1, fontSize: FontSize.base, color: Colors.text, paddingHorizontal: Spacing.md },
  parsingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.md, paddingVertical: Spacing.md },
  parsingText: { fontSize: FontSize.base, color: Colors.muted },
  previewCard: {
    flexDirection: 'row', backgroundColor: Colors.card, borderRadius: Radius.xl,
    overflow: 'hidden', borderWidth: 1, borderColor: Colors.border,
  },
  previewThumb: {
    width: 100, backgroundColor: Colors.chip,
    justifyContent: 'center', alignItems: 'center',
  },
  previewInfo: { flex: 1, padding: Spacing.lg, gap: 4 },
  previewSuccess: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  previewSuccessText: { fontSize: FontSize.xs, fontWeight: '700', color: Colors.success },
  previewTitle: { fontSize: FontSize.base, fontWeight: '700', color: Colors.text },
  previewMeta: { fontSize: FontSize.xs, color: Colors.muted },
  previewSource: { fontSize: FontSize.xs, color: Colors.navyMid, fontWeight: '600' },
  conflictWarn: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    backgroundColor: '#FFF8EC', borderRadius: Radius.lg, padding: Spacing.md,
    borderWidth: 1, borderColor: '#F0D8A0',
  },
  conflictWarnText: { flex: 1, fontSize: FontSize.sm, color: Colors.text },
  socialGrid: { flexDirection: 'row', gap: Spacing.sm },
  socialCard: {
    flex: 1, borderRadius: Radius.lg, padding: Spacing.lg,
    alignItems: 'center', gap: 6,
  },
  socialIcon: { fontSize: 28, fontWeight: '700' },
  socialLabel: { fontSize: FontSize.sm, fontWeight: '700' },
});
