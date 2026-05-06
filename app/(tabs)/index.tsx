import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Flame, Moon, Activity, TrendingUp, Sun, Plus } from 'lucide-react-native';

import { Screen } from '@/components/velo/Screen';
import { Text } from '@/components/velo/Text';
import { Card } from '@/components/velo/Card';
import { Button } from '@/components/velo/Button';
import { MetricRing } from '@/components/velo/MetricRing';
import { Colors, Spacing } from '@/constants/theme';
import { useUserStore } from '@/stores/userStore';
import { useNutritionStore } from '@/stores/nutritionStore';
import { useWorkoutStore } from '@/stores/workoutStore';
import { useWellnessStore } from '@/stores/wellnessStore';
import { SPORT_LABEL, WORKOUT_LABEL } from '@/lib/constants';

export default function HomeScreen() {
  const router = useRouter();
  const profile = useUserStore((s) => s.profile);
  const todayTotals = useNutritionStore((s) => s.todayTotals());
  const todayWorkouts = useWorkoutStore((s) => s.todayWorkouts());
  const checkIn = useWellnessStore((s) => s.todayCheckIn());
  const readiness = useWellnessStore((s) => s.readinessScore());

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const greeting = getGreeting();
  const readinessMsg = getReadinessMessage(readiness, !!checkIn);
  const todayWorkoutMin = todayWorkouts.reduce((acc, w) => acc + w.durationMin, 0);

  return (
    <Screen>
      <View style={styles.header}>
        <Text variant="label" color="muted">
          {today}
        </Text>
        <Text variant="display" weight="bold" style={{ marginTop: Spacing.xs }}>
          {greeting}
          {profile.sport ? (
            <>
              ,{'\n'}
              <Text variant="display" color="muted">
                {SPORT_LABEL[profile.sport].toLowerCase()}.
              </Text>
            </>
          ) : (
            '.'
          )}
        </Text>
      </View>

      <Card style={styles.readinessCard}>
        <View style={styles.readinessRow}>
          <View style={styles.readinessLeft}>
            <Text variant="label" color="muted">
              Readiness
            </Text>
            <Text variant="bodyLg" color="muted" style={{ marginTop: Spacing.sm }}>
              {readinessMsg}
            </Text>
            {!checkIn ? (
              <Button
                label="Quick check-in"
                variant="secondary"
                onPress={() => router.push('/wellness')}
                icon={<Sun size={16} color={Colors.dark.text} strokeWidth={2.5} />}
                style={{ marginTop: Spacing.md, alignSelf: 'flex-start' }}
              />
            ) : null}
          </View>
          <MetricRing value={readiness} centerLabel={`${readiness}`} label="ready" />
        </View>
      </Card>

      <Text variant="label" color="muted" style={styles.sectionLabel}>
        Today
      </Text>

      <View style={styles.statRow}>
        <StatCard
          icon={<Flame size={18} color={Colors.dark.accent} strokeWidth={2.2} />}
          label="Calories"
          value={todayTotals.calories > 0 ? String(todayTotals.calories) : '—'}
          subtitle={`of ${profile.targets.calories}`}
        />
        <StatCard
          icon={<Moon size={18} color={Colors.dark.accent} strokeWidth={2.2} />}
          label="Sleep"
          value={checkIn ? `${checkIn.sleepHours}` : '—'}
          subtitle="hours"
        />
      </View>

      <View style={styles.statRow}>
        <StatCard
          icon={<Activity size={18} color={Colors.dark.accent} strokeWidth={2.2} />}
          label="Active"
          value={todayWorkoutMin > 0 ? String(todayWorkoutMin) : '—'}
          subtitle="minutes"
        />
        <StatCard
          icon={<TrendingUp size={18} color={Colors.dark.accent} strokeWidth={2.2} />}
          label="Protein"
          value={todayTotals.protein > 0 ? String(todayTotals.protein) : '—'}
          subtitle={`of ${profile.targets.protein}g`}
        />
      </View>

      <Text variant="label" color="muted" style={styles.sectionLabel}>
        Up next
      </Text>

      {todayWorkouts.length > 0 ? (
        <Card>
          <Text variant="caption" color="accent">
            COMPLETED TODAY
          </Text>
          <Text variant="title" style={{ marginTop: Spacing.sm }}>
            {todayWorkouts[0].name}
          </Text>
          <Text variant="body" color="muted" style={{ marginTop: Spacing.sm }}>
            {WORKOUT_LABEL[todayWorkouts[0].type]} · {todayWorkouts[0].durationMin} min ·
            intensity {todayWorkouts[0].intensity}/10
          </Text>
        </Card>
      ) : (
        <Card>
          <Text variant="caption" color="dim">
            NO WORKOUT LOGGED
          </Text>
          <Text variant="title" style={{ marginTop: Spacing.sm }}>
            Open day
          </Text>
          <Text variant="body" color="muted" style={{ marginTop: Spacing.sm, marginBottom: Spacing.md }}>
            Log a workout to see it here.
          </Text>
          <Button
            label="Log a workout"
            icon={<Plus size={16} color="#0a0a0a" strokeWidth={2.5} />}
            onPress={() => router.push('/log-workout')}
            style={{ alignSelf: 'flex-start' }}
          />
        </Card>
      )}
    </Screen>
  );
}

function StatCard({
  icon,
  label,
  value,
  subtitle,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  subtitle: string;
}) {
  return (
    <Card style={styles.statCard}>
      <View style={styles.statHeader}>
        {icon}
        <Text variant="caption" color="muted">
          {label}
        </Text>
      </View>
      <Text variant="display" weight="semibold" style={{ marginTop: Spacing.md }}>
        {value}
      </Text>
      <Text variant="small" color="dim">
        {subtitle}
      </Text>
    </Card>
  );
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

function getReadinessMessage(score: number, hasCheckIn: boolean): string {
  if (!hasCheckIn) return 'Check in to dial in your day.';
  if (score >= 85) return "You're primed.\nPush it today.";
  if (score >= 70) return "Solid recovery.\nGreen light.";
  if (score >= 55) return "Moderate.\nStay sharp.";
  if (score >= 40) return "Run light.\nFocus on quality.";
  return "Recovery mode.\nProtect tomorrow.";
}

const styles = StyleSheet.create({
  header: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  readinessCard: {
    marginBottom: Spacing.xl,
  },
  readinessRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  readinessLeft: {
    flex: 1,
    marginRight: Spacing.md,
  },
  sectionLabel: {
    marginTop: Spacing.md,
    marginBottom: Spacing.md,
  },
  statRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  statCard: {
    flex: 1,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
});
