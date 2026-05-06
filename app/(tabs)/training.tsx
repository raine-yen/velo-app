import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Plus, Zap } from 'lucide-react-native';

import { Screen } from '@/components/velo/Screen';
import { Text } from '@/components/velo/Text';
import { Card } from '@/components/velo/Card';
import { Button } from '@/components/velo/Button';
import { Colors, Spacing } from '@/constants/theme';
import { useWorkoutStore } from '@/stores/workoutStore';
import { WORKOUT_LABEL } from '@/lib/constants';
import { Workout } from '@/types';
import { isToday, isThisWeek } from '@/lib/date';

const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export default function TrainingScreen() {
  const router = useRouter();
  const workouts = useWorkoutStore((s) => s.workouts);
  const weekActiveMin = useWorkoutStore((s) => s.weekActiveMin());

  const today = new Date().getDay();
  const todayIdx = today === 0 ? 6 : today - 1;
  const weekWorkoutsByDay = computeWeekDays(workouts);
  const todaysWorkouts = workouts.filter((w) => isToday(w.completedAt));
  const recent = workouts.filter((w) => isThisWeek(w.completedAt)).slice(0, 5);
  const sessions = workouts.filter((w) => isThisWeek(w.completedAt)).length;
  const avgIntensity = recent.length
    ? Math.round((recent.reduce((acc, w) => acc + w.intensity, 0) / recent.length) * 10) / 10
    : 0;

  return (
    <Screen>
      <View style={styles.header}>
        <Text variant="label" color="muted">
          Training
        </Text>
        <Text variant="display" weight="bold" style={{ marginTop: Spacing.xs }}>
          This week
        </Text>
      </View>

      <View style={styles.weekRow}>
        {days.map((d, i) => {
          const isTodayCol = i === todayIdx;
          const hasWorkout = weekWorkoutsByDay[i];
          return (
            <View key={i} style={styles.dayWrap}>
              <Text variant="caption" color={isTodayCol ? 'accent' : 'dim'}>
                {d}
              </Text>
              <View
                style={[
                  styles.dayDot,
                  hasWorkout && styles.dayDotDone,
                  isTodayCol && styles.dayDotActive,
                ]}
              />
            </View>
          );
        })}
      </View>

      <Button
        label="Log a workout"
        icon={<Plus size={18} color="#0a0a0a" strokeWidth={2.5} />}
        onPress={() => router.push('/log-workout')}
        fullWidth
        style={{ marginTop: Spacing.lg, marginBottom: Spacing.xl }}
      />

      <Text variant="label" color="muted" style={styles.sectionLabel}>
        Today
      </Text>

      {todaysWorkouts.length > 0 ? (
        <View style={styles.list}>
          {todaysWorkouts.map((w) => (
            <WorkoutRow key={w.id} workout={w} />
          ))}
        </View>
      ) : (
        <Card>
          <Text variant="caption" color="dim">
            NO WORKOUT YET
          </Text>
          <Text variant="title" style={{ marginTop: Spacing.sm }}>
            Open day
          </Text>
          <Text variant="body" color="muted" style={{ marginTop: Spacing.sm }}>
            Recovery is part of the work, but if you trained — log it.
          </Text>
        </Card>
      )}

      {recent.filter((w) => !isToday(w.completedAt)).length > 0 ? (
        <>
          <Text variant="label" color="muted" style={[styles.sectionLabel, { marginTop: Spacing.xl }]}>
            Recent
          </Text>
          <View style={styles.list}>
            {recent
              .filter((w) => !isToday(w.completedAt))
              .map((w) => (
                <WorkoutRow key={w.id} workout={w} showDay />
              ))}
          </View>
        </>
      ) : null}

      <Text variant="label" color="muted" style={[styles.sectionLabel, { marginTop: Spacing.xl }]}>
        This week
      </Text>

      <View style={styles.statRow}>
        <SummaryCard label="Sessions" value={`${sessions}`} />
        <SummaryCard label="Active min" value={`${weekActiveMin}`} />
        <SummaryCard label="Avg intensity" value={avgIntensity > 0 ? `${avgIntensity}` : '—'} />
      </View>
    </Screen>
  );
}

function WorkoutRow({ workout, showDay = false }: { workout: Workout; showDay?: boolean }) {
  const date = new Date(workout.completedAt);
  const day = date.toLocaleDateString('en-US', { weekday: 'short' });

  return (
    <Card style={styles.workoutRow}>
      <View style={styles.workoutIcon}>
        <Zap size={20} color={Colors.dark.accent} strokeWidth={2} />
      </View>
      <View style={{ flex: 1 }}>
        <Text variant="body" weight="semibold">
          {workout.name}
        </Text>
        <Text variant="small" color="dim">
          {showDay ? `${day} · ` : ''}
          {WORKOUT_LABEL[workout.type]} · {workout.durationMin} min · {workout.intensity}/10
        </Text>
      </View>
    </Card>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <Card style={styles.summaryCard}>
      <Text variant="title" weight="semibold">
        {value}
      </Text>
      <Text variant="caption" color="muted">
        {label}
      </Text>
    </Card>
  );
}

function computeWeekDays(workouts: Workout[]): boolean[] {
  const week = [false, false, false, false, false, false, false];
  workouts.filter((w) => isThisWeek(w.completedAt)).forEach((w) => {
    const d = new Date(w.completedAt).getDay();
    const idx = d === 0 ? 6 : d - 1;
    week[idx] = true;
  });
  return week;
}

const styles = StyleSheet.create({
  header: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayWrap: {
    alignItems: 'center',
    gap: Spacing.sm,
  },
  dayDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.dark.border,
  },
  dayDotDone: {
    backgroundColor: Colors.dark.accentMuted,
  },
  dayDotActive: {
    backgroundColor: Colors.dark.accent,
  },
  sectionLabel: {
    marginBottom: Spacing.md,
  },
  list: {
    gap: Spacing.sm,
  },
  workoutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  workoutIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.dark.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  summaryCard: {
    flex: 1,
    alignItems: 'flex-start',
  },
});
