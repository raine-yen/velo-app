import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { isToday, uid } from '@/lib/date';
import { deleteMealRemote, pushMeal } from '@/lib/sync';
import { supabase } from '@/lib/supabase';
import { FoodItem, Meal, MealType } from '@/types';

type NutritionState = {
  meals: Meal[];
  logMeal: (mealType: MealType, foods: { food: FoodItem; servings: number }[]) => void;
  editMeal: (id: string, mealType: MealType, foods: { food: FoodItem; servings: number }[]) => void;
  removeMeal: (id: string) => void;
  setMeals: (meals: Meal[]) => void;
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
    (set) => ({
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
        supabase.auth.getSession().then(({ data }) => {
          if (data.session?.user) pushMeal(data.session.user.id, meal);
        });
      },

      editMeal: (id, mealType, foods) => {
        const totals = totalsForFoods(foods);
        const updated: Partial<Meal> = { mealType, foods, calories: Math.round(totals.calories), protein: Math.round(totals.protein), carbs: Math.round(totals.carbs), fat: Math.round(totals.fat) };
        set((s) => ({ meals: s.meals.map((m) => m.id === id ? { ...m, ...updated } : m) }));
        supabase.auth.getSession().then(({ data }) => {
          if (data.session?.user) {
            const meal = useNutritionStore.getState().meals.find((m) => m.id === id);
            if (meal) pushMeal(data.session.user.id, meal);
          }
        });
      },

      removeMeal: (id) => {
        set((s) => ({ meals: s.meals.filter((m) => m.id !== id) }));
        deleteMealRemote(id);
      },

      setMeals: (meals) => set({ meals }),
    }),
    {
      name: 'velo-nutrition',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

// Pure helpers — call from useMemo with raw `meals` array.
export function getTodayMeals(meals: Meal[]): Meal[] {
  return meals.filter((m) => isToday(m.loggedAt));
}

export function getTodayTotals(meals: Meal[]) {
  return getTodayMeals(meals).reduce(
    (acc, m) => ({
      calories: acc.calories + m.calories,
      protein: acc.protein + m.protein,
      carbs: acc.carbs + m.carbs,
      fat: acc.fat + m.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 },
  );
}
