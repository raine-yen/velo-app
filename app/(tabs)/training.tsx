import { View, StyleSheet } from 'react-native';
import { Plus, Zap, Heart, Wind } from 'lucide-react-native';

import { Screen } from '@/components/velo/Screen';
import { Text } from '@/components/velo/Text';
import { Card } from '@/components/velo/Card';
import { Button } from '@/components/velo/Button';
import { Colors, Spacing } from '@/constants/theme';

const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export default function TrainingScreen() {
  const today = new Date().getDay();
  const todayIdx = today === 0 ? 6 : today - 1;

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
          const isToday = i === todayIdx;
          return (
            <View key={i} style={styles.dayWrap}>
              <Text variant="caption" color={isToday ? 'accent' : 'dim'}>
                {d}
              </Text>
              <View style={[styles.dayDot, isToday && styles.dayDotActive]} />
            </View>
          );
        })}
      </View>

      <Button
        label="Log a workout"
        icon={<Plus size={18} color="#0a0a0a" strokeWidth={2.5} />}
        onPress={() => {}}
        fullWidth
        style={{ marginTop: Spacing.lg, marginBottom: Spacing.xl }}
      />

      <Text variant="label" color="muted" style={styles.sectionLabel}>
        Today's plan
      </Text>

      <Card>
        <Text variant="caption" color="dim">
          NO WORKOUT
        </Text>
        <Text variant="title" style={{ marginTop: Spacing.sm }}>
          Rest day
        </Text>
        <Text variant="body" color="muted" style={{ marginTop: Spacing.sm }}>
          Recovery is part of the work.
        </Text>
      </Card>

      <Text variant="label" color="muted" style={[styles.sectionLabel, { marginTop: Spacing.xl }]}>
        Recent
      </Text>

      <WorkoutRow
        icon={<Zap size={20} color={Colors.dark.accent} strokeWidth={2} />}
        title="No recent workouts"
        subtitle="Connect Strava or log manually to start tracking"
      />

      <Text variant="label" color="muted" style={[styles.sectionLabel, { marginTop: Spacing.xl }]}>
        This week
      </Text>

      <View style={styles.statRow}>
        <SummaryCard label="Sessions" value="0" />
        <SummaryCard label="Active min" value="0" />
        <SummaryCard label="Strain" value="—" />
      </View>
    </Screen>
  );
}

function WorkoutRow({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <Card style={styles.workoutRow}>
      <View style={styles.workoutIcon}>{icon}</View>
      <View style={styles.workoutContent}>
        <Text variant="body" weight="semibold">
          {title}
        </Text>
        <Text variant="small" color="dim">
          {subtitle}
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
  dayDotActive: {
    backgroundColor: Colors.dark.accent,
  },
  sectionLabel: {
    marginBottom: Spacing.md,
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
  workoutContent: {
    flex: 1,
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
