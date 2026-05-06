import { View, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useColors } from '@/hooks/useColors';
import { Text } from './Text';

type Props = {
  value: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  centerLabel?: string;
  color?: string;
};

export function MetricRing({ value, size = 120, strokeWidth = 10, label, centerLabel, color }: Props) {
  const colors = useColors();
  const accentColor = color ?? colors.accent;
  const clamped = Math.max(0, Math.min(100, value));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Circle cx={size / 2} cy={size / 2} r={radius} stroke={colors.border} strokeWidth={strokeWidth} fill="transparent" />
        <Circle cx={size / 2} cy={size / 2} r={radius} stroke={accentColor} strokeWidth={strokeWidth} fill="transparent"
          strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`} />
      </Svg>
      <View style={styles.center}>
        <Text variant="display" weight="bold">{centerLabel ?? `${clamped}`}</Text>
        {label ? <Text variant="caption" color="muted">{label}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center' },
  center: { alignItems: 'center', justifyContent: 'center' },
});
