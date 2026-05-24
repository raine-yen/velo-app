import { useMemo, useState } from 'react';
import { View, StyleSheet, Pressable, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { Flame, Moon, Activity, TrendingUp, Sun, Plus, Heart, Zap, Wind } from 'lucide-react-native';

import { Screen } from '@/components/velo/Screen';
import { Text } from '@/components/velo/Text';
import { Card } from '@/components/velo/Card';
import { Button } from '@/components/velo/Button';
import { MetricRing } from '@/components/velo/MetricRing';
import { Spacing, Radius } from '@/constants/theme';
import { useColors } from '@/hooks/useColors';
import { useUserStore } from '@/stores/userStore';
import { getTodayTotals, useNutritionStore } from '@/stores/nutritionStore';
import { getTodayWorkouts, useWorkoutStore } from '@/stores/workoutStore';
import { computeReadiness, useWellnessStore, AthleteStatus } from '@/stores/wellnessStore';
import { useHealthStore, computeRecoveryScore, computeStressLevel } from '@/stores/healthStore';
import { useHealthSync } from '@/hooks/useHealthSync';
import { usePlannerStore } from '@/stores/plannerStore';
import { useAuthStore } from '@/stores/authStore';
import { useTeamStore } from '@/stores/teamStore';
import { isoDate } from '@/lib/date';
import { SPORT_LABEL, WORKOUT_LABEL } from '@/lib/constants';

export default function HomeScreen() {
  const router = useRouter();
  const colors = useColors();
  const profile = useUserStore((s) => s.profile);
  const meals = useNutritionStore((s) => s.meals);
  const workouts = useWorkoutStore((s) => s.workouts);
  const checkIns = useWellnessStore((s) => s.checkIns);
  const userId = useAuthStore((s) => s.user?.id ?? '');
  const getPlansForAthlete = usePlannerStore((s) => s.getPlansForAthlete);
  const plannedWorkouts = useMemo(() => getPlansForAthlete(userId), [userId]);
  const healthSnap = useHealthStore((s) => s.snapshot);
  const healthSyncing = useHealthStore((s) => s.syncing);

  // Kick off auto-sync
  useHealthSync();

  const todayTotals = useMemo(() => getTodayTotals(meals), [meals]);
  const todayWorkouts = useMemo(() => getTodayWorkouts(workouts), [workouts]);
  const statusLog = useWellnessStore((s) => s.statusLog);
  const logStatus = useWellnessStore((s) => s.logStatus);
  const checkIn = useMemo(() => checkIns[isoDate()] ?? null, [checkIns]);
  const readiness = useMemo(() => computeReadiness(checkIn), [checkIn]);
  const todayStatus = useMemo(() => statusLog[isoDate()] ?? null, [statusLog]);
  const hasTeam = useTeamStore((s) => s.teams.length > 0);

  const recoveryScore = useMemo(() => computeRecoveryScore(healthSnap), [healthSnap]);
  const stressLevel = useMemo(() => computeStressLevel(healthSnap), [healthSnap]);

  // Combine manual check-in sleep with HealthKit sleep (prefer HealthKit)
  const sleepHours = healthSnap?.sleepHours ?? checkIn?.sleepHours ?? null;

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  const todayWorkoutMin = todayWorkouts.reduce((acc, w) => acc + w.durationMin, 0);
  const todayBurnedKcal = todayWorkouts.reduce((acc, w) => acc + (w.healthData?.caloriesBurned ?? 0), 0);

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

      {/* Readiness / Recovery */}
      <Card style={styles.readinessCard}>
        <View style={styles.readinessRow}>
          <View style={styles.readinessLeft}>
            <Text variant="label" color="muted">{recoveryScore !== null ? 'Recovery' : 'Readiness'}</Text>
            <Text variant="bodyLg" color="muted" style={{ marginTop: Spacing.sm }}>
              {getReadinessMessage(recoveryScore ?? readiness, !!(healthSnap || checkIn))}
            </Text>
            {!checkIn && !healthSnap ? (
              <Button label="Quick check-in" variant="secondary" onPress={() => router.push('/wellness')}
                icon={<Sun size={16} color={colors.text} strokeWidth={2.5} />}
                style={{ marginTop: Spacing.md, alignSelf: 'flex-start' }} />
            ) : null}
          </View>
          <MetricRing
            value={recoveryScore ?? readiness}
            centerLabel={`${recoveryScore ?? readiness}`}
            label={recoveryScore !== null ? 'recovery' : 'ready'}
          />
        </View>
      </Card>

      {hasTeam && <StatusWidget today={todayStatus} onLog={logStatus} colors={colors} />}

      {/* Health metrics from Apple Health */}
      {healthSnap && (
        <>
          <Text variant="label" color="muted" style={styles.sectionLabel}>Body · Apple Health</Text>
          <View style={styles.statRow}>
            {healthSnap.restingHR !== undefined && (
              <StatCard
                icon={<Heart size={18} color="#FF375F" strokeWidth={2.2} />}
                label="Resting HR"
                value={`${healthSnap.restingHR}`}
                subtitle="bpm"
              />
            )}
            {healthSnap.avgHRV !== undefined && (
              <StatCard
                icon={<Activity size={18} color={colors.accent} strokeWidth={2.2} />}
                label="HRV"
                value={`${healthSnap.avgHRV}`}
                subtitle="ms SDNN"
              />
            )}
          </View>
          <View style={styles.statRow}>
            {healthSnap.steps !== undefined && (
              <StatCard
                icon={<Wind size={18} color={colors.accent} strokeWidth={2.2} />}
                label="Steps"
                value={healthSnap.steps.toLocaleString()}
                subtitle="today"
              />
            )}
            {healthSnap.vo2Max !== undefined && (
              <StatCard
                icon={<TrendingUp size={18} color={colors.accent} strokeWidth={2.2} />}
                label="VO₂ Max"
                value={`${healthSnap.vo2Max}`}
                subtitle="mL/kg/min"
              />
            )}
          </View>
        </>
      )}

      {/* AI Insights */}
      {(stressLevel || todayBurnedKcal > 0) && (
        <>
          <Text variant="label" color="muted" style={styles.sectionLabel}>Insights</Text>
          {stressLevel && (
            <Card style={{ marginBottom: Spacing.sm }}>
              <Text variant="caption" color={stressLevel === 'high' ? 'danger' : stressLevel === 'moderate' ? 'accent' : 'accent'}>
                {stressLevel === 'high' ? 'HIGH STRESS' : stressLevel === 'moderate' ? 'MODERATE STRESS' : 'LOW STRESS'}
              </Text>
              <Text variant="body" style={{ marginTop: Spacing.xs }}>
                {getStressInsight(stressLevel, healthSnap)}
              </Text>
            </Card>
          )}
          {todayBurnedKcal > 0 && (
            <Card style={{ marginBottom: Spacing.sm }}>
              <Text variant="caption" color="accent">NUTRITION FOCUS</Text>
              <Text variant="body" style={{ marginTop: Spacing.xs }}>
                {getNutritionInsight(todayBurnedKcal, profile.targets.calories, profile.targets.protein)}
              </Text>
            </Card>
          )}
        </>
      )}

      <Text variant="label" color="muted" style={styles.sectionLabel}>Today</Text>
      <View style={styles.statRow}>
        <StatCard icon={<Flame size={18} color={colors.accent} strokeWidth={2.2} />} label="Calories"
          value={todayTotals.calories > 0 ? String(todayTotals.calories) : '—'} subtitle={`of ${profile.targets.calories}`} />
        <StatCard icon={<Moon size={18} color={colors.accent} strokeWidth={2.2} />} label="Sleep"
          value={sleepHours !== null ? `${sleepHours}` : '—'} subtitle="hours" />
      </View>
      <View style={styles.statRow}>
        <StatCard icon={<Activity size={18} color={colors.accent} strokeWidth={2.2} />} label="Active"
          value={todayWorkoutMin > 0 ? String(todayWorkoutMin) : '—'} subtitle="minutes" />
        <StatCard icon={<TrendingUp size={18} color={colors.accent} strokeWidth={2.2} />} label="Protein"
          value={todayTotals.protein > 0 ? String(todayTotals.protein) : '—'} subtitle={`of ${profile.targets.protein}g`} />
      </View>

      {plannedWorkouts.length > 0 && (
        <>
          <Text variant="label" color="muted" style={styles.sectionLabel}>Coach's plan</Text>
          {plannedWorkouts.slice(0, 2).map((p) => (
            <Card key={p.id} style={{ marginBottom: Spacing.sm }}>
              <Text variant="caption" color="accent">{new Date(p.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }).toUpperCase()}</Text>
              <Text variant="title" style={{ marginTop: Spacing.xs }}>{p.title}</Text>
              <Text variant="body" color="muted" style={{ marginTop: Spacing.xs }}>
                {WORKOUT_LABEL[p.type]} · {p.durationMin} min · intensity {p.intensity}/10
              </Text>
              {p.description ? <Text variant="small" color="dim" style={{ marginTop: Spacing.xs }}>{p.description}</Text> : null}
            </Card>
          ))}
        </>
      )}

      <Text variant="label" color="muted" style={styles.sectionLabel}>Up next</Text>
      {todayWorkouts.length > 0 ? (
        <Card>
          <Text variant="caption" color="accent">COMPLETED TODAY</Text>
          <Text variant="title" style={{ marginTop: Spacing.sm }}>{todayWorkouts[0].name}</Text>
          <Text variant="body" color="muted" style={{ marginTop: Spacing.sm }}>
            {WORKOUT_LABEL[todayWorkouts[0].type]} · {todayWorkouts[0].durationMin} min · intensity {todayWorkouts[0].intensity}/10
          </Text>
        </Card>
      ) : (
        <Card>
          <Text variant="caption" color="dim">NO WORKOUT LOGGED</Text>
          <Text variant="title" style={{ marginTop: Spacing.sm }}>Open day</Text>
          <Text variant="body" color="muted" style={{ marginTop: Spacing.sm, marginBottom: Spacing.md }}>Log a workout to see it here.</Text>
          <Button label="Log a workout" icon={<Plus size={16} color="#0a0a0a" strokeWidth={2.5} />}
            onPress={() => router.push('/log-workout')} style={{ alignSelf: 'flex-start' }} />
        </Card>
      )}
    </Screen>
  );
}

const STATUS_OPTIONS: { id: AthleteStatus; label: string; color: string }[] = [
  { id: 'healthy', label: 'Healthy', color: '#4CAF50' },
  { id: 'sore',    label: 'Sore',    color: '#FF9800' },
  { id: 'injured', label: 'Injured', color: '#F44336' },
];

function StatusWidget({ today, onLog, colors }: {
  today: { status: AthleteStatus; note: string } | null;
  onLog: (s: AthleteStatus, note: string) => void;
  colors: ReturnType<typeof useColors>;
}) {
  const [note, setNote] = useState(today?.note ?? '');
  const [showNote, setShowNote] = useState(false);

  const select = (s: AthleteStatus) => {
    onLog(s, note);
    setShowNote(true);
  };

  return (
    <Card style={styles.statusCard}>
      <Text variant="label" color="muted" style={{ marginBottom: Spacing.md }}>
        {today ? 'Today\'s status' : 'How are you feeling?'}
      </Text>
      <View style={styles.statusRow}>
        {STATUS_OPTIONS.map((opt) => {
          const active = today?.status === opt.id;
          return (
            <Pressable key={opt.id} onPress={() => select(opt.id)} style={[
              styles.statusChip,
              { borderColor: active ? opt.color : colors.border, backgroundColor: active ? opt.color + '22' : colors.surface },
            ]}>
              <View style={[styles.statusDot, { backgroundColor: opt.color }]} />
              <Text variant="small" weight={active ? 'semibold' : 'regular'} style={{ color: active ? opt.color : colors.textMuted }}>
                {opt.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
      {(showNote || today?.note) && (
        <TextInput
          style={[styles.noteInput, { color: colors.text, borderColor: colors.border }]}
          placeholder="Add a note for your coach…"
          placeholderTextColor={colors.textDim}
          value={note}
          onChangeText={(t) => { setNote(t); if (today) onLog(today.status, t); }}
          returnKeyType="done"
        />
      )}
    </Card>
  );
}

function StatCard({ icon, label, value, subtitle }: { icon: React.ReactNode; label: string; value: string; subtitle: string }) {
  return (
    <Card style={styles.statCard}>
      <View style={styles.statHeader}>{icon}<Text variant="caption" color="muted">{label}</Text></View>
      <Text variant="display" weight="semibold" style={{ marginTop: Spacing.md }}>{value}</Text>
      <Text variant="small" color="dim">{subtitle}</Text>
    </Card>
  );
}

function getStressInsight(level: 'low' | 'moderate' | 'high', snap: any): string {
  if (level === 'high') {
    const reason = snap?.avgHRV < 30 ? 'Your HRV is suppressed' : snap?.restingHR > 70 ? 'Resting HR is elevated' : 'Recovery markers are low';
    return `${reason}. Prioritize sleep and keep today's effort easy. Avoid heavy lifting or high-intensity work.`;
  }
  if (level === 'moderate') {
    return 'Your body is handling the load well. A moderate workout is fine — just listen to any fatigue signals.';
  }
  return 'HRV and resting HR look great. Your body is ready to perform. A strong session today is well-timed.';
}

function getNutritionInsight(burnedKcal: number, targetCal: number, targetProtein: number): string {
  const adjusted = targetCal + burnedKcal;
  return `You burned ~${burnedKcal} kcal in workouts today. Aim for ~${adjusted.toLocaleString()} total calories and ${targetProtein}g+ protein to fuel recovery.`;
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

function getReadinessMessage(score: number, hasCheckIn: boolean) {
  if (!hasCheckIn) return 'Check in to dial in your day.';
  if (score >= 85) return "You're primed.\nPush it today.";
  if (score >= 70) return "Solid recovery.\nGreen light.";
  if (score >= 55) return "Moderate.\nStay sharp.";
  if (score >= 40) return "Run light.\nFocus on quality.";
  return "Recovery mode.\nProtect tomorrow.";
}

const styles = StyleSheet.create({
  header: { marginTop: Spacing.lg, marginBottom: Spacing.xl },
  readinessCard: { marginBottom: Spacing.xl },
  readinessRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  readinessLeft: { flex: 1, marginRight: Spacing.md },
  sectionLabel: { marginTop: Spacing.md, marginBottom: Spacing.md },
  statRow: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.md },
  statCard: { flex: 1 },
  statHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  statusCard: { marginBottom: Spacing.xl },
  statusRow: { flexDirection: 'row', gap: Spacing.sm },
  statusChip: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: Radius.pill, borderWidth: 1 },
  statusDot: { width: 7, height: 7, borderRadius: 4 },
  noteInput: { marginTop: Spacing.md, borderWidth: 1, borderRadius: Radius.md, paddingHorizontal: Spacing.md, paddingVertical: 10, fontSize: 14 },
});
