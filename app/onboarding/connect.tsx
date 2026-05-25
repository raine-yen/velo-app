import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Heart, Watch, Activity } from 'lucide-react-native';

import { OnboardingShell } from '@/components/velo/OnboardingShell';
import { Card } from '@/components/velo/Card';
import { Text } from '@/components/velo/Text';
import { Spacing } from '@/constants/theme';
import { useColors } from '@/hooks/useColors';

export default function ConnectStep() {
  const router = useRouter();
  const colors = useColors();

  return (
    <OnboardingShell step={4} totalSteps={6} title="Connect your data"
      subtitle="Pull workouts, sleep, and activity automatically. You can do this later in Profile."
      primaryLabel="Skip for now" onPrimary={() => router.push('/onboarding/done')}>
      <View style={styles.list}>
        <ConnectionRow
          icon={<Heart size={22} color={colors.accent} strokeWidth={2} />}
          title="Apple Health"
          subtitle="Sleep, steps, workouts, weight"
          status="Connect"
          colors={colors}
          onPress={() => router.push('/health-import')}
        />
        <ConnectionRow icon={<Activity size={22} color={colors.textMuted} strokeWidth={2} />} title="Strava" subtitle="Runs, rides, swims" status="Coming soon" colors={colors} />
        <ConnectionRow icon={<Watch size={22} color={colors.textMuted} strokeWidth={2} />} title="Garmin" subtitle="Watch data and metrics" status="Coming soon" colors={colors} />
      </View>
      <Text variant="small" color="dim" style={{ marginTop: Spacing.lg, textAlign: 'center' }}>
        Apple Health can be connected now on iPhone. Other sources can still be added later.
      </Text>
    </OnboardingShell>
  );
}

function ConnectionRow({ icon, title, subtitle, status, colors, onPress }: {
  icon: React.ReactNode; title: string; subtitle: string; status: string;
  colors: ReturnType<typeof useColors>; onPress?: () => void;
}) {
  return (
    <Card style={styles.row} onPress={onPress}>
      <View style={[styles.iconWrap, { backgroundColor: colors.surfaceElevated }]}>{icon}</View>
      <View style={{ flex: 1 }}>
        <Text variant="body" weight="semibold">{title}</Text>
        <Text variant="small" color="muted">{subtitle}</Text>
      </View>
      <Text variant="caption" color="dim">{status}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  list: { gap: Spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  iconWrap: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
});
