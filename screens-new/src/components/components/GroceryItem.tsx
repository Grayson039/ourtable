import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors, Spacing, Radius, FontSize } from '@/constants/theme';
import { GroceryItem as GroceryItemType } from '@/types';

interface Props {
  item: GroceryItemType;
  onToggle: (id: string, current: boolean) => void;
  onDelete?: (id: string) => void;
}

export default function GroceryItem({ item, onToggle, onDelete }: Props) {
  const handleToggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onToggle(item.id, item.is_checked);
  };

  const metaParts = [item.amount, item.unit].filter(Boolean).join(' ');

  return (
    <TouchableOpacity onPress={handleToggle} activeOpacity={0.7} style={styles.row}>
      {/* Checkbox */}
      <View style={[styles.check, item.is_checked && styles.checkDone]}>
        {item.is_checked && <Ionicons name="checkmark" size={14} color="#fff" />}
      </View>

      {/* Name + meta */}
      <View style={styles.info}>
        <Text style={[styles.name, item.is_checked && styles.strikethrough]}>
          {item.name}
        </Text>
        {metaParts ? (
          <Text style={styles.meta}>{metaParts}</Text>
        ) : null}
      </View>

      {/* Aisle badge */}
      {item.aisle ? (
        <View style={styles.aisleBadge}>
          <Text style={styles.aisleText}>{item.aisle}</Text>
        </View>
      ) : null}

      {/* Delete */}
      {onDelete && (
        <TouchableOpacity
          onPress={() => onDelete(item.id)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="close-circle-outline" size={18} color={Colors.muted} />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    gap: Spacing.md,
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  check: {
    width: 24, height: 24, borderRadius: Radius.full,
    borderWidth: 1.5, borderColor: Colors.border,
    justifyContent: 'center', alignItems: 'center', flexShrink: 0,
  },
  checkDone: { backgroundColor: Colors.sage, borderColor: Colors.sage },
  info: { flex: 1 },
  name: { fontSize: FontSize.base, fontWeight: '600', color: Colors.text },
  strikethrough: { textDecorationLine: 'line-through', color: Colors.muted, fontWeight: '400' },
  meta: { fontSize: FontSize.xs, color: Colors.muted, marginTop: 1 },
  aisleBadge: {
    backgroundColor: Colors.chip, paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: Radius.full, flexShrink: 0,
  },
  aisleText: {
    fontSize: FontSize.xxs, fontWeight: '700', color: Colors.chipText,
    textTransform: 'uppercase', letterSpacing: 0.4,
  },
});
