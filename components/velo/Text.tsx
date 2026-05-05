import { Text as RNText, TextProps, StyleSheet } from 'react-native';

import { Colors, FontSizes, FontWeights } from '@/constants/theme';

type VeloTextProps = TextProps & {
  variant?: 'hero' | 'display' | 'title' | 'bodyLg' | 'body' | 'small' | 'caption' | 'label';
  color?: 'primary' | 'muted' | 'dim' | 'accent' | 'danger';
  weight?: 'regular' | 'medium' | 'semibold' | 'bold';
};

export function Text({
  variant = 'body',
  color = 'primary',
  weight,
  style,
  ...props
}: VeloTextProps) {
  const colorMap = {
    primary: Colors.dark.text,
    muted: Colors.dark.textMuted,
    dim: Colors.dark.textDim,
    accent: Colors.dark.accent,
    danger: Colors.dark.danger,
  };

  return (
    <RNText
      style={[
        styles[variant],
        { color: colorMap[color] },
        weight ? { fontWeight: FontWeights[weight] } : null,
        style,
      ]}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  hero: {
    fontSize: FontSizes.hero,
    fontWeight: FontWeights.bold,
    letterSpacing: -1,
    lineHeight: FontSizes.hero * 1.05,
  },
  display: {
    fontSize: FontSizes.display,
    fontWeight: FontWeights.semibold,
    letterSpacing: -0.6,
    lineHeight: FontSizes.display * 1.1,
  },
  title: {
    fontSize: FontSizes.title,
    fontWeight: FontWeights.semibold,
    letterSpacing: -0.3,
  },
  bodyLg: {
    fontSize: FontSizes.bodyLg,
    fontWeight: FontWeights.regular,
    lineHeight: FontSizes.bodyLg * 1.5,
  },
  body: {
    fontSize: FontSizes.body,
    fontWeight: FontWeights.regular,
    lineHeight: FontSizes.body * 1.5,
  },
  small: {
    fontSize: FontSizes.small,
    fontWeight: FontWeights.regular,
    lineHeight: FontSizes.small * 1.4,
  },
  caption: {
    fontSize: FontSizes.caption,
    fontWeight: FontWeights.regular,
    lineHeight: FontSizes.caption * 1.4,
  },
  label: {
    fontSize: FontSizes.caption,
    fontWeight: FontWeights.medium,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
});
