import { View, StyleSheet } from 'react-native';
import { Activity, Heart, Moon } from 'lucide-react-native';

import { Card } from '@/components/velo/Card';
import { InsightCard } from '@/components/velo/InsightCard';
import { MetricRing } from '@/components/velo/MetricRing';
import { Screen } from '@/components/velo/Screen';
import { Text } from '@/components/velo/Text';
import { Spacing } from '@/constants/theme';
import { useColors } from '@/hooks/useColors';
import { useVeloInsight } from '@/hooks/useVeloInsight';
import { formatHours } from '@/lib/format';
import { computeRecoveryScore, useHealthStore } from '@/stores/healthStore';

export default function RecoveryDetailScreen() {
  const colors = useColors();
  const snap = useHealthStore((s) => s.snapshot);
  const score = computeRecoveryScore(snap) ?? 60;
  const { insight, loading } = useVeloInsight('recovery');

  return (
    <Screen>
      <View style={styles.header}>
        <Text variant="label" color="muted">Recovery</Text>
        <Text variant="display" weight="bold">Ready to train?</Text>
      </View>

      <Card style={styles.hero}>
        <View style={{ flex: 1 }}>
          <Text variant="label" color="muted">Recovery score</Text>
          <Text variant="bodyLg" color="muted" style={{ marginTop: Spacing.sm }}>
            {score >= 70 ? 'Green light, but keep the plan honest.' : score >= 50 ? 'Moderate readiness. Train with control.' : 'Recovery needs the priority today.'}
          </Text>
        </View>
        <MetricRing value={score} centerLabel={`${score}`} label="ready" />
      </Card>

      <View style={styles.grid}>
        <Marker icon={<Activity size={18} color={colors.accent} />} label="HRV" value={snap?.avgHRV ? `${snap.avgHRV} ms` : '-'} />
        <Marker icon={<Heart size={18} color="#FF375F" />} label="Resting HR" value={snap?.restingHR ? `${snap.restingHR} bpm` : '-'} />
        <Marker icon={<Moon size={18} color={colors.accent} />} label="Sleep" value={formatHours(snap?.sleepHours)} />
      </View>

      <InsightCard insight={insight} loading={loading} title="Recovery coach" />
    </Screen>
  );
}

function Marker({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <Card style={styles.marker}>
      {icon}
      <Text variant="body" weight="semibold">{value}</Text>
      <Text variant="caption" color="muted">{label}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  header: { marginTop: Spacing.lg, marginBottom: Spacing.xl, gap: Spacing.xs },
  hero: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.md },
  grid: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md },
  marker: { flex: 1, gap: Spacing.xs },
});
