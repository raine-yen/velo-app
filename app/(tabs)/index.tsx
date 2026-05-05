import { View, StyleSheet } from 'react-native';
import { Flame, Moon, Activity, TrendingUp } from 'lucide-react-native';

import { Screen } from '@/components/velo/Screen';
import { Text } from '@/components/velo/Text';
import { Card } from '@/components/velo/Card';
import { MetricRing } from '@/components/velo/MetricRing';
import { Colors, Spacing } from '@/constants/theme';

export default function HomeScreen() {
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Screen>
      <View style={styles.header}>
        <Text variant="label" color="muted">
          {today}
        </Text>
        <Text variant="display" weight="bold" style={{ marginTop: Spacing.xs }}>
          Good morning,{'\n'}
          <Text variant="display" color="muted">
            athlete.
          </Text>
        </Text>
      </View>

      <Card style={styles.readinessCard}>
        <View style={styles.readinessRow}>
          <View style={styles.readinessLeft}>
            <Text variant="label" color="muted">
              Readiness
            </Text>
            <Text variant="bodyLg" color="muted" style={{ marginTop: Spacing.sm }}>
              Body's primed.{'\n'}Push it today.
            </Text>
          </View>
          <MetricRing value={82} centerLabel="82" label="ready" />
        </View>
      </Card>

      <Text variant="label" color="muted" style={styles.sectionLabel}>
        Today
      </Text>

      <View style={styles.statRow}>
        <StatCard
          icon={<Flame size={18} color={Colors.dark.accent} strokeWidth={2.2} />}
          label="Calories"
          value="—"
          subtitle="of 2,400"
        />
        <StatCard
          icon={<Moon size={18} color={Colors.dark.accent} strokeWidth={2.2} />}
          label="Sleep"
          value="—"
          subtitle="hours"
        />
      </View>

      <View style={styles.statRow}>
        <StatCard
          icon={<Activity size={18} color={Colors.dark.accent} strokeWidth={2.2} />}
          label="Active"
          value="—"
          subtitle="minutes"
        />
        <StatCard
          icon={<TrendingUp size={18} color={Colors.dark.accent} strokeWidth={2.2} />}
          label="Strain"
          value="—"
          subtitle="of 21"
        />
      </View>

      <Text variant="label" color="muted" style={styles.sectionLabel}>
        Up next
      </Text>

      <Card>
        <Text variant="caption" color="dim">
          NO WORKOUT SCHEDULED
        </Text>
        <Text variant="title" style={{ marginTop: Spacing.sm }}>
          Rest day
        </Text>
        <Text variant="body" color="muted" style={{ marginTop: Spacing.sm }}>
          Connect Apple Health and Strava in Profile to see your training automatically.
        </Text>
      </Card>
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
