import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type DailyHealthSnapshot = {
  date: string; // ISO date YYYY-MM-DD
  syncedAt: string; // ISO timestamp
  // Sleep
  sleepHours?: number;
  sleepStages?: {
    remMin: number;
    coreMin: number;
    deepMin: number;
    asleepMin: number;
  };
  sleepAwakeMinutes?: number;
  // Heart
  restingHR?: number;
  avgHRV?: number; // SDNN ms
  // Activity
  steps?: number;
  activeMinutes?: number;
  activeCalories?: number;
  basalCalories?: number;
  // Fitness
  vo2Max?: number;
  // Body
  weightKg?: number;
};

export type HealthPermissionStatus = 'unknown' | 'unavailable' | 'ready' | 'granted' | 'error' | 'mock';

export type HealthDiagnostics = {
  nativeAvailable: boolean;
  nativeModuleLoaded: boolean;
  permissionApiLoaded: boolean;
  permissionRequested: boolean;
  permissionGrantedOrUnknown: boolean;
  status: HealthPermissionStatus;
  statusMessage: string | null;
  lastError: string | null;
  lastSyncAt: string | null;
  lastImportCount: number;
  mockMode: boolean;
};

type HealthState = {
  snapshot: DailyHealthSnapshot | null;
  syncing: boolean;
  lastSyncError: string | null;
  diagnostics: HealthDiagnostics;
  setSnapshot: (s: DailyHealthSnapshot) => void;
  setSyncing: (v: boolean) => void;
  setSyncError: (e: string | null) => void;
  setDiagnostics: (patch: Partial<HealthDiagnostics>) => void;
};

const initialDiagnostics: HealthDiagnostics = {
  nativeAvailable: false,
  nativeModuleLoaded: false,
  permissionApiLoaded: false,
  permissionRequested: false,
  permissionGrantedOrUnknown: false,
  status: 'unknown',
  statusMessage: null,
  lastError: null,
  lastSyncAt: null,
  lastImportCount: 0,
  mockMode: false,
};

export const useHealthStore = create<HealthState>()(
  persist(
    (set) => ({
      snapshot: null,
      syncing: false,
      lastSyncError: null,
      diagnostics: initialDiagnostics,
      setSnapshot: (snapshot) => set({ snapshot }),
      setSyncing: (syncing) => set({ syncing }),
      setSyncError: (lastSyncError) => set({ lastSyncError }),
      setDiagnostics: (patch) => set((state) => ({
        diagnostics: { ...state.diagnostics, ...patch },
      })),
    }),
    { name: 'velo-health', storage: createJSONStorage(() => AsyncStorage) },
  ),
);

// Recovery score from HRV + resting HR (0-100)
export function computeRecoveryScore(snap: DailyHealthSnapshot | null): number | null {
  if (!snap) return null;
  const parts: number[] = [];

  if (snap.avgHRV !== undefined) {
    // HRV: 20ms = poor (30), 80ms = excellent (100)
    const hrvScore = Math.min(100, Math.max(30, ((snap.avgHRV - 20) / 60) * 70 + 30));
    parts.push(hrvScore);
  }
  if (snap.restingHR !== undefined) {
    // Resting HR: 80+ = poor (30), 40 = excellent (100)
    const hrScore = Math.min(100, Math.max(30, ((80 - snap.restingHR) / 40) * 70 + 30));
    parts.push(hrScore);
  }
  if (snap.sleepHours !== undefined) {
    const sleepScore = Math.min(100, (snap.sleepHours / 8) * 100);
    parts.push(sleepScore);
  }

  if (parts.length === 0) return null;
  return Math.round(parts.reduce((a, b) => a + b, 0) / parts.length);
}

export function computeStrainScore(snap: DailyHealthSnapshot | null): number {
  if (!snap) return 0;
  const activeScore = Math.min(50, ((snap.activeMinutes ?? 0) / 60) * 35);
  const calorieScore = Math.min(35, ((snap.activeCalories ?? 0) / 600) * 35);
  const stepScore = Math.min(15, ((snap.steps ?? 0) / 10000) * 15);
  return Math.round(activeScore + calorieScore + stepScore);
}

// Simple stress estimate (inverse of recovery)
export function computeStressLevel(snap: DailyHealthSnapshot | null): 'low' | 'moderate' | 'high' | null {
  const score = computeRecoveryScore(snap);
  if (score === null) return null;
  if (score >= 70) return 'low';
  if (score >= 50) return 'moderate';
  return 'high';
}
