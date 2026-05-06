import { Pressable, StyleSheet, View } from 'react-native';
import { Minus, Plus } from 'lucide-react-native';

import { Colors, Radius, Spacing } from '@/constants/theme';
import { Text } from './Text';

type Props = {
  label: string;
  value: number;
  onChange: (n: number) => void;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
};

export function NumberStepper({
  label,
  value,
  onChange,
  min = 0,
  max = 999,
  step = 1,
  suffix,
}: Props) {
  const dec = () => onChange(Math.max(min, value - step));
  const inc = () => onChange(Math.min(max, value + step));

  return (
    <View style={styles.row}>
      <Text variant="body" color="muted" style={{ flex: 1 }}>
        {label}
      </Text>
      <View style={styles.controls}>
        <Pressable
          onPress={dec}
          style={({ pressed }) => [styles.btn, pressed && { opacity: 0.6 }]}>
          <Minus size={16} color={Colors.dark.text} strokeWidth={2.5} />
        </Pressable>
        <View style={styles.valueWrap}>
          <Text variant="bodyLg" weight="semibold">
            {value}
            {suffix ? <Text variant="bodyLg" color="muted">{` ${suffix}`}</Text> : null}
          </Text>
        </View>
        <Pressable
          onPress={inc}
          style={({ pressed }) => [styles.btn, pressed && { opacity: 0.6 }]}>
          <Plus size={16} color={Colors.dark.text} strokeWidth={2.5} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.md,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  btn: {
    width: 36,
    height: 36,
    borderRadius: Radius.pill,
    backgroundColor: Colors.dark.surface,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  valueWrap: {
    minWidth: 80,
    alignItems: 'center',
  },
});
