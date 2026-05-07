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

  useEffect(() => {
    if (loading) return;
    if (!session) {
      router.replace('/auth');
    } else if (!onboardedAt) {
      router.replace('/onboarding/welcome');
    } else {
      router.replace('/(tabs)');
    }
  }, [loading, session, onboardedAt]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator color={colors.accent} />
    </View>
  );
}
