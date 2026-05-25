import { useMemo } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Camera, Plus, SlidersHorizontal, Pencil } from 'lucide-react-native';

import { Screen } from '@/components/velo/Screen';
import { Text } from '@/components/velo/Text';
import { Card } from '@/components/velo/Card';
import { Button } from '@/components/velo/Button';
import { MetricBar } from '@/components/velo/MetricBar';
import { InsightCard } from '@/components/velo/InsightCard';
import { Radius, Spacing } from '@/constants/theme';
import { useColors } from '@/hooks/useColors';
import { useVeloInsight } from '@/hooks/useVeloInsight';
import { formatNumber } from '@/lib/format';
import { getTodayMeals, getTodayTotals, useNutritionStore } from '@/stores/nutritionStore';
import { NUTRITION_GOALS, useNutritionGoalStore } from '@/stores/nutritionGoalStore';
import { SwipeToDelete } from '@/components/velo/SwipeToDelete';
import { Meal, NutritionGoalId } from '@/types';

export default function NutritionScreen() {
  const router = useRouter();
  const colors = useColors();
  const meals = useNutritionStore((s) => s.meals);
  const removeMeal = useNutritionStore((s) => s.removeMeal);
  const enabled = useNutritionGoalStore((s) => s.enabled);
  const targets = useNutritionGoalStore((s) => s.targets);
  const totals = useMemo(() => getTodayTotals(meals), [meals]);
  const todayMeals = useMemo(() => getTodayMeals(meals), [meals]);
  const { insight, loading } = useVeloInsight('nutrition');

  return (
    <Screen>
      <View style={styles.header}>
        <Text variant="label" color="muted">Nutrition</Text>
        <Text variant="display" weight="bold" style={{ marginTop: Spacing.xs }}>Fuel today</Text>
      </View>

      <Card style={styles.goalsCard}>
        <View style={styles.cardHeader}>
          <Text variant="label" color="muted">Selected goals</Text>
          <Pressable onPress={() => router.push('/nutrition-goals')} hitSlop={8}>
            <SlidersHorizontal size={19} color={colors.accent} strokeWidth={2.3} />
          </Pressable>
        </View>
        <View style={styles.goalStack}>
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
              />
            );
          })}
        </View>
      </Card>

      <View style={styles.actionRow}>
        <Button label="Snap meal" icon={<Camera size={18} color="#0a0a0a" strokeWidth={2.5} />}
          onPress={() => router.push('/log-meal')} style={{ flex: 1 }} />
        <Button label="Add" variant="secondary" icon={<Plus size={18} color={colors.text} strokeWidth={2.5} />}
          onPress={() => router.push('/log-meal')} style={{ flex: 1 }} />
      </View>

      <InsightCard insight={insight} loading={loading} title="Fuel insight" onPress={() => router.push('/ai-insight-detail?kind=nutrition')} />

      <Text variant="label" color="muted" style={styles.sectionLabel}>Food log</Text>
      {todayMeals.length ? (
        <View style={styles.timeline}>
          {todayMeals.map((meal) => (
            <FoodLogRow key={meal.id} meal={meal} colors={colors} onDelete={removeMeal} onEdit={(id) => router.push(`/log-meal?id=${id}`)} />
          ))}
        </View>
      ) : (
        <Card>
          <Text variant="body" weight="semibold">No food logged today</Text>
          <Text variant="small" color="muted" style={{ marginTop: Spacing.xs }}>Snap a meal or add one manually when you want nutrition guidance.</Text>
        </Card>
      )}
    </Screen>
  );
}

function valueForGoal(id: NutritionGoalId, totals: { calories: number; protein: number; carbs: number; fat: number }) {
  if (id === 'water' || id === 'fiber' || id === 'sodium') return 0;
  return totals[id];
}

function FoodLogRow({ meal, colors, onDelete, onEdit }: {
  meal: Meal;
  colors: ReturnType<typeof useColors>;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
}) {
  const time = new Date(meal.loggedAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  return (
    <SwipeToDelete onDelete={() => onDelete(meal.id)}>
      <View style={[styles.foodRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.dotColumn}>
          <View style={[styles.dot, { backgroundColor: colors.accent }]} />
        </View>
        <View style={{ flex: 1 }}>
          <Text variant="body" weight="semibold">{meal.foods.map(({ food }) => food.name).slice(0, 2).join(', ')}</Text>
          <Text variant="small" color="dim">{time} - {meal.calories} kcal - {meal.protein}g protein</Text>
        </View>
        <Pressable hitSlop={8} onPress={() => onEdit(meal.id)}>
          <Pencil size={15} color={colors.textDim} strokeWidth={2} />
        </Pressable>
      </View>
    </SwipeToDelete>
  );
}

const styles = StyleSheet.create({
  header: { marginTop: Spacing.lg, marginBottom: Spacing.xl },
  goalsCard: { marginBottom: Spacing.md },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.md },
  goalStack: { gap: Spacing.md },
  actionRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md },
  sectionLabel: { marginTop: Spacing.lg, marginBottom: Spacing.md },
  timeline: { gap: Spacing.sm },
  foodRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, padding: Spacing.md, borderWidth: 1, borderRadius: Radius.md },
  dotColumn: { width: 10, alignItems: 'center' },
  dot: { width: 8, height: 8, borderRadius: 4 },
});
