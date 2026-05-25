import { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Activity, Flame, Footprints } from 'lucide-react-native';

import { Card } from '@/components/velo/Card';
import { InsightCard } from '@/components/velo/InsightCard';
import { Screen } from '@/components/velo/Screen';
import { Text } from '@/components/velo/Text';
import { Spacing } from '@/constants/theme';
import { useColors } from '@/hooks/useColors';
import { useVeloInsight } from '@/hooks/useVeloInsight';
import { formatMinutes, formatNumber } from '@/lib/format';
import { WORKOUT_LABEL } from '@/lib/constants';
import { useHealthStore } from '@/stores/healthStore';
import { getTodayWorkouts, useWorkoutStore } from '@/stores/workoutStore';

export default function ActivityDetailScreen() {
  const colors = useColors();
  const snap = useHealthStore((s) => s.snapshot);
  const workouts = useWorkoutStore((s) => s.workouts);
  const today = useMemo(() => getTodayWorkouts(workouts), [workouts]);
  const { insight, loading } = useVeloInsight('training');

  return (
    <Screen>
      <View style={styles.header}>
        <Text variant="label" color="muted">Activity</Text>
        <Text variant="display" weight="bold">Today's strain</Text>
      </View>

      <View style={styles.grid}>
        <Metric icon={<Activity size={18} color={colors.accent} />} label="Active" value={formatMinutes(snap?.activeMinutes)} />
        <Metric icon={<Flame size={18} color={colors.accent} />} label="Active kcal" value={formatNumber(snap?.activeCalories)} />
        <Metric icon={<Footprints size={18} color={colors.accent} />} label="Steps" value={formatNumber(snap?.steps)} />
      </View>

      <Text variant="label" color="muted" style={styles.section}>Workouts</Text>
      {today.length ? today.map((workout) => (
        <Card key={workout.id} style={styles.workout}>
          <Text variant="body" weight="semibold">{workout.name}</Text>
          <Text variant="small" color="dim">
            {WORKOUT_LABEL[workout.type]} - {workout.durationMin} min
            {workout.distanceKm ? ` - ${workout.distanceKm.toFixed(1)} km` : ''}
            {workout.healthData?.caloriesBurned ? ` - ${workout.healthData.caloriesBurned} kcal` : ''}
          </Text>
        </Card>
      )) : (
        <Card>
          <Text variant="body" weight="semibold">No workout imported today</Text>
          <Text variant="small" color="muted" style={{ marginTop: Spacing.xs }}>
            Apple Exercise Time can still count active minutes outside logged workouts.
          </Text>
        </Card>
      )}

      <InsightCard insight={insight} loading={loading} title="Training coach" />
    </Screen>
  );
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <Card style={styles.metric}>
      {icon}
      <Text variant="title" weight="semibold">{value}</Text>
      <Text variant="caption" color="muted">{label}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  header: { marginTop: Spacing.lg, marginBottom: Spacing.xl, gap: Spacing.xs },
  grid: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md },
  metric: { flex: 1, gap: Spacing.xs },
  section: { marginTop: Spacing.md, marginBottom: Spacing.md },
  workout: { marginBottom: Spacing.sm },
});
