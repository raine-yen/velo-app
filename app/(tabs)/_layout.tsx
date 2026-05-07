import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import { Home, Apple, Dumbbell, User } from 'lucide-react-native';
import { HapticTab } from '@/components/haptic-tab';
import { useColors } from '@/hooks/useColors';
import { useSync } from '@/hooks/useSync';

export default function TabLayout() {
  const colors = useColors();
  useSync();
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.tabIconSelected,
        tabBarInactiveTintColor: colors.tabIconDefault,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
          borderTopWidth: 0.5,
          height: Platform.OS === 'ios' ? 88 : 64,
          paddingTop: 6,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '500', letterSpacing: 0.2 },
      }}>
      <Tabs.Screen name="index" options={{ title: 'Home', tabBarIcon: ({ color }) => <Home size={22} color={color} strokeWidth={2} /> }} />
      <Tabs.Screen name="nutrition" options={{ title: 'Nutrition', tabBarIcon: ({ color }) => <Apple size={22} color={color} strokeWidth={2} /> }} />
      <Tabs.Screen name="training" options={{ title: 'Training', tabBarIcon: ({ color }) => <Dumbbell size={22} color={color} strokeWidth={2} /> }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: ({ color }) => <User size={22} color={color} strokeWidth={2} /> }} />
    </Tabs>
  );
}
