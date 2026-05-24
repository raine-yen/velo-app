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
  compact?: boolean;
};

export function SelectionCard({ label, description, selected, onPress, compact }: Props) {
  const colors = useColors();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        compact && styles.cardCompact,
        { backgroundColor: colors.surface, borderColor: colors.border },
        selected && { borderColor: colors.accent, backgroundColor: colors.surfaceElevated },
        pressed && { opacity: 0.85 },
      ]}>
      <View style={styles.content}>
        <Text variant={compact ? 'small' : 'body'} weight="semibold" numberOfLines={1}>{label}</Text>
        {description ? <Text variant="small" color="muted" style={{ marginTop: 2 }}>{description}</Text> : null}
      </View>
      {selected ? (
        <View style={[styles.check, compact && styles.checkCompact, { backgroundColor: colors.accent }]}>
          <Check size={compact ? 10 : 14} color="#0a0a0a" strokeWidth={3} />
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
  cardCompact: {
    gap: Spacing.sm,
    padding: Spacing.md,
    paddingVertical: 12,
  },
  content: { flex: 1, minWidth: 0 },
  check: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  checkCompact: { width: 18, height: 18, borderRadius: 9 },
});
