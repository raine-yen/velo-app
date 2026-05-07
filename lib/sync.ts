/**
 * Supabase sync helpers.
 * Strategy: local AsyncStorage is the source of truth offline.
 * On sign-in, pull remote → merge with local (remote wins on conflict).
 * On every write, also upsert to Supabase (fire-and-forget).
 */

import { supabase } from './supabase';
import { Meal, Workout, WellnessCheckIn } from '@/types';
import { UserProfile } from '@/types';

// ─── Profile ─────────────────────────────────────────────────────────────────

export async function pushProfile(userId: string, p: UserProfile) {
  await supabase.from('profiles').upsert({
    id: userId,
    name: p.name,
    sport: p.sport,
    goal: p.goal,
    gender: p.gender,
    age: p.age,
    height_cm: p.heightCm,
    weight_kg: p.weightKg,
    units: p.units,
    target_calories: p.targets.calories,
    target_protein: p.targets.protein,
    target_carbs: p.targets.carbs,
    target_fat: p.targets.fat,
    onboarded_at: p.onboardedAt,
  });
}

export async function pullProfile(userId: string): Promise<Partial<UserProfile> | null> {
  const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
  if (!data) return null;
  return {
    name: data.name ?? '',
    sport: data.sport,
    goal: data.goal,
    gender: data.gender,
    age: data.age,
    heightCm: data.height_cm,
    weightKg: data.weight_kg,
    units: data.units,
    targets: {
      calories: data.target_calories,
      protein: data.target_protein,
      carbs: data.target_carbs,
      fat: data.target_fat,
    },
    onboardedAt: data.onboarded_at,
  };
}

// ─── Meals ────────────────────────────────────────────────────────────────────

export async function pushMeal(userId: string, meal: Meal) {
  await supabase.from('meals').upsert({
    id: meal.id,
    user_id: userId,
    meal_type: meal.mealType,
    foods: meal.foods,
    calories: meal.calories,
    protein: meal.protein,
    carbs: meal.carbs,
    fat: meal.fat,
    logged_at: meal.loggedAt,
  });
}

export async function deleteMealRemote(mealId: string) {
  await supabase.from('meals').delete().eq('id', mealId);
}

export async function pullMeals(userId: string): Promise<Meal[]> {
  const { data } = await supabase
    .from('meals')
    .select('*')
    .eq('user_id', userId)
    .order('logged_at', { ascending: false })
    .limit(200);
  if (!data) return [];
  return data.map((r) => ({
    id: r.id,
    mealType: r.meal_type,
    foods: r.foods,
    calories: r.calories,
    protein: r.protein,
    carbs: r.carbs,
    fat: r.fat,
    loggedAt: r.logged_at,
  }));
}

// ─── Workouts ─────────────────────────────────────────────────────────────────

export async function pushWorkout(userId: string, workout: Workout) {
  await supabase.from('workouts').upsert({
    id: workout.id,
    user_id: userId,
    type: workout.type,
    name: workout.name,
    duration_min: workout.durationMin,
    distance_km: workout.distanceKm ?? null,
    intensity: workout.intensity,
    notes: workout.notes ?? null,
    completed_at: workout.completedAt,
  });
}

export async function deleteWorkoutRemote(workoutId: string) {
  await supabase.from('workouts').delete().eq('id', workoutId);
}

export async function pullWorkouts(userId: string): Promise<Workout[]> {
  const { data } = await supabase
    .from('workouts')
    .select('*')
    .eq('user_id', userId)
    .order('completed_at', { ascending: false })
    .limit(200);
  if (!data) return [];
  return data.map((r) => ({
    id: r.id,
    type: r.type,
    name: r.name,
    durationMin: r.duration_min,
    distanceKm: r.distance_km ?? undefined,
    intensity: r.intensity,
    notes: r.notes ?? undefined,
    completedAt: r.completed_at,
  }));
}

// ─── Wellness ─────────────────────────────────────────────────────────────────

export async function pushCheckIn(userId: string, c: WellnessCheckIn) {
  await supabase.from('wellness_checkins').upsert({
    user_id: userId,
    date: c.date,
    sleep_hours: c.sleepHours,
    energy: c.energy,
    soreness: c.soreness,
    mood: c.mood,
    logged_at: c.loggedAt,
  }, { onConflict: 'user_id,date' });
}

export async function pullCheckIns(userId: string): Promise<WellnessCheckIn[]> {
  const { data } = await supabase
    .from('wellness_checkins')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false })
    .limit(90);
  if (!data) return [];
  return data.map((r) => ({
    date: r.date,
    sleepHours: r.sleep_hours,
    energy: r.energy,
    soreness: r.soreness,
    mood: r.mood,
    loggedAt: r.logged_at,
  }));
}
