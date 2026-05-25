import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { NutritionGoalId } from '@/types';

export const NUTRITION_GOALS: {
  id: NutritionGoalId;
  label: string;
  unit: string;
  defaultTarget: number;
  description: string;
}[] = [
  { id: 'calories', label: 'Calories', unit: 'kcal', defaultTarget: 2400, description: 'Daily energy intake' },
  { id: 'protein', label: 'Protein', unit: 'g', defaultTarget: 150, description: 'Recovery and muscle repair' },
  { id: 'carbs', label: 'Carbs', unit: 'g', defaultTarget: 300, description: 'Training fuel and glycogen' },
  { id: 'fat', label: 'Fat', unit: 'g', defaultTarget: 75, description: 'Hormones and satiety' },
  { id: 'water', label: 'Water', unit: 'oz', defaultTarget: 96, description: 'Hydration target' },
  { id: 'fiber', label: 'Fiber', unit: 'g', defaultTarget: 30, description: 'Digestive health' },
  { id: 'sodium', label: 'Sodium', unit: 'mg', defaultTarget: 2300, description: 'Electrolytes and sweat losses' },
];

type NutritionGoalState = {
  enabled: NutritionGoalId[];
  targets: Record<NutritionGoalId, number>;
  toggleGoal: (id: NutritionGoalId) => void;
  setGoalTarget: (id: NutritionGoalId, target: number) => void;
};

const defaultTargets = NUTRITION_GOALS.reduce((acc, goal) => {
  acc[goal.id] = goal.defaultTarget;
  return acc;
}, {} as Record<NutritionGoalId, number>);

export const useNutritionGoalStore = create<NutritionGoalState>()(
  persist(
    (set) => ({
      enabled: ['calories', 'protein'],
      targets: defaultTargets,
      toggleGoal: (id) => set((state) => {
        const nextEnabled = state.enabled.includes(id)
          ? state.enabled.filter((goal) => goal !== id)
          : [...state.enabled, id];
        return { enabled: nextEnabled.length ? nextEnabled : ['calories'] };
      }),
      setGoalTarget: (id, target) => set((state) => ({
        targets: { ...state.targets, [id]: Math.max(0, Math.round(target)) },
      })),
    }),
    {
      name: 'velo-nutrition-goals',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
