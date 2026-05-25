import { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
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
import { useUserStore } from '@/stores/userStore';

export default function NutritionDetailScreen() {
  const colors = useColors();
  const meals = useNutritionStore((s) => s.meals);
  const targets = useUserStore((s) => s.profile.targets);
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
        <Text variant="title" weight="semibold">Macros</Text>
        <MetricBar label="Protein" value={totals.protein} max={targets.protein} detail={`${formatNumber(totals.protein)} / ${targets.protein}g`} />
        <MetricBar label="Carbs" value={totals.carbs} max={targets.carbs} detail={`${formatNumber(totals.carbs)} / ${targets.carbs}g`} color="#60a5fa" />
        <MetricBar label="Fat" value={totals.fat} max={targets.fat} detail={`${formatNumber(totals.fat)} / ${targets.fat}g`} color={colors.warning} />
      </Card>

      <View style={styles.grid}>
        <Mini icon={<Flame size={17} color={colors.accent} />} label="Basal" value={`${formatNumber(snap?.basalCalories)} kcal`} />
        <Mini icon={<TrendingUp size={17} color={colors.accent} />} label="Remaining" value={`${formatNumber(Math.max(0, targets.calories - totals.calories))} kcal`} />
      </View>

      <InsightCard insight={insight} loading={loading} title="Fuel coach" />
    </Screen>
  );
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
