import { useMemo } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Plus, Zap, Pencil, Heart, Eye, EyeOff } from 'lucide-react-native';
import { Platform } from 'react-native';
import { useTeamStore } from '@/stores/teamStore';

import { Screen } from '@/components/velo/Screen';
import { Text } from '@/components/velo/Text';
import { Card } from '@/components/velo/Card';
import { Button } from '@/components/velo/Button';
import { Spacing } from '@/constants/theme';
import { useColors } from '@/hooks/useColors';
import { getWeekActiveMin, useWorkoutStore } from '@/stores/workoutStore';
import { SwipeToDelete } from '@/components/velo/SwipeToDelete';
import { WORKOUT_LABEL } from '@/lib/constants';
import { Workout } from '@/types';
import { isToday, isThisWeek } from '@/lib/date';

const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export default function TrainingScreen() {
  const router = useRouter();
  const colors = useColors();
  const workouts = useWorkoutStore((s) => s.workouts);
  const removeWorkout = useWorkoutStore((s) => s.removeWorkout);

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

      <View style={{ flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.lg, marginBottom: Spacing.xl }}>
        <Button label="Log workout" icon={<Plus size={18} color="#0a0a0a" strokeWidth={2.5} />}
          onPress={() => router.push('/log-workout')} style={{ flex: 1 }} />
        {Platform.OS === 'ios' && (
          <Button label="Sync" variant="secondary" icon={<Heart size={16} color="red" strokeWidth={2} />}
            onPress={() => router.push('/health-import')} />
        )}
      </View>

      <Text variant="label" color="muted" style={styles.sectionLabel}>Today</Text>
      {todaysWorkouts.length > 0 ? (
        <View style={styles.list}>
          {todaysWorkouts.map((w) => (
            <SwipeToDelete key={w.id} onDelete={() => removeWorkout(w.id)}>
              <WorkoutRow workout={w} colors={colors} />
            </SwipeToDelete>
          ))}
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
            {recent.filter((w) => !isToday(w.completedAt)).map((w) => (
              <SwipeToDelete key={w.id} onDelete={() => removeWorkout(w.id)}>
                <WorkoutRow workout={w} showDay colors={colors} />
              </SwipeToDelete>
            ))}
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

function formatPace(minPerKm?: number) {
  if (!minPerKm) return null;
  const m = Math.floor(minPerKm);
  const s = Math.round((minPerKm - m) * 60);
  return `${m}:${s.toString().padStart(2, '0')}/km`;
}

function WorkoutRow({ workout, showDay = false, colors }: { workout: Workout; showDay?: boolean; colors: ReturnType<typeof useColors> }) {
  const router = useRouter();
  const togglePrivate = useWorkoutStore((s) => s.toggleWorkoutPrivate);
  const inATeamAsAthlete = useTeamStore((s) => s.teams.some((t) => t.myRole === 'athlete'));
  const day = new Date(workout.completedAt).toLocaleDateString('en-US', { weekday: 'short' });
  const hd = workout.healthData;
  const details = [
    showDay ? day : null,
    WORKOUT_LABEL[workout.type],
    `${workout.durationMin} min`,
    workout.distanceKm ? `${workout.distanceKm.toFixed(1)} km` : null,
    formatPace(hd?.avgPaceMinPerKm),
    hd?.avgHeartRate ? `${hd.avgHeartRate} bpm` : null,
    hd?.caloriesBurned ? `${hd.caloriesBurned} kcal` : null,
    !hd ? `${workout.intensity}/10` : null,
  ].filter(Boolean).join(' · ');

  return (
    <Card style={styles.workoutRow}>
      <View style={[styles.workoutIcon, {
        backgroundColor: workout.source === 'apple_health' ? '#FF375F22' : workout.source === 'strava' ? '#FC4C0222' : colors.surfaceElevated
      }]}>
        {workout.source === 'apple_health' ? <Heart size={20} color="#FF375F" strokeWidth={2} />
          : workout.source === 'strava' ? <Zap size={20} color="#FC4C02" strokeWidth={2} />
          : <Zap size={20} color={colors.accent} strokeWidth={2} />}
      </View>
      <View style={{ flex: 1 }}>
        <Text variant="body" weight="semibold">{workout.name}</Text>
        <Text variant="small" color="dim">{details}</Text>
      </View>
      {inATeamAsAthlete && (
        <Pressable hitSlop={8} onPress={() => togglePrivate(workout.id)} style={{ marginRight: Spacing.sm }}>
          {workout.private
            ? <EyeOff size={16} color={colors.textDim} strokeWidth={2} />
            : <Eye size={16} color={colors.accent} strokeWidth={2} />}
        </Pressable>
      )}
      <Pressable hitSlop={8} onPress={() => router.push(`/log-workout?id=${workout.id}`)}>
        <Pencil size={16} color={colors.textDim} strokeWidth={2} />
      </Pressable>
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
