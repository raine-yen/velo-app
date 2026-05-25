import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';

import { isoDate } from '@/lib/date';
import {
  fetchDailySnapshot,
  fetchRecentWorkouts,
  getHealthKitAvailability,
  HealthKitPermissionResult,
  HealthKitWorkout,
  requestHealthKitPermissions,
} from '@/lib/healthKit';
import { DailyHealthSnapshot, useHealthStore } from '@/stores/healthStore';
import { useStravaStore } from '@/stores/stravaStore';
import { useWorkoutStore } from '@/stores/workoutStore';

const SYNC_COOLDOWN_MS = 5 * 60 * 1000;

type SyncOptions = {
  requestPermissions?: boolean;
  importWorkouts?: boolean;
  days?: number;
};

type SyncResult = {
  permission: HealthKitPermissionResult | null;
  snapshot: DailyHealthSnapshot | null;
  workouts: HealthKitWorkout[];
  importedCount: number;
};

type HookOptions = {
  autoSync?: boolean;
};

function buildMockSnapshot(): DailyHealthSnapshot {
  const seed = new Date().getDate();
  return {
    date: isoDate(),
    syncedAt: new Date().toISOString(),
    sleepHours: 6.5 + (seed % 3) * 0.5,
    restingHR: 52 + (seed % 8),
    avgHRV: 58 + (seed % 20),
    steps: 4800 + (seed % 5) * 800,
    activeMinutes: 22 + (seed % 4) * 8,
    activeCalories: 180 + (seed % 5) * 45,
    basalCalories: 1450,
    sleepStages: {
      remMin: 84,
      coreMin: 268,
      deepMin: 72,
      asleepMin: 424,
    },
    sleepAwakeMinutes: 18,
    vo2Max: 52.4,
    weightKg: 74.2,
  };
}

export function useHealthKitSync({ autoSync = false }: HookOptions = {}) {
  const workouts = useWorkoutStore((s) => s.workouts);
  const logWorkout = useWorkoutStore((s) => s.logWorkout);
  const lastHealthSync = useWorkoutStore((s) => s.lastHealthSync);
  const setLastHealthSync = useWorkoutStore((s) => s.setLastHealthSync);
  const setSnapshot = useHealthStore((s) => s.setSnapshot);
  const snapshot = useHealthStore((s) => s.snapshot);
  const setSyncing = useHealthStore((s) => s.setSyncing);
  const setSyncError = useHealthStore((s) => s.setSyncError);
  const diagnostics = useHealthStore((s) => s.diagnostics);
  const setDiagnostics = useHealthStore((s) => s.setDiagnostics);
  const stravaSync = useStravaStore((s) => s.sync);
  const stravaConnected = useStravaStore((s) => !!s.tokens);
  const [newCount, setNewCount] = useState(0);
  const appState = useRef(AppState.currentState);

  const refreshAvailability = useCallback(() => {
    const availability = getHealthKitAvailability();
    setDiagnostics({
      nativeAvailable: availability.available,
      nativeModuleLoaded: availability.nativeModuleLoaded,
      permissionApiLoaded: availability.permissionApiLoaded,
      status: availability.available ? 'ready' : 'unavailable',
      statusMessage: availability.message,
      mockMode: !availability.available,
    });
    return availability;
  }, [setDiagnostics]);

  const importFreshWorkouts = useCallback((found: HealthKitWorkout[], since?: Date) => {
    const existingAppleIds = new Set(
      workouts
        .filter((w) => w.source === 'apple_health')
        .map((w) => (w as any).appleId)
        .filter(Boolean),
    );

    const fresh = found.filter((w) => {
      const isNew = !existingAppleIds.has(w.appleId);
      return isNew && (!since || new Date(w.completedAt) >= since);
    });

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

    return fresh.length;
  }, [logWorkout, workouts]);

  const syncNow = useCallback(async ({
    requestPermissions = false,
    importWorkouts = true,
    days = 30,
  }: SyncOptions = {}): Promise<SyncResult> => {
    const availability = refreshAvailability();

    if (!availability.available) {
      if (!snapshot || snapshot.date !== isoDate()) {
        setSnapshot(buildMockSnapshot());
      }
      return { permission: null, snapshot: null, workouts: [], importedCount: 0 };
    }

    if (!requestPermissions && !diagnostics.permissionGrantedOrUnknown) {
      return { permission: null, snapshot: null, workouts: [], importedCount: 0 };
    }

    setSyncing(true);
    setSyncError(null);

    try {
      let permission: HealthKitPermissionResult | null = null;

      if (requestPermissions) {
        permission = await requestHealthKitPermissions();
        setDiagnostics({
          permissionRequested: permission.requested,
          permissionGrantedOrUnknown: permission.granted,
          status: permission.granted ? 'granted' : permission.status,
          statusMessage: permission.message,
          lastError: permission.granted ? null : permission.message,
          mockMode: false,
        });

        if (!permission.granted) {
          setSyncError(permission.message ?? 'Apple Health permission was not granted.');
          return { permission, snapshot: null, workouts: [], importedCount: 0 };
        }
      }

      const [nextSnapshot, found] = await Promise.all([
        fetchDailySnapshot(),
        fetchRecentWorkouts(days),
      ]);
      setSnapshot(nextSnapshot);

      let importedCount = 0;
      if (importWorkouts) {
        const since = lastHealthSync ? new Date(lastHealthSync) : undefined;
        importedCount = importFreshWorkouts(found, since);
        setLastHealthSync(new Date().toISOString());
      }

      let stravaNew = 0;
      if (importWorkouts && stravaConnected) {
        stravaNew = await stravaSync();
      }

      const totalImported = importedCount + stravaNew;
      if (totalImported > 0) setNewCount(totalImported);

      setDiagnostics({
        permissionGrantedOrUnknown: true,
        status: 'granted',
        statusMessage: found.length === 0 ? 'No Health workouts found in the selected window.' : null,
        lastError: null,
        lastSyncAt: new Date().toISOString(),
        lastImportCount: importedCount,
        mockMode: false,
      });

      return { permission, snapshot: nextSnapshot, workouts: found, importedCount };
    } catch (error: any) {
      const message = error?.message ?? 'Health sync failed.';
      setSyncError(message);
      setDiagnostics({ status: 'error', statusMessage: message, lastError: message });
      return { permission: null, snapshot: null, workouts: [], importedCount: 0 };
    } finally {
      setSyncing(false);
    }
  }, [
    diagnostics.permissionGrantedOrUnknown,
    importFreshWorkouts,
    lastHealthSync,
    refreshAvailability,
    setDiagnostics,
    setLastHealthSync,
    setSnapshot,
    setSyncError,
    setSyncing,
    snapshot,
    stravaConnected,
    stravaSync,
  ]);

  useEffect(() => {
    refreshAvailability();
  }, [refreshAvailability]);

  useEffect(() => {
    if (!autoSync) return undefined;

    const maybeSync = () => {
      if (!diagnostics.permissionGrantedOrUnknown) return;
      if (lastHealthSync) {
        const elapsed = Date.now() - new Date(lastHealthSync).getTime();
        if (elapsed < SYNC_COOLDOWN_MS) return;
      }
      syncNow({ requestPermissions: false, importWorkouts: true });
    };

    maybeSync();
    const sub = AppState.addEventListener('change', (next: AppStateStatus) => {
      if (appState.current.match(/inactive|background/) && next === 'active') {
        maybeSync();
      }
      appState.current = next;
    });

    return () => sub.remove();
  }, [autoSync, diagnostics.permissionGrantedOrUnknown, lastHealthSync, syncNow]);

  return {
    diagnostics,
    newCount,
    clearNewCount: () => setNewCount(0),
    refreshAvailability,
    syncNow,
  };
}
