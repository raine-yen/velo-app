import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Check } from 'lucide-react-native';

import { Button } from '@/components/velo/Button';
import { Card } from '@/components/velo/Card';
import { Text } from '@/components/velo/Text';
import { Spacing } from '@/constants/theme';
import { useColors } from '@/hooks/useColors';
import { useUserStore } from '@/stores/userStore';

export default function DoneStep() {
  const router = useRouter();
  const colors = useColors();
  const profile = useUserStore((s) => s.profile);
  const finishOnboarding = useUserStore((s) => s.finishOnboarding);
  const targets = profile.targets;

  const handleStart = () => {
    finishOnboarding();
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      <View style={styles.body}>
        <View style={[styles.checkWrap, { backgroundColor: colors.accent }]}>
          <Check size={36} color="#0a0a0a" strokeWidth={3} />
        </View>
        <Text variant="hero" weight="bold" style={styles.title}>You're set.</Text>
        <Text variant="bodyLg" color="muted" style={styles.subtitle}>
          Here are your starting daily targets. Velo adjusts these as you train.
        </Text>
        <Card style={styles.targets}>
          {[['Calories', targets.calories, 'kcal'], ['Protein', targets.protein, 'g'], ['Carbs', targets.carbs, 'g'], ['Fat', targets.fat, 'g']].map(([label, val, unit]) => (
            <View key={label as string} style={styles.row}>
              <Text variant="body" color="muted">{label as string}</Text>
              <View style={styles.rowVal}>
                <Text variant="bodyLg" weight="semibold">{val as number}</Text>
                <Text variant="small" color="dim"> {unit as string}</Text>
              </View>
            </View>
          ))}
        </Card>
      </View>
      <View style={styles.footer}>
        <Button label="Open Velo" onPress={handleStart} fullWidth />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  body: { flex: 1, justifyContent: 'center', paddingHorizontal: Spacing.lg },
  checkWrap: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.xl },
  title: { marginBottom: Spacing.md },
  subtitle: { marginBottom: Spacing.xl, maxWidth: 320 },
  targets: {},
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: Spacing.sm },
  rowVal: { flexDirection: 'row', alignItems: 'baseline' },
  footer: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.md },
});
