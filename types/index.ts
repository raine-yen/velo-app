/**
 * Shared types for Velo.
 */

export type Gender = 'male' | 'female' | 'other';

export type SportId =
  | 'running'
  | 'cycling'
  | 'swimming'
  | 'triathlon'
  | 'track'
  | 'cross_country'
  | 'soccer'
  | 'basketball'
  | 'football'
  | 'baseball'
  | 'tennis'
  | 'volleyball'
  | 'hockey'
  | 'wrestling'
  | 'crossfit'
  | 'lifting'
  | 'other';

export type GoalId =
  | 'build_muscle'
  | 'lose_fat'
  | 'gain_weight'
  | 'perform'
  | 'event'
  | 'maintain';

export type Units = 'metric' | 'imperial';

export type DailyTargets = {
  calories: number;
  protein: number; // grams
  carbs: number;
  fat: number;
};

export type NutritionGoalId = 'calories' | 'protein' | 'carbs' | 'fat' | 'water' | 'fiber' | 'sodium';

export type UserProfile = {
  name: string;
  sport: SportId | null;
  goal: GoalId | null;
  gender: Gender;
  age: number; // years
  heightCm: number;
  weightKg: number;
  units: Units;
  targets: DailyTargets;
  onboardedAt: string | null; // ISO date string
};

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export type FoodItem = {
  id: string;
  name: string;
  servingDesc: string; // e.g. "1 cup", "100g"
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

export type Meal = {
  id: string;
  mealType: MealType;
  foods: { food: FoodItem; servings: number }[];
  loggedAt: string; // ISO
  // computed totals stored for fast retrieval
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

export type WorkoutType =
  | 'run'
  | 'ride'
  | 'swim'
  | 'lift'
  | 'crossfit'
  | 'sport'
  | 'walk'
  | 'yoga'
  | 'other';

export type WorkoutSource = 'manual' | 'apple_health' | 'strava';

export type PlannedWorkout = {
  id: string;
  teamId: string;
  athleteId: string | null; // null = whole team
  date: string; // YYYY-MM-DD
  type: WorkoutType;
  title: string;
  description: string;
  durationMin: number;
  intensity: number; // 1-10
  createdBy: string; // coach userId
};

export type WeekTemplate = {
  id: string;
  name: string;
  days: { dayIndex: number; type: WorkoutType; title: string; description: string; durationMin: number; intensity: number }[];
};

export type WorkoutHealthData = {
  avgHeartRate?: number;
  maxHeartRate?: number;
  caloriesBurned?: number;
  elevationGain?: number;
  sourceName?: string;
  sourceId?: string;
  device?: string;
  // Running / cycling
  avgPaceMinPerKm?: number;
  avgCadence?: number;
  // Cycling
  avgPowerWatts?: number;
  // Swimming
  strokeType?: string;
  swolf?: number;
  poolLengthM?: number;
};

export type Workout = {
  id: string;
  appleId?: string;
  stravaId?: string;
  type: WorkoutType;
  name: string;
  durationMin: number;
  distanceKm?: number;
  intensity: number; // 1-10
  notes?: string;
  completedAt: string; // ISO
  source?: WorkoutSource;
  healthData?: WorkoutHealthData;
  private?: boolean; // hide from coaches
};

export type WellnessCheckIn = {
  date: string; // YYYY-MM-DD
  sleepHours: number; // 0-12
  energy: number; // 1-5
  soreness: number; // 1-5 (5 = very sore)
  mood: number; // 1-5
  loggedAt: string; // ISO
};
