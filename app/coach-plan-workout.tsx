import { useState } from 'react';
import { View, StyleSheet, TextInput, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { X } from 'lucide-react-native';

import { Button } from '@/components/velo/Button';
import { Card } from '@/components/velo/Card';
import { NumberStepper } from '@/components/velo/NumberStepper';
import { Text } from '@/components/velo/Text';
import { Spacing, Radius } from '@/constants/theme';
import { useColors } from '@/hooks/useColors';
import { usePlannerStore } from '@/stores/plannerStore';
import { useAuthStore } from '@/stores/authStore';
import { WORKOUT_TYPES } from '@/lib/constants';
import { WorkoutType } from '@/types';

export default function CoachPlanWorkoutScreen() {
  const router = useRouter();
  const colors = useColors();
  const { teamId, athleteId, date } = useLocalSearchParams<{ teamId: string; athleteId?: string; date: string }>();
  const addPlan = usePlannerStore((s) => s.addPlan);
  const userId = useAuthStore((s) => s.user?.id ?? '');

  const [type, setType] = useState<WorkoutType>('run');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState(45);
  const [intensity, setIntensity] = useState(6);
  const [saving, setSaving] = useState(false);

  const displayDate = new Date(date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

  const save = async () => {
    if (!title.trim()) return;
    setSaving(true);
    await addPlan({
      teamId, athleteId: athleteId || null,
      date, type,
      title: title.trim(),
      description: description.trim(),
      durationMin: duration,
      intensity,
      createdBy: userId,
    });
    setSaving(false);
    router.back();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable hitSlop={12} onPress={() => router.back()}><X size={24} color={colors.text} strokeWidth={2} /></Pressable>
        <Text variant="title" weight="semibold">Add workout</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent} keyboardShouldPersistTaps="handled">
        <Text variant="label" color="muted" style={styles.section}>{displayDate}</Text>

        <Text variant="label" color="muted" style={styles.section}>Type</Text>
        <View style={styles.chipRow}>
          {WORKOUT_TYPES.map((w) => (
            <Pressable key={w.id} onPress={() => setType(w.id)}
              style={[styles.chip, { backgroundColor: colors.surface, borderColor: colors.border },
                type === w.id && { backgroundColor: colors.accent, borderColor: colors.accent }]}>
              <Text variant="small" weight="semibold" style={{ color: type === w.id ? '#0a0a0a' : colors.text }}>{w.label}</Text>
            </Pressable>
          ))}
        </View>

        <Text variant="label" color="muted" style={styles.section}>Title</Text>
        <TextInput style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
          placeholder="e.g. Easy 5k, Tempo run, Heavy squat day" placeholderTextColor={colors.textDim}
          value={title} onChangeText={setTitle} autoFocus />

        <Text variant="label" color="muted" style={styles.section}>Coaching notes</Text>
        <TextInput style={[styles.input, styles.notesInput, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
          placeholder="Instructions, focus cues, pacing…" placeholderTextColor={colors.textDim}
          value={description} onChangeText={setDescription} multiline numberOfLines={3} />

        <Card style={{ marginTop: Spacing.lg }}>
          <NumberStepper label="Duration" value={duration} onChange={setDuration} min={5} max={300} step={5} suffix="min" />
          <NumberStepper label="Intensity" value={intensity} onChange={setIntensity} min={1} max={10} suffix="/ 10" />
        </Card>
      </ScrollView>

      <View style={[styles.footer, { borderTopColor: colors.borderMuted }]}>
        <Button label={saving ? 'Saving…' : 'Add to plan'} onPress={save} fullWidth
          style={saving || !title.trim() ? { opacity: 0.5 } : undefined} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md },
  body: { flex: 1 },
  bodyContent: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xl },
  section: { marginTop: Spacing.lg, marginBottom: Spacing.md },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  chip: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: Radius.pill, borderWidth: 1 },
  input: { borderWidth: 1, borderRadius: Radius.lg, paddingHorizontal: Spacing.md, paddingVertical: 14, fontSize: 15 },
  notesInput: { minHeight: 80, textAlignVertical: 'top' },
  footer: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.md, paddingBottom: Spacing.md, borderTopWidth: 1 },
});
