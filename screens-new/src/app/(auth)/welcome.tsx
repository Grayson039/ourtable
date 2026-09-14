import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  SafeAreaView, StatusBar, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Colors, FontSize, Spacing, Radius } from '@/constants/theme';

const { height } = Dimensions.get('window');

export default function WelcomeScreen() {
  return (
    <LinearGradient
      colors={['#12333C', '#2C5D69', '#3D7A8A']}
      start={{ x: 0.1, y: 0 }}
      end={{ x: 0.9, y: 1 }}
      style={styles.gradient}
    >
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.safe}>
        {/* Logo mark */}
        <View style={styles.logoArea}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoEmoji}>🍽️</Text>
          </View>
          <Text style={styles.logoLabel}>OurTable</Text>
        </View>

        {/* Hero text */}
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>Cook together,{'\n'}eat together.</Text>
          <Text style={styles.heroSub}>
            Your family's recipes, grocery lists, and kitchen — all in one place.
          </Text>
        </View>

        {/* Feature pills */}
        <View style={styles.pills}>
          {['🧑‍🍳  Shared recipe library', '🛒  Smart grocery lists', '❄️  Fridge & pantry tracker'].map(f => (
            <View key={f} style={styles.pill}>
              <Text style={styles.pillText}>{f}</Text>
            </View>
          ))}
        </View>

        {/* CTA buttons */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.btnPrimary}
            onPress={() => router.push('/(auth)/create-account')}
            activeOpacity={0.85}
          >
            <Text style={styles.btnPrimaryText}>Get started — it's free</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/(auth)/sign-in')}
            activeOpacity={0.7}
          >
            <Text style={styles.linkText}>Already have an account? <Text style={styles.linkBold}>Sign in</Text></Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.legal}>By continuing you agree to our Terms & Privacy Policy</Text>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safe: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xxl,
    justifyContent: 'space-between',
  },
  logoArea: {
    marginTop: height * 0.08,
    alignItems: 'flex-start',
    gap: 12,
  },
  logoCircle: {
    width: 64,
    height: 64,
    borderRadius: Radius.xl,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  logoEmoji: { fontSize: 30 },
  logoLabel: {
    fontSize: FontSize.lg,
    fontFamily: 'Arvo_700Bold',
    letterSpacing: -0.2,
    color: 'rgba(255,255,255,0.85)',
  },
  hero: { gap: 14 },
  heroTitle: {
    fontSize: FontSize.hero,
    fontWeight: '700',
    color: '#fff',
    lineHeight: 40,
    fontFamily: 'PlayfairDisplay_700Bold',
  },
  heroSub: {
    fontSize: FontSize.md,
    color: 'rgba(255,255,255,0.7)',
    lineHeight: 23,
  },
  pills: { gap: 8 },
  pill: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm + 2,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    alignSelf: 'flex-start',
  },
  pillText: { fontSize: FontSize.base, color: 'rgba(255,255,255,0.88)', fontWeight: '500' },
  actions: { gap: Spacing.lg },
  btnPrimary: {
    backgroundColor: '#fff',
    height: 54,
    borderRadius: Radius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnPrimaryText: { fontSize: FontSize.md, fontWeight: '700', color: Colors.navy },
  linkText: { textAlign: 'center', fontSize: FontSize.base, color: 'rgba(255,255,255,0.65)' },
  linkBold: { fontWeight: '700', color: '#fff' },
  legal: {
    textAlign: 'center',
    fontSize: FontSize.xs,
    color: 'rgba(255,255,255,0.35)',
  },
});
