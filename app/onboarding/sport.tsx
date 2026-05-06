import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

import { OnboardingShell } from '@/components/velo/OnboardingShell';
import { SelectionCard } from '@/components/velo/SelectionCard';
import { Spacing } from '@/constants/theme';
import { SPORTS } from '@/lib/constants';
import { useUserStore } from '@/stores/userStore';

export default function SportStep() {
  const router = useRouter();
  const sport = useUserStore((s) => s.profile.sport);
  const setSport = useUserStore((s) => s.setSport);

  return (
    <OnboardingShell
      step={0}
      totalSteps={5}
      title="What's your sport?"
      subtitle="We'll tailor your plan around how you train."
      primaryLabel="Continue"
      primaryDisabled={!sport}
      onPrimary={() => sport && router.push('/onboarding/goal')}>
      <View style={styles.list}>
        {SPORTS.map((s) => (
          <SelectionCard
            key={s.id}
            label={s.label}
            selected={sport === s.id}
            onPress={() => setSport(s.id)}
          />
        ))}
      </View>
    </OnboardingShell>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: Spacing.sm,
  },
});
