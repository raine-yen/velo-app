import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { Send, Sparkles } from 'lucide-react-native';

import { Card } from '@/components/velo/Card';
import { Screen } from '@/components/velo/Screen';
import { Text } from '@/components/velo/Text';
import { Spacing, Radius } from '@/constants/theme';
import { useColors } from '@/hooks/useColors';
import { generateCoachMessage, CoachMessage } from '@/lib/aiInsights';
import { summarizeForAI } from '@/lib/healthContext';
import { isoDate } from '@/lib/date';
import { useHealthStore } from '@/stores/healthStore';
import { useNutritionStore } from '@/stores/nutritionStore';
import { useUserStore } from '@/stores/userStore';
import { useWellnessStore } from '@/stores/wellnessStore';
import { useWorkoutStore } from '@/stores/workoutStore';

export default function AICoachScreen() {
  const colors = useColors();
  const profile = useUserStore((s) => s.profile);
  const health = useHealthStore((s) => s.snapshot);
  const meals = useNutritionStore((s) => s.meals);
  const workouts = useWorkoutStore((s) => s.workouts);
  const checkIns = useWellnessStore((s) => s.checkIns);
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<CoachMessage | null>(null);

  const context = useMemo(() => summarizeForAI({
    profile,
    health,
    meals,
    workouts,
    checkIn: checkIns[isoDate()] ?? null,
  }), [checkIns, health, meals, profile, workouts]);

  const ask = async (prompt = question) => {
    setLoading(true);
    const next = await generateCoachMessage(prompt, context);
    setMessage(next);
    setLoading(false);
  };

  return (
    <Screen>
      <View style={styles.header}>
        <Text variant="label" color="muted">Velo AI</Text>
        <Text variant="display" weight="bold">Ask your coach</Text>
      </View>

      <Card style={styles.promptCard}>
        <View style={styles.promptHeader}>
          <Sparkles size={18} color={colors.accent} />
          <Text variant="body" weight="semibold">What should I know?</Text>
        </View>
        <View style={[styles.inputWrap, { borderColor: colors.border }]}>
          <TextInput
            value={question}
            onChangeText={setQuestion}
            placeholder="Ask about sleep, recovery, training, or fuel"
            placeholderTextColor={colors.textDim}
            multiline
            style={[styles.input, { color: colors.text }]}
          />
          <Pressable onPress={() => ask()} style={[styles.send, { backgroundColor: colors.accent }]}>
            {loading ? <ActivityIndicator color="#0a0a0a" /> : <Send size={16} color="#0a0a0a" strokeWidth={2.5} />}
          </Pressable>
        </View>
        <View style={styles.chips}>
          {['Can I train hard today?', 'Why is recovery low?', 'What should I eat next?'].map((sample) => (
            <Pressable key={sample} onPress={() => { setQuestion(sample); ask(sample); }} style={[styles.chip, { borderColor: colors.border }]}>
              <Text variant="caption" color="muted">{sample}</Text>
            </Pressable>
          ))}
        </View>
      </Card>

      {message ? (
        <Card style={styles.answer}>
          <Text variant="title" weight="semibold">{message.title}</Text>
          <Text variant="body" color="muted" style={{ marginTop: Spacing.sm }}>{message.answer}</Text>
          {message.actions.map((action) => (
            <Text key={action} variant="small" color="accent" style={{ marginTop: Spacing.sm }}>
              {action}
            </Text>
          ))}
        </Card>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { marginTop: Spacing.lg, marginBottom: Spacing.xl, gap: Spacing.xs },
  promptCard: { gap: Spacing.md },
  promptHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  inputWrap: { borderWidth: 1, borderRadius: Radius.lg, padding: Spacing.sm, gap: Spacing.sm },
  input: { minHeight: 72, fontSize: 15, textAlignVertical: 'top' },
  send: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', alignSelf: 'flex-end' },
  chips: { gap: Spacing.sm },
  chip: { borderWidth: 1, borderRadius: Radius.pill, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, alignSelf: 'flex-start' },
  answer: { marginTop: Spacing.md },
});
