import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { calcDailyTargets } from '@/lib/nutrition';
import { DailyTargets, GoalId, SportId, UserProfile } from '@/types';

type UserState = {
  profile: UserProfile;
  _hydrated: boolean;
  _setHydrated: () => void;
  // actions
  setName: (name: string) => void;
  setSport: (sport: SportId) => void;
  setGoal: (goal: GoalId) => void;
  setProfile: (
    p: Partial<Pick<UserProfile, 'gender' | 'age' | 'heightCm' | 'weightKg' | 'units' | 'name'>>,
  ) => void;
  recomputeTargets: () => void;
  finishOnboarding: () => void;
  resetForDev: () => void;
};

const defaultTargets: DailyTargets = {
  calories: 2400,
  protein: 150,
  carbs: 300,
  fat: 75,
};

const defaultProfile: UserProfile = {
  name: '',
  sport: null,
  goal: null,
  gender: 'male',
  age: 22,
  heightCm: 175,
  weightKg: 70,
  units: 'imperial',
  targets: defaultTargets,
  onboardedAt: null,
};

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      profile: defaultProfile,
      _hydrated: false,
      _setHydrated: () => set({ _hydrated: true }),

      setName: (name) =>
        set((s) => ({ profile: { ...s.profile, name } })),

      setSport: (sport) => {
        set((s) => ({ profile: { ...s.profile, sport } }));
        get().recomputeTargets();
      },

      setGoal: (goal) => {
        set((s) => ({ profile: { ...s.profile, goal } }));
        get().recomputeTargets();
      },

      setProfile: (p) => {
        set((s) => ({ profile: { ...s.profile, ...p } }));
        get().recomputeTargets();
      },

      recomputeTargets: () => {
        const p = get().profile;
        const targets = calcDailyTargets({
          gender: p.gender,
          weightKg: p.weightKg,
          heightCm: p.heightCm,
          age: p.age,
          sport: p.sport,
          goal: p.goal,
        });
        set((s) => ({ profile: { ...s.profile, targets } }));
      },

      finishOnboarding: () => {
        get().recomputeTargets();
        set((s) => ({
          profile: { ...s.profile, onboardedAt: new Date().toISOString() },
        }));
      },

      resetForDev: () => set({ profile: defaultProfile }),
    }),
    {
      name: 'velo-user',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ profile: state.profile }),
      onRehydrateStorage: () => (state) => {
        state?._setHydrated();
      },
    },
  ),
);
