import { Sparkles } from 'lucide-react-native';
import { View, StyleSheet } from 'react-native';

import { VeloInsight } from '@/lib/aiInsights';
import { useColors } from '@/hooks/useColors';
import { Card } from '@/components/velo/Card';
import { Text } from '@/components/velo/Text';
import { Spacing } from '@/constants/theme';

export function InsightCard({ insight, loading, title = 'AI insight' }: {
  insight: VeloInsight | null;
  loading?: boolean;
  title?: string;
}) {
  const colors = useColors();
  const toneColor = insight?.tone === 'red' ? colors.danger : insight?.tone === 'yellow' ? colors.warning : colors.accent;

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <Sparkles size={16} color={toneColor} strokeWidth={2.3} />
        <Text variant="label" color="muted">{title}</Text>
      </View>
      <Text variant="title" weight="semibold" style={{ marginTop: Spacing.sm }}>
        {loading && !insight ? 'Reading your signals' : insight?.title ?? "Today's guidance"}
      </Text>
      <Text variant="body" color="muted" style={{ marginTop: Spacing.xs }}>
        {loading && !insight ? 'Velo is checking recovery, training, and fuel.' : insight?.summary ?? 'Connect Apple Health and log meals to unlock sharper coaching.'}
      </Text>
      <Text variant="small" color="accent" weight="semibold" style={{ marginTop: Spacing.md }}>
        {insight?.action ?? 'Keep your next choice easy to act on.'}
      </Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: 0 },
  header: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
});
