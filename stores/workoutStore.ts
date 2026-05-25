import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { isThisWeek, isToday, uid } from '@/lib/date';
import { deleteWorkoutRemote, pushWorkout } from '@/lib/sync';
import { supabase } from '@/lib/supabase';
import { Workout, WorkoutType } from '@/types';

type WorkoutState = {
  workouts: Workout[];
  lastHealthSync: string | null; // ISO timestamp
  setLastHealthSync: (ts: string) => void;
  logWorkout: (data: {
    type: WorkoutType;
    name: string;
    durationMin: number;
    distanceKm?: number;
    intensity: number;
    notes?: string;
    source?: import('@/types').WorkoutSource;
    healthData?: import('@/types').WorkoutHealthData;
    appleId?: string;
    stravaId?: string;
    completedAt?: string;
  }) => void;
  editWorkout: (id: string, data: Partial<Omit<Workout, 'id' | 'completedAt'>>) => void;
  toggleWorkoutPrivate: (id: string) => void;
  removeWorkout: (id: string) => void;
  setWorkouts: (workouts: Workout[]) => void;
};

export const useWorkoutStore = create<WorkoutState>()(
  persist(
    (set, get) => ({
      workouts: [],
      lastHealthSync: null,
      setLastHealthSync: (ts) => set({ lastHealthSync: ts }),

      logWorkout: (data) => {
        const workout: Workout = { id: uid(), ...data, completedAt: data.completedAt ?? new Date().toISOString() };
        const existing = get().workouts;
        if (workout.appleId && existing.some((w) => w.appleId === workout.appleId)) return;
        if (workout.stravaId && existing.some((w) => w.stravaId === workout.stravaId)) return;
        set((s) => {
          return { workouts: [workout, ...s.workouts] };
        });
        supabase.auth.getSession().then(({ data: d }) => {
          if (d.session?.user) pushWorkout(d.session.user.id, workout);
        });
      },

      editWorkout: (id, data) => {
        set((s) => ({ workouts: s.workouts.map((w) => w.id === id ? { ...w, ...data } : w) }));
        supabase.auth.getSession().then(({ data: d }) => {
          if (d.session?.user) {
            const updated = useWorkoutStore.getState().workouts.find((w) => w.id === id);
            if (updated) pushWorkout(d.session.user.id, updated);
          }
        });
      },

      toggleWorkoutPrivate: (id) => {
        set((s) => ({ workouts: s.workouts.map((w) => w.id === id ? { ...w, private: !w.private } : w) }));
        supabase.auth.getSession().then(({ data: d }) => {
          if (d.session?.user) {
            const updated = useWorkoutStore.getState().workouts.find((w) => w.id === id);
            if (updated) pushWorkout(d.session.user.id, updated);
          }
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

// Pure helpers - call from useMemo with raw `workouts` array.
export function getTodayWorkouts(workouts: Workout[]): Workout[] {
  return workouts.filter((w) => isToday(w.completedAt));
}

export function getWeekWorkouts(workouts: Workout[]): Workout[] {
  return workouts.filter((w) => isThisWeek(w.completedAt));
}

export function getWeekActiveMin(workouts: Workout[]): number {
  return getWeekWorkouts(workouts).reduce((acc, w) => acc + w.durationMin, 0);
}
