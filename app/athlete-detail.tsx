import { useMemo } from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { X, Calendar, Shield, Zap, Heart, Activity } from 'lucide-react-native';

import { Card } from '@/components/velo/Card';
import { Text } from '@/components/velo/Text';
import { Button } from '@/components/velo/Button';
import { MetricRing } from '@/components/velo/MetricRing';
import { Spacing, Radius } from '@/constants/theme';
import { useColors } from '@/hooks/useColors';
import { useConsentStore } from '@/stores/consentStore';
import { useWorkoutStore } from '@/stores/workoutStore';
import { useNutritionStore, getTodayTotals } from '@/stores/nutritionStore';
import { useWellnessStore, computeReadiness } from '@/stores/wellnessStore';
import { usePlannerStore } from '@/stores/plannerStore';
import { WORKOUT_LABEL } from '@/lib/constants';
import { isoDate } from '@/lib/date';

const STATUS_COLORS: Record<string, string> = {
  healthy: '#4CAF50', sore: '#FF9800', injured: '#F44336',
};

export default function AthleteDetailScreen() {
  const router = useRouter();
  const colors = useColors();
  const { teamId, athleteId, athleteName } = useLocalSearchParams<{ teamId: string; athleteId: string; athleteName: string }>();

  const outgoingConsents = useConsentStore((s) => s.outgoingConsents);
  const consent = outgoingConsents.find((c) => c.teamId === teamId && c.athleteId === athleteId);
  const approved = consent?.approved ?? [];

  // Data stores — in production, these would pull athlete-specific data from Supabase
  // For now shows coach's own data as a preview (real athlete data needs server-side fetch)
  const workouts = useWorkoutStore((s) => s.workouts);
  const meals = useNutritionStore((s) => s.meals);
  const checkIns = useWellnessStore((s) => s.checkIns);
  const statusLog = useWellnessStore((s) => s.statusLog);
  const getPlansForAthlete = usePlannerStore((s) => s.getPlansForAthlete);

  const recentWorkouts = useMemo(() => workouts.filter((w) => !w.private).slice(0, 5), [workouts]);
  const todayTotals = useMemo(() => getTodayTotals(meals), [meals]);
  const todayCheckIn = checkIns[isoDate()] ?? null;
  const readiness = useMemo(() => computeReadiness(todayCheckIn), [todayCheckIn]);
  const todayStatus = statusLog[isoDate()] ?? null;
  const upcomingPlans = useMemo(() => getPlansForAthlete(athleteId), [athleteId]);

  const canSee = (cat: string) => approved.includes(cat as any);
  const hasConsent = approved.length > 0;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable hitSlop={12} onPress={() => router.back()}>
          <X size={24} color={colors.text} strokeWidth={2} />
        </Pressable>
        <Text variant="title" weight="semibold">{athleteName}</Text>
        <Pressable hitSlop={12} onPress={() => router.push(`/coach-planner?teamId=${teamId}&athleteId=${athleteId}&athleteName=${encodeURIComponent(athleteName)}`)}>
          <Calendar size={22} color={colors.accent} strokeWidth={2} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.body}>
        {!hasConsent ? (
          <Card style={styles.noConsent}>
            <Shield size={28} color={colors.textMuted} strokeWidth={1.5} />
            <Text variant="title" weight="semibold" style={{ marginTop: Spacing.md }}>No data access yet</Text>
            <Text variant="body" color="muted" style={{ marginTop: Spacing.sm, textAlign: 'center' }}>
              Request data access and the athlete needs to approve before you can see their stats.
            </Text>
            <Button label="Request data access" onPress={() => router.push(`/request-data?teamId=${teamId}&athleteId=${athleteId}&athleteName=${encodeURIComponent(athleteName)}`)}
              style={{ marginTop: Spacing.lg }} />
          </Card>
        ) : (
          <>
            {/* Status + Readiness row */}
            <View style={styles.topRow}>
              {canSee('readiness') && (
                <Card style={styles.readinessCard}>
                  <Text variant="label" color="muted">Readiness</Text>
                  <MetricRing value={readiness} centerLabel={`${readiness}`} label="ready" />
                </Card>
              )}
              {todayStatus && (
                <Card style={[styles.statusCard, { borderColor: STATUS_COLORS[todayStatus.status] ?? colors.border, borderWidth: 1.5 }]}>
                  <Text variant="label" color="muted">Status</Text>
                  <View style={styles.statusRow}>
                    <View style={[styles.statusDot, { backgroundColor: STATUS_COLORS[todayStatus.status] }]} />
                    <Text variant="body" weight="semibold" style={{ textTransform: 'capitalize' }}>{todayStatus.status}</Text>
                  </View>
                  {todayStatus.note ? <Text variant="small" color="muted" style={{ marginTop: Spacing.xs }}>{todayStatus.note}</Text> : null}
                </Card>
              )}
            </View>

            {/* Wellness */}
            {canSee('wellness') && todayCheckIn && (
              <>
                <Text variant="label" color="muted" style={styles.sectionLabel}>Today's check-in</Text>
                <Card>
                  <View style={styles.wellnessRow}>
                    {[
                      { label: 'Sleep', value: `${todayCheckIn.sleepHours}h` },
                      { label: 'Energy', value: `${todayCheckIn.energy}/5` },
                      { label: 'Soreness', value: `${todayCheckIn.soreness}/5` },
                      { label: 'Mood', value: `${todayCheckIn.mood}/5` },
                    ].map((item) => (
                      <View key={item.label} style={styles.wellnessStat}>
                        <Text variant="title" weight="semibold">{item.value}</Text>
                        <Text variant="small" color="dim">{item.label}</Text>
                      </View>
                    ))}
                  </View>
                </Card>
              </>
            )}

            {/* Upcoming plan */}
            {upcomingPlans.length > 0 && (
              <>
                <Text variant="label" color="muted" style={styles.sectionLabel}>Upcoming plan</Text>
                {upcomingPlans.slice(0, 3).map((p) => (
                  <Card key={p.id} style={styles.planCard}>
                    <Text variant="caption" color="accent">
                      {new Date(p.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).toUpperCase()}
                    </Text>
                    <Text variant="body" weight="semibold" style={{ marginTop: 2 }}>{p.title}</Text>
                    <Text variant="small" color="muted">{WORKOUT_LABEL[p.type]} · {p.durationMin} min · {p.intensity}/10</Text>
                    {p.description ? <Text variant="small" color="dim" style={{ marginTop: 2 }}>{p.description}</Text> : null}
                  </Card>
                ))}
              </>
            )}

            {/* Recent workouts */}
            {canSee('workouts') && recentWorkouts.length > 0 && (
              <>
                <Text variant="label" color="muted" style={styles.sectionLabel}>Recent workouts</Text>
                {recentWorkouts.map((w) => (
                  <Card key={w.id} style={styles.workoutRow}>
                    <View style={[styles.workoutIcon, { backgroundColor: colors.surfaceElevated }]}>
                      {w.source === 'apple_health' ? <Heart size={18} color="#FF375F" strokeWidth={2} /> : <Zap size={18} color={colors.accent} strokeWidth={2} />}
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text variant="body" weight="semibold">{w.name}</Text>
                      <Text variant="small" color="dim">
                        {WORKOUT_LABEL[w.type]} · {w.durationMin} min
                        {w.healthData?.avgHeartRate ? ` · ${w.healthData.avgHeartRate} bpm` : ''}
                      </Text>
                    </View>
                    <Text variant="small" color="dim">
                      {new Date(w.completedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </Text>
                  </Card>
                ))}
              </>
            )}

            {/* Nutrition */}
            {canSee('nutrition') && (
              <>
                <Text variant="label" color="muted" style={styles.sectionLabel}>Today's nutrition</Text>
                <Card>
                  <View style={styles.macroRow}>
                    {[
                      { label: 'Calories', value: todayTotals.calories },
                      { label: 'Protein', value: `${todayTotals.protein}g` },
                      { label: 'Carbs', value: `${todayTotals.carbs}g` },
                      { label: 'Fat', value: `${todayTotals.fat}g` },
                    ].map((m) => (
                      <View key={m.label} style={styles.macroStat}>
                        <Text variant="title" weight="semibold">{m.value}</Text>
                        <Text variant="small" color="dim">{m.label}</Text>
                      </View>
                    ))}
                  </View>
                </Card>
              </>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md },
  body: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xl },
  noConsent: { alignItems: 'center', paddingVertical: Spacing.xl },
  sectionLabel: { marginTop: Spacing.xl, marginBottom: Spacing.md },
  topRow: { flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.sm },
  readinessCard: { flex: 1, alignItems: 'center' },
  statusCard: { flex: 1, justifyContent: 'center' },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginTop: Spacing.sm },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  wellnessRow: { flexDirection: 'row', justifyContent: 'space-between' },
  wellnessStat: { alignItems: 'center' },
  planCard: { marginBottom: Spacing.sm },
  workoutRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.sm },
  workoutIcon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  macroRow: { flexDirection: 'row', justifyContent: 'space-between' },
  macroStat: { alignItems: 'center' },
});
