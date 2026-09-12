import React, { useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors, FontSize, Spacing, Radius, Shadow } from '@/constants/theme';
import Button from '@/components/ui/Button';
import { DIET_OPTIONS } from '@/constants/data';
import { useAuth } from '@/context/AuthContext';
import { saveDietaryPreferences } from '@/lib/household';

export default function DietaryPrefsScreen() {
  const { profile, refreshProfile } = useAuth();
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const toggle = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelected(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <Ionicons name="arrow-back" size={22} color={Colors.navy} />
        </TouchableOpacity>

        <View style={styles.progress}>
          {[0,1,2,3].map(i => (
            <View key={i} style={[styles.dot, i === 2 && styles.dotActive]} />
          ))}
        </View>

        <View style={styles.header}>
          <Text style={styles.title}>Dietary preferences</Text>
          <Text style={styles.sub}>Step 3 of 4 — Your household's dietary needs</Text>
        </View>

        <Text style={styles.hint}>
          Select all that apply. We'll flag conflicts in recipes and filter your grocery list.
        </Text>

        <View style={styles.grid}>
          {DIET_OPTIONS.map(opt => {
            const on = selected.includes(opt.id);
            return (
              <TouchableOpacity
                key={opt.id}
                onPress={() => toggle(opt.id)}
                activeOpacity={0.8}
                style={[styles.optCard, on && styles.optCardActive, Shadow.sm]}
              >
                <Text style={styles.optEmoji}>{opt.emoji}</Text>
                <Text style={[styles.optLabel, on && styles.optLabelActive]}>{opt.label}</Text>
                {on && (
                  <View style={styles.checkBadge}>
                    <Ionicons name="checkmark" size={10} color="#fff" />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        <Button
          label={loading ? 'Saving…' : selected.length > 0 ? `Continue (${selected.length} selected)` : 'Skip for now'}
          onPress={async () => {
            if (!profile?.id) return router.replace('/(tabs)');
            setLoading(true);
            const { error } = await saveDietaryPreferences(profile.id, selected);
            setLoading(false);
            if (error) return Alert.alert('Error', error);
            await refreshProfile();
            router.replace('/(tabs)');
          }}
          variant={selected.length > 0 ? 'primary' : 'secondary'}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  scroll: { padding: Spacing.xl, paddingTop: Spacing.lg, gap: Spacing.lg },
  back: { width: 40, height: 40, justifyContent: 'center' },
  progress: { flexDirection: 'row', gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.border },
  dotActive: { backgroundColor: Colors.navy, width: 24 },
  header: { gap: 6, marginBottom: Spacing.xs },
  title: { fontSize: FontSize.xxl, fontWeight: '700', color: Colors.text, fontFamily: 'PlayfairDisplay_700Bold' },
  sub: { fontSize: FontSize.base, color: Colors.muted },
  hint: { fontSize: FontSize.sm, color: Colors.muted, lineHeight: 18 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  optCard: {
    width: '47%',
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 1.5,
    borderColor: Colors.border,
    gap: 8,
    position: 'relative',
  },
  optCardActive: {
    borderColor: Colors.navy,
    backgroundColor: '#EBF1F8',
  },
  optEmoji: { fontSize: 28 },
  optLabel: { fontSize: FontSize.base, fontWeight: '600', color: Colors.text },
  optLabelActive: { color: Colors.navy },
  checkBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Colors.navy,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
