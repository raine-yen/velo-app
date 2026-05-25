import { useMemo, useState } from 'react';
import { Platform, View, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Plus, Zap, Pencil, Heart } from 'lucide-react-native';

import { Screen } from '@/components/velo/Screen';
import { Text } from '@/components/velo/Text';
import { Card } from '@/components/velo/Card';
import { Button } from '@/components/velo/Button';
import { InsightCard } from '@/components/velo/InsightCard';
import { Spacing } from '@/constants/theme';
import { useColors } from '@/hooks/useColors';
import { useVeloInsight } from '@/hooks/useVeloInsight';
import { startOfWeekSunday, isoDate } from '@/lib/date';
import { useWorkoutStore } from '@/stores/workoutStore';
import { WORKOUT_LABEL } from '@/lib/constants';
import { Workout } from '@/types';

const DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export default function TrainingScreen() {
  const router = useRouter();
  const colors = useColors();
  const workouts = useWorkoutStore((s) => s.workouts);
  const { insight, loading } = useVeloInsight('training');
  const [selectedDate, setSelectedDate] = useState(isoDate());

  const weekDays = useMemo(() => buildWeekDays(workouts), [workouts]);
  const selectedWorkouts = useMemo(() => workouts.filter((w) => w.completedAt.slice(0, 10) === selectedDate), [selectedDate, workouts]);
  const weekWorkouts = useMemo(() => workouts.filter((w) => weekDays.some((day) => day.date === w.completedAt.slice(0, 10))), [weekDays, workouts]);
  const weekActiveMin = useMemo(() => weekWorkouts.reduce((sum, workout) => sum + workout.durationMin, 0), [weekWorkouts]);
  const weekDistance = useMemo(() => Math.round(weekWorkouts.reduce((acc, w) => acc + (w.distanceKm ?? 0), 0) * 10) / 10, [weekWorkouts]);
  const avgIntensity = weekWorkouts.length
    ? Math.round((weekWorkouts.reduce((acc, w) => acc + w.intensity, 0) / weekWorkouts.length) * 10) / 10
    : 0;

  return (
    <Screen>
      <View style={styles.header}>
        <Text variant="label" color="muted">Training</Text>
        <Text variant="display" weight="bold" style={{ marginTop: Spacing.xs }}>This week</Text>
      </View>

      <Card style={styles.calendarCard}>
        <View style={styles.weekRow}>
          {weekDays.map((day, i) => {
            const isSelected = day.date === selectedDate;
            return (
              <Pressable key={day.date} onPress={() => setSelectedDate(day.date)} style={styles.dayWrap}>
                <Text variant="caption" color={isSelected ? 'accent' : 'dim'}>{DAYS[i]}</Text>
                <View style={[styles.dayBar, { backgroundColor: colors.surfaceElevated, borderColor: isSelected ? colors.accent : colors.border }]}>
                  <View style={[
                    styles.dayFill,
                    {
                      height: `${Math.min(100, Math.max(8, (day.minutes / 90) * 100))}%`,
                      backgroundColor: day.minutes > 0 ? colors.accent : colors.border,
                    },
                  ]} />
                </View>
                <Text variant="caption" color="dim">{day.minutes || '-'}</Text>
              </Pressable>
            );
          })}
        </View>
      </Card>

      <View style={styles.actionRow}>
        <Button label="Log workout" icon={<Plus size={18} color="#0a0a0a" strokeWidth={2.5} />}
          onPress={() => router.push('/log-workout')} style={{ flex: 1 }} />
        {Platform.OS === 'ios' && (
          <Button label="Health" variant="secondary" icon={<Heart size={16} color="red" strokeWidth={2} />}
            onPress={() => router.push('/health-import')} />
        )}
      </View>

      <Text variant="label" color="muted" style={styles.sectionLabel}>
        {new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
      </Text>
      {selectedWorkouts.length ? (
        <View style={styles.list}>
          {selectedWorkouts.map((workout) => (
            <WorkoutRow key={workout.id} workout={workout} colors={colors} onOpen={() => router.push(`/workout-detail?id=${workout.id}`)} />
          ))}
        </View>
      ) : (
        <Card>
          <Text variant="body" weight="semibold">No workouts this day</Text>
          <Text variant="small" color="muted" style={{ marginTop: Spacing.xs }}>Select another day or import from Apple Health.</Text>
        </Card>
      )}

      <Text variant="label" color="muted" style={[styles.sectionLabel, { marginTop: Spacing.xl }]}>This week</Text>
      <View style={styles.statRow}>
        <SummaryCard label="Sessions" value={`${weekWorkouts.length}`} />
        <SummaryCard label="Active min" value={`${weekActiveMin}`} />
        <SummaryCard label="Distance" value={weekDistance > 0 ? `${weekDistance}` : '-'} />
        <SummaryCard label="Avg intensity" value={avgIntensity > 0 ? `${avgIntensity}` : '-'} />
      </View>
      <InsightCard insight={insight} loading={loading} title="Load this week" onPress={() => router.push('/ai-insight-detail?kind=training')} />
    </Screen>
  );
}

function WorkoutRow({ workout, colors, onOpen }: { workout: Workout; colors: ReturnType<typeof useColors>; onOpen: () => void }) {
  const details = [
    WORKOUT_LABEL[workout.type],
    `${workout.durationMin} min`,
    workout.distanceKm ? `${workout.distanceKm.toFixed(1)} km` : null,
    workout.healthData?.avgHeartRate ? `${workout.healthData.avgHeartRate} bpm` : null,
    workout.healthData?.caloriesBurned ? `${workout.healthData.caloriesBurned} kcal` : null,
  ].filter(Boolean).join(' - ');

  return (
    <Card style={styles.workoutRow} onPress={onOpen}>
      <View style={[styles.workoutIcon, {
        backgroundColor: workout.source === 'apple_health' ? '#FF375F22' : workout.source === 'strava' ? '#FC4C0222' : colors.surfaceElevated,
      }]}>
        {workout.source === 'apple_health' ? <Heart size={20} color="#FF375F" strokeWidth={2} />
          : workout.source === 'strava' ? <Zap size={20} color="#FC4C02" strokeWidth={2} />
          : <Zap size={20} color={colors.accent} strokeWidth={2} />}
      </View>
      <View style={{ flex: 1 }}>
        <Text variant="body" weight="semibold">{workout.name}</Text>
        <Text variant="small" color="dim">{details}</Text>
      </View>
      <Pencil size={16} color={colors.textDim} strokeWidth={2} />
    </Card>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <Card style={styles.summaryCard}>
      <Text variant="title" weight="semibold">{value}</Text>
      <Text variant="caption" color="muted">{label}</Text>
    </Card>
  );
}

function buildWeekDays(workouts: Workout[]) {
  const start = startOfWeekSunday();
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    const key = isoDate(date);
    const dayWorkouts = workouts.filter((w) => w.completedAt.slice(0, 10) === key);
    return {
      date: key,
      minutes: dayWorkouts.reduce((sum, workout) => sum + workout.durationMin, 0),
    };
  });
}

const styles = StyleSheet.create({
  header: { marginTop: Spacing.lg, marginBottom: Spacing.xl },
  calendarCard: { marginBottom: Spacing.md },
  weekRow: { flexDirection: 'row', justifyContent: 'space-between' },
  dayWrap: { alignItems: 'center', gap: Spacing.sm },
  dayBar: { width: 28, height: 82, borderRadius: 14, borderWidth: 1, overflow: 'hidden', justifyContent: 'flex-end' },
  dayFill: { width: '100%', borderRadius: 14 },
  actionRow: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.lg, marginBottom: Spacing.xl },
  sectionLabel: { marginBottom: Spacing.md },
  list: { gap: Spacing.sm },
  workoutRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  workoutIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  statRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md },
  summaryCard: { flex: 1, alignItems: 'flex-start' },
});
