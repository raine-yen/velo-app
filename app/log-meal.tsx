import { useMemo, useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable, TextInput, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { X, Plus, Minus, Search, Camera, Sparkles } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';

import { Button } from '@/components/velo/Button';
import { Card } from '@/components/velo/Card';
import { Text } from '@/components/velo/Text';
import { Radius, Spacing } from '@/constants/theme';
import { useColors } from '@/hooks/useColors';
import { STARTER_FOODS } from '@/lib/constants';
import { useNutritionStore } from '@/stores/nutritionStore';
import { FoodItem, MealType } from '@/types';

const MEAL_TYPES: { id: MealType; label: string }[] = [
  { id: 'breakfast', label: 'Breakfast' },
  { id: 'lunch', label: 'Lunch' },
  { id: 'dinner', label: 'Dinner' },
  { id: 'snack', label: 'Snack' },
];

function detectMealType(): MealType {
  const h = new Date().getHours();
  if (h < 11) return 'breakfast';
  if (h < 15) return 'lunch';
  if (h < 21) return 'dinner';
  return 'snack';
}

export default function LogMealModal() {
  const router = useRouter();
  const colors = useColors();
  const logMeal = useNutritionStore((s) => s.logMeal);

  const [mealType, setMealType] = useState<MealType>(detectMealType());
  const [search, setSearch] = useState('');
  const [items, setItems] = useState<{ food: FoodItem; servings: number }[]>([]);
  const [photoUri, setPhotoUri] = useState<string | null>(null);

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

  const openCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') return;
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      quality: 0.7,
      allowsEditing: false,
    });
    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const addFood = (food: FoodItem) => {
    const existing = items.find((i) => i.food.id === food.id);
    if (existing) {
      setItems(items.map((i) => (i.food.id === food.id ? { ...i, servings: i.servings + 1 } : i)));
    } else {
      setItems([...items, { food, servings: 1 }]);
    }
  };

  const decFood = (id: string) =>
    setItems((c) => c.map((i) => (i.food.id === id ? { ...i, servings: i.servings - 1 } : i)).filter((i) => i.servings > 0));

  const incFood = (id: string) =>
    setItems((c) => c.map((i) => (i.food.id === id ? { ...i, servings: i.servings + 1 } : i)));

  const save = () => {
    if (items.length === 0) return;
    logMeal(mealType, items);
    router.back();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable hitSlop={12} onPress={() => router.back()}>
          <X size={24} color={colors.text} strokeWidth={2} />
        </Pressable>
        <Text variant="title" weight="semibold">Log meal</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent} keyboardShouldPersistTaps="handled">

        {/* Photo area */}
        {photoUri ? (
          <View style={styles.photoWrap}>
            <Image source={{ uri: photoUri }} style={styles.photo} resizeMode="cover" />
            <View style={[styles.aiPill, { backgroundColor: colors.accent }]}>
              <Sparkles size={13} color="#0a0a0a" strokeWidth={2.5} />
              <Text variant="caption" weight="semibold" style={{ color: '#0a0a0a' }}>
                AI logging coming soon — add foods below
              </Text>
            </View>
            <Pressable style={styles.retake} onPress={openCamera} hitSlop={8}>
              <Text variant="small" color="muted">Retake</Text>
            </Pressable>
          </View>
        ) : (
          <Pressable
            style={[styles.cameraBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={openCamera}>
            <Camera size={28} color={colors.accent} strokeWidth={2} />
            <Text variant="body" weight="semibold" style={{ marginTop: Spacing.sm }}>Snap your meal</Text>
            <Text variant="small" color="muted">Opens camera · log foods below</Text>
          </Pressable>
        )}

        {/* Meal type */}
        <Text variant="label" color="muted" style={styles.section}>Meal type</Text>
        <View style={styles.chipRow}>
          {MEAL_TYPES.map((m) => (
            <Pressable key={m.id} onPress={() => setMealType(m.id)}
              style={[styles.chip, { backgroundColor: colors.surface, borderColor: colors.border },
                mealType === m.id && { backgroundColor: colors.accent, borderColor: colors.accent }]}>
              <Text variant="small" weight="semibold" style={{ color: mealType === m.id ? '#0a0a0a' : colors.text }}>
                {m.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Selected foods */}
        {items.length > 0 ? (
          <>
            <Text variant="label" color="muted" style={styles.section}>Selected</Text>
            <View style={styles.list}>
              {items.map(({ food, servings }) => (
                <Card key={food.id} style={styles.itemRow}>
                  <View style={{ flex: 1 }}>
                    <Text variant="body" weight="semibold">{food.name}</Text>
                    <Text variant="small" color="dim">{Math.round(food.calories * servings)} kcal · {food.servingDesc}</Text>
                  </View>
                  <View style={styles.qty}>
                    <Pressable hitSlop={8} onPress={() => decFood(food.id)}
                      style={[styles.qtyBtn, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
                      <Minus size={14} color={colors.text} strokeWidth={2.5} />
                    </Pressable>
                    <Text variant="body" weight="semibold" style={{ minWidth: 24, textAlign: 'center' }}>{servings}</Text>
                    <Pressable hitSlop={8} onPress={() => incFood(food.id)}
                      style={[styles.qtyBtn, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
                      <Plus size={14} color={colors.text} strokeWidth={2.5} />
                    </Pressable>
                  </View>
                </Card>
              ))}
            </View>
          </>
        ) : null}

        {/* Search */}
        <Text variant="label" color="muted" style={styles.section}>Add food</Text>
        <View style={[styles.searchWrap, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Search size={16} color={colors.textDim} strokeWidth={2} />
          <TextInput style={[styles.searchInput, { color: colors.text }]} placeholder="Search foods"
            placeholderTextColor={colors.textDim} value={search} onChangeText={setSearch} autoCorrect={false} />
        </View>

        <View style={styles.list}>
          {filtered.map((food) => (
            <Pressable key={food.id} onPress={() => addFood(food)}
              style={({ pressed }) => [styles.foodRow, { backgroundColor: colors.surface, borderColor: colors.border },
                pressed && { backgroundColor: colors.surfaceElevated }]}>
              <View style={{ flex: 1 }}>
                <Text variant="body" weight="semibold">{food.name}</Text>
                <Text variant="small" color="dim">{food.servingDesc} · {food.calories} kcal · {food.protein}g protein</Text>
              </View>
              <View style={[styles.addBtn, { backgroundColor: colors.surfaceElevated }]}>
                <Plus size={16} color={colors.accent} strokeWidth={2.5} />
              </View>
            </Pressable>
          ))}
          {filtered.length === 0 ? (
            <Text variant="body" color="dim" style={{ textAlign: 'center', padding: Spacing.lg }}>No matches.</Text>
          ) : null}
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={[styles.footer, { borderTopColor: colors.borderMuted }]}>
        {items.length > 0 ? (
          <View style={styles.totals}>
            {([['kcal', totals.calories], ['P', totals.protein], ['C', totals.carbs], ['F', totals.fat]] as [string, number][]).map(([label, val]) => (
              <View key={label} style={{ alignItems: 'center', flex: 1 }}>
                <Text variant="body" weight="semibold">{Math.round(val)}</Text>
                <Text variant="caption" color="muted">{label}</Text>
              </View>
            ))}
          </View>
        ) : null}
        <Button label={items.length === 0 ? 'Pick at least one food' : 'Save meal'} onPress={save} fullWidth
          style={items.length === 0 ? { opacity: 0.4 } : undefined} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md },
  body: { flex: 1 },
  bodyContent: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xl },
  cameraBtn: { borderWidth: 1, borderRadius: Radius.lg, borderStyle: 'dashed', padding: Spacing.xl, alignItems: 'center', marginBottom: Spacing.lg },
  photoWrap: { borderRadius: Radius.lg, overflow: 'hidden', marginBottom: Spacing.lg, position: 'relative' },
  photo: { width: '100%', height: 200 },
  aiPill: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, position: 'absolute', bottom: Spacing.md, left: Spacing.md, paddingHorizontal: Spacing.sm, paddingVertical: 5, borderRadius: Radius.pill },
  retake: { position: 'absolute', top: Spacing.md, right: Spacing.md, paddingHorizontal: Spacing.sm, paddingVertical: 4, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: Radius.pill },
  section: { marginTop: Spacing.lg, marginBottom: Spacing.md },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  chip: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: Radius.pill, borderWidth: 1 },
  list: { gap: Spacing.sm },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  qty: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  qtyBtn: { width: 28, height: 28, borderRadius: 14, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  searchWrap: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingHorizontal: Spacing.md, paddingVertical: 12, borderRadius: Radius.lg, borderWidth: 1, marginBottom: Spacing.md },
  searchInput: { flex: 1, fontSize: 15, padding: 0 },
  foodRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, padding: Spacing.md, borderRadius: Radius.md, borderWidth: 1 },
  addBtn: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  footer: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.md, paddingBottom: Spacing.md, borderTopWidth: 1, gap: Spacing.md },
  totals: { flexDirection: 'row', paddingVertical: Spacing.sm },
});
