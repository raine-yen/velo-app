import { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Plus, Zap } from 'lucide-react-native';

import { Screen } from '@/components/velo/Screen';
import { Text } from '@/components/velo/Text';
import { Card } from '@/components/velo/Card';
import { Button } from '@/components/velo/Button';
import { Spacing } from '@/constants/theme';
import { useColors } from '@/hooks/useColors';
import { getWeekActiveMin, useWorkoutStore } from '@/stores/workoutStore';
import { WORKOUT_LABEL } from '@/lib/constants';
import { Workout } from '@/types';
import { isToday, isThisWeek } from '@/lib/date';

const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export default function TrainingScreen() {
  const router = useRouter();
  const colors = useColors();
  const workouts = useWorkoutStore((s) => s.workouts);

  const todayIdx = (() => { const d = new Date().getDay(); return d === 0 ? 6 : d - 1; })();
  const weekActiveMin = useMemo(() => getWeekActiveMin(workouts), [workouts]);
  const weekWorkoutsByDay = useMemo(() => computeWeekDays(workouts), [workouts]);
  const todaysWorkouts = useMemo(() => workouts.filter((w) => isToday(w.completedAt)), [workouts]);
  const weekWorkouts = useMemo(() => workouts.filter((w) => isThisWeek(w.completedAt)), [workouts]);
  const recent = useMemo(() => weekWorkouts.slice(0, 5), [weekWorkouts]);
  const avgIntensity = recent.length
    ? Math.round((recent.reduce((acc, w) => acc + w.intensity, 0) / recent.length) * 10) / 10
    : 0;

  return (
    <Screen>
      <View style={styles.header}>
        <Text variant="label" color="muted">Training</Text>
        <Text variant="display" weight="bold" style={{ marginTop: Spacing.xs }}>This week</Text>
      </View>

      <View style={styles.weekRow}>
        {DAYS.map((d, i) => (
          <View key={i} style={styles.dayWrap}>
            <Text variant="caption" color={i === todayIdx ? 'accent' : 'dim'}>{d}</Text>
            <View style={[
              styles.dayDot,
              { backgroundColor: colors.border },
              weekWorkoutsByDay[i] && { backgroundColor: colors.accentMuted },
              i === todayIdx && { backgroundColor: colors.accent },
            ]} />
          </View>
        ))}
      </View>

      <Button label="Log a workout" icon={<Plus size={18} color="#0a0a0a" strokeWidth={2.5} />}
        onPress={() => router.push('/log-workout')} fullWidth style={{ marginTop: Spacing.lg, marginBottom: Spacing.xl }} />

      <Text variant="label" color="muted" style={styles.sectionLabel}>Today</Text>
      {todaysWorkouts.length > 0 ? (
        <View style={styles.list}>
          {todaysWorkouts.map((w) => <WorkoutRow key={w.id} workout={w} colors={colors} />)}
        </View>
      ) : (
        <Card>
          <Text variant="caption" color="dim">NO WORKOUT YET</Text>
          <Text variant="title" style={{ marginTop: Spacing.sm }}>Open day</Text>
          <Text variant="body" color="muted" style={{ marginTop: Spacing.sm }}>Recovery is part of the work, but if you trained — log it.</Text>
        </Card>
      )}

      {recent.filter((w) => !isToday(w.completedAt)).length > 0 ? (
        <>
          <Text variant="label" color="muted" style={[styles.sectionLabel, { marginTop: Spacing.xl }]}>Recent</Text>
          <View style={styles.list}>
            {recent.filter((w) => !isToday(w.completedAt)).map((w) => <WorkoutRow key={w.id} workout={w} showDay colors={colors} />)}
          </View>
        </>
      ) : null}

      <Text variant="label" color="muted" style={[styles.sectionLabel, { marginTop: Spacing.xl }]}>This week</Text>
      <View style={styles.statRow}>
        <SummaryCard label="Sessions" value={`${weekWorkouts.length}`} />
        <SummaryCard label="Active min" value={`${weekActiveMin}`} />
        <SummaryCard label="Avg intensity" value={avgIntensity > 0 ? `${avgIntensity}` : '—'} />
      </View>
    </Screen>
  );
}

function WorkoutRow({ workout, showDay = false, colors }: { workout: Workout; showDay?: boolean; colors: ReturnType<typeof useColors> }) {
  const day = new Date(workout.completedAt).toLocaleDateString('en-US', { weekday: 'short' });
  return (
    <Card style={styles.workoutRow}>
      <View style={[styles.workoutIcon, { backgroundColor: colors.surfaceElevated }]}>
        <Zap size={20} color={colors.accent} strokeWidth={2} />
      </View>
      <View style={{ flex: 1 }}>
        <Text variant="body" weight="semibold">{workout.name}</Text>
        <Text variant="small" color="dim">
          {showDay ? `${day} · ` : ''}{WORKOUT_LABEL[workout.type]} · {workout.durationMin} min · {workout.intensity}/10
        </Text>
      </View>
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

function computeWeekDays(workouts: Workout[]): boolean[] {
  const week = [false, false, false, false, false, false, false];
  workouts.filter((w) => isThisWeek(w.completedAt)).forEach((w) => {
    const d = new Date(w.completedAt).getDay();
    week[d === 0 ? 6 : d - 1] = true;
  });
  return week;
}

const styles = StyleSheet.create({
  header: { marginTop: Spacing.lg, marginBottom: Spacing.xl },
  weekRow: { flexDirection: 'row', justifyContent: 'space-between' },
  dayWrap: { alignItems: 'center', gap: Spacing.sm },
  dayDot: { width: 8, height: 8, borderRadius: 4 },
  sectionLabel: { marginBottom: Spacing.md },
  list: { gap: Spacing.sm },
  workoutRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  workoutIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  statRow: { flexDirection: 'row', gap: Spacing.md },
  summaryCard: { flex: 1, alignItems: 'flex-start' },
});
