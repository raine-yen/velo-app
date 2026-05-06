import { useMemo, useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { X, Plus, Minus, Search, Camera } from 'lucide-react-native';

import { Button } from '@/components/velo/Button';
import { Card } from '@/components/velo/Card';
import { Text } from '@/components/velo/Text';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { STARTER_FOODS } from '@/lib/constants';
import { useNutritionStore } from '@/stores/nutritionStore';
import { FoodItem, MealType } from '@/types';

const MEAL_TYPES: { id: MealType; label: string }[] = [
  { id: 'breakfast', label: 'Breakfast' },
  { id: 'lunch', label: 'Lunch' },
  { id: 'dinner', label: 'Dinner' },
  { id: 'snack', label: 'Snack' },
];

export default function LogMealModal() {
  const router = useRouter();
  const logMeal = useNutritionStore((s) => s.logMeal);
  const [mealType, setMealType] = useState<MealType>(detectMealType());
  const [search, setSearch] = useState('');
  const [items, setItems] = useState<{ food: FoodItem; servings: number }[]>([]);

  const filtered = useMemo(() => {
    if (!search) return STARTER_FOODS;
    const q = search.toLowerCase();
    return STARTER_FOODS.filter((f) => f.name.toLowerCase().includes(q));
  }, [search]);

  const totals = items.reduce(
    (acc, { food, servings }) => ({
      calories: acc.calories + food.calories * servings,
      protein: acc.protein + food.protein * servings,
      carbs: acc.carbs + food.carbs * servings,
      fat: acc.fat + food.fat * servings,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 },
  );

  const addFood = (food: FoodItem) => {
    const existing = items.find((i) => i.food.id === food.id);
    if (existing) {
      setItems(
        items.map((i) => (i.food.id === food.id ? { ...i, servings: i.servings + 1 } : i)),
      );
    } else {
      setItems([...items, { food, servings: 1 }]);
    }
  };

  const decFood = (id: string) => {
    setItems((curr) =>
      curr
        .map((i) => (i.food.id === id ? { ...i, servings: i.servings - 1 } : i))
        .filter((i) => i.servings > 0),
    );
  };

  const incFood = (id: string) => {
    setItems((curr) =>
      curr.map((i) => (i.food.id === id ? { ...i, servings: i.servings + 1 } : i)),
    );
  };

  const save = () => {
    if (items.length === 0) return;
    logMeal(mealType, items);
    router.back();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable hitSlop={12} onPress={() => router.back()}>
          <X size={24} color={Colors.dark.text} strokeWidth={2} />
        </Pressable>
        <Text variant="title" weight="semibold">
          Log meal
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.body}
        contentContainerStyle={styles.bodyContent}
        keyboardShouldPersistTaps="handled">
        <View style={styles.cameraHint}>
          <Camera size={16} color={Colors.dark.textDim} strokeWidth={2} />
          <Text variant="small" color="dim">
            Photo logging coming soon
          </Text>
        </View>

        <Text variant="label" color="muted" style={styles.section}>
          Meal type
        </Text>
        <View style={styles.chipRow}>
          {MEAL_TYPES.map((m) => (
            <Pressable
              key={m.id}
              onPress={() => setMealType(m.id)}
              style={[styles.chip, mealType === m.id && styles.chipActive]}>
              <Text
                variant="small"
                weight="semibold"
                style={{
                  color: mealType === m.id ? '#0a0a0a' : Colors.dark.text,
                }}>
                {m.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {items.length > 0 ? (
          <>
            <Text variant="label" color="muted" style={styles.section}>
              Selected
            </Text>
            <View style={styles.list}>
              {items.map(({ food, servings }) => (
                <Card key={food.id} style={styles.itemRow}>
                  <View style={{ flex: 1 }}>
                    <Text variant="body" weight="semibold">
                      {food.name}
                    </Text>
                    <Text variant="small" color="dim">
                      {Math.round(food.calories * servings)} kcal · {food.servingDesc}
                    </Text>
                  </View>
                  <View style={styles.qty}>
                    <Pressable
                      hitSlop={8}
                      onPress={() => decFood(food.id)}
                      style={styles.qtyBtn}>
                      <Minus size={14} color={Colors.dark.text} strokeWidth={2.5} />
                    </Pressable>
                    <Text variant="body" weight="semibold" style={{ minWidth: 24, textAlign: 'center' }}>
                      {servings}
                    </Text>
                    <Pressable
                      hitSlop={8}
                      onPress={() => incFood(food.id)}
                      style={styles.qtyBtn}>
                      <Plus size={14} color={Colors.dark.text} strokeWidth={2.5} />
                    </Pressable>
                  </View>
                </Card>
              ))}
            </View>
          </>
        ) : null}

        <Text variant="label" color="muted" style={styles.section}>
          Add food
        </Text>

        <View style={styles.searchWrap}>
          <Search size={16} color={Colors.dark.textDim} strokeWidth={2} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search foods"
            placeholderTextColor={Colors.dark.textDim}
            value={search}
            onChangeText={setSearch}
            autoCorrect={false}
          />
        </View>

        <View style={styles.list}>
          {filtered.map((food) => (
            <Pressable
              key={food.id}
              onPress={() => addFood(food)}
              style={({ pressed }) => [
                styles.foodRow,
                pressed && { backgroundColor: Colors.dark.surfaceElevated },
              ]}>
              <View style={{ flex: 1 }}>
                <Text variant="body" weight="semibold">
                  {food.name}
                </Text>
                <Text variant="small" color="dim">
                  {food.servingDesc} · {food.calories} kcal · {food.protein}g protein
                </Text>
              </View>
              <View style={styles.addBtn}>
                <Plus size={16} color={Colors.dark.accent} strokeWidth={2.5} />
              </View>
            </Pressable>
          ))}
          {filtered.length === 0 ? (
            <Text variant="body" color="dim" style={{ textAlign: 'center', padding: Spacing.lg }}>
              No matches.
            </Text>
          ) : null}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        {items.length > 0 ? (
          <View style={styles.totals}>
            <Total label="kcal" value={Math.round(totals.calories)} />
            <Total label="P" value={Math.round(totals.protein)} />
            <Total label="C" value={Math.round(totals.carbs)} />
            <Total label="F" value={Math.round(totals.fat)} />
          </View>
        ) : null}
        <Button
          label={items.length === 0 ? 'Pick at least one food' : 'Save meal'}
          onPress={save}
          fullWidth
          style={items.length === 0 ? { opacity: 0.4 } : undefined}
        />
      </View>
    </SafeAreaView>
  );
}

function Total({ label, value }: { label: string; value: number }) {
  return (
    <View style={{ alignItems: 'center', flex: 1 }}>
      <Text variant="body" weight="semibold">
        {value}
      </Text>
      <Text variant="caption" color="muted">
        {label}
      </Text>
    </View>
  );
}

function detectMealType(): MealType {
  const h = new Date().getHours();
  if (h < 11) return 'breakfast';
  if (h < 15) return 'lunch';
  if (h < 21) return 'dinner';
  return 'snack';
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  body: {
    flex: 1,
  },
  bodyContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  cameraHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.md,
  },
  section: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.pill,
    backgroundColor: Colors.dark.surface,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  chipActive: {
    backgroundColor: Colors.dark.accent,
    borderColor: Colors.dark.accent,
  },
  list: {
    gap: Spacing.sm,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  qty: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  qtyBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.dark.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    backgroundColor: Colors.dark.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    marginBottom: Spacing.md,
  },
  searchInput: {
    flex: 1,
    color: Colors.dark.text,
    fontSize: 15,
    padding: 0,
  },
  foodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    backgroundColor: Colors.dark.surface,
  },
  addBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.dark.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.dark.borderMuted,
    gap: Spacing.md,
  },
  totals: {
    flexDirection: 'row',
    paddingVertical: Spacing.sm,
  },
});
