import { useState } from 'react';
import { View, StyleSheet, TextInput } from 'react-native';
import { useRouter } from 'expo-router';

import { OnboardingShell } from '@/components/velo/OnboardingShell';
import { Spacing, Radius } from '@/constants/theme';
import { useColors } from '@/hooks/useColors';
import { useUserStore } from '@/stores/userStore';

export default function NameStep() {
  const router = useRouter();
  const colors = useColors();
  const setName = useUserStore((s) => s.setName);
  const saved = useUserStore((s) => s.profile.name);
  const [name, setLocal] = useState(saved);

  const next = () => {
    setName(name.trim());
    router.push('/onboarding/sport');
  };

  return (
    <OnboardingShell
      step={0}
      totalSteps={5}
      title={`What's your\nname?`}
      subtitle="Just your first name is fine."
      primaryLabel="Continue"
      primaryDisabled={!name.trim()}
      onPrimary={next}
      secondaryLabel="Skip"
      onSecondary={() => router.push('/onboarding/sport')}>
      <View style={styles.wrap}>
        <TextInput
          style={[styles.input, { backgroundColor: colors.surface, borderColor: name.trim() ? colors.accent : colors.border, color: colors.text }]}
          placeholder="Your name"
          placeholderTextColor={colors.textDim}
          value={name}
          onChangeText={setLocal}
          autoFocus
          autoCorrect={false}
          returnKeyType="done"
          onSubmitEditing={next}
        />
      </View>
    </OnboardingShell>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingTop: Spacing.sm },
  input: {
    borderWidth: 1.5,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 18,
    fontSize: 22,
    fontWeight: '500',
    letterSpacing: -0.3,
  },
});
