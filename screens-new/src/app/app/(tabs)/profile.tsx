import React, { useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TouchableOpacity, Switch, Alert, Modal, TextInput,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, Spacing, Radius, Shadow } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { updateProfile } from '@/lib/household';

const AVATAR_COLORS = ['#1B3A5C', '#7A8C52', '#C9A84C', '#2E6DA4'];

type SettingRowProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
  toggle?: boolean;
  toggleValue?: boolean;
  onToggle?: (v: boolean) => void;
  danger?: boolean;
  onPress?: () => void;
};

function SettingRow({ icon, label, value, toggle, toggleValue, onToggle, danger, onPress }: SettingRowProps) {
  return (
    <TouchableOpacity style={styles.settingRow} onPress={onPress} activeOpacity={toggle ? 1 : 0.7}>
      <View style={[styles.settingIcon, danger && styles.settingIconDanger]}>
        <Ionicons name={icon} size={18} color={danger ? Colors.error : Colors.navy} />
      </View>
      <Text style={[styles.settingLabel, danger && styles.settingLabelDanger]}>{label}</Text>
      {value && <Text style={styles.settingValue}>{value}</Text>}
      {toggle && (
        <Switch
          value={toggleValue}
          onValueChange={onToggle}
          trackColor={{ false: Colors.border, true: Colors.navy }}
          thumbColor="#fff"
        />
      )}
      {!toggle && !value && !danger && (
        <Ionicons name="chevron-forward" size={16} color={Colors.muted} />
      )}
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const { profile, household, signOut, refreshProfile } = useAuth();
  const [notifications, setNotifications] = useState(true);
  const [weeklyDigest, setWeeklyDigest]   = useState(true);
  const [darkMode, setDarkMode]           = useState(false);
  const [editVisible, setEditVisible]     = useState(false);
  const [editName, setEditName]           = useState('');
  const [editSaving, setEditSaving]       = useState(false);

  const displayName   = profile?.name ?? 'You';
  const initials      = displayName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const householdName = household?.name ?? 'Your Household';
  const members       = household?.members ?? [];
  const myMember      = members.find(m => m.id === profile?.id);
  const dietPrefs     = (myMember?.dietary_preferences ?? []).map(p =>
    p.split('-').map((w: string) => w[0].toUpperCase() + w.slice(1)).join('-')
  );

  const handleSignOut = () => {
    Alert.alert('Sign out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign out',
        style: 'destructive',
        onPress: async () => { await signOut(); },
      },
    ]);
  };

  const handleEditOpen = () => {
    setEditName(profile?.name ?? '');
    setEditVisible(true);
  };

  const handleSaveName = async () => {
    if (!profile || !editName.trim()) return;
    setEditSaving(true);
    const { error } = await updateProfile(profile.id, { name: editName.trim() });
    setEditSaving(false);
    if (error) {
      Alert.alert('Error', error);
    } else {
      await refreshProfile();
      setEditVisible(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Profile header */}
        <View style={styles.profileHeader}>
          <View style={[styles.avatar, { backgroundColor: AVATAR_COLORS[0] }]}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{displayName}</Text>
            <Text style={styles.profileRole}>Owner · {householdName}</Text>
          </View>
          <TouchableOpacity style={styles.editBtn} onPress={handleEditOpen}>
            <Ionicons name="pencil-outline" size={16} color={Colors.navy} />
          </TouchableOpacity>
        </View>

        {/* Subscription card */}
        <TouchableOpacity style={[styles.plusCard, Shadow.md]} activeOpacity={0.88}>
          <View style={styles.plusLeft}>
            <View style={styles.plusBadge}>
              <Text style={styles.plusBadgeText}>PLUS</Text>
            </View>
            <View>
              <Text style={styles.plusTitle}>Our Table Plus</Text>
              <Text style={styles.plusSub}>Unlimited recipes · Priority support</Text>
            </View>
          </View>
          <Text style={styles.plusPrice}>$9.99/mo</Text>
        </TouchableOpacity>

        {/* Household */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>My Household</Text>
          <View style={[styles.card, Shadow.sm]}>
            {members.length > 0 ? members.map((m, i) => (
              <View key={m.id} style={[styles.memberRow, i < members.length - 1 && styles.memberRowBorder]}>
                <View style={[styles.memberAvatar, { backgroundColor: AVATAR_COLORS[i % AVATAR_COLORS.length] }]}>
                  <Text style={styles.memberAvatarText}>{m.name[0].toUpperCase()}</Text>
                </View>
                <View style={styles.memberInfo}>
                  <Text style={styles.memberName}>{m.name}</Text>
                  <Text style={styles.memberMeta}>
                    {m.id === profile?.id ? 'You' : 'Member'}
                    {m.dietary_preferences.length > 0
                      ? ` · ${m.dietary_preferences.join(', ')}`
                      : ''}
                  </Text>
                </View>
                {m.id === profile?.id && (
                  <View style={styles.adminBadge}>
                    <Text style={styles.adminText}>You</Text>
                  </View>
                )}
              </View>
            )) : (
              <View style={styles.memberRow}>
                <Text style={styles.memberMeta}>No household set up yet</Text>
              </View>
            )}
            <TouchableOpacity style={styles.inviteRow}>
              <Ionicons name="person-add-outline" size={18} color={Colors.navyMid} />
              <Text style={styles.inviteText}>Invite a member</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Preferences */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <View style={[styles.card, Shadow.sm]}>
            <SettingRow icon="notifications-outline" label="Push notifications" toggle toggleValue={notifications} onToggle={setNotifications} />
            <SettingRow icon="mail-outline" label="Weekly digest email" toggle toggleValue={weeklyDigest} onToggle={setWeeklyDigest} />
            <SettingRow icon="moon-outline" label="Dark mode" toggle toggleValue={darkMode} onToggle={setDarkMode} />
            <SettingRow
              icon="leaf-outline"
              label="Dietary preferences"
              value={dietPrefs.length > 0 ? dietPrefs.join(', ') : 'None'}
            />
          </View>
        </View>

        {/* Account */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={[styles.card, Shadow.sm]}>
            <SettingRow icon="lock-closed-outline" label="Change password" />
            <SettingRow icon="download-outline" label="Export my data" />
            <SettingRow icon="help-circle-outline" label="Help & support" />
            <SettingRow icon="log-out-outline" label="Sign out" danger onPress={handleSignOut} />
          </View>
        </View>

        <Text style={styles.version}>Our Table v1.0.0 · Everyone eats.</Text>
      </ScrollView>

      {/* Edit profile modal */}
      <Modal visible={editVisible} transparent animationType="slide" onRequestClose={() => setEditVisible(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>Edit Profile</Text>
            <Text style={styles.modalLabel}>Name</Text>
            <TextInput
              style={styles.modalInput}
              value={editName}
              onChangeText={setEditName}
              placeholder="Your name"
              placeholderTextColor={Colors.muted}
              autoFocus
              maxLength={40}
              returnKeyType="done"
              onSubmitEditing={handleSaveName}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancel} onPress={() => setEditVisible(false)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalSave, (editSaving || !editName.trim()) && { opacity: 0.5 }]}
                onPress={handleSaveName}
                disabled={editSaving || !editName.trim()}
              >
                <Text style={styles.modalSaveText}>{editSaving ? 'Saving…' : 'Save'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  profileHeader: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    paddingHorizontal: Spacing.xl, paddingTop: Spacing.xl, paddingBottom: Spacing.lg,
  },
  avatar: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: FontSize.xl, fontWeight: '700', color: '#fff' },
  profileInfo: { flex: 1 },
  profileName: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.text },
  profileRole: { fontSize: FontSize.sm, color: Colors.muted, marginTop: 2 },
  editBtn: {
    width: 36, height: 36, backgroundColor: Colors.chip, borderRadius: Radius.md,
    justifyContent: 'center', alignItems: 'center',
  },
  plusCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginHorizontal: Spacing.xl, marginBottom: Spacing.xl,
    backgroundColor: Colors.navy, borderRadius: Radius.xl, padding: Spacing.lg,
  },
  plusLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  plusBadge: {
    backgroundColor: Colors.gold, paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: Radius.sm,
  },
  plusBadgeText: { fontSize: FontSize.xxs, fontWeight: '800', color: '#fff', letterSpacing: 0.8 },
  plusTitle: { fontSize: FontSize.base, fontWeight: '700', color: '#fff' },
  plusSub: { fontSize: FontSize.xs, color: 'rgba(255,255,255,0.65)', marginTop: 2 },
  plusPrice: { fontSize: FontSize.base, fontWeight: '700', color: Colors.gold },
  section: { paddingHorizontal: Spacing.xl, marginBottom: Spacing.xl },
  sectionTitle: {
    fontSize: FontSize.xs, fontWeight: '800', color: Colors.muted,
    textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: Spacing.sm,
  },
  card: { backgroundColor: Colors.card, borderRadius: Radius.xl, overflow: 'hidden', borderWidth: 1, borderColor: Colors.border },
  memberRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, padding: Spacing.lg },
  memberRowBorder: { borderBottomWidth: 1, borderBottomColor: Colors.border },
  memberAvatar: { width: 38, height: 38, borderRadius: 19, justifyContent: 'center', alignItems: 'center' },
  memberAvatarText: { fontSize: FontSize.base, fontWeight: '700', color: '#fff' },
  memberInfo: { flex: 1 },
  memberName: { fontSize: FontSize.base, fontWeight: '600', color: Colors.text },
  memberMeta: { fontSize: FontSize.xs, color: Colors.muted, marginTop: 2 },
  adminBadge: { backgroundColor: Colors.chip, paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.full },
  adminText: { fontSize: FontSize.xxs, fontWeight: '700', color: Colors.navy },
  inviteRow: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    padding: Spacing.lg, borderTopWidth: 1, borderTopColor: Colors.border,
  },
  inviteText: { fontSize: FontSize.base, fontWeight: '600', color: Colors.navyMid },
  settingRow: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    padding: Spacing.lg, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  settingIcon: {
    width: 34, height: 34, backgroundColor: Colors.chip,
    borderRadius: Radius.sm, justifyContent: 'center', alignItems: 'center',
  },
  settingIconDanger: { backgroundColor: '#FFF0F0' },
  settingLabel: { flex: 1, fontSize: FontSize.base, fontWeight: '500', color: Colors.text },
  settingLabelDanger: { color: Colors.error },
  settingValue: { fontSize: FontSize.sm, color: Colors.muted, fontWeight: '500' },
  version: { textAlign: 'center', fontSize: FontSize.xs, color: Colors.muted, marginTop: Spacing.md },
  modalOverlay: {
    flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalSheet: {
    backgroundColor: Colors.card, borderTopLeftRadius: Radius.xl, borderTopRightRadius: Radius.xl,
    padding: Spacing.xl, gap: Spacing.md, paddingBottom: 40,
  },
  modalTitle: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.text, marginBottom: Spacing.xs },
  modalLabel: { fontSize: FontSize.xs, fontWeight: '800', color: Colors.muted, textTransform: 'uppercase', letterSpacing: 0.8 },
  modalInput: {
    borderWidth: 1.5, borderColor: Colors.border, borderRadius: Radius.lg,
    paddingHorizontal: Spacing.lg, paddingVertical: 14,
    fontSize: FontSize.base, color: Colors.text, backgroundColor: Colors.bg,
  },
  modalActions: { flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.xs },
  modalCancel: {
    flex: 1, paddingVertical: 14, borderRadius: Radius.full,
    backgroundColor: Colors.chip, alignItems: 'center',
  },
  modalCancelText: { fontSize: FontSize.base, fontWeight: '600', color: Colors.muted },
  modalSave: {
    flex: 1, paddingVertical: 14, borderRadius: Radius.full,
    backgroundColor: Colors.navy, alignItems: 'center',
  },
  modalSaveText: { fontSize: FontSize.base, fontWeight: '700', color: '#fff' },
});
