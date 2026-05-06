import { useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { X } from 'lucide-react-native';

import { Button } from '@/components/velo/Button';
import { Card } from '@/components/velo/Card';
import { NumberStepper } from '@/components/velo/NumberStepper';
import { Text } from '@/components/velo/Text';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useWellnessStore } from '@/stores/wellnessStore';

const SCALE_LABELS_ENERGY = ['Drained', 'Low', 'OK', 'Good', 'Peak'];
const SCALE_LABELS_SORENESS = ['None', 'Mild', 'Some', 'Tight', 'Very sore'];
const SCALE_LABELS_MOOD = ['Off', 'Meh', 'Steady', 'Good', 'Locked in'];

export default function WellnessModal() {
  const router = useRouter();
  const logCheckIn = useWellnessStore((s) => s.logCheckIn);
  const existing = useWellnessStore((s) => s.todayCheckIn());

  const [sleepHours, setSleepHours] = useState(existing?.sleepHours ?? 7);
  const [energy, setEnergy] = useState(existing?.energy ?? 3);
  const [soreness, setSoreness] = useState(existing?.soreness ?? 2);
  const [mood, setMood] = useState(existing?.mood ?? 3);

  const save = () => {
    logCheckIn({ sleepHours, energy, soreness, mood });
    router.back();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable hitSlop={12} onPress={() => router.back()}>
          <X size={24} color={Colors.dark.text} strokeWidth={2} />
        </Pressable>
        <Text variant="title" weight="semibold">
          Morning check-in
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.body}
        contentContainerStyle={styles.bodyContent}>
        <Text variant="bodyLg" color="muted" style={{ marginBottom: Spacing.xl }}>
          A 30-second check tells Velo how to set your day's plan.
        </Text>

        <Card>
          <NumberStepper
            label="Sleep"
            value={sleepHours}
            onChange={setSleepHours}
            min={0}
            max={12}
            suffix="hrs"
          />
        </Card>

        <Scale
          title="Energy"
          value={energy}
          onChange={setEnergy}
          labels={SCALE_LABELS_ENERGY}
        />
        <Scale
          title="Soreness"
          value={soreness}
          onChange={setSoreness}
          labels={SCALE_LABELS_SORENESS}
        />
        <Scale
          title="Mood"
          value={mood}
          onChange={setMood}
          labels={SCALE_LABELS_MOOD}
        />
      </ScrollView>

      <View style={styles.footer}>
        <Button label="Save check-in" onPress={save} fullWidth />
      </View>
    </SafeAreaView>
  );
}

function Scale({
  title,
  value,
  onChange,
  labels,
}: {
  title: string;
  value: number;
  onChange: (n: number) => void;
  labels: string[];
}) {
  return (
    <View style={{ marginTop: Spacing.lg }}>
      <View style={styles.scaleHeader}>
        <Text variant="label" color="muted">
          {title}
        </Text>
        <Text variant="small" color="dim">
          {labels[value - 1]}
        </Text>
      </View>
      <View style={styles.scaleRow}>
        {[1, 2, 3, 4, 5].map((n) => (
          <Pressable
            key={n}
            onPress={() => onChange(n)}
            style={({ pressed }) => [
              styles.scaleBtn,
              value >= n && styles.scaleBtnActive,
              pressed && { opacity: 0.7 },
            ]}>
            <Text
              variant="body"
              weight="semibold"
              style={{ color: value >= n ? '#0a0a0a' : Colors.dark.textMuted }}>
              {n}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  body: {
    flex: 1,
  },
  bodyContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  scaleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  scaleRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  scaleBtn: {
    flex: 1,
    height: 56,
    borderRadius: Radius.lg,
    backgroundColor: Colors.dark.surface,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scaleBtnActive: {
    backgroundColor: Colors.dark.accent,
    borderColor: Colors.dark.accent,
  },
  footer: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.dark.borderMuted,
  },
});
