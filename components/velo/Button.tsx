import { Pressable, StyleSheet, View, ViewStyle } from 'react-native';

import { Colors, Radius, Spacing, FontSizes, FontWeights } from '@/constants/theme';
import { Text } from './Text';

type Props = {
  onPress: () => void;
  label: string;
  variant?: 'primary' | 'secondary' | 'ghost';
  icon?: React.ReactNode;
  fullWidth?: boolean;
  style?: ViewStyle;
};

export function Button({
  onPress,
  label,
  variant = 'primary',
  icon,
  fullWidth = false,
  style,
}: Props) {
  const variantStyle = variantStyles[variant];
  const textColor =
    variant === 'primary'
      ? '#0a0a0a'
      : variant === 'secondary'
      ? Colors.dark.text
      : Colors.dark.text;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        variantStyle,
        fullWidth && styles.fullWidth,
        pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] },
        style,
      ]}>
      {icon ? <View style={styles.icon}>{icon}</View> : null}
      <Text
        style={{
          fontSize: FontSizes.body,
          fontWeight: FontWeights.semibold,
          color: textColor,
        }}>
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
  fullWidth: {
    width: '100%',
  },
  icon: {
    marginRight: 2,
  },
});

const variantStyles = StyleSheet.create({
  primary: {
    backgroundColor: Colors.dark.accent,
  },
  secondary: {
    backgroundColor: Colors.dark.surface,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
});
