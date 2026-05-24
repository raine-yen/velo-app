import { useEffect } from 'react';
import { Tabs } from 'expo-router';
import { Platform, View, Animated } from 'react-native';
import { Home, Apple, Dumbbell, User, Users } from 'lucide-react-native';
import { HapticTab } from '@/components/haptic-tab';
import { useColors } from '@/hooks/useColors';
import { useSync } from '@/hooks/useSync';
import { useTeamStore } from '@/stores/teamStore';
import { useAutoHealthSync } from '@/hooks/useAutoHealthSync';
import { Text } from '@/components/velo/Text';
import { Spacing, Radius } from '@/constants/theme';

export default function TabLayout() {
  const colors = useColors();
  const hasTeam = useTeamStore((s) => s.teams.length > 0);
  const { newCount, clearNewCount } = useAutoHealthSync();
  useSync();

  useEffect(() => {
    if (newCount > 0) {
      const t = setTimeout(clearNewCount, 4000);
      return () => clearTimeout(t);
    }
  }, [newCount]);
  return (
    <>
      {newCount > 0 && (
        <View style={{ position: 'absolute', top: 60, left: Spacing.lg, right: Spacing.lg, zIndex: 999,
          backgroundColor: colors.accent, borderRadius: Radius.pill, paddingVertical: 10, paddingHorizontal: Spacing.lg,
          flexDirection: 'row', justifyContent: 'center' }}>
          <Text variant="small" weight="semibold" style={{ color: '#0a0a0a' }}>
            ♥ {newCount} workout{newCount !== 1 ? 's' : ''} imported from Apple Health
          </Text>
        </View>
      )}
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
      <Tabs.Screen name="team" options={hasTeam
        ? { title: 'Team', tabBarIcon: ({ color }) => <Users size={22} color={color} strokeWidth={2} /> }
        : { href: null }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: ({ color }) => <User size={22} color={color} strokeWidth={2} /> }} />
    </Tabs>
    </>
  );
}
