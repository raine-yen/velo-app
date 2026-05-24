import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { isoDate } from '@/lib/date';
import { pushCheckIn } from '@/lib/sync';
import { supabase } from '@/lib/supabase';
import { WellnessCheckIn } from '@/types';

export type AthleteStatus = 'healthy' | 'sore' | 'injured';
export type AthleteStatusEntry = { date: string; status: AthleteStatus; note: string };

type WellnessState = {
  checkIns: Record<string, WellnessCheckIn>;
  statusLog: Record<string, AthleteStatusEntry>; // keyed by date
  logCheckIn: (data: { sleepHours: number; energy: number; soreness: number; mood: number }) => void;
  logStatus: (status: AthleteStatus, note: string) => void;
  setCheckIns: (checkIns: Record<string, WellnessCheckIn>) => void;
};

export const useWellnessStore = create<WellnessState>()(
  persist(
    (set) => ({
      checkIns: {},
      statusLog: {},

      logStatus: (status, note) => {
        const date = isoDate();
        set((s) => ({ statusLog: { ...s.statusLog, [date]: { date, status, note } } }));
      },

      logCheckIn: ({ sleepHours, energy, soreness, mood }) => {
        const date = isoDate();
        const c: WellnessCheckIn = {
          date, sleepHours, energy, soreness, mood,
          loggedAt: new Date().toISOString(),
        };
        set((s) => ({ checkIns: { ...s.checkIns, [date]: c } }));
        supabase.auth.getSession().then(({ data }) => {
          if (data.session?.user) pushCheckIn(data.session.user.id, c);
        });
      },

      setCheckIns: (checkIns) => set({ checkIns }),
    }),
    { name: 'velo-wellness', storage: createJSONStorage(() => AsyncStorage) },
  ),
);

export function computeReadiness(c: WellnessCheckIn | null): number {
  if (!c) return 60;
  const sleepScore = Math.min(100, (c.sleepHours / 8) * 100);
  const energyScore = (c.energy / 5) * 100;
  const sorenessScore = ((6 - c.soreness) / 5) * 100;
  const moodScore = (c.mood / 5) * 100;
  return Math.round(sleepScore * 0.4 + energyScore * 0.25 + sorenessScore * 0.2 + moodScore * 0.15);
}
