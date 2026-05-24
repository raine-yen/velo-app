import { useEffect } from 'react';
import { AppState, Platform } from 'react-native';
import { isoDate } from '@/lib/date';
import { isHealthKitAvailable, requestHealthKitPermissions, fetchRecentWorkouts, fetchDailySnapshot } from '@/lib/healthKit';
import { useHealthStore, DailyHealthSnapshot } from '@/stores/healthStore';
import { useWorkoutStore } from '@/stores/workoutStore';

// Simulates a realistic athlete's daily snapshot for Expo Go / non-iOS
function buildMockSnapshot(): DailyHealthSnapshot {
  const seed = new Date().getDate(); // changes each day so it feels fresh
  return {
    date: isoDate(),
    syncedAt: new Date().toISOString(),
    sleepHours: 6.5 + (seed % 3) * 0.5,          // 6.5 – 7.5 hrs
    restingHR: 52 + (seed % 8),                    // 52 – 59 bpm
    avgHRV: 58 + (seed % 20),                      // 58 – 77 ms
    steps: 4800 + (seed % 5) * 800,                // 4800 – 8000
    vo2Max: 52.4,
    weightKg: 74.2,
  };
}

export function useHealthSync() {
  const setSnapshot = useHealthStore((s) => s.setSnapshot);
  const setSyncing = useHealthStore((s) => s.setSyncing);
  const setSyncError = useHealthStore((s) => s.setSyncError);
  const snapshot = useHealthStore((s) => s.snapshot);
  const logWorkout = useWorkoutStore((s) => s.logWorkout);
  const workouts = useWorkoutStore((s) => s.workouts);

  const sync = async () => {
    // Mock mode: HealthKit unavailable (Expo Go, Android, simulator)
    if (!isHealthKitAvailable()) {
      if (snapshot?.date !== isoDate()) {
        setSnapshot(buildMockSnapshot());
      }
      return;
    }

    // Only sync once per day for the snapshot
    if (snapshot?.date === isoDate()) {
      await syncWorkouts();
      return;
    }

    setSyncing(true);
    setSyncError(null);
    try {
      const granted = await requestHealthKitPermissions();
      if (!granted) return;
      const [snap] = await Promise.all([fetchDailySnapshot(), syncWorkouts()]);
      setSnapshot(snap);
    } catch (e: any) {
      setSyncError(e?.message ?? 'Health sync failed');
    } finally {
      setSyncing(false);
    }
  };

  const syncWorkouts = async () => {
    const existingAppleIds = new Set(
      workouts.filter((w) => w.source === 'apple_health').map((w) => (w as any).appleId)
    );
    const fresh = await fetchRecentWorkouts(14);
    const newOnes = fresh.filter((w) => !existingAppleIds.has(w.appleId));
    for (const w of newOnes) {
      logWorkout({
        type: w.type,
        name: w.name,
        durationMin: w.durationMin,
        distanceKm: w.distanceKm,
        intensity: w.intensity,
        source: 'apple_health',
        healthData: w.healthData,
        appleId: w.appleId,
      } as any);
    }
  };

  useEffect(() => {
    sync();

    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') sync();
    });
    return () => sub.remove();
  }, []);
}
