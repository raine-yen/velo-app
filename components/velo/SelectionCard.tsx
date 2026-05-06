import { Pressable, StyleSheet, View } from 'react-native';
import { Check } from 'lucide-react-native';
import { useColors } from '@/hooks/useColors';
import { Radius, Spacing } from '@/constants/theme';
import { Text } from './Text';

type Props = {
  label: string;
  description?: string;
  selected?: boolean;
  onPress: () => void;
};

export function SelectionCard({ label, description, selected, onPress }: Props) {
  const colors = useColors();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: colors.surface, borderColor: colors.border },
        selected && { borderColor: colors.accent, backgroundColor: colors.surfaceElevated },
        pressed && { opacity: 0.85 },
      ]}>
      <View style={styles.content}>
        <Text variant="body" weight="semibold">{label}</Text>
        {description ? <Text variant="small" color="muted" style={{ marginTop: 2 }}>{description}</Text> : null}
      </View>
      {selected ? (
        <View style={[styles.check, { backgroundColor: colors.accent }]}>
          <Check size={14} color="#0a0a0a" strokeWidth={3} />
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    borderWidth: 1,
  },
  content: { flex: 1 },
  check: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
});
