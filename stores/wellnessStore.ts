import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { isoDate } from '@/lib/date';
import { WellnessCheckIn } from '@/types';

type WellnessState = {
  checkIns: Record<string, WellnessCheckIn>; // keyed by YYYY-MM-DD
  logCheckIn: (data: {
    sleepHours: number;
    energy: number;
    soreness: number;
    mood: number;
  }) => void;
  todayCheckIn: () => WellnessCheckIn | null;
  readinessScore: () => number; // 0-100
};

/**
 * Readiness blends sleep, energy, soreness (inverted), and mood.
 * Returns 0-100. Defaults to a neutral 60 if no check-in today.
 */
function computeReadiness(c: WellnessCheckIn | null): number {
  if (!c) return 60;
  const sleepScore = Math.min(100, (c.sleepHours / 8) * 100);
  const energyScore = (c.energy / 5) * 100;
  const sorenessScore = ((6 - c.soreness) / 5) * 100; // less soreness = better
  const moodScore = (c.mood / 5) * 100;
  return Math.round(
    sleepScore * 0.4 + energyScore * 0.25 + sorenessScore * 0.2 + moodScore * 0.15,
  );
}

export const useWellnessStore = create<WellnessState>()(
  persist(
    (set, get) => ({
      checkIns: {},

      logCheckIn: ({ sleepHours, energy, soreness, mood }) => {
        const date = isoDate();
        const c: WellnessCheckIn = {
          date,
          sleepHours,
          energy,
          soreness,
          mood,
          loggedAt: new Date().toISOString(),
        };
        set((s) => ({ checkIns: { ...s.checkIns, [date]: c } }));
      },

      todayCheckIn: () => get().checkIns[isoDate()] ?? null,

      readinessScore: () => computeReadiness(get().checkIns[isoDate()] ?? null),
    }),
    {
      name: 'velo-wellness',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
