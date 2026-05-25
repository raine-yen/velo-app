import { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Activity, Apple, Bot, Flame, Moon, Plus } from 'lucide-react-native';

import { Button } from '@/components/velo/Button';
import { Card } from '@/components/velo/Card';
import { InsightCard } from '@/components/velo/InsightCard';
import { MetricRing } from '@/components/velo/MetricRing';
import { Screen } from '@/components/velo/Screen';
import { Text } from '@/components/velo/Text';
import { Spacing } from '@/constants/theme';
import { useColors } from '@/hooks/useColors';
import { useVeloInsight } from '@/hooks/useVeloInsight';
import { isoDate } from '@/lib/date';
import { formatHours, formatMinutes, formatNumber } from '@/lib/format';
import { SPORT_LABEL } from '@/lib/constants';
import { computeRecoveryScore, useHealthStore } from '@/stores/healthStore';
import { getTodayTotals, useNutritionStore } from '@/stores/nutritionStore';
import { useNutritionGoalStore } from '@/stores/nutritionGoalStore';
import { useUserStore } from '@/stores/userStore';
import { computeReadiness, useWellnessStore } from '@/stores/wellnessStore';
import { getTodayWorkouts, useWorkoutStore } from '@/stores/workoutStore';

export default function HomeScreen() {
  const router = useRouter();
  const colors = useColors();
  const profile = useUserStore((s) => s.profile);
  const meals = useNutritionStore((s) => s.meals);
  const nutritionTargets = useNutritionGoalStore((s) => s.targets);
  const workouts = useWorkoutStore((s) => s.workouts);
  const checkIns = useWellnessStore((s) => s.checkIns);
  const healthSnap = useHealthStore((s) => s.snapshot);
  const { insight, loading } = useVeloInsight('daily');

  const todayTotals = useMemo(() => getTodayTotals(meals), [meals]);
  const todayWorkouts = useMemo(() => getTodayWorkouts(workouts), [workouts]);
  const checkIn = checkIns[isoDate()] ?? null;
  const readiness = computeReadiness(checkIn);
  const recoveryScore = computeRecoveryScore(healthSnap);
  const score = recoveryScore ?? readiness;
  const sleepHours = healthSnap?.sleepHours ?? checkIn?.sleepHours ?? null;
  const activeMinutes = healthSnap?.activeMinutes ?? todayWorkouts.reduce((sum, workout) => sum + workout.durationMin, 0);
  const activeCalories = healthSnap?.activeCalories ?? todayWorkouts.reduce((sum, workout) => sum + (workout.healthData?.caloriesBurned ?? 0), 0);

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <Screen>
      <View style={styles.header}>
        <Text variant="label" color="muted">{today}</Text>
        <Text variant="display" weight="bold" style={{ marginTop: Spacing.xs }}>
          {getGreeting()}
          {profile.sport ? (
            <>{',\n'}<Text variant="display" color="muted">{SPORT_LABEL[profile.sport].toLowerCase()}.</Text></>
          ) : '.'}
        </Text>
      </View>

      <Card style={styles.recoveryCard} onPress={() => router.push('/recovery-detail')}>
        <View style={styles.recoveryCopy}>
          <Text variant="label" color="muted">{recoveryScore !== null ? 'Recovery' : 'Readiness'}</Text>
          <Text variant="title" weight="semibold" style={{ marginTop: Spacing.xs }}>
            {getReadinessMessage(score, !!(healthSnap || checkIn))}
          </Text>
          <Text variant="small" color="dim" style={{ marginTop: Spacing.sm }}>
            Tap for HRV, resting HR, sleep contribution, and today&apos;s training recommendation.
          </Text>
        </View>
        <MetricRing value={score} centerLabel={`${score}`} label={recoveryScore !== null ? 'recovery' : 'ready'} />
      </Card>

      <View style={styles.actionRow}>
        <Button label="Ask AI" variant="secondary" icon={<Bot size={16} color={colors.text} strokeWidth={2.4} />} onPress={() => router.push('/ai-coach')} style={{ flex: 1 }} />
        <Button label="Log" icon={<Plus size={16} color="#0a0a0a" strokeWidth={2.4} />} onPress={() => router.push('/log-workout')} style={{ flex: 1 }} />
      </View>

      <Text variant="label" color="muted" style={styles.sectionLabel}>Today</Text>
      <View style={styles.todayGrid}>
        <TodayCard icon={<Apple size={18} color={colors.accent} />} label="Consumed" value={formatNumber(todayTotals.calories)} detail={`of ${nutritionTargets.calories} kcal`} onPress={() => router.push('/nutrition-detail')} />
        <TodayCard icon={<Moon size={18} color={colors.accent} />} label="Sleep" value={formatHours(sleepHours)} detail={healthSnap?.sleepStages ? 'stages ready' : 'tap details'} onPress={() => router.push('/sleep-detail')} />
        <TodayCard icon={<Activity size={18} color={colors.accent} />} label="Active" value={formatMinutes(activeMinutes)} detail="Apple Exercise" onPress={() => router.push('/activity-detail')} />
        <TodayCard icon={<Flame size={18} color={colors.accent} />} label="Active kcal" value={formatNumber(activeCalories)} detail="Health burn" onPress={() => router.push('/activity-detail')} />
      </View>

      <InsightCard insight={insight} loading={loading} title="Velo intelligence" onPress={() => router.push('/ai-insight-detail?kind=daily')} />
    </Screen>
  );
}

function TodayCard({ icon, label, value, detail, onPress }: {
  icon: React.ReactNode;
  label: string;
  value: string;
  detail: string;
  onPress: () => void;
}) {
  return (
    <Card style={styles.todayCard} onPress={onPress}>
      <View style={styles.todayTop}>{icon}<Text variant="caption" color="muted">{label}</Text></View>
      <Text variant="title" weight="semibold" style={{ marginTop: Spacing.sm }}>{value}</Text>
      <Text variant="small" color="dim">{detail}</Text>
    </Card>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

function getReadinessMessage(score: number, hasData: boolean) {
  if (!hasData) return 'Connect data to tune today.';
  if (score >= 85) return 'Primed. Use it wisely.';
  if (score >= 70) return 'Solid recovery.';
  if (score >= 55) return 'Moderate. Stay sharp.';
  if (score >= 40) return 'Keep the load light.';
  return 'Recovery first today.';
}

const styles = StyleSheet.create({
  header: { marginTop: Spacing.lg, marginBottom: Spacing.xl },
  recoveryCard: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.md },
  recoveryCopy: { flex: 1 },
  actionRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.xl },
  sectionLabel: { marginBottom: Spacing.md },
  todayGrid: { gap: Spacing.sm, marginBottom: Spacing.md },
  todayCard: { minHeight: 104 },
  todayTop: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
});
