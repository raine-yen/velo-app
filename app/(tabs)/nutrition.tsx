import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Camera, Plus, Coffee, Sun, Moon, Apple } from 'lucide-react-native';

import { Screen } from '@/components/velo/Screen';
import { Text } from '@/components/velo/Text';
import { Card } from '@/components/velo/Card';
import { Button } from '@/components/velo/Button';
import { Colors, Spacing } from '@/constants/theme';
import { useUserStore } from '@/stores/userStore';
import { useNutritionStore } from '@/stores/nutritionStore';
import { Meal, MealType } from '@/types';

export default function NutritionScreen() {
  const router = useRouter();
  const targets = useUserStore((s) => s.profile.targets);
  const totals = useNutritionStore((s) => s.todayTotals());
  const todayMeals = useNutritionStore((s) => s.todayMeals());

  const grouped = groupByMealType(todayMeals);

  return (
    <Screen>
      <View style={styles.header}>
        <Text variant="label" color="muted">
          Nutrition
        </Text>
        <Text variant="display" weight="bold" style={{ marginTop: Spacing.xs }}>
          Today's plate
        </Text>
      </View>

      <Card style={styles.macrosCard}>
        <Text variant="label" color="muted">
          Daily targets
        </Text>
        <View style={styles.macroRow}>
          <Macro label="Calories" value={totals.calories} target={targets.calories} unit="kcal" />
          <Macro label="Protein" value={totals.protein} target={targets.protein} unit="g" />
        </View>
        <View style={styles.macroRow}>
          <Macro label="Carbs" value={totals.carbs} target={targets.carbs} unit="g" />
          <Macro label="Fat" value={totals.fat} target={targets.fat} unit="g" />
        </View>
      </Card>

      <Button
        label="Snap a meal"
        icon={<Camera size={18} color="#0a0a0a" strokeWidth={2.5} />}
        onPress={() => router.push('/log-meal')}
        fullWidth
      />

      <Button
        label="Add manually"
        variant="secondary"
        icon={<Plus size={18} color={Colors.dark.text} strokeWidth={2.5} />}
        onPress={() => router.push('/log-meal')}
        fullWidth
        style={{ marginTop: Spacing.md, marginBottom: Spacing.xl }}
      />

      <Text variant="label" color="muted" style={styles.sectionLabel}>
        Meals
      </Text>

      <MealSection
        icon={<Coffee size={20} color={Colors.dark.textMuted} strokeWidth={2} />}
        title="Breakfast"
        meals={grouped.breakfast}
        onAdd={() => router.push('/log-meal')}
      />
      <MealSection
        icon={<Sun size={20} color={Colors.dark.textMuted} strokeWidth={2} />}
        title="Lunch"
        meals={grouped.lunch}
        onAdd={() => router.push('/log-meal')}
      />
      <MealSection
        icon={<Moon size={20} color={Colors.dark.textMuted} strokeWidth={2} />}
        title="Dinner"
        meals={grouped.dinner}
        onAdd={() => router.push('/log-meal')}
      />
      <MealSection
        icon={<Apple size={20} color={Colors.dark.textMuted} strokeWidth={2} />}
        title="Snacks"
        meals={grouped.snack}
        onAdd={() => router.push('/log-meal')}
      />
    </Screen>
  );
}

function Macro({
  label,
  value,
  target,
  unit,
}: {
  label: string;
  value: number;
  target: number;
  unit: string;
}) {
  const pct = target > 0 ? Math.min(100, (value / target) * 100) : 0;
  return (
    <View style={styles.macro}>
      <Text variant="caption" color="muted">
        {label}
      </Text>
      <View style={styles.macroValue}>
        <Text variant="title" weight="semibold">
          {value}
        </Text>
        <Text variant="small" color="dim">
          {' / '}
          {target} {unit}
        </Text>
      </View>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${pct}%` }]} />
      </View>
    </View>
  );
}

function MealSection({
  icon,
  title,
  meals,
  onAdd,
}: {
  icon: React.ReactNode;
  title: string;
  meals: Meal[];
  onAdd: () => void;
}) {
  const totalKcal = meals.reduce((acc, m) => acc + m.calories, 0);
  return (
    <Card style={styles.mealCard} onPress={onAdd}>
      <View style={styles.mealHeader}>
        <View style={styles.mealIcon}>{icon}</View>
        <View style={{ flex: 1 }}>
          <Text variant="body" weight="semibold">
            {title}
          </Text>
          <Text variant="small" color="dim">
            {meals.length === 0
              ? 'Not logged yet'
              : `${meals.length} ${meals.length === 1 ? 'item' : 'items'} · ${totalKcal} kcal`}
          </Text>
        </View>
        <Plus size={18} color={Colors.dark.textDim} strokeWidth={2} />
      </View>

      {meals.length > 0 ? (
        <View style={styles.foodPreview}>
          {meals.flatMap((m) =>
            m.foods.map(({ food, servings }, i) => (
              <Text
                key={`${m.id}-${food.id}-${i}`}
                variant="small"
                color="muted"
                style={{ marginTop: 4 }}>
                · {servings > 1 ? `${servings}x ` : ''}{food.name}
              </Text>
            )),
          )}
        </View>
      ) : null}
    </Card>
  );
}

function groupByMealType(meals: Meal[]): Record<MealType, Meal[]> {
  return meals.reduce(
    (acc, m) => {
      acc[m.mealType].push(m);
      return acc;
    },
    { breakfast: [], lunch: [], dinner: [], snack: [] } as Record<MealType, Meal[]>,
  );
}

const styles = StyleSheet.create({
  header: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  macrosCard: {
    marginBottom: Spacing.lg,
  },
  macroRow: {
    flexDirection: 'row',
    gap: Spacing.lg,
    marginTop: Spacing.md,
  },
  macro: {
    flex: 1,
  },
  macroValue: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: Spacing.xs,
  },
  progressTrack: {
    height: 4,
    backgroundColor: Colors.dark.border,
    borderRadius: 2,
    marginTop: Spacing.sm,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.dark.accent,
  },
  sectionLabel: {
    marginTop: Spacing.md,
    marginBottom: Spacing.md,
  },
  mealCard: {
    marginBottom: Spacing.sm,
  },
  mealHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  mealIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.dark.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  foodPreview: {
    marginTop: Spacing.md,
    paddingLeft: 52,
  },
});
