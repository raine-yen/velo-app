import { useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { isHealthKitAvailable, requestHealthKitPermissions, fetchRecentWorkouts } from '@/lib/healthKit';
import { useWorkoutStore } from '@/stores/workoutStore';
import { useStravaStore } from '@/stores/stravaStore';

const SYNC_COOLDOWN_MS = 5 * 60 * 1000; // don't re-sync within 5 minutes

export function useAutoHealthSync() {
  const workouts = useWorkoutStore((s) => s.workouts);
  const logWorkout = useWorkoutStore((s) => s.logWorkout);
  const lastHealthSync = useWorkoutStore((s) => s.lastHealthSync);
  const setLastHealthSync = useWorkoutStore((s) => s.setLastHealthSync);
  const stravaSync = useStravaStore((s) => s.sync);
  const stravaConnected = useStravaStore((s) => !!s.tokens);
  const [newCount, setNewCount] = useState(0);
  const appState = useRef(AppState.currentState);

  const sync = async () => {
    if (!isHealthKitAvailable()) return;

    // Respect cooldown
    if (lastHealthSync) {
      const elapsed = Date.now() - new Date(lastHealthSync).getTime();
      if (elapsed < SYNC_COOLDOWN_MS) return;
    }

    const granted = await requestHealthKitPermissions();
    if (!granted) return;

    // Fetch from last sync date or last 7 days if first time
    const since = lastHealthSync ? new Date(lastHealthSync) : (() => {
      const d = new Date(); d.setDate(d.getDate() - 7); return d;
    })();

    const existingAppleIds = new Set(
      workouts
        .filter((w) => w.source === 'apple_health')
        .map((w) => (w as any).appleId)
        .filter(Boolean)
    );

    const found = await fetchRecentWorkouts(30);
    const fresh = found.filter(
      (w) =>
        !existingAppleIds.has(w.appleId) &&
        new Date(w.completedAt) >= since
    );

    for (const w of fresh) {
      logWorkout({
        type: w.type,
        name: w.name,
        durationMin: w.durationMin,
        distanceKm: w.distanceKm,
        intensity: w.intensity,
        source: 'apple_health',
        healthData: w.healthData,
        appleId: w.appleId,
        completedAt: w.completedAt,
      } as any);
    }

    setLastHealthSync(new Date().toISOString());

    // Also sync Strava if connected
    let stravaNew = 0;
    if (stravaConnected) stravaNew = await stravaSync();

    if (fresh.length + stravaNew > 0) setNewCount(fresh.length + stravaNew);
  };

  // Sync on mount
  useEffect(() => { sync(); }, []);

  // Sync whenever app comes to foreground
  useEffect(() => {
    const sub = AppState.addEventListener('change', (next: AppStateStatus) => {
      if (appState.current.match(/inactive|background/) && next === 'active') {
        sync();
      }
      appState.current = next;
    });
    return () => sub.remove();
  }, [lastHealthSync, workouts]);

  return { newCount, clearNewCount: () => setNewCount(0) };
}
