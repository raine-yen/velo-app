import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Send, Sparkles } from 'lucide-react-native';

import { Card } from '@/components/velo/Card';
import { Screen } from '@/components/velo/Screen';
import { Text } from '@/components/velo/Text';
import { Spacing, Radius } from '@/constants/theme';
import { useColors } from '@/hooks/useColors';
import { generateCoachMessage, CoachMessage, InsightKind } from '@/lib/aiInsights';
import { summarizeForAI } from '@/lib/healthContext';
import { isoDate } from '@/lib/date';
import { insightKey, useAIInsightStore } from '@/stores/aiInsightStore';
import { useHealthStore } from '@/stores/healthStore';
import { useNutritionStore } from '@/stores/nutritionStore';
import { useUserStore } from '@/stores/userStore';
import { useWellnessStore } from '@/stores/wellnessStore';
import { useWorkoutStore } from '@/stores/workoutStore';

export default function AIInsightDetailScreen() {
  const colors = useColors();
  const params = useLocalSearchParams<{ kind?: string }>();
  const kind = ((params.kind as InsightKind) || 'daily') as InsightKind;
  const date = isoDate();
  const insight = useAIInsightStore((s) => s.insights[insightKey(date, kind)]);
  const profile = useUserStore((s) => s.profile);
  const health = useHealthStore((s) => s.snapshot);
  const meals = useNutritionStore((s) => s.meals);
  const workouts = useWorkoutStore((s) => s.workouts);
  const checkIns = useWellnessStore((s) => s.checkIns);
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [reply, setReply] = useState<CoachMessage | null>(null);

  const context = useMemo(() => summarizeForAI({
    profile,
    health,
    meals,
    workouts,
    checkIn: checkIns[date] ?? null,
  }), [checkIns, date, health, meals, profile, workouts]);

  const ask = async () => {
    setLoading(true);
    const answer = await generateCoachMessage(question || `Explain my ${kind} insight`, context);
    setReply(answer);
    setLoading(false);
  };

  return (
    <Screen>
      <View style={styles.header}>
        <Text variant="label" color="muted">Velo intelligence</Text>
        <Text variant="display" weight="bold">{insight?.title ?? 'Insight detail'}</Text>
      </View>

      <Card style={styles.stack}>
        <View style={styles.row}>
          <Sparkles size={18} color={insight?.tone === 'red' ? colors.danger : insight?.tone === 'yellow' ? colors.warning : colors.accent} />
          <Text variant="body" weight="semibold">{insight?.summary ?? 'Velo is building this insight from your available data.'}</Text>
        </View>
        <Text variant="body" color="accent">{insight?.action ?? 'Ask a follow-up to go deeper.'}</Text>
      </Card>

      <Card style={styles.stack}>
        <Text variant="title" weight="semibold">Why this showed up</Text>
        {(insight?.drivers?.length ? insight.drivers : ['Recovery, activity, nutrition, and sleep signals']).map((driver) => (
          <Text key={driver} variant="small" color="muted">{driver}</Text>
        ))}
      </Card>

      <Card style={styles.stack}>
        <Text variant="title" weight="semibold">Next actions</Text>
        {(insight?.actions?.length ? insight.actions : [insight?.action ?? 'Keep the next choice simple and intentional.']).map((action) => (
          <Text key={action} variant="small" color="accent">{action}</Text>
        ))}
      </Card>

      <Card style={styles.stack}>
        <Text variant="title" weight="semibold">Ask more</Text>
        <View style={[styles.inputWrap, { borderColor: colors.border }]}>
          <TextInput
            value={question}
            onChangeText={setQuestion}
            placeholder="Ask why, what to do next, or how hard to train"
            placeholderTextColor={colors.textDim}
            multiline
            style={[styles.input, { color: colors.text }]}
          />
          <Pressable onPress={ask} style={[styles.send, { backgroundColor: colors.accent }]}>
            {loading ? <ActivityIndicator color="#0a0a0a" /> : <Send size={16} color="#0a0a0a" strokeWidth={2.5} />}
          </Pressable>
        </View>
        {reply ? (
          <View style={{ gap: Spacing.sm }}>
            <Text variant="body" weight="semibold">{reply.title}</Text>
            <Text variant="small" color="muted">{reply.answer}</Text>
          </View>
        ) : null}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { marginTop: Spacing.lg, marginBottom: Spacing.xl, gap: Spacing.xs },
  stack: { gap: Spacing.md, marginBottom: Spacing.md },
  row: { flexDirection: 'row', gap: Spacing.sm, alignItems: 'flex-start' },
  inputWrap: { borderWidth: 1, borderRadius: Radius.lg, padding: Spacing.sm, gap: Spacing.sm },
  input: { minHeight: 72, fontSize: 15, textAlignVertical: 'top' },
  send: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', alignSelf: 'flex-end' },
});
