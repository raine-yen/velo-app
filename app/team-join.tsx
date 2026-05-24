import { useState } from 'react';
import { View, StyleSheet, TextInput, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { X } from 'lucide-react-native';

import { Button } from '@/components/velo/Button';
import { Text } from '@/components/velo/Text';
import { Spacing, Radius } from '@/constants/theme';
import { useColors } from '@/hooks/useColors';
import { useTeamStore } from '@/stores/teamStore';

export default function TeamJoinModal() {
  const router = useRouter();
  const colors = useColors();
  const joinTeam = useTeamStore((s) => s.joinTeam);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async () => {
    if (code.trim().length < 6) return;
    setLoading(true);
    const err = await joinTeam(code.trim());
    setLoading(false);
    if (err) setError(err);
    else router.back();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable hitSlop={12} onPress={() => router.back()}>
          <X size={24} color={colors.text} strokeWidth={2} />
        </Pressable>
        <Text variant="title" weight="semibold">Join a team</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.body}>
        <Text variant="body" color="muted" style={{ marginBottom: Spacing.xl }}>
          Enter the 6-character code from your coach.
        </Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text, letterSpacing: 6, textAlign: 'center', fontSize: 22, fontWeight: '700' }]}
          placeholder="ABC123" placeholderTextColor={colors.textDim}
          value={code} onChangeText={(t) => setCode(t.toUpperCase())}
          maxLength={6} autoCapitalize="characters" autoCorrect={false} autoFocus
        />
        {error ? <Text variant="small" color="danger" style={{ marginTop: Spacing.sm, textAlign: 'center' }}>{error}</Text> : null}
        <Button label={loading ? 'Joining...' : 'Join team'} onPress={submit}
          fullWidth style={{ marginTop: Spacing.lg, ...(loading || code.length < 6 ? { opacity: 0.5 } : {}) }} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md },
  body: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.xl },
  input: { borderWidth: 1, borderRadius: Radius.lg, paddingHorizontal: Spacing.md, paddingVertical: 16 },
});
