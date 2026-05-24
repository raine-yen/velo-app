import { useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { X, Check, Shield } from 'lucide-react-native';

import { Button } from '@/components/velo/Button';
import { Card } from '@/components/velo/Card';
import { Text } from '@/components/velo/Text';
import { Spacing, Radius } from '@/constants/theme';
import { useColors } from '@/hooks/useColors';
import { useConsentStore, DataCategory, DATA_CATEGORY_LABELS } from '@/stores/consentStore';

export default function ConsentScreen() {
  const router = useRouter();
  const colors = useColors();
  const { teamId } = useLocalSearchParams<{ teamId: string }>();
  const incomingRequests = useConsentStore((s) => s.incomingRequests);
  const respondToRequest = useConsentStore((s) => s.respondToRequest);
  const revokeConsent = useConsentStore((s) => s.revokeConsent);

  const request = incomingRequests.find((r) => r.teamId === teamId);
  const [approved, setApproved] = useState<DataCategory[]>(request?.approved ?? request?.requested ?? []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!request) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <Pressable hitSlop={12} onPress={() => router.back()}><X size={24} color={colors.text} strokeWidth={2} /></Pressable>
          <Text variant="title" weight="semibold">Data sharing</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text variant="body" color="muted">No pending request found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const toggle = (cat: DataCategory) => {
    setApproved((prev) => prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]);
  };

  const save = async () => {
    setLoading(true);
    const err = await respondToRequest(teamId, approved);
    setLoading(false);
    if (err) setError(err);
    else router.back();
  };

  const revoke = async () => {
    await revokeConsent(teamId);
    router.back();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable hitSlop={12} onPress={() => router.back()}><X size={24} color={colors.text} strokeWidth={2} /></Pressable>
        <Text variant="title" weight="semibold">Data sharing</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
        <View style={[styles.banner, { backgroundColor: colors.surfaceElevated }]}>
          <Shield size={20} color={colors.accent} strokeWidth={2} />
          <View style={{ flex: 1 }}>
            <Text variant="body" weight="semibold">{request.coachName} · {request.teamName}</Text>
            <Text variant="small" color="muted">Your coach is requesting access to your data. You control exactly what they can see.</Text>
          </View>
        </View>

        <Text variant="label" color="muted" style={styles.sectionLabel}>Choose what to share</Text>
        {(request.requested as DataCategory[]).map((cat) => {
          const { label, description } = DATA_CATEGORY_LABELS[cat];
          const isOn = approved.includes(cat);
          return (
            <Pressable key={cat} onPress={() => toggle(cat)}>
              <Card style={[styles.categoryRow, isOn && { borderColor: colors.accent }]}>
                <View style={{ flex: 1 }}>
                  <Text variant="body" weight="semibold">{label}</Text>
                  <Text variant="small" color="dim">{description}</Text>
                </View>
                <View style={[styles.checkbox, { borderColor: isOn ? colors.accent : colors.border, backgroundColor: isOn ? colors.accent : 'transparent' }]}>
                  {isOn && <Check size={14} color="#0a0a0a" strokeWidth={3} />}
                </View>
              </Card>
            </Pressable>
          );
        })}

        <Text variant="small" color="dim" style={{ marginTop: Spacing.lg, textAlign: 'center' }}>
          You can change or revoke this at any time from your profile.
        </Text>
        {error ? <Text variant="small" color="danger" style={{ textAlign: 'center', marginTop: Spacing.sm }}>{error}</Text> : null}
      </ScrollView>

      <View style={[styles.footer, { borderTopColor: colors.borderMuted }]}>
        <Button label={loading ? 'Saving...' : approved.length === 0 ? 'Share nothing' : `Share ${approved.length} item${approved.length !== 1 ? 's' : ''}`}
          onPress={save} fullWidth style={loading ? { opacity: 0.6 } : undefined} />
        {request.status === 'responded' && (
          <Button label="Revoke all access" variant="secondary" onPress={revoke}
            fullWidth style={{ marginTop: Spacing.sm }} />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md },
  body: { flex: 1 },
  bodyContent: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xl },
  banner: { flexDirection: 'row', gap: Spacing.md, padding: Spacing.md, borderRadius: Radius.lg, marginBottom: Spacing.lg, alignItems: 'flex-start' },
  sectionLabel: { marginBottom: Spacing.md },
  categoryRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.sm, borderWidth: 1 },
  checkbox: { width: 24, height: 24, borderRadius: 6, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  footer: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.md, paddingBottom: Spacing.md, borderTopWidth: 1 },
});
