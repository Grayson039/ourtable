import { useEffect } from 'react';
import { Stack, router, useSegments } from 'expo-router';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import {
  PlayfairDisplay_700Bold,
  PlayfairDisplay_400Regular_Italic,
} from '@expo-google-fonts/playfair-display';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import { Arvo_700Bold } from '@expo-google-fonts/arvo';
import { AuthProvider, useAuth } from '@/context/AuthContext';

SplashScreen.preventAutoHideAsync();

// ── Inner layout: runs inside AuthProvider so it can read auth state ──────────
function RootLayoutNav() {
  const [fontsLoaded] = useFonts({
    PlayfairDisplay_700Bold,
    PlayfairDisplay_400Regular_Italic,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Arvo_700Bold,
  });

  const { session, loading } = useAuth();
  const segments = useSegments();

  // Hide splash once fonts + auth are both ready
  useEffect(() => {
    if (fontsLoaded && !loading) SplashScreen.hideAsync();
  }, [fontsLoaded, loading]);

  // Route protection — redirect based on auth state
  useEffect(() => {
    if (loading || !fontsLoaded) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inTabsGroup = segments[0] === '(tabs)';

    if (!session && !inAuthGroup) {
      // Not signed in → send to auth
      router.replace('/(auth)/welcome');
    } else if (session && inAuthGroup) {
      // Signed in → send to app
      router.replace('/(tabs)');
    }
  }, [session, loading, fontsLoaded, segments]);

  if (!fontsLoaded || loading) return null;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="recipe/[id]" options={{ presentation: 'card' }} />
      <Stack.Screen name="add-recipe/index" options={{ presentation: 'modal' }} />
    </Stack>
  );
}

// ── Root layout: wraps everything with providers ──────────────────────────────
export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}
