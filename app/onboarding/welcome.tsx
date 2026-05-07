import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { Button } from '@/components/velo/Button';
import { Text } from '@/components/velo/Text';
import { Spacing } from '@/constants/theme';
import { useColors } from '@/hooks/useColors';

export default function Welcome() {
  const router = useRouter();
  const colors = useColors();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      <View style={styles.body}>
        <View style={[styles.logoMark, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text variant="hero" weight="bold" color="accent">V</Text>
        </View>
        <Text variant="hero" weight="bold" style={styles.title}>
          Train smarter.{'\n'}
          <Text variant="hero" color="muted">Track everything.</Text>
        </Text>
        <Text variant="bodyLg" color="muted" style={styles.subtitle}>
          Velo unifies nutrition, training, recovery, and your team — in one minimal app built for athletes.
        </Text>
      </View>
      <View style={styles.footer}>
        <Button label="Get started" onPress={() => router.push('/onboarding/name')} fullWidth />
        <Text variant="small" color="dim" style={styles.legal}>
          By continuing you agree to Velo's terms and privacy policy.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  body: { flex: 1, justifyContent: 'center', paddingHorizontal: Spacing.lg },
  logoMark: { width: 64, height: 64, borderRadius: 16, borderWidth: 1, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.xl },
  title: { marginBottom: Spacing.lg },
  subtitle: { maxWidth: 320 },
  footer: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.md, gap: Spacing.md },
  legal: { textAlign: 'center' },
});
