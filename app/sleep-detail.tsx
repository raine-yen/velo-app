import { View, StyleSheet } from 'react-native';
import { Moon } from 'lucide-react-native';

import { Card } from '@/components/velo/Card';
import { InsightCard } from '@/components/velo/InsightCard';
import { MetricBar } from '@/components/velo/MetricBar';
import { Screen } from '@/components/velo/Screen';
import { Text } from '@/components/velo/Text';
import { Spacing } from '@/constants/theme';
import { useColors } from '@/hooks/useColors';
import { useVeloInsight } from '@/hooks/useVeloInsight';
import { formatHours, formatMinutes } from '@/lib/format';
import { useHealthStore } from '@/stores/healthStore';

export default function SleepDetailScreen() {
  const colors = useColors();
  const snap = useHealthStore((s) => s.snapshot);
  const stages = snap?.sleepStages;
  const { insight, loading } = useVeloInsight('sleep');

  return (
    <Screen>
      <View style={styles.header}>
        <Text variant="label" color="muted">Sleep</Text>
        <Text variant="display" weight="bold">Recovery starts here</Text>
      </View>

      <Card style={styles.hero}>
        <Moon size={24} color={colors.accent} strokeWidth={2.2} />
        <View>
          <Text variant="display" weight="bold">{formatHours(snap?.sleepHours)}</Text>
          <Text variant="small" color="muted">total sleep from Apple Health</Text>
        </View>
      </Card>

      <Card style={styles.stack}>
        <Text variant="title" weight="semibold">Stages</Text>
        <MetricBar label="REM" value={stages?.remMin ?? 0} max={120} detail={formatMinutes(stages?.remMin)} color="#60a5fa" />
        <MetricBar label="Core" value={stages?.coreMin ?? 0} max={360} detail={formatMinutes(stages?.coreMin)} />
        <MetricBar label="Deep" value={stages?.deepMin ?? 0} max={120} detail={formatMinutes(stages?.deepMin)} color="#a78bfa" />
        <MetricBar label="Awake" value={snap?.sleepAwakeMinutes ?? 0} max={90} detail={formatMinutes(snap?.sleepAwakeMinutes)} color={colors.warning} />
      </Card>

      <InsightCard insight={insight} loading={loading} title="Sleep coach" />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { marginTop: Spacing.lg, marginBottom: Spacing.xl, gap: Spacing.xs },
  hero: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.md },
  stack: { gap: Spacing.md, marginBottom: Spacing.md },
});
