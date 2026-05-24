import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';

import { useAuthStore } from '@/stores/authStore';
import { useUserStore } from '@/stores/userStore';
import { useColors } from '@/hooks/useColors';

export default function Entry() {
  const router = useRouter();
  const colors = useColors();
  const loading = useAuthStore((s) => s.loading);
  const session = useAuthStore((s) => s.session);
  const onboardedAt = useUserStore((s) => s.profile.onboardedAt);
  const hydrated = useUserStore((s) => s._hydrated);

  useEffect(() => {
    if (loading || !hydrated) return;
    if (!session) {
      router.replace('/auth');
    } else if (!onboardedAt) {
      router.replace('/onboarding/welcome');
    } else {
      router.replace('/(tabs)');
    }
  }, [loading, hydrated, session, onboardedAt]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator color={colors.accent} />
    </View>
  );
}
