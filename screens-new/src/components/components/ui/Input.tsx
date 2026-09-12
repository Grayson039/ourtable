import React, { useState } from 'react';
import {
  View, TextInput, Text, TouchableOpacity,
  StyleSheet, ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, FontSize } from '@/constants/theme';

interface InputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoComplete?: any;
  error?: string;
  style?: ViewStyle;
  icon?: keyof typeof Ionicons.glyphMap;
}

export default function Input({
  label, placeholder, value, onChangeText,
  secureTextEntry, keyboardType = 'default',
  autoCapitalize = 'sentences', autoComplete,
  error, style, icon,
}: InputProps) {
  const [visible, setVisible] = useState(false);
  const [focused, setFocused] = useState(false);

  return (
    <View style={[styles.wrapper, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[
        styles.row,
        focused && styles.focused,
        !!error && styles.errored,
      ]}>
        {icon && (
          <Ionicons
            name={icon}
            size={18}
            color={focused ? Colors.navy : Colors.muted}
            style={styles.iconLeft}
          />
        )}
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={Colors.muted}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry && !visible}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoComplete={autoComplete}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        {secureTextEntry && (
          <TouchableOpacity onPress={() => setVisible(v => !v)} style={styles.iconRight}>
            <Ionicons
              name={visible ? 'eye-off-outline' : 'eye-outline'}
              size={18}
              color={Colors.muted}
            />
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: 6 },
  label: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.input,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    height: 50,
  },
  focused:  { borderColor: Colors.navy },
  errored:  { borderColor: Colors.error },
  iconLeft: { marginRight: Spacing.sm },
  iconRight:{ paddingLeft: Spacing.sm },
  input: {
    flex: 1,
    fontSize: FontSize.base,
    color: Colors.text,
    height: '100%',
  },
  error: {
    fontSize: FontSize.xs,
    color: Colors.error,
    marginTop: 2,
  },
});
