import { View, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Activity, Flame, Heart, Timer, Zap } from 'lucide-react-native';

import { Card } from '@/components/velo/Card';
import { Screen } from '@/components/velo/Screen';
import { Text } from '@/components/velo/Text';
import { Spacing } from '@/constants/theme';
import { useColors } from '@/hooks/useColors';
import { formatNumber } from '@/lib/format';
import { WORKOUT_LABEL } from '@/lib/constants';
import { useWorkoutStore } from '@/stores/workoutStore';

export default function WorkoutDetailScreen() {
  const colors = useColors();
  const { id } = useLocalSearchParams<{ id: string }>();
  const workout = useWorkoutStore((s) => s.workouts.find((w) => w.id === id));

  if (!workout) {
    return (
      <Screen>
        <View style={styles.header}>
          <Text variant="label" color="muted">Workout</Text>
          <Text variant="display" weight="bold">Not found</Text>
        </View>
      </Screen>
    );
  }

  const health = workout.healthData;

  return (
    <Screen>
      <View style={styles.header}>
        <Text variant="label" color="muted">{WORKOUT_LABEL[workout.type]}</Text>
        <Text variant="display" weight="bold">{workout.name}</Text>
        <Text variant="small" color="dim">{new Date(workout.completedAt).toLocaleString()}</Text>
      </View>

      <View style={styles.grid}>
        <Metric icon={<Timer size={18} color={colors.accent} />} label="Duration" value={`${workout.durationMin}m`} />
        <Metric icon={<Flame size={18} color={colors.accent} />} label="Calories" value={health?.caloriesBurned ? `${health.caloriesBurned}` : '-'} />
        <Metric icon={<Heart size={18} color="#FF375F" />} label="Avg HR" value={health?.avgHeartRate ? `${health.avgHeartRate}` : '-'} />
        <Metric icon={<Zap size={18} color={colors.accent} />} label="Max HR" value={health?.maxHeartRate ? `${health.maxHeartRate}` : '-'} />
      </View>

      <Card style={styles.stack}>
        <Text variant="title" weight="semibold">Apple Health detail</Text>
        <Detail label="Distance" value={workout.distanceKm ? `${workout.distanceKm.toFixed(2)} km` : null} />
        <Detail label="Pace" value={health?.avgPaceMinPerKm ? `${Math.floor(health.avgPaceMinPerKm)}:${Math.round((health.avgPaceMinPerKm % 1) * 60).toString().padStart(2, '0')}/km` : null} />
        <Detail label="Cadence" value={health?.avgCadence ? `${formatNumber(health.avgCadence)}` : null} />
        <Detail label="Power" value={health?.avgPowerWatts ? `${formatNumber(health.avgPowerWatts)} W` : null} />
        <Detail label="Swim stroke" value={health?.strokeType ?? null} />
        <Detail label="SWOLF" value={health?.swolf ? `${formatNumber(health.swolf)}` : null} />
        <Detail label="Pool length" value={health?.poolLengthM ? `${health.poolLengthM} m` : null} />
        <Detail label="Source" value={health?.sourceName ?? workout.source ?? 'manual'} />
        <Detail label="Device" value={health?.device ?? null} />
      </Card>

      {!health ? (
        <Card>
          <View style={styles.empty}>
            <Activity size={18} color={colors.textMuted} />
            <Text variant="small" color="muted">This workout was logged manually, so detailed Apple Health metrics are not available.</Text>
          </View>
        </Card>
      ) : null}
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

function Detail({ label, value }: { label: string; value: string | null }) {
  if (!value) return null;
  return (
    <View style={styles.detailRow}>
      <Text variant="small" color="muted">{label}</Text>
      <Text variant="small" weight="semibold">{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { marginTop: Spacing.lg, marginBottom: Spacing.xl, gap: Spacing.xs },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.md },
  metric: { width: '48%', gap: Spacing.xs },
  stack: { gap: Spacing.md, marginBottom: Spacing.md },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', gap: Spacing.md },
  empty: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
});
