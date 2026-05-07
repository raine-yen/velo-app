import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

import { OnboardingShell } from '@/components/velo/OnboardingShell';
import { SelectionCard } from '@/components/velo/SelectionCard';
import { Spacing } from '@/constants/theme';
import { GOALS } from '@/lib/constants';
import { useUserStore } from '@/stores/userStore';

export default function GoalStep() {
  const router = useRouter();
  const goal = useUserStore((s) => s.profile.goal);
  const setGoal = useUserStore((s) => s.setGoal);

  return (
    <OnboardingShell
      step={2}
      totalSteps={6}
      title="What's your goal?"
      subtitle="This sets your daily nutrition targets and training focus."
      primaryLabel="Continue"
      primaryDisabled={!goal}
      onPrimary={() => goal && router.push('/onboarding/profile')}>
      <View style={styles.list}>
        {GOALS.map((g) => (
          <SelectionCard
            key={g.id}
            label={g.label}
            description={g.description}
            selected={goal === g.id}
            onPress={() => setGoal(g.id)}
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
