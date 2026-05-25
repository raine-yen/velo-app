import { useMemo, useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { X, Check, Heart, Settings } from 'lucide-react-native';

import { Button } from '@/components/velo/Button';
import { Card } from '@/components/velo/Card';
import { Text } from '@/components/velo/Text';
import { Spacing } from '@/constants/theme';
import { useColors } from '@/hooks/useColors';
import { useHealthKitSync } from '@/hooks/useHealthKitSync';
import { getHealthKitSettingsGuidance, HealthKitWorkout } from '@/lib/healthKit';
import { WORKOUT_LABEL } from '@/lib/constants';
import { useHealthStore } from '@/stores/healthStore';
import { useWorkoutStore } from '@/stores/workoutStore';

function formatPace(minPerKm?: number) {
  if (!minPerKm) return null;
  const m = Math.floor(minPerKm);
  const s = Math.round((minPerKm - m) * 60);
  return `${m}:${s.toString().padStart(2, '0')}/km`;
}

function formatTime(value: string | null) {
  if (!value) return 'Never';
  return new Date(value).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default function HealthImportScreen() {
  const router = useRouter();
  const colors = useColors();
  const workouts = useWorkoutStore((s) => s.workouts);
  const logWorkout = useWorkoutStore((s) => s.logWorkout);
  const syncing = useHealthStore((s) => s.syncing);
  const lastSyncError = useHealthStore((s) => s.lastSyncError);
  const { diagnostics, syncNow } = useHealthKitSync();

  const [results, setResults] = useState<HealthKitWorkout[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [hasRequested, setHasRequested] = useState(diagnostics.permissionRequested);
  const [importing, setImporting] = useState(false);

  const statusText = useMemo(() => {
    if (!diagnostics.nativeAvailable) return diagnostics.statusMessage ?? 'Apple Health is unavailable in this build.';
    if (!hasRequested && !diagnostics.permissionRequested) return 'Ready to ask iOS for Health access.';
    if (diagnostics.permissionGrantedOrUnknown) return 'Connected or previously authorized.';
    if (diagnostics.lastError) return diagnostics.lastError;
    return diagnostics.statusMessage ?? 'Permission has not been granted yet.';
  }, [diagnostics, hasRequested]);

  const connectAndLoad = async () => {
    setHasRequested(true);
    const result = await syncNow({ requestPermissions: true, importWorkouts: false, days: 30 });
    const existingAppleIds = new Set(
      workouts
        .filter((w) => w.source === 'apple_health')
        .map((w) => (w as any).appleId)
        .filter(Boolean),
    );
    const fresh = result.workouts.filter((w) => !existingAppleIds.has(w.appleId));
    setResults(fresh);
    setSelected(new Set(fresh.map((w) => w.appleId)));
  };

  const toggleAll = () => {
    setSelected((prev) => (
      prev.size === results.length ? new Set() : new Set(results.map((w) => w.appleId))
    ));
  };

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
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
        completedAt: w.completedAt,
      } as any);
    }
    setImporting(false);
    router.back();
  };

  const showConnect = diagnostics.nativeAvailable && !diagnostics.permissionGrantedOrUnknown && results.length === 0;
  const showSettingsGuidance = hasRequested && !syncing && !diagnostics.permissionGrantedOrUnknown;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable hitSlop={12} onPress={() => router.back()}>
          <X size={24} color={colors.text} strokeWidth={2} />
        </Pressable>
        <Text variant="title" weight="semibold">Apple Health</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.connectionCard}>
          <View style={[styles.iconCircle, { backgroundColor: colors.surfaceElevated }]}>
            <Heart size={28} color={colors.accent} strokeWidth={2} />
          </View>
          <Text variant="title" weight="semibold" style={{ marginTop: Spacing.md }}>
            Connect Apple Health
          </Text>
          <Text variant="body" color="muted" style={styles.centerText}>
            Import workouts, sleep, HRV, resting heart rate, steps, VO2 max, and weight from your iPhone.
          </Text>

          {syncing ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator color={colors.accent} />
              <Text variant="body" color="muted">Reading Health data...</Text>
            </View>
          ) : !diagnostics.nativeAvailable ? (
            <Text variant="small" color="muted" style={styles.centerText}>
              Use the installed iOS development build on your iPhone to connect real Health data.
            </Text>
          ) : showConnect ? (
            <Button
              label="Connect Apple Health"
              onPress={connectAndLoad}
              fullWidth
              icon={<Heart size={16} color="#0a0a0a" strokeWidth={2.5} />}
              style={{ marginTop: Spacing.lg }}
            />
          ) : (
            <Button
              label={diagnostics.permissionGrantedOrUnknown ? 'Refresh Health Data' : 'Try Connect Again'}
              onPress={connectAndLoad}
              variant={diagnostics.permissionGrantedOrUnknown ? 'secondary' : 'primary'}
              fullWidth
              style={{ marginTop: Spacing.lg }}
            />
          )}

          <Text variant="small" color="dim" style={styles.centerText}>
            {statusText}
          </Text>
        </Card>

        {showSettingsGuidance ? (
          <Card style={styles.noticeCard}>
            <View style={styles.noticeHeader}>
              <Settings size={18} color={colors.accent} strokeWidth={2} />
              <Text variant="body" weight="semibold">Permission help</Text>
            </View>
            <Text variant="small" color="muted" style={{ marginTop: Spacing.sm }}>
              {getHealthKitSettingsGuidance()}
            </Text>
          </Card>
        ) : null}

        {lastSyncError ? (
          <Card style={styles.noticeCard}>
            <Text variant="body" weight="semibold">Health diagnostic</Text>
            <Text variant="small" color="muted" style={{ marginTop: Spacing.sm }}>{lastSyncError}</Text>
          </Card>
        ) : null}

        {results.length > 0 ? (
          <>
            <View style={styles.subheader}>
              <Text variant="body" color="muted">
                {results.length} new workout{results.length !== 1 ? 's' : ''} found
              </Text>
              <Pressable onPress={toggleAll} hitSlop={8}>
                <Text variant="body" color="accent" weight="semibold">
                  {selected.size === results.length ? 'Deselect all' : 'Select all'}
                </Text>
              </Pressable>
            </View>

            <View style={styles.list}>
              {results.map((w) => {
                const isOn = selected.has(w.appleId);
                const date = new Date(w.completedAt).toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                });
                const pace = formatPace(w.healthData?.avgPaceMinPerKm);
                return (
                  <Pressable key={w.appleId} onPress={() => toggle(w.appleId)}>
                    <Card style={[
                      styles.workoutCard,
                      isOn && { borderColor: colors.accent, borderWidth: 1.5 },
                    ]}>
                      <View style={{ flex: 1 }}>
                        <View style={styles.cardTop}>
                          <Text variant="body" weight="semibold">{w.name}</Text>
                          <Text variant="small" color="dim">{date}</Text>
                        </View>
                        <Text variant="small" color="muted" style={{ marginTop: 2 }}>
                          {WORKOUT_LABEL[w.type]} - {w.durationMin} min
                          {w.distanceKm ? ` - ${w.distanceKm.toFixed(1)} km` : ''}
                          {pace ? ` - ${pace}` : ''}
                          {w.healthData?.avgHeartRate ? ` - ${w.healthData.avgHeartRate} bpm avg` : ''}
                          {w.healthData?.caloriesBurned ? ` - ${w.healthData.caloriesBurned} kcal` : ''}
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
            </View>

            <Button
              label={importing ? 'Importing...' : selected.size === 0 ? 'Select workouts' : `Import ${selected.size} workout${selected.size !== 1 ? 's' : ''}`}
              onPress={importSelected}
              fullWidth
              style={importing || selected.size === 0 ? { opacity: 0.5 } : undefined}
            />
          </>
        ) : diagnostics.permissionGrantedOrUnknown && !syncing ? (
          <Card>
            <Text variant="body" weight="semibold">No new workouts found</Text>
            <Text variant="small" color="muted" style={{ marginTop: Spacing.sm }}>
              Velo could read Health, but there were no new workouts from the last 30 days to import.
            </Text>
          </Card>
        ) : null}

        <Card style={styles.diagnosticCard}>
          <Text variant="label" color="muted">Diagnostics</Text>
          <DiagnosticRow label="Native module" value={diagnostics.nativeModuleLoaded ? 'Loaded' : 'Missing'} />
          <DiagnosticRow label="Permission API" value={diagnostics.permissionApiLoaded ? 'Loaded' : 'Missing'} />
          <DiagnosticRow label="Permission" value={diagnostics.permissionGrantedOrUnknown ? 'Connected' : diagnostics.permissionRequested ? 'Requested' : 'Not requested'} />
          <DiagnosticRow label="Last sync" value={formatTime(diagnostics.lastSyncAt)} />
          <DiagnosticRow label="Imported" value={`${diagnostics.lastImportCount} workout${diagnostics.lastImportCount !== 1 ? 's' : ''}`} />
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

function DiagnosticRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.diagnosticRow}>
      <Text variant="small" color="muted">{label}</Text>
      <Text variant="small" weight="semibold">{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md },
  content: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xl, gap: Spacing.md },
  connectionCard: { alignItems: 'center' },
  iconCircle: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  centerText: { marginTop: Spacing.sm, textAlign: 'center' },
  loadingRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginTop: Spacing.lg },
  noticeCard: { borderWidth: 1 },
  noticeHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  subheader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: Spacing.sm },
  list: { gap: Spacing.sm },
  workoutCard: { borderWidth: 1, borderColor: 'transparent', flexDirection: 'row', alignItems: 'center' },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: Spacing.sm },
  checkbox: { width: 24, height: 24, borderRadius: 6, borderWidth: 2, alignItems: 'center', justifyContent: 'center', marginLeft: Spacing.sm },
  diagnosticCard: { gap: Spacing.sm },
  diagnosticRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: Spacing.md },
});
