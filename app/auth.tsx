import { useState } from 'react';
import { View, StyleSheet, TextInput, KeyboardAvoidingView, Platform, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/velo/Button';
import { Text } from '@/components/velo/Text';
import { Radius, Spacing } from '@/constants/theme';
import { useColors } from '@/hooks/useColors';
import { useAuthStore } from '@/stores/authStore';

export default function AuthScreen() {
  const colors = useColors();
  const signIn = useAuthStore((s) => s.signIn);
  const signUp = useAuthStore((s) => s.signUp);

  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  const submit = async () => {
    if (!email || !password) return;
    setLoading(true);
    setError('');
    setSuccess('');

    const err = isSignUp
      ? await signUp(email.trim(), password)
      : await signIn(email.trim(), password);

    setLoading(false);
    if (err) {
      setError(err);
    } else if (isSignUp) {
      setSuccess('Check your email to confirm your account.');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.inner}>
        <View style={styles.header}>
          <Text variant="display" weight="bold" color="accent">V</Text>
          <Text variant="display" weight="bold" style={{ marginTop: Spacing.sm }}>
            {isSignUp ? 'Create account' : 'Welcome back'}
          </Text>
          <Text variant="body" color="muted" style={{ marginTop: Spacing.sm }}>
            {isSignUp ? 'Sign up to save your data across devices.' : 'Sign in to your Velo account.'}
          </Text>
        </View>

        <View style={styles.form}>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
            placeholder="Email" placeholderTextColor={colors.textDim}
            value={email} onChangeText={setEmail}
            autoCapitalize="none" keyboardType="email-address" autoCorrect={false}
          />
          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
            placeholder="Password" placeholderTextColor={colors.textDim}
            value={password} onChangeText={setPassword}
            secureTextEntry autoCapitalize="none"
          />

          {error ? <Text variant="small" color="danger">{error}</Text> : null}
          {success ? <Text variant="small" color="accent">{success}</Text> : null}

          <Button label={loading ? 'Loading...' : isSignUp ? 'Sign up' : 'Sign in'} onPress={submit} fullWidth
            style={loading ? { opacity: 0.6 } : undefined} />
        </View>

        <Pressable onPress={() => { setIsSignUp(!isSignUp); setError(''); setSuccess(''); }} hitSlop={8}>
          <Text variant="body" color="muted" style={{ textAlign: 'center' }}>
            {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
            <Text variant="body" color="accent" weight="semibold">
              {isSignUp ? 'Sign in' : 'Sign up'}
            </Text>
          </Text>
        </Pressable>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: { flex: 1, paddingHorizontal: Spacing.lg, justifyContent: 'center', gap: Spacing.xl },
  header: {},
  form: { gap: Spacing.md },
  input: { borderWidth: 1, borderRadius: Radius.lg, paddingHorizontal: Spacing.md, paddingVertical: 16, fontSize: 16 },
});
