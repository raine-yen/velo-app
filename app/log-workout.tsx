import { useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { X } from 'lucide-react-native';

import { Button } from '@/components/velo/Button';
import { Card } from '@/components/velo/Card';
import { NumberStepper } from '@/components/velo/NumberStepper';
import { Text } from '@/components/velo/Text';
import { Radius, Spacing } from '@/constants/theme';
import { useColors } from '@/hooks/useColors';
import { WORKOUT_TYPES } from '@/lib/constants';
import { useWorkoutStore } from '@/stores/workoutStore';
import { WorkoutType } from '@/types';

export default function LogWorkoutModal() {
  const router = useRouter();
  const colors = useColors();
  const logWorkout = useWorkoutStore((s) => s.logWorkout);

  const [type, setType] = useState<WorkoutType>('lift');
  const [name, setName] = useState('');
  const [duration, setDuration] = useState(45);
  const [intensity, setIntensity] = useState(7);
  const [notes, setNotes] = useState('');

  const save = () => {
    logWorkout({
      type,
      name: name.trim() || WORKOUT_TYPES.find((w) => w.id === type)?.label || 'Workout',
      durationMin: duration,
      intensity,
      notes: notes.trim() || undefined,
    });
    router.back();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable hitSlop={12} onPress={() => router.back()}>
          <X size={24} color={colors.text} strokeWidth={2} />
        </Pressable>
        <Text variant="title" weight="semibold">Log workout</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent} keyboardShouldPersistTaps="handled">
        <Text variant="label" color="muted" style={styles.section}>Type</Text>
        <View style={styles.chipRow}>
          {WORKOUT_TYPES.map((w) => (
            <Pressable key={w.id} onPress={() => setType(w.id)}
              style={[styles.chip, { backgroundColor: colors.surface, borderColor: colors.border },
                type === w.id && { backgroundColor: colors.accent, borderColor: colors.accent }]}>
              <Text variant="small" weight="semibold" style={{ color: type === w.id ? '#0a0a0a' : colors.text }}>
                {w.label}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text variant="label" color="muted" style={styles.section}>Name (optional)</Text>
        <TextInput style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
          placeholder="Push day, 5k tempo, etc." placeholderTextColor={colors.textDim}
          value={name} onChangeText={setName} />

        <Card style={{ marginTop: Spacing.lg }}>
          <NumberStepper label="Duration" value={duration} onChange={setDuration} min={5} max={300} step={5} suffix="min" />
          <NumberStepper label="Intensity" value={intensity} onChange={setIntensity} min={1} max={10} suffix="/ 10" />
        </Card>

        <Text variant="label" color="muted" style={styles.section}>Notes</Text>
        <TextInput style={[styles.input, styles.notesInput, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
          placeholder="How'd it go?" placeholderTextColor={colors.textDim}
          value={notes} onChangeText={setNotes} multiline numberOfLines={3} />
      </ScrollView>

      <View style={[styles.footer, { borderTopColor: colors.borderMuted }]}>
        <Button label="Save workout" onPress={save} fullWidth />
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
