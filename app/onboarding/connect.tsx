import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Heart, Watch, Activity } from 'lucide-react-native';

import { OnboardingShell } from '@/components/velo/OnboardingShell';
import { Card } from '@/components/velo/Card';
import { Text } from '@/components/velo/Text';
import { Colors, Spacing } from '@/constants/theme';

export default function ConnectStep() {
  const router = useRouter();

  return (
    <OnboardingShell
      step={3}
      totalSteps={5}
      title="Connect your data"
      subtitle="Pull workouts, sleep, and activity automatically. You can do this later in Profile."
      primaryLabel="Skip for now"
      onPrimary={() => router.push('/onboarding/done')}>
      <View style={styles.list}>
        <ConnectionRow
          icon={<Heart size={22} color={Colors.dark.accent} strokeWidth={2} />}
          title="Apple Health"
          subtitle="Sleep, steps, workouts, weight"
          status="Coming soon"
        />
        <ConnectionRow
          icon={<Activity size={22} color={Colors.dark.textMuted} strokeWidth={2} />}
          title="Strava"
          subtitle="Runs, rides, swims"
          status="Coming soon"
        />
        <ConnectionRow
          icon={<Watch size={22} color={Colors.dark.textMuted} strokeWidth={2} />}
          title="Garmin"
          subtitle="Watch data and metrics"
          status="Coming soon"
        />
      </View>

      <Text variant="small" color="dim" style={{ marginTop: Spacing.lg, textAlign: 'center' }}>
        We'll wire up real connections in a future update. For now, log workouts and meals manually.
      </Text>
    </OnboardingShell>
  );
}

function ConnectionRow({
  icon,
  title,
  subtitle,
  status,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  status: string;
}) {
  return (
    <Card style={styles.row}>
      <View style={styles.iconWrap}>{icon}</View>
      <View style={{ flex: 1 }}>
        <Text variant="body" weight="semibold">
          {title}
        </Text>
        <Text variant="small" color="muted">
          {subtitle}
        </Text>
      </View>
      <Text variant="caption" color="dim">
        {status}
      </Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: Spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.dark.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
