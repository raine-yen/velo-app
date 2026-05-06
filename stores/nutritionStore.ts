import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { isToday, uid } from '@/lib/date';
import { FoodItem, Meal, MealType } from '@/types';

type NutritionState = {
  meals: Meal[];
  // actions
  logMeal: (mealType: MealType, foods: { food: FoodItem; servings: number }[]) => void;
  removeMeal: (id: string) => void;
  // selectors
  todayMeals: () => Meal[];
  todayTotals: () => { calories: number; protein: number; carbs: number; fat: number };
};

function totalsForFoods(foods: { food: FoodItem; servings: number }[]) {
  return foods.reduce(
    (acc, { food, servings }) => ({
      calories: acc.calories + food.calories * servings,
      protein: acc.protein + food.protein * servings,
      carbs: acc.carbs + food.carbs * servings,
      fat: acc.fat + food.fat * servings,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 },
  );
}

export const useNutritionStore = create<NutritionState>()(
  persist(
    (set, get) => ({
      meals: [],

      logMeal: (mealType, foods) => {
        const totals = totalsForFoods(foods);
        const meal: Meal = {
          id: uid(),
          mealType,
          foods,
          loggedAt: new Date().toISOString(),
          calories: Math.round(totals.calories),
          protein: Math.round(totals.protein),
          carbs: Math.round(totals.carbs),
          fat: Math.round(totals.fat),
        };
        set((s) => ({ meals: [meal, ...s.meals] }));
      },

      removeMeal: (id) => set((s) => ({ meals: s.meals.filter((m) => m.id !== id) })),

      todayMeals: () => get().meals.filter((m) => isToday(m.loggedAt)),

      todayTotals: () => {
        const meals = get().meals.filter((m) => isToday(m.loggedAt));
        return meals.reduce(
          (acc, m) => ({
            calories: acc.calories + m.calories,
            protein: acc.protein + m.protein,
            carbs: acc.carbs + m.carbs,
            fat: acc.fat + m.fat,
          }),
          { calories: 0, protein: 0, carbs: 0, fat: 0 },
        );
      },
    }),
    {
      name: 'velo-nutrition',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
