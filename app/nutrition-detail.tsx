import { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Apple, Flame, TrendingUp } from 'lucide-react-native';

import { Card } from '@/components/velo/Card';
import { InsightCard } from '@/components/velo/InsightCard';
import { MetricBar } from '@/components/velo/MetricBar';
import { Screen } from '@/components/velo/Screen';
import { Text } from '@/components/velo/Text';
import { Spacing } from '@/constants/theme';
import { useColors } from '@/hooks/useColors';
import { useVeloInsight } from '@/hooks/useVeloInsight';
import { formatNumber } from '@/lib/format';
import { useHealthStore } from '@/stores/healthStore';
import { getTodayTotals, useNutritionStore } from '@/stores/nutritionStore';
import { NUTRITION_GOALS, useNutritionGoalStore } from '@/stores/nutritionGoalStore';
import { NutritionGoalId } from '@/types';

export default function NutritionDetailScreen() {
  const router = useRouter();
  const colors = useColors();
  const meals = useNutritionStore((s) => s.meals);
  const enabled = useNutritionGoalStore((s) => s.enabled);
  const targets = useNutritionGoalStore((s) => s.targets);
  const snap = useHealthStore((s) => s.snapshot);
  const totals = useMemo(() => getTodayTotals(meals), [meals]);
  const { insight, loading } = useVeloInsight('nutrition');

  return (
    <Screen>
      <View style={styles.header}>
        <Text variant="label" color="muted">Nutrition</Text>
        <Text variant="display" weight="bold">Fuel balance</Text>
      </View>

      <Card style={styles.hero}>
        <View style={styles.heroLine}>
          <Apple size={20} color={colors.accent} />
          <Text variant="title" weight="semibold">{formatNumber(totals.calories)} kcal consumed</Text>
        </View>
        <Text variant="small" color="muted">Target {formatNumber(targets.calories)} kcal. Active burn {formatNumber(snap?.activeCalories)} kcal.</Text>
      </Card>

      <Card style={styles.stack}>
        <Text variant="title" weight="semibold">Selected goals</Text>
        {enabled.map((id) => {
          const goal = NUTRITION_GOALS.find((g) => g.id === id);
          if (!goal) return null;
          const value = valueForGoal(id, totals);
          return (
            <MetricBar
              key={id}
              label={goal.label}
              value={value}
              max={targets[id]}
              detail={`${formatNumber(value)} / ${formatNumber(targets[id])} ${goal.unit}`}
              color={id === 'carbs' ? '#60a5fa' : id === 'fat' ? colors.warning : undefined}
            />
          );
        })}
      </Card>

      <View style={styles.grid}>
        <Mini icon={<Flame size={17} color={colors.accent} />} label="Basal" value={`${formatNumber(snap?.basalCalories)} kcal`} />
        <Mini icon={<TrendingUp size={17} color={colors.accent} />} label="Remaining" value={`${formatNumber(Math.max(0, targets.calories - totals.calories))} kcal`} />
      </View>

      <InsightCard insight={insight} loading={loading} title="Fuel coach" onPress={() => router.push('/ai-insight-detail?kind=nutrition')} />
    </Screen>
  );
}

function valueForGoal(id: NutritionGoalId, totals: { calories: number; protein: number; carbs: number; fat: number }) {
  if (id === 'water' || id === 'fiber' || id === 'sodium') return 0;
  return totals[id];
}

function Mini({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <Card style={styles.mini}>
      {icon}
      <Text variant="body" weight="semibold">{value}</Text>
      <Text variant="caption" color="muted">{label}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  header: { marginTop: Spacing.lg, marginBottom: Spacing.xl, gap: Spacing.xs },
  hero: { gap: Spacing.sm, marginBottom: Spacing.md },
  heroLine: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  stack: { gap: Spacing.md, marginBottom: Spacing.md },
  grid: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md },
  mini: { flex: 1, gap: Spacing.xs },
});
