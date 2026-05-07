import { useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useNutritionStore } from '@/stores/nutritionStore';
import { useWorkoutStore } from '@/stores/workoutStore';
import { useWellnessStore } from '@/stores/wellnessStore';
import { useUserStore } from '@/stores/userStore';
import { pullMeals, pullWorkouts, pullCheckIns, pullProfile } from '@/lib/sync';

export function useSync() {
  const user = useAuthStore((s) => s.user);
  const setMeals = useNutritionStore((s) => s.setMeals);
  const setWorkouts = useWorkoutStore((s) => s.setWorkouts);
  const setCheckIns = useWellnessStore((s) => s.setCheckIns);
  const setProfile = useUserStore((s) => s.setProfile);

  useEffect(() => {
    if (!user) return;
    const uid = user.id;

    // Pull all remote data in parallel, update local stores
    Promise.all([
      pullMeals(uid),
      pullWorkouts(uid),
      pullCheckIns(uid),
      pullProfile(uid),
    ]).then(([meals, workouts, checkInsArr, profile]) => {
      if (meals.length) setMeals(meals);
      if (workouts.length) setWorkouts(workouts);
      if (checkInsArr.length) {
        const map: Record<string, (typeof checkInsArr)[0]> = {};
        checkInsArr.forEach((c) => { map[c.date] = c; });
        setCheckIns(map);
      }
      if (profile) setProfile(profile);
    });
  }, [user?.id]);
}
