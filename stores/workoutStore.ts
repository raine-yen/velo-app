import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { isThisWeek, isToday, uid } from '@/lib/date';
import { deleteWorkoutRemote, pushWorkout } from '@/lib/sync';
import { supabase } from '@/lib/supabase';
import { Workout, WorkoutType } from '@/types';

type WorkoutState = {
  workouts: Workout[];
  logWorkout: (data: {
    type: WorkoutType;
    name: string;
    durationMin: number;
    distanceKm?: number;
    intensity: number;
    notes?: string;
  }) => void;
  removeWorkout: (id: string) => void;
  setWorkouts: (workouts: Workout[]) => void;
};

export const useWorkoutStore = create<WorkoutState>()(
  persist(
    (set) => ({
      workouts: [],

      logWorkout: (data) => {
        const workout: Workout = { id: uid(), ...data, completedAt: new Date().toISOString() };
        set((s) => ({ workouts: [workout, ...s.workouts] }));
        supabase.auth.getSession().then(({ data: d }) => {
          if (d.session?.user) pushWorkout(d.session.user.id, workout);
        });
      },

      removeWorkout: (id) => {
        set((s) => ({ workouts: s.workouts.filter((w) => w.id !== id) }));
        deleteWorkoutRemote(id);
      },

      setWorkouts: (workouts) => set({ workouts }),
    }),
    {
      name: 'velo-workouts',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

// Pure helpers — call from useMemo with raw `workouts` array.
export function getTodayWorkouts(workouts: Workout[]): Workout[] {
  return workouts.filter((w) => isToday(w.completedAt));
}

export function getWeekWorkouts(workouts: Workout[]): Workout[] {
  return workouts.filter((w) => isThisWeek(w.completedAt));
}

export function getWeekActiveMin(workouts: Workout[]): number {
  return getWeekWorkouts(workouts).reduce((acc, w) => acc + w.durationMin, 0);
}
