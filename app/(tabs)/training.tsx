import { useMemo } from 'react';
import { Platform, View, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Plus, Zap, Pencil, Heart, Eye, EyeOff } from 'lucide-react-native';
import { useTeamStore } from '@/stores/teamStore';

import { Screen } from '@/components/velo/Screen';
import { Text } from '@/components/velo/Text';
import { Card } from '@/components/velo/Card';
import { Button } from '@/components/velo/Button';
import { InsightCard } from '@/components/velo/InsightCard';
import { Spacing } from '@/constants/theme';
import { useColors } from '@/hooks/useColors';
import { useVeloInsight } from '@/hooks/useVeloInsight';
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
  const { insight, loading } = useVeloInsight('training');

  const todayIdx = (() => { const d = new Date().getDay(); return d === 0 ? 6 : d - 1; })();
  const weekActiveMin = useMemo(() => getWeekActiveMin(workouts), [workouts]);
  const weekWorkoutsByDay = useMemo(() => computeWeekDays(workouts), [workouts]);
  const todaysWorkouts = useMemo(() => workouts.filter((w) => isToday(w.completedAt)), [workouts]);
  const weekWorkouts = useMemo(() => workouts.filter((w) => isThisWeek(w.completedAt)), [workouts]);
  const recent = useMemo(() => weekWorkouts.slice(0, 5), [weekWorkouts]);
  const weekDistance = useMemo(() => Math.round(weekWorkouts.reduce((acc, w) => acc + (w.distanceKm ?? 0), 0) * 10) / 10, [weekWorkouts]);
  const avgIntensity = recent.length
    ? Math.round((recent.reduce((acc, w) => acc + w.intensity, 0) / recent.length) * 10) / 10
    : 0;

  return (
    <Screen>
      <View style={styles.header}>
        <Text variant="label" color="muted">Training</Text>
        <Text variant="display" weight="bold" style={{ marginTop: Spacing.xs }}>This week</Text>
      </View>

      <Card style={styles.calendarCard}>
        <View style={styles.weekRow}>
          {DAYS.map((d, i) => (
            <View key={i} style={styles.dayWrap}>
              <Text variant="caption" color={i === todayIdx ? 'accent' : 'dim'}>{d}</Text>
              <View style={[styles.dayBar, { backgroundColor: colors.surfaceElevated, borderColor: i === todayIdx ? colors.accent : colors.border }]}>
                <View style={[
                  styles.dayFill,
                  {
                    height: `${Math.min(100, Math.max(8, (weekWorkoutsByDay[i].minutes / 90) * 100))}%`,
                    backgroundColor: weekWorkoutsByDay[i].minutes > 0 ? colors.accent : colors.border,
                  },
                ]} />
              </View>
              <Text variant="caption" color="dim">{weekWorkoutsByDay[i].minutes || '-'}</Text>
            </View>
          ))}
        </View>
      </Card>

      <View style={{ flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.lg, marginBottom: Spacing.xl }}>
        <Button label="Log workout" icon={<Plus size={18} color="#0a0a0a" strokeWidth={2.5} />}
          onPress={() => router.push('/log-workout')} style={{ flex: 1 }} />
        {Platform.OS === 'ios' && (
          <Button label="Health" variant="secondary" icon={<Heart size={16} color="red" strokeWidth={2} />}
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
          <Text variant="body" color="muted" style={{ marginTop: Spacing.sm }}>Recovery is part of the work, but if you trained - log it.</Text>
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
        <SummaryCard label="Distance" value={weekDistance > 0 ? `${weekDistance}` : '-'} />
        <SummaryCard label="Avg intensity" value={avgIntensity > 0 ? `${avgIntensity}` : '-'} />
      </View>
      <InsightCard insight={insight} loading={loading} title="Load this week" />
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
  ].filter(Boolean).join(' - ');

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

function computeWeekDays(workouts: Workout[]): { minutes: number; intensity: number }[] {
  const week = Array.from({ length: 7 }, () => ({ minutes: 0, intensity: 0, count: 0 }));
  workouts.filter((w) => isThisWeek(w.completedAt)).forEach((w) => {
    const d = new Date(w.completedAt).getDay();
    const idx = d === 0 ? 6 : d - 1;
    week[idx].minutes += w.durationMin;
    week[idx].intensity += w.intensity;
    week[idx].count += 1;
  });
  return week.map((day) => ({
    minutes: day.minutes,
    intensity: day.count ? Math.round((day.intensity / day.count) * 10) / 10 : 0,
  }));
}

const styles = StyleSheet.create({
  header: { marginTop: Spacing.lg, marginBottom: Spacing.xl },
  calendarCard: { marginBottom: Spacing.md },
  weekRow: { flexDirection: 'row', justifyContent: 'space-between' },
  dayWrap: { alignItems: 'center', gap: Spacing.sm },
  dayBar: { width: 26, height: 78, borderRadius: 13, borderWidth: 1, overflow: 'hidden', justifyContent: 'flex-end' },
  dayFill: { width: '100%', borderRadius: 13 },
  sectionLabel: { marginBottom: Spacing.md },
  list: { gap: Spacing.sm },
  workoutRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  workoutIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  statRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md },
  summaryCard: { flex: 1, alignItems: 'flex-start' },
});
