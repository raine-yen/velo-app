import { Pressable, StyleSheet, View } from 'react-native';
import { Minus, Plus } from 'lucide-react-native';
import { useColors } from '@/hooks/useColors';
import { Radius, Spacing } from '@/constants/theme';
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

export function NumberStepper({ label, value, onChange, min = 0, max = 999, step = 1, suffix }: Props) {
  const colors = useColors();
  const dec = () => onChange(Math.max(min, value - step));
  const inc = () => onChange(Math.min(max, value + step));

  return (
    <View style={styles.row}>
      <Text variant="body" color="muted" style={{ flex: 1 }}>{label}</Text>
      <View style={styles.controls}>
        <Pressable onPress={dec} style={[styles.btn, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Minus size={16} color={colors.text} strokeWidth={2.5} />
        </Pressable>
        <View style={styles.val}>
          <Text variant="bodyLg" weight="semibold">
            {value}{suffix ? <Text variant="bodyLg" color="muted">{` ${suffix}`}</Text> : null}
          </Text>
        </View>
        <Pressable onPress={inc} style={[styles.btn, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Plus size={16} color={colors.text} strokeWidth={2.5} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingVertical: Spacing.md },
  controls: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  btn: { width: 36, height: 36, borderRadius: Radius.pill, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  val: { minWidth: 80, alignItems: 'center' },
});
