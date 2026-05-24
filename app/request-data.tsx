import { useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { X, Check } from 'lucide-react-native';

import { Button } from '@/components/velo/Button';
import { Card } from '@/components/velo/Card';
import { Text } from '@/components/velo/Text';
import { Spacing, Radius } from '@/constants/theme';
import { useColors } from '@/hooks/useColors';
import { useConsentStore, DataCategory, DATA_CATEGORY_LABELS } from '@/stores/consentStore';

const ALL_CATEGORIES: DataCategory[] = ['readiness', 'workouts', 'nutrition', 'wellness'];

export default function RequestDataScreen() {
  const router = useRouter();
  const colors = useColors();
  const { teamId, athleteId, athleteName } = useLocalSearchParams<{ teamId: string; athleteId: string; athleteName: string }>();
  const requestData = useConsentStore((s) => s.requestData);
  const outgoingConsents = useConsentStore((s) => s.outgoingConsents);

  const existing = outgoingConsents.find((c) => c.teamId === teamId && c.athleteId === athleteId);
  const [selected, setSelected] = useState<DataCategory[]>(existing?.requested ?? ALL_CATEGORIES);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const toggle = (cat: DataCategory) => {
    setSelected((prev) => prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]);
  };

  const send = async () => {
    if (selected.length === 0) return;
    setLoading(true);
    const err = await requestData(teamId, athleteId, selected);
    setLoading(false);
    if (err) setError(err);
    else router.back();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable hitSlop={12} onPress={() => router.back()}><X size={24} color={colors.text} strokeWidth={2} /></Pressable>
        <Text variant="title" weight="semibold">Request data</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
        <Text variant="body" color="muted" style={{ marginBottom: Spacing.xl }}>
          Choose what data you'd like to see from <Text variant="body" weight="semibold">{athleteName || 'this athlete'}</Text>. They'll need to approve your request.
        </Text>

        <Text variant="label" color="muted" style={styles.sectionLabel}>Data categories</Text>
        {ALL_CATEGORIES.map((cat) => {
          const { label, description } = DATA_CATEGORY_LABELS[cat];
          const isOn = selected.includes(cat);
          const isApproved = existing?.approved.includes(cat);
          return (
            <Pressable key={cat} onPress={() => toggle(cat)}>
              <Card style={[styles.categoryRow, isOn && { borderColor: colors.accent }]}>
                <View style={{ flex: 1 }}>
                  <Text variant="body" weight="semibold">{label}</Text>
                  <Text variant="small" color="dim">{description}</Text>
                  {isApproved && <Text variant="small" color="accent" style={{ marginTop: 2 }}>✓ Athlete approved</Text>}
                </View>
                <View style={[styles.checkbox, { borderColor: isOn ? colors.accent : colors.border, backgroundColor: isOn ? colors.accent : 'transparent' }]}>
                  {isOn && <Check size={14} color="#0a0a0a" strokeWidth={3} />}
                </View>
              </Card>
            </Pressable>
          );
        })}

        {error ? <Text variant="small" color="danger" style={{ marginTop: Spacing.md }}>{error}</Text> : null}
      </ScrollView>

      <View style={[styles.footer, { borderTopColor: colors.borderMuted }]}>
        <Button
          label={loading ? 'Sending...' : existing ? 'Update request' : 'Send request'}
          onPress={send} fullWidth
          style={loading || selected.length === 0 ? { opacity: 0.5 } : undefined}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md },
  body: { flex: 1 },
  bodyContent: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xl },
  sectionLabel: { marginBottom: Spacing.md },
  categoryRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.sm, borderWidth: 1 },
  checkbox: { width: 24, height: 24, borderRadius: 6, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  footer: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.md, paddingBottom: Spacing.md, borderTopWidth: 1 },
});
