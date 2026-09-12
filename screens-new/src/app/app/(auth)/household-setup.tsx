import React, { useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, TouchableOpacity,
  ScrollView, TextInput, Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, Spacing, Radius, Shadow } from '@/constants/theme';
import Button from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { createHousehold } from '@/lib/household';

type Member = { name: string; avatar: string };

const AVATAR_COLORS = ['#1B3A5C','#7A8C52','#C9A84C','#2E6DA4','#B04040','#5A6A8A'];

export default function HouseholdSetupScreen() {
  const { user, refreshProfile } = useAuth();
  const [householdName, setHouseholdName] = useState('');
  const [members, setMembers]             = useState<Member[]>([]);
  const [newMember, setNewMember]         = useState('');
  const [loading, setLoading]             = useState(false);

  const addMember = () => {
    if (!newMember.trim()) return;
    setMembers(prev => [...prev, { name: newMember.trim(), avatar: newMember[0].toUpperCase() }]);
    setNewMember('');
  };

  const handleContinue = async () => {
    if (!householdName.trim() || !user) return;

    setLoading(true);
    const { error } = await createHousehold(householdName.trim(), user.id);
    setLoading(false);

    if (error) {
      Alert.alert('Error', error);
      return;
    }

    // Refresh profile so AuthContext has the new household_id
    await refreshProfile();

    // Advance to dietary prefs
    router.push('/(auth)/dietary-prefs');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <Ionicons name="arrow-back" size={22} color={Colors.navy} />
        </TouchableOpacity>

        <View style={styles.progress}>
          {[0,1,2,3].map(i => (
            <View key={i} style={[styles.dot, i === 1 && styles.dotActive]} />
          ))}
        </View>

        <View style={styles.header}>
          <Text style={styles.title}>Set up your household</Text>
          <Text style={styles.sub}>Step 2 of 4 — Who's at the table?</Text>
        </View>

        {/* Household name */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Household name</Text>
          <TextInput
            style={styles.nameInput}
            placeholder="e.g. The Johnson Family"
            placeholderTextColor={Colors.muted}
            value={householdName}
            onChangeText={setHouseholdName}
          />
        </View>

        {/* Members */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Members</Text>
          <View style={styles.memberList}>
            {members.map((m, i) => (
              <View key={i} style={styles.memberChip}>
                <View style={[styles.avatar, { backgroundColor: AVATAR_COLORS[i % AVATAR_COLORS.length] }]}>
                  <Text style={styles.avatarText}>{m.avatar}</Text>
                </View>
                <Text style={styles.memberName}>{m.name}</Text>
                <TouchableOpacity onPress={() => setMembers(prev => prev.filter((_, j) => j !== i))}>
                  <Ionicons name="close-circle" size={18} color={Colors.muted} />
                </TouchableOpacity>
              </View>
            ))}
          </View>

          {/* Add member row */}
          <View style={styles.addRow}>
            <TextInput
              style={styles.addInput}
              placeholder="Add a family member…"
              placeholderTextColor={Colors.muted}
              value={newMember}
              onChangeText={setNewMember}
              onSubmitEditing={addMember}
              returnKeyType="done"
            />
            <TouchableOpacity onPress={addMember} style={styles.addBtn}>
              <Ionicons name="add" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Info card */}
        <View style={[styles.infoCard, Shadow.sm]}>
          <Ionicons name="information-circle-outline" size={20} color={Colors.navyMid} />
          <Text style={styles.infoText}>
            Each member gets their own dietary preferences and can save recipes to the shared library.
          </Text>
        </View>

        <Button
          label="Continue"
          onPress={handleContinue}
          loading={loading}
          disabled={!householdName.trim()}
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
  header: { gap: 6, marginBottom: Spacing.sm },
  title: { fontSize: FontSize.xxl, fontWeight: '700', color: Colors.text, fontFamily: 'PlayfairDisplay_700Bold' },
  sub: { fontSize: FontSize.base, color: Colors.muted },
  section: { gap: Spacing.sm },
  sectionLabel: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.muted, textTransform: 'uppercase', letterSpacing: 0.8 },
  nameInput: {
    height: 50, borderRadius: Radius.md, borderWidth: 1.5, borderColor: Colors.border,
    paddingHorizontal: Spacing.md, fontSize: FontSize.base, color: Colors.text,
    backgroundColor: Colors.card,
  },
  memberList: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  memberChip: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: Colors.card, borderRadius: Radius.full,
    paddingLeft: 4, paddingRight: Spacing.sm, paddingVertical: 4,
    borderWidth: 1, borderColor: Colors.border,
  },
  avatar: { width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: FontSize.sm, fontWeight: '700', color: '#fff' },
  memberName: { fontSize: FontSize.base, fontWeight: '600', color: Colors.text },
  addRow: { flexDirection: 'row', gap: Spacing.sm },
  addInput: {
    flex: 1, height: 50, borderRadius: Radius.md, borderWidth: 1.5, borderColor: Colors.border,
    paddingHorizontal: Spacing.md, fontSize: FontSize.base, color: Colors.text,
    backgroundColor: Colors.card,
  },
  addBtn: {
    width: 50, height: 50, borderRadius: Radius.md,
    backgroundColor: Colors.navy, justifyContent: 'center', alignItems: 'center',
  },
  infoCard: {
    flexDirection: 'row', gap: Spacing.md, alignItems: 'flex-start',
    backgroundColor: '#EBF4FF', borderRadius: Radius.lg,
    padding: Spacing.lg, borderWidth: 1, borderColor: '#C0D8F0',
  },
  infoText: { flex: 1, fontSize: FontSize.sm, color: Colors.navyMid, lineHeight: 19 },
});
