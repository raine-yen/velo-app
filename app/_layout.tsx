import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { Colors } from '@/constants/theme';

const VeloNavTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: Colors.dark.background,
    card: Colors.dark.background,
    text: Colors.dark.text,
    border: Colors.dark.border,
    primary: Colors.dark.accent,
  },
};

export default function RootLayout() {
  return (
    <ThemeProvider value={VeloNavTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen
          name="log-meal"
          options={{ presentation: 'modal', headerShown: false }}
        />
        <Stack.Screen
          name="log-workout"
          options={{ presentation: 'modal', headerShown: false }}
        />
        <Stack.Screen
          name="wellness"
          options={{ presentation: 'modal', headerShown: false }}
        />
      </Stack>
      <StatusBar style="light" />
    </ThemeProvider>
  );
}
