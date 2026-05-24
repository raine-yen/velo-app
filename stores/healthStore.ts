import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type DailyHealthSnapshot = {
  date: string; // ISO date YYYY-MM-DD
  syncedAt: string; // ISO timestamp
  // Sleep
  sleepHours?: number;
  // Heart
  restingHR?: number;
  avgHRV?: number; // SDNN ms
  // Activity
  steps?: number;
  activeCalories?: number;
  // Fitness
  vo2Max?: number;
  // Body
  weightKg?: number;
};

type HealthState = {
  snapshot: DailyHealthSnapshot | null;
  syncing: boolean;
  lastSyncError: string | null;
  setSnapshot: (s: DailyHealthSnapshot) => void;
  setSyncing: (v: boolean) => void;
  setSyncError: (e: string | null) => void;
};

export const useHealthStore = create<HealthState>()(
  persist(
    (set) => ({
      snapshot: null,
      syncing: false,
      lastSyncError: null,
      setSnapshot: (snapshot) => set({ snapshot }),
      setSyncing: (syncing) => set({ syncing }),
      setSyncError: (lastSyncError) => set({ lastSyncError }),
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

// Simple stress estimate (inverse of recovery)
export function computeStressLevel(snap: DailyHealthSnapshot | null): 'low' | 'moderate' | 'high' | null {
  const score = computeRecoveryScore(snap);
  if (score === null) return null;
  if (score >= 70) return 'low';
  if (score >= 50) return 'moderate';
  return 'high';
}
