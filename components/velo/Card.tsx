import { View, StyleSheet, ViewStyle, Pressable, StyleProp } from 'react-native';
import { useColors } from '@/hooks/useColors';
import { Radius, Spacing } from '@/constants/theme';

type Props = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  variant?: 'default' | 'elevated' | 'outline';
};

export function Card({ children, style, onPress, variant = 'default' }: Props) {
  const colors = useColors();

  const variantStyle: ViewStyle =
    variant === 'elevated'
      ? { backgroundColor: colors.surfaceElevated, borderWidth: 1, borderColor: colors.border }
      : variant === 'outline'
      ? { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.border }
      : { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border };

  const content = <View style={[styles.base, variantStyle, style]}>{children}</View>;

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}>
        {content}
      </Pressable>
    );
  }
  return content;
}

const styles = StyleSheet.create({
  base: { borderRadius: Radius.lg, padding: Spacing.lg },
});
