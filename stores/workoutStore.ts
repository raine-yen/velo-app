import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { isThisWeek, isToday, uid } from '@/lib/date';
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
  todayWorkouts: () => Workout[];
  weekWorkouts: () => Workout[];
  weekActiveMin: () => number;
};

export const useWorkoutStore = create<WorkoutState>()(
  persist(
    (set, get) => ({
      workouts: [],

      logWorkout: (data) => {
        const workout: Workout = {
          id: uid(),
          ...data,
          completedAt: new Date().toISOString(),
        };
        set((s) => ({ workouts: [workout, ...s.workouts] }));
      },

      removeWorkout: (id) =>
        set((s) => ({ workouts: s.workouts.filter((w) => w.id !== id) })),

      todayWorkouts: () => get().workouts.filter((w) => isToday(w.completedAt)),

      weekWorkouts: () => get().workouts.filter((w) => isThisWeek(w.completedAt)),

      weekActiveMin: () =>
        get()
          .workouts.filter((w) => isThisWeek(w.completedAt))
          .reduce((acc, w) => acc + w.durationMin, 0),
    }),
    {
      name: 'velo-workouts',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
