import { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { X, Check, Heart } from 'lucide-react-native';

import { Button } from '@/components/velo/Button';
import { Card } from '@/components/velo/Card';
import { Text } from '@/components/velo/Text';
import { Spacing } from '@/constants/theme';
import { useColors } from '@/hooks/useColors';
import {
  requestHealthKitPermissions,
  fetchRecentWorkouts,
  HealthKitWorkout,
  isHealthKitAvailable,
  getHealthKitAvailabilityMessage,
} from '@/lib/healthKit';
import { useWorkoutStore } from '@/stores/workoutStore';
import { WORKOUT_LABEL } from '@/lib/constants';

function formatPace(minPerKm?: number) {
  if (!minPerKm) return null;
  const m = Math.floor(minPerKm);
  const s = Math.round((minPerKm - m) * 60);
  return `${m}:${s.toString().padStart(2, '0')}/km`;
}

export default function HealthImportScreen() {
  const router = useRouter();
  const colors = useColors();
  const workouts = useWorkoutStore((s) => s.workouts);
  const logWorkout = useWorkoutStore((s) => s.logWorkout);

  const [available, setAvailable] = useState(isHealthKitAvailable());
  const [availabilityMessage, setAvailabilityMessage] = useState(getHealthKitAvailabilityMessage());
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState<HealthKitWorkout[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    const nextAvailable = isHealthKitAvailable();
    setAvailable(nextAvailable);
    setAvailabilityMessage(getHealthKitAvailabilityMessage());

    if (!nextAvailable) { setLoading(false); return; }
    requestHealthKitPermissions().then((granted) => {
      if (!granted) { setLoading(false); return; }
      fetchRecentWorkouts(30).then((data) => {
        const existingAppleIds = new Set(workouts.filter((w) => w.source === 'apple_health').map((w) => (w as any).appleId));
        // Filter out already imported
        const fresh = data.filter((w) => !existingAppleIds.has(w.appleId));
        setResults(fresh);
        setSelected(new Set(fresh.map((w) => w.appleId)));
        setLoading(false);
      });
    });
  }, [workouts]);

  const toggleAll = () => {
    if (selected.size === results.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(results.map((w) => w.appleId)));
    }
  };

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const importSelected = async () => {
    setImporting(true);
    const toImport = results.filter((w) => selected.has(w.appleId));
    for (const w of toImport) {
      logWorkout({
        type: w.type,
        name: w.name,
        durationMin: w.durationMin,
        distanceKm: w.distanceKm,
        intensity: w.intensity,
        notes: w.notes,
        source: 'apple_health',
        healthData: w.healthData,
        appleId: w.appleId,
      } as any);
    }
    setImporting(false);
    router.back();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable hitSlop={12} onPress={() => router.back()}><X size={24} color={colors.text} strokeWidth={2} /></Pressable>
        <Text variant="title" weight="semibold">Apple Health</Text>
        <View style={{ width: 24 }} />
      </View>

      {!available ? (
        <View style={styles.centered}>
          <Heart size={40} color={colors.textMuted} strokeWidth={1.5} />
          <Text variant="title" weight="semibold" style={{ marginTop: Spacing.lg }}>Apple Health unavailable</Text>
          <Text variant="body" color="muted" style={{ marginTop: Spacing.sm, textAlign: 'center' }}>
            {availabilityMessage ?? 'Apple Health is not available right now.'}
          </Text>
        </View>
      ) : loading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.accent} size="large" />
          <Text variant="body" color="muted" style={{ marginTop: Spacing.md }}>Reading workouts…</Text>
        </View>
      ) : results.length === 0 ? (
        <View style={styles.centered}>
          <Heart size={40} color={colors.textMuted} strokeWidth={1.5} />
          <Text variant="title" weight="semibold" style={{ marginTop: Spacing.lg }}>All caught up</Text>
          <Text variant="body" color="muted" style={{ marginTop: Spacing.sm, textAlign: 'center' }}>
            No new workouts from the last 30 days to import.
          </Text>
        </View>
      ) : (
        <>
          <View style={styles.subheader}>
            <Text variant="body" color="muted">{results.length} new workout{results.length !== 1 ? 's' : ''} found</Text>
            <Pressable onPress={toggleAll} hitSlop={8}>
              <Text variant="body" color="accent" weight="semibold">
                {selected.size === results.length ? 'Deselect all' : 'Select all'}
              </Text>
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={styles.list}>
            {results.map((w) => {
              const isOn = selected.has(w.appleId);
              const workoutCardStyle = isOn
                ? StyleSheet.flatten([styles.workoutCard, { borderColor: colors.accent, borderWidth: 1.5 }])
                : styles.workoutCard;
              const date = new Date(w.completedAt).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
              const pace = formatPace(w.healthData?.avgPaceMinPerKm);
              return (
                <Pressable key={w.appleId} onPress={() => toggle(w.appleId)}>
                  <Card style={workoutCardStyle}>
                    <View style={{ flex: 1 }}>
                      <View style={styles.cardTop}>
                        <Text variant="body" weight="semibold">{w.name}</Text>
                        <Text variant="small" color="dim">{date}</Text>
                      </View>
                      <Text variant="small" color="muted" style={{ marginTop: 2 }}>
                        {WORKOUT_LABEL[w.type]} · {w.durationMin} min
                        {w.distanceKm ? ` · ${w.distanceKm.toFixed(1)} km` : ''}
                        {pace ? ` · ${pace}` : ''}
                        {w.healthData?.avgHeartRate ? ` · ${w.healthData.avgHeartRate} bpm avg` : ''}
                        {w.healthData?.caloriesBurned ? ` · ${w.healthData.caloriesBurned} kcal` : ''}
                      </Text>
                    </View>
                    <View style={[styles.checkbox, {
                      borderColor: isOn ? colors.accent : colors.border,
                      backgroundColor: isOn ? colors.accent : 'transparent',
                    }]}>
                      {isOn && <Check size={14} color="#0a0a0a" strokeWidth={3} />}
                    </View>
                  </Card>
                </Pressable>
              );
            })}
          </ScrollView>

          <View style={[styles.footer, { borderTopColor: colors.borderMuted }]}>
            <Button
              label={importing ? 'Importing…' : selected.size === 0 ? 'Select workouts' : `Import ${selected.size} workout${selected.size !== 1 ? 's' : ''}`}
              onPress={importSelected} fullWidth
              style={importing || selected.size === 0 ? { opacity: 0.5 } : undefined}
            />
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md },
  subheader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.lg, paddingBottom: Spacing.md },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: Spacing.xl },
  list: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xl, gap: Spacing.sm },
  workoutCard: { borderWidth: 1, borderColor: 'transparent' },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  checkbox: { width: 24, height: 24, borderRadius: 6, borderWidth: 2, alignItems: 'center', justifyContent: 'center', marginLeft: Spacing.sm },
  footer: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.md, paddingBottom: Spacing.md, borderTopWidth: 1 },
});
