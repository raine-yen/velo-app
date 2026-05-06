import { GoalId, SportId, FoodItem, WorkoutType } from '@/types';

export const SPORTS: { id: SportId; label: string; activityFactor: number }[] = [
  { id: 'running', label: 'Running', activityFactor: 1.7 },
  { id: 'cycling', label: 'Cycling', activityFactor: 1.7 },
  { id: 'swimming', label: 'Swimming', activityFactor: 1.7 },
  { id: 'triathlon', label: 'Triathlon', activityFactor: 1.85 },
  { id: 'track', label: 'Track & Field', activityFactor: 1.65 },
  { id: 'cross_country', label: 'Cross Country', activityFactor: 1.75 },
  { id: 'soccer', label: 'Soccer', activityFactor: 1.7 },
  { id: 'basketball', label: 'Basketball', activityFactor: 1.65 },
  { id: 'football', label: 'Football', activityFactor: 1.65 },
  { id: 'baseball', label: 'Baseball', activityFactor: 1.55 },
  { id: 'tennis', label: 'Tennis', activityFactor: 1.6 },
  { id: 'volleyball', label: 'Volleyball', activityFactor: 1.55 },
  { id: 'hockey', label: 'Hockey', activityFactor: 1.7 },
  { id: 'wrestling', label: 'Wrestling', activityFactor: 1.75 },
  { id: 'crossfit', label: 'CrossFit', activityFactor: 1.7 },
  { id: 'lifting', label: 'Weightlifting', activityFactor: 1.55 },
  { id: 'other', label: 'Other', activityFactor: 1.55 },
];

export const GOALS: { id: GoalId; label: string; description: string }[] = [
  {
    id: 'build_muscle',
    label: 'Build muscle',
    description: 'Slight surplus, high protein',
  },
  {
    id: 'lose_fat',
    label: 'Lose fat',
    description: 'Calorie deficit, preserve muscle',
  },
  {
    id: 'gain_weight',
    label: 'Gain weight',
    description: 'Larger surplus for strength gains',
  },
  {
    id: 'perform',
    label: 'Improve performance',
    description: 'Fuel for training and recovery',
  },
  {
    id: 'event',
    label: 'Train for an event',
    description: 'Race, game, or season prep',
  },
  {
    id: 'maintain',
    label: 'Maintain',
    description: 'Hold weight and fitness',
  },
];

export const WORKOUT_TYPES: { id: WorkoutType; label: string }[] = [
  { id: 'run', label: 'Run' },
  { id: 'ride', label: 'Bike' },
  { id: 'swim', label: 'Swim' },
  { id: 'lift', label: 'Lift' },
  { id: 'crossfit', label: 'CrossFit' },
  { id: 'sport', label: 'Sport practice' },
  { id: 'walk', label: 'Walk' },
  { id: 'yoga', label: 'Yoga' },
  { id: 'other', label: 'Other' },
];

/**
 * Small starter food list for the MVP. Real food database comes via Passio API in Phase 3.
 * Macros are per single serving as described.
 */
export const STARTER_FOODS: FoodItem[] = [
  { id: 'egg', name: 'Egg', servingDesc: '1 large', calories: 72, protein: 6, carbs: 0, fat: 5 },
  { id: 'oats', name: 'Oatmeal', servingDesc: '1 cup cooked', calories: 158, protein: 6, carbs: 27, fat: 3 },
  { id: 'banana', name: 'Banana', servingDesc: '1 medium', calories: 105, protein: 1, carbs: 27, fat: 0 },
  { id: 'apple', name: 'Apple', servingDesc: '1 medium', calories: 95, protein: 0, carbs: 25, fat: 0 },
  { id: 'chicken', name: 'Chicken breast', servingDesc: '4 oz cooked', calories: 187, protein: 35, carbs: 0, fat: 4 },
  { id: 'beef', name: 'Lean ground beef', servingDesc: '4 oz cooked', calories: 200, protein: 26, carbs: 0, fat: 10 },
  { id: 'salmon', name: 'Salmon', servingDesc: '4 oz cooked', calories: 235, protein: 25, carbs: 0, fat: 14 },
  { id: 'rice_white', name: 'White rice', servingDesc: '1 cup cooked', calories: 205, protein: 4, carbs: 45, fat: 0 },
  { id: 'rice_brown', name: 'Brown rice', servingDesc: '1 cup cooked', calories: 218, protein: 5, carbs: 46, fat: 2 },
  { id: 'pasta', name: 'Pasta', servingDesc: '1 cup cooked', calories: 220, protein: 8, carbs: 43, fat: 1 },
  { id: 'bread', name: 'Whole wheat bread', servingDesc: '1 slice', calories: 80, protein: 4, carbs: 14, fat: 1 },
  { id: 'potato', name: 'Sweet potato', servingDesc: '1 medium', calories: 112, protein: 2, carbs: 26, fat: 0 },
  { id: 'broccoli', name: 'Broccoli', servingDesc: '1 cup', calories: 55, protein: 4, carbs: 11, fat: 1 },
  { id: 'spinach', name: 'Spinach', servingDesc: '1 cup', calories: 7, protein: 1, carbs: 1, fat: 0 },
  { id: 'avocado', name: 'Avocado', servingDesc: '1/2 medium', calories: 160, protein: 2, carbs: 9, fat: 15 },
  { id: 'almonds', name: 'Almonds', servingDesc: '1 oz (~23)', calories: 164, protein: 6, carbs: 6, fat: 14 },
  { id: 'pb', name: 'Peanut butter', servingDesc: '2 tbsp', calories: 188, protein: 8, carbs: 7, fat: 16 },
  { id: 'milk', name: 'Milk (2%)', servingDesc: '1 cup', calories: 122, protein: 8, carbs: 12, fat: 5 },
  { id: 'yogurt_greek', name: 'Greek yogurt', servingDesc: '1 cup', calories: 130, protein: 23, carbs: 9, fat: 0 },
  { id: 'cheese_cheddar', name: 'Cheddar cheese', servingDesc: '1 oz', calories: 113, protein: 7, carbs: 0, fat: 9 },
  { id: 'shake_protein', name: 'Protein shake', servingDesc: '1 scoop + water', calories: 120, protein: 25, carbs: 3, fat: 1 },
  { id: 'bar_protein', name: 'Protein bar', servingDesc: '1 bar', calories: 220, protein: 20, carbs: 22, fat: 7 },
  { id: 'pizza', name: 'Pizza', servingDesc: '1 slice', calories: 285, protein: 12, carbs: 36, fat: 10 },
  { id: 'burger', name: 'Cheeseburger', servingDesc: '1 burger', calories: 535, protein: 30, carbs: 39, fat: 28 },
  { id: 'sandwich_turkey', name: 'Turkey sandwich', servingDesc: '1 sandwich', calories: 320, protein: 22, carbs: 36, fat: 9 },
  { id: 'burrito', name: 'Chicken burrito', servingDesc: '1 burrito', calories: 700, protein: 40, carbs: 80, fat: 22 },
  { id: 'salad_chicken', name: 'Chicken salad', servingDesc: '1 bowl', calories: 380, protein: 32, carbs: 18, fat: 20 },
  { id: 'coffee', name: 'Coffee (black)', servingDesc: '1 cup', calories: 2, protein: 0, carbs: 0, fat: 0 },
  { id: 'orange_juice', name: 'Orange juice', servingDesc: '1 cup', calories: 112, protein: 2, carbs: 26, fat: 0 },
  { id: 'gatorade', name: 'Gatorade', servingDesc: '20 oz', calories: 140, protein: 0, carbs: 36, fat: 0 },
];

export const SPORT_LABEL: Record<SportId, string> = SPORTS.reduce(
  (acc, s) => ({ ...acc, [s.id]: s.label }),
  {} as Record<SportId, string>
);

export const WORKOUT_LABEL: Record<WorkoutType, string> = WORKOUT_TYPES.reduce(
  (acc, w) => ({ ...acc, [w.id]: w.label }),
  {} as Record<WorkoutType, string>
);
