import { View, StyleSheet } from 'react-native';
import { Camera, Plus, Coffee, Sun, Moon } from 'lucide-react-native';

import { Screen } from '@/components/velo/Screen';
import { Text } from '@/components/velo/Text';
import { Card } from '@/components/velo/Card';
import { Button } from '@/components/velo/Button';
import { Colors, Spacing } from '@/constants/theme';

export default function NutritionScreen() {
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
          <Macro label="Calories" value="0" target="2400" unit="kcal" />
          <Macro label="Protein" value="0" target="180" unit="g" />
        </View>
        <View style={styles.macroRow}>
          <Macro label="Carbs" value="0" target="280" unit="g" />
          <Macro label="Fat" value="0" target="80" unit="g" />
        </View>
      </Card>

      <View style={styles.actionRow}>
        <Button
          label="Snap a meal"
          icon={<Camera size={18} color="#0a0a0a" strokeWidth={2.5} />}
          onPress={() => {}}
          fullWidth
        />
      </View>

      <Button
        label="Add manually"
        variant="secondary"
        icon={<Plus size={18} color={Colors.dark.text} strokeWidth={2.5} />}
        onPress={() => {}}
        fullWidth
        style={{ marginTop: Spacing.md, marginBottom: Spacing.xl }}
      />

      <Text variant="label" color="muted" style={styles.sectionLabel}>
        Meals
      </Text>

      <MealRow
        icon={<Coffee size={20} color={Colors.dark.textMuted} strokeWidth={2} />}
        title="Breakfast"
        subtitle="Not logged yet"
      />
      <MealRow
        icon={<Sun size={20} color={Colors.dark.textMuted} strokeWidth={2} />}
        title="Lunch"
        subtitle="Not logged yet"
      />
      <MealRow
        icon={<Moon size={20} color={Colors.dark.textMuted} strokeWidth={2} />}
        title="Dinner"
        subtitle="Not logged yet"
      />
      <MealRow
        icon={<Plus size={20} color={Colors.dark.textMuted} strokeWidth={2} />}
        title="Snacks"
        subtitle="Not logged yet"
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
  value: string;
  target: string;
  unit: string;
}) {
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
        <View style={[styles.progressFill, { width: '0%' }]} />
      </View>
    </View>
  );
}

function MealRow({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <Card style={styles.mealRow} onPress={() => {}}>
      <View style={styles.mealIcon}>{icon}</View>
      <View style={styles.mealContent}>
        <Text variant="body" weight="semibold">
          {title}
        </Text>
        <Text variant="small" color="dim">
          {subtitle}
        </Text>
      </View>
      <Plus size={18} color={Colors.dark.textDim} strokeWidth={2} />
    </Card>
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
  actionRow: {
    flexDirection: 'row',
  },
  sectionLabel: {
    marginTop: Spacing.md,
    marginBottom: Spacing.md,
  },
  mealRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.md,
    marginBottom: Spacing.sm,
  },
  mealIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.dark.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mealContent: {
    flex: 1,
  },
});
