import { useEffect } from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import 'react-native-url-polyfill/auto';

import { useColors } from '@/hooks/useColors';
import { useThemeStore } from '@/stores/themeStore';
import { useAuthStore } from '@/stores/authStore';

export default function RootLayout() {
  const isDark = useThemeStore((s) => s.isDark);
  const colors = useColors();
  const init = useAuthStore((s) => s.init);

  useEffect(() => { init(); }, []);

  const navTheme = {
    ...(isDark ? DarkTheme : DefaultTheme),
    colors: {
      ...(isDark ? DarkTheme : DefaultTheme).colors,
      background: colors.background,
      card: colors.background,
      text: colors.text,
      border: colors.border,
      primary: colors.accent,
    },
  };

  return (
    <ThemeProvider value={navTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="auth" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="log-meal" options={{ presentation: 'modal' }} />
        <Stack.Screen name="log-workout" options={{ presentation: 'modal' }} />
        <Stack.Screen name="wellness" options={{ presentation: 'modal' }} />
        <Stack.Screen name="health-import" options={{ presentation: 'modal' }} />
        <Stack.Screen name="sleep-detail" options={{ presentation: 'modal' }} />
        <Stack.Screen name="activity-detail" options={{ presentation: 'modal' }} />
        <Stack.Screen name="nutrition-detail" options={{ presentation: 'modal' }} />
        <Stack.Screen name="recovery-detail" options={{ presentation: 'modal' }} />
        <Stack.Screen name="ai-coach" options={{ presentation: 'modal' }} />
        <Stack.Screen name="athlete-detail" options={{ presentation: 'modal' }} />
        <Stack.Screen name="team-edit" options={{ presentation: 'modal' }} />
        <Stack.Screen name="coach-planner" options={{ presentation: 'modal' }} />
        <Stack.Screen name="coach-plan-ai" options={{ presentation: 'modal' }} />
        <Stack.Screen name="coach-plan-workout" options={{ presentation: 'modal' }} />
        <Stack.Screen name="team-create" options={{ presentation: 'modal' }} />
        <Stack.Screen name="team-join" options={{ presentation: 'modal' }} />
        <Stack.Screen name="consent" options={{ presentation: 'modal' }} />
        <Stack.Screen name="request-data" options={{ presentation: 'modal' }} />
      </Stack>
      <StatusBar style={isDark ? 'light' : 'dark'} />
    </ThemeProvider>
  );
}
