import React from 'react';
import {
  TouchableOpacity, Text, StyleSheet, ActivityIndicator,
  ViewStyle, TextStyle,
} from 'react-native';
import { Colors, Spacing, Radius, FontSize } from '@/constants/theme';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: Variant;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

export default function Button({
  label, onPress, variant = 'primary',
  loading, disabled, style, textStyle, fullWidth = true,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
      style={[
        styles.base,
        styles[variant],
        fullWidth && styles.full,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? '#fff' : Colors.navy} size="small" />
      ) : (
        <Text style={[styles.label, styles[`label_${variant}`], textStyle]}>
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 52,
    borderRadius: Radius.full,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  full: { width: '100%' },

  // Variants
  primary:   { backgroundColor: Colors.navy },
  secondary: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: Colors.navy },
  ghost:     { backgroundColor: 'transparent' },
  danger:    { backgroundColor: Colors.error },

  disabled: { opacity: 0.45 },

  // Labels
  label: {
    fontSize: FontSize.md,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  label_primary:   { color: '#fff' },
  label_secondary: { color: Colors.navy },
  label_ghost:     { color: Colors.navy },
  label_danger:    { color: '#fff' },
});
