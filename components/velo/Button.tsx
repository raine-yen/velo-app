import { Pressable, StyleSheet, StyleProp, View, ViewStyle } from 'react-native';
import { useColors } from '@/hooks/useColors';
import { Radius, Spacing, FontSizes, FontWeights } from '@/constants/theme';
import { Text } from './Text';

type Props = {
  onPress: () => void;
  label: string;
  variant?: 'primary' | 'secondary' | 'ghost';
  icon?: React.ReactNode;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function Button({ onPress, label, variant = 'primary', icon, fullWidth, style }: Props) {
  const colors = useColors();

  const bg =
    variant === 'primary'
      ? colors.accent
      : variant === 'secondary'
      ? colors.surface
      : 'transparent';

  const border: ViewStyle =
    variant === 'secondary'
      ? { borderWidth: 1, borderColor: colors.border }
      : {};

  const textColor = variant === 'primary' ? '#0a0a0a' : colors.text;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        { backgroundColor: bg },
        border,
        fullWidth && styles.fullWidth,
        pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] },
        style,
      ]}>
      {icon ? <View style={styles.icon}>{icon}</View> : null}
      <Text style={{ fontSize: FontSizes.body, fontWeight: FontWeights.semibold, color: textColor }}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: 14,
    borderRadius: Radius.pill,
    gap: Spacing.sm,
  },
  fullWidth: { width: '100%' },
  icon: { marginRight: 2 },
});
