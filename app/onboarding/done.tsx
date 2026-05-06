import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Check } from 'lucide-react-native';

import { Button } from '@/components/velo/Button';
import { Card } from '@/components/velo/Card';
import { Text } from '@/components/velo/Text';
import { Colors, Spacing } from '@/constants/theme';
import { useUserStore } from '@/stores/userStore';

export default function DoneStep() {
  const router = useRouter();
  const profile = useUserStore((s) => s.profile);
  const finishOnboarding = useUserStore((s) => s.finishOnboarding);

  // Compute targets so we can preview them on this screen.
  // (finishOnboarding will recompute anyway.)
  const targets = profile.targets;

  const handleStart = () => {
    finishOnboarding();
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.body}>
        <View style={styles.checkWrap}>
          <Check size={36} color="#0a0a0a" strokeWidth={3} />
        </View>

        <Text variant="hero" weight="bold" style={styles.title}>
          You're set.
        </Text>
        <Text variant="bodyLg" color="muted" style={styles.subtitle}>
          Here are your starting daily targets. Velo adjusts these as you train.
        </Text>

        <Card style={styles.targets}>
          <Row label="Calories" value={`${targets.calories}`} unit="kcal" />
          <Row label="Protein" value={`${targets.protein}`} unit="g" />
          <Row label="Carbs" value={`${targets.carbs}`} unit="g" />
          <Row label="Fat" value={`${targets.fat}`} unit="g" />
        </Card>
      </View>

      <View style={styles.footer}>
        <Button label="Open Velo" onPress={handleStart} fullWidth />
      </View>
    </SafeAreaView>
  );
}

function Row({ label, value, unit }: { label: string; value: string; unit: string }) {
  return (
    <View style={styles.row}>
      <Text variant="body" color="muted">
        {label}
      </Text>
      <View style={styles.rowVal}>
        <Text variant="bodyLg" weight="semibold">
          {value}
        </Text>
        <Text variant="small" color="dim">
          {' '}
          {unit}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  body: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
  },
  checkWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.dark.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
  },
  title: {
    marginBottom: Spacing.md,
  },
  subtitle: {
    marginBottom: Spacing.xl,
    maxWidth: 320,
  },
  targets: {},
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
  },
  rowVal: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  footer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
});
