import { Pressable, View, StyleSheet } from 'react-native';
import { Check, Minus, Plus } from 'lucide-react-native';

import { Card } from '@/components/velo/Card';
import { Screen } from '@/components/velo/Screen';
import { Text } from '@/components/velo/Text';
import { Button } from '@/components/velo/Button';
import { Spacing } from '@/constants/theme';
import { useColors } from '@/hooks/useColors';
import { NUTRITION_GOALS, useNutritionGoalStore } from '@/stores/nutritionGoalStore';

export default function NutritionGoalsScreen() {
  const colors = useColors();
  const enabled = useNutritionGoalStore((s) => s.enabled);
  const targets = useNutritionGoalStore((s) => s.targets);
  const toggleGoal = useNutritionGoalStore((s) => s.toggleGoal);
  const setGoalTarget = useNutritionGoalStore((s) => s.setGoalTarget);

  return (
    <Screen>
      <View style={styles.header}>
        <Text variant="label" color="muted">Nutrition goals</Text>
        <Text variant="display" weight="bold">Choose what matters</Text>
      </View>

      <View style={styles.list}>
        {NUTRITION_GOALS.map((goal) => {
          const isEnabled = enabled.includes(goal.id);
          const step = goal.id === 'sodium' ? 100 : goal.id === 'water' ? 8 : 5;
          return (
            <Card key={goal.id} style={styles.goalCard}>
              <View style={styles.goalTop}>
                <Pressable style={[styles.check, { backgroundColor: isEnabled ? colors.accent : colors.surfaceElevated }]} onPress={() => toggleGoal(goal.id)}>
                  {isEnabled ? <Check size={15} color="#0a0a0a" strokeWidth={3} /> : null}
                </Pressable>
                <View style={{ flex: 1 }}>
                  <Text variant="body" weight="semibold">{goal.label}</Text>
                  <Text variant="small" color="dim">{goal.description}</Text>
                </View>
              </View>
              {isEnabled ? (
                <View style={styles.targetRow}>
                  <Button label="" variant="secondary" icon={<Minus size={16} color={colors.text} />} onPress={() => setGoalTarget(goal.id, targets[goal.id] - step)} />
                  <View style={styles.targetValue}>
                    <Text variant="title" weight="semibold">{targets[goal.id]}</Text>
                    <Text variant="small" color="dim">{goal.unit}</Text>
                  </View>
                  <Button label="" variant="secondary" icon={<Plus size={16} color={colors.text} />} onPress={() => setGoalTarget(goal.id, targets[goal.id] + step)} />
                </View>
              ) : null}
            </Card>
          );
        })}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { marginTop: Spacing.lg, marginBottom: Spacing.xl, gap: Spacing.xs },
  list: { gap: Spacing.sm },
  goalCard: { gap: Spacing.md },
  goalTop: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  check: { width: 34, height: 34, borderRadius: 17, padding: 0, alignItems: 'center', justifyContent: 'center' },
  targetRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.md },
  targetValue: { alignItems: 'center', minWidth: 92 },
});
