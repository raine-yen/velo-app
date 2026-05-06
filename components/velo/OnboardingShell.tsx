import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';

import { Colors, Spacing } from '@/constants/theme';
import { ProgressDots } from './ProgressDots';
import { Button } from './Button';
import { Text } from './Text';

type Props = {
  step: number; // 0-indexed
  totalSteps: number;
  title: string;
  subtitle?: string;
  primaryLabel: string;
  primaryDisabled?: boolean;
  onPrimary: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
  showBack?: boolean;
  scroll?: boolean;
  children: React.ReactNode;
};

export function OnboardingShell({
  step,
  totalSteps,
  title,
  subtitle,
  primaryLabel,
  primaryDisabled,
  onPrimary,
  secondaryLabel,
  onSecondary,
  showBack = true,
  scroll = true,
  children,
}: Props) {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.topBar}>
        {showBack && router.canGoBack() ? (
          <Pressable
            hitSlop={12}
            onPress={() => router.back()}
            style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.6 }]}>
            <ChevronLeft size={24} color={Colors.dark.text} strokeWidth={2} />
          </Pressable>
        ) : (
          <View style={styles.backBtn} />
        )}
        <View style={styles.dotsWrap}>
          <ProgressDots total={totalSteps} current={step} />
        </View>
        <View style={styles.backBtn} />
      </View>

      {scroll ? (
        <ScrollView
          style={styles.body}
          contentContainerStyle={styles.bodyContent}
          showsVerticalScrollIndicator={false}>
          <View style={styles.titleBlock}>
            <Text variant="display" weight="bold">
              {title}
            </Text>
            {subtitle ? (
              <Text variant="bodyLg" color="muted" style={{ marginTop: Spacing.md }}>
                {subtitle}
              </Text>
            ) : null}
          </View>
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.body, styles.bodyContent]}>
          <View style={styles.titleBlock}>
            <Text variant="display" weight="bold">
              {title}
            </Text>
            {subtitle ? (
              <Text variant="bodyLg" color="muted" style={{ marginTop: Spacing.md }}>
                {subtitle}
              </Text>
            ) : null}
          </View>
          {children}
        </View>
      )}

      <View style={styles.footer}>
        <Button
          label={primaryLabel}
          onPress={onPrimary}
          fullWidth
          style={primaryDisabled ? { opacity: 0.4 } : undefined}
        />
        {secondaryLabel ? (
          <Pressable
            onPress={onSecondary}
            hitSlop={8}
            style={({ pressed }) => [styles.secondary, pressed && { opacity: 0.6 }]}>
            <Text variant="body" color="muted">
              {secondaryLabel}
            </Text>
          </Pressable>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  dotsWrap: {
    flex: 1,
    paddingHorizontal: Spacing.md,
  },
  body: {
    flex: 1,
  },
  bodyContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xl,
  },
  titleBlock: {
    marginBottom: Spacing.xl,
  },
  footer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.dark.borderMuted,
    gap: Spacing.md,
  },
  secondary: {
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
});
