import { useMemo } from 'react';
import { Pressable, View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Camera, Plus, Coffee, Sun, Moon, Apple, Pencil } from 'lucide-react-native';

import { Screen } from '@/components/velo/Screen';
import { Text } from '@/components/velo/Text';
import { Card } from '@/components/velo/Card';
import { Button } from '@/components/velo/Button';
import { Radius, Spacing } from '@/constants/theme';
import { useColors } from '@/hooks/useColors';
import { useUserStore } from '@/stores/userStore';
import { getTodayMeals, getTodayTotals, useNutritionStore } from '@/stores/nutritionStore';
import { SwipeToDelete } from '@/components/velo/SwipeToDelete';
import { Meal, MealType } from '@/types';

export default function NutritionScreen() {
  const router = useRouter();
  const colors = useColors();
  const targets = useUserStore((s) => s.profile.targets);
  const meals = useNutritionStore((s) => s.meals);
  const removeMeal = useNutritionStore((s) => s.removeMeal);
  const totals = useMemo(() => getTodayTotals(meals), [meals]);
  const todayMeals = useMemo(() => getTodayMeals(meals), [meals]);
  const grouped = useMemo(() => groupByMealType(todayMeals), [todayMeals]);

  return (
    <Screen>
      <View style={styles.header}>
        <Text variant="label" color="muted">Nutrition</Text>
        <Text variant="display" weight="bold" style={{ marginTop: Spacing.xs }}>Today's plate</Text>
      </View>

      <Card style={styles.macrosCard}>
        <Text variant="label" color="muted">Daily targets</Text>
        <View style={styles.macroRow}>
          <Macro label="Calories" value={totals.calories} target={targets.calories} unit="kcal" colors={colors} />
          <Macro label="Protein" value={totals.protein} target={targets.protein} unit="g" colors={colors} />
        </View>
        <View style={styles.macroRow}>
          <Macro label="Carbs" value={totals.carbs} target={targets.carbs} unit="g" colors={colors} />
          <Macro label="Fat" value={totals.fat} target={targets.fat} unit="g" colors={colors} />
        </View>
      </Card>

      <Button label="Snap a meal" icon={<Camera size={18} color="#0a0a0a" strokeWidth={2.5} />}
        onPress={() => router.push('/log-meal')} fullWidth />
      <Button label="Add manually" variant="secondary" icon={<Plus size={18} color={colors.text} strokeWidth={2.5} />}
        onPress={() => router.push('/log-meal')} fullWidth style={{ marginTop: Spacing.md, marginBottom: Spacing.xl }} />

      <Text variant="label" color="muted" style={styles.sectionLabel}>Meals</Text>
      <MealSection icon={<Coffee size={20} color={colors.textMuted} strokeWidth={2} />} title="Breakfast" meals={grouped.breakfast} colors={colors} onAdd={() => router.push('/log-meal')} onDelete={removeMeal} onEdit={(id) => router.push(`/log-meal?id=${id}`)} />
      <MealSection icon={<Sun size={20} color={colors.textMuted} strokeWidth={2} />} title="Lunch" meals={grouped.lunch} colors={colors} onAdd={() => router.push('/log-meal')} onDelete={removeMeal} onEdit={(id) => router.push(`/log-meal?id=${id}`)} />
      <MealSection icon={<Moon size={20} color={colors.textMuted} strokeWidth={2} />} title="Dinner" meals={grouped.dinner} colors={colors} onAdd={() => router.push('/log-meal')} onDelete={removeMeal} onEdit={(id) => router.push(`/log-meal?id=${id}`)} />
      <MealSection icon={<Apple size={20} color={colors.textMuted} strokeWidth={2} />} title="Snacks" meals={grouped.snack} colors={colors} onAdd={() => router.push('/log-meal')} onDelete={removeMeal} onEdit={(id) => router.push(`/log-meal?id=${id}`)} />
    </Screen>
  );
}

function Macro({ label, value, target, unit, colors }: { label: string; value: number; target: number; unit: string; colors: ReturnType<typeof useColors> }) {
  const pct = target > 0 ? Math.min(100, (value / target) * 100) : 0;
  return (
    <View style={styles.macro}>
      <Text variant="caption" color="muted">{label}</Text>
      <View style={styles.macroValue}>
        <Text variant="title" weight="semibold">{value}</Text>
        <Text variant="small" color="dim">{' / '}{target} {unit}</Text>
      </View>
      <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
        <View style={[styles.progressFill, { width: `${pct}%` as any, backgroundColor: colors.accent }]} />
      </View>
    </View>
  );
}

function MealSection({ icon, title, meals, colors, onAdd, onDelete, onEdit }: {
  icon: React.ReactNode; title: string; meals: Meal[];
  colors: ReturnType<typeof useColors>; onAdd: () => void; onDelete: (id: string) => void; onEdit: (id: string) => void;
}) {
  const totalKcal = meals.reduce((acc, m) => acc + m.calories, 0);
  return (
    <View style={styles.mealCard}>
      <Card onPress={onAdd}>
        <View style={styles.mealHeader}>
          <View style={[styles.mealIcon, { backgroundColor: colors.surfaceElevated }]}>{icon}</View>
          <View style={{ flex: 1 }}>
            <Text variant="body" weight="semibold">{title}</Text>
            <Text variant="small" color="dim">
              {meals.length === 0 ? 'Not logged yet' : `${meals.length} item${meals.length !== 1 ? 's' : ''} · ${totalKcal} kcal`}
            </Text>
          </View>
          <Plus size={18} color={colors.textDim} strokeWidth={2} />
        </View>
      </Card>
      {meals.map((m) => (
        <SwipeToDelete key={m.id} onDelete={() => onDelete(m.id)}>
          <View style={[styles.loggedRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={{ flex: 1 }}>
              {m.foods.map(({ food, servings }, i) => (
                <Text key={i} variant="small" color="muted">· {servings > 1 ? `${servings}x ` : ''}{food.name}</Text>
              ))}
            </View>
            <Text variant="small" color="dim">{m.calories} kcal</Text>
            <Pressable hitSlop={8} onPress={() => onEdit(m.id)}>
              <Pencil size={14} color={colors.textDim} strokeWidth={2} />
            </Pressable>
          </View>
        </SwipeToDelete>
      ))}
    </View>
  );
}

function groupByMealType(meals: Meal[]): Record<MealType, Meal[]> {
  return meals.reduce(
    (acc, m) => { acc[m.mealType].push(m); return acc; },
    { breakfast: [], lunch: [], dinner: [], snack: [] } as Record<MealType, Meal[]>,
  );
}

const styles = StyleSheet.create({
  header: { marginTop: Spacing.lg, marginBottom: Spacing.xl },
  macrosCard: { marginBottom: Spacing.lg },
  macroRow: { flexDirection: 'row', gap: Spacing.lg, marginTop: Spacing.md },
  macro: { flex: 1 },
  macroValue: { flexDirection: 'row', alignItems: 'baseline', marginTop: Spacing.xs },
  progressTrack: { height: 4, borderRadius: 2, marginTop: Spacing.sm, overflow: 'hidden' },
  progressFill: { height: '100%' },
  sectionLabel: { marginTop: Spacing.md, marginBottom: Spacing.md },
  mealCard: { marginBottom: Spacing.sm, gap: 4 },
  mealHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  mealIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  loggedRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderWidth: 1, borderRadius: Radius.md },
});
