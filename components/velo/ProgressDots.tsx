import { View, StyleSheet } from 'react-native';
import { Colors, Spacing } from '@/constants/theme';

type Props = {
  total: number;
  current: number; // 0-indexed
};

export function ProgressDots({ total, current }: Props) {
  return (
    <View style={styles.row}>
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          style={[
            styles.dot,
            i === current && styles.dotActive,
            i < current && styles.dotDone,
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  dot: {
    height: 4,
    flex: 1,
    backgroundColor: Colors.dark.border,
    borderRadius: 2,
  },
  dotActive: {
    backgroundColor: Colors.dark.accent,
  },
  dotDone: {
    backgroundColor: Colors.dark.accent,
    opacity: 0.5,
  },
});
