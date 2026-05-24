import { useState } from 'react';
import { View, StyleSheet, TextInput, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { X, Sparkles, Check, Trash2 } from 'lucide-react-native';

import { Button } from '@/components/velo/Button';
import { Card } from '@/components/velo/Card';
import { Text } from '@/components/velo/Text';
import { Spacing, Radius } from '@/constants/theme';
import { useColors } from '@/hooks/useColors';
import { generatePlan, GeneratedDay } from '@/lib/aiPlanGeneration';
import { usePlannerStore } from '@/stores/plannerStore';
import { useAuthStore } from '@/stores/authStore';
import { WORKOUT_LABEL, WORKOUT_TYPES } from '@/lib/constants';
import { WorkoutType } from '@/types';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const SUGGESTIONS = [
  '5-day marathon base building week, moderate intensity',
  'Recovery week after a race, 4 sessions',
  '3-day strength focus for football players',
  'Triathlon build week, 6 days, balanced swim/bike/run',
  'High school cross-country, 5 days, varied intensity',
];

export default function CoachPlanAIScreen() {
  const router = useRouter();
  const colors = useColors();
  const { teamId, athleteId, weekStart } = useLocalSearchParams<{ teamId: string; athleteId?: string; weekStart: string }>();
  const userId = useAuthStore((s) => s.user?.id ?? '');
  const addPlan = usePlannerStore((s) => s.addPlan);
  const saveTemplate = usePlannerStore((s) => s.saveTemplate);

  const [prompt, setPrompt] = useState('');
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [days, setDays] = useState<GeneratedDay[]>([]);
  const [saving, setSaving] = useState(false);

  const generate = async () => {
    if (!prompt.trim()) return;
    setGenerating(true);
    setError('');
    try {
      const result = await generatePlan(prompt.trim());
      setDays(result);
    } catch (e: any) {
      setError(e.message ?? 'Failed to generate plan');
    } finally {
      setGenerating(false);
    }
  };

  const removeDay = (idx: number) => setDays((d) => d.filter((_, i) => i !== idx));

  const updateDay = (idx: number, field: keyof GeneratedDay, value: any) => {
    setDays((d) => d.map((day, i) => i === idx ? { ...day, [field]: value } : day));
  };

  const apply = async (saveAsTemplate = false) => {
    if (days.length === 0) return;
    setSaving(true);
    for (const day of days) {
      const date = new Date(weekStart);
      date.setDate(date.getDate() + day.dayIndex);
      await addPlan({
        teamId, athleteId: athleteId ?? null,
        date: date.toISOString().split('T')[0],
        type: day.type, title: day.title,
        description: day.description,
        durationMin: day.durationMin,
        intensity: day.intensity,
        createdBy: userId,
      });
    }
    if (saveAsTemplate) saveTemplate(prompt.slice(0, 40), days);
    setSaving(false);
    router.back();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable hitSlop={12} onPress={() => router.back()}><X size={24} color={colors.text} strokeWidth={2} /></Pressable>
        <Text variant="title" weight="semibold">AI Plan Builder</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent} keyboardShouldPersistTaps="handled">
        <View style={[styles.inputWrap, { backgroundColor: colors.surface, borderColor: error ? colors.danger : colors.border }]}>
          <Sparkles size={16} color={colors.accent} strokeWidth={2} />
          <TextInput
            style={[styles.input, { color: colors.text }]}
            placeholder="Describe the training plan…"
            placeholderTextColor={colors.textDim}
            value={prompt} onChangeText={setPrompt}
            multiline returnKeyType="done"
          />
        </View>

        {days.length === 0 && (
          <>
            <Text variant="label" color="muted" style={styles.sectionLabel}>Try these</Text>
            {SUGGESTIONS.map((s) => (
              <Pressable key={s} onPress={() => setPrompt(s)}>
                <Card style={styles.suggestion}>
                  <Text variant="small" color="muted">{s}</Text>
                </Card>
              </Pressable>
            ))}
          </>
        )}

        {error ? <Text variant="small" color="danger" style={{ marginTop: Spacing.sm }}>{error}</Text> : null}

        {days.length > 0 && (
          <>
            <Text variant="label" color="muted" style={styles.sectionLabel}>
              Review · {days.length} workout{days.length !== 1 ? 's' : ''}
            </Text>
            {days.map((day, i) => (
              <Card key={i} style={styles.dayCard}>
                <View style={styles.dayHeader}>
                  <View style={[styles.dayBadge, { backgroundColor: colors.accent }]}>
                    <Text variant="caption" weight="bold" style={{ color: '#0a0a0a' }}>{DAYS[day.dayIndex]}</Text>
                  </View>
                  <Text variant="body" weight="semibold" style={{ flex: 1 }}>{day.title}</Text>
                  <Pressable hitSlop={8} onPress={() => removeDay(i)}>
                    <Trash2 size={16} color={colors.textDim} strokeWidth={2} />
                  </Pressable>
                </View>
                <Text variant="small" color="muted" style={{ marginTop: Spacing.xs }}>{day.description}</Text>
                <Text variant="small" color="dim" style={{ marginTop: Spacing.xs }}>
                  {WORKOUT_LABEL[day.type]} · {day.durationMin} min · intensity {day.intensity}/10
                </Text>
              </Card>
            ))}
          </>
        )}
      </ScrollView>

      <View style={[styles.footer, { borderTopColor: colors.borderMuted }]}>
        {days.length === 0 ? (
          <Button
            label={generating ? 'Generating…' : 'Generate plan'}
            icon={generating ? undefined : <Sparkles size={16} color="#0a0a0a" strokeWidth={2.5} />}
            onPress={generate} fullWidth
            style={generating || !prompt.trim() ? { opacity: 0.5 } : undefined}
          />
        ) : (
          <View style={{ gap: Spacing.sm }}>
            <Button label={saving ? 'Saving…' : 'Apply to week'} onPress={() => apply(false)} fullWidth
              style={saving ? { opacity: 0.6 } : undefined} />
            <Button label="Apply & save as template" variant="secondary" onPress={() => apply(true)} fullWidth />
            <Button label="Regenerate" variant="secondary"
              icon={<Sparkles size={14} color={colors.text} strokeWidth={2} />}
              onPress={generate} fullWidth />
          </View>
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
  inputWrap: { flexDirection: 'row', gap: Spacing.sm, borderWidth: 1, borderRadius: Radius.lg, padding: Spacing.md, alignItems: 'flex-start', minHeight: 80 },
  input: { flex: 1, fontSize: 15, lineHeight: 22 },
  sectionLabel: { marginTop: Spacing.xl, marginBottom: Spacing.md },
  suggestion: { marginBottom: Spacing.sm },
  dayCard: { marginBottom: Spacing.sm },
  dayHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  dayBadge: { paddingHorizontal: Spacing.sm, paddingVertical: 3, borderRadius: Radius.sm },
  footer: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.md, paddingBottom: Spacing.md, borderTopWidth: 1 },
});
