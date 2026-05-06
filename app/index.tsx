import { Redirect } from 'expo-router';

import { useUserStore } from '@/stores/userStore';

export default function Entry() {
  const onboardedAt = useUserStore((s) => s.profile.onboardedAt);
  if (onboardedAt) return <Redirect href="/(tabs)" />;
  return <Redirect href="/onboarding/welcome" />;
}
