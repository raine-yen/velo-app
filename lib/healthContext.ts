import { isoDate, startOfWeek } from '@/lib/date';
import { DailyHealthSnapshot, computeRecoveryScore, computeStrainScore } from '@/stores/healthStore';
import { Meal, UserProfile, WellnessCheckIn, Workout } from '@/types';

export type VeloHealthContext = {
  date: string;
  profile: {
    sport: string | null;
    goal: string | null;
    targets: UserProfile['targets'];
  };
  health: DailyHealthSnapshot | null;
  todayNutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  todayWorkouts: {
    count: number;
    activeWorkoutMinutes: number;
    caloriesBurned: number;
    names: string[];
  };
  weekTraining: {
    sessions: number;
    minutes: number;
    distanceKm: number;
    averageIntensity: number;
  };
  wellness: WellnessCheckIn | null;
  scores: {
    recovery: number | null;
    strain: number;
  };
};

export function summarizeForAI({
  profile,
  health,
  meals,
  workouts,
  checkIn,
}: {
  profile: UserProfile;
  health: DailyHealthSnapshot | null;
  meals: Meal[];
  workouts: Workout[];
  checkIn: WellnessCheckIn | null;
}): VeloHealthContext {
  const today = isoDate();
  const weekStart = startOfWeek();
  const todayMeals = meals.filter((meal) => meal.loggedAt.slice(0, 10) === today);
  const todayWorkouts = workouts.filter((workout) => workout.completedAt.slice(0, 10) === today);
  const weekWorkouts = workouts.filter((workout) => new Date(workout.completedAt) >= weekStart);

  const todayNutrition = todayMeals.reduce(
    (acc, meal) => ({
      calories: acc.calories + meal.calories,
      protein: acc.protein + meal.protein,
      carbs: acc.carbs + meal.carbs,
      fat: acc.fat + meal.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 },
  );

  const weekMinutes = weekWorkouts.reduce((sum, workout) => sum + workout.durationMin, 0);

  return {
    date: today,
    profile: {
      sport: profile.sport,
      goal: profile.goal,
      targets: profile.targets,
    },
    health,
    todayNutrition,
    todayWorkouts: {
      count: todayWorkouts.length,
      activeWorkoutMinutes: todayWorkouts.reduce((sum, workout) => sum + workout.durationMin, 0),
      caloriesBurned: todayWorkouts.reduce((sum, workout) => sum + (workout.healthData?.caloriesBurned ?? 0), 0),
      names: todayWorkouts.slice(0, 4).map((workout) => workout.name),
    },
    weekTraining: {
      sessions: weekWorkouts.length,
      minutes: weekMinutes,
      distanceKm: Math.round(weekWorkouts.reduce((sum, workout) => sum + (workout.distanceKm ?? 0), 0) * 10) / 10,
      averageIntensity: weekWorkouts.length
        ? Math.round((weekWorkouts.reduce((sum, workout) => sum + workout.intensity, 0) / weekWorkouts.length) * 10) / 10
        : 0,
    },
    wellness: checkIn,
    scores: {
      recovery: computeRecoveryScore(health),
      strain: computeStrainScore(health),
    },
  };
}
