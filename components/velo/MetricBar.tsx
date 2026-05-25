import { DimensionValue, View, StyleSheet } from 'react-native';

import { Text } from '@/components/velo/Text';
import { Spacing, Radius } from '@/constants/theme';
import { useColors } from '@/hooks/useColors';

export function MetricBar({ label, value, max, detail, color }: {
  label: string;
  value: number;
  max: number;
  detail?: string;
  color?: string;
}) {
  const colors = useColors();
  const width = `${Math.min(100, Math.max(0, (value / Math.max(max, 1)) * 100))}%` as DimensionValue;

  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <Text variant="small" weight="semibold">{label}</Text>
        <Text variant="small" color="dim">{detail ?? `${Math.round(value)}`}</Text>
      </View>
      <View style={[styles.track, { backgroundColor: colors.surfaceElevated }]}>
        <View style={[styles.fill, { width, backgroundColor: color ?? colors.accent }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: Spacing.xs },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.md },
  track: { height: 8, borderRadius: Radius.pill, overflow: 'hidden' },
  fill: { height: 8, borderRadius: Radius.pill },
});
