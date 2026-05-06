import { Pressable, StyleSheet, View } from 'react-native';
import { Check } from 'lucide-react-native';

import { Colors, Radius, Spacing } from '@/constants/theme';
import { Text } from './Text';

type Props = {
  label: string;
  description?: string;
  selected?: boolean;
  onPress: () => void;
};

export function SelectionCard({ label, description, selected, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        selected && styles.cardSelected,
        pressed && { opacity: 0.85 },
      ]}>
      <View style={styles.content}>
        <Text variant="body" weight="semibold">
          {label}
        </Text>
        {description ? (
          <Text variant="small" color="muted" style={{ marginTop: 2 }}>
            {description}
          </Text>
        ) : null}
      </View>
      {selected ? (
        <View style={styles.checkBadge}>
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
    backgroundColor: Colors.dark.surface,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  cardSelected: {
    borderColor: Colors.dark.accent,
    backgroundColor: Colors.dark.surfaceElevated,
  },
  content: {
    flex: 1,
  },
  checkBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.dark.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
