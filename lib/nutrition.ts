import { DailyTargets, Gender, GoalId, SportId } from '@/types';
import { SPORTS } from './constants';

/**
 * Mifflin-St Jeor BMR formula. Returns kcal/day.
 */
export function calcBMR(
  gender: Gender,
  weightKg: number,
  heightCm: number,
  age: number,
): number {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  if (gender === 'male') return base + 5;
  if (gender === 'female') return base - 161;
  // 'other' — average of male/female
  return base - 78;
}

export function activityFactorForSport(sport: SportId | null): number {
  if (!sport) return 1.55;
  const found = SPORTS.find((s) => s.id === sport);
  return found ? found.activityFactor : 1.55;
}

export function calcTDEE(
  bmr: number,
  sport: SportId | null,
): number {
  return Math.round(bmr * activityFactorForSport(sport));
}

export function calcDailyTargets({
  gender,
  weightKg,
  heightCm,
  age,
  sport,
  goal,
}: {
  gender: Gender;
  weightKg: number;
  heightCm: number;
  age: number;
  sport: SportId | null;
  goal: GoalId | null;
}): DailyTargets {
  const bmr = calcBMR(gender, weightKg, heightCm, age);
  const tdee = calcTDEE(bmr, sport);

  let calories = tdee;
  switch (goal) {
    case 'lose_fat':
      calories = Math.max(1500, tdee - 500);
      break;
    case 'gain_weight':
      calories = tdee + 500;
      break;
    case 'build_muscle':
      calories = tdee + 250;
      break;
    case 'perform':
    case 'event':
    case 'maintain':
    default:
      calories = tdee;
  }

  // Protein: 1.8g/kg as a strong default for athletes.
  const protein = Math.round(weightKg * 1.8);
  // Fat: ~28% of calories. 1g fat = 9 kcal.
  const fat = Math.round((calories * 0.28) / 9);
  // Carbs: remainder. 1g carb = 4 kcal.
  const carbsKcal = calories - protein * 4 - fat * 9;
  const carbs = Math.max(0, Math.round(carbsKcal / 4));

  return {
    calories: Math.round(calories),
    protein,
    fat,
    carbs,
  };
}

export function lbsToKg(lbs: number) {
  return lbs * 0.45359237;
}
export function kgToLbs(kg: number) {
  return kg / 0.45359237;
}
export function inToCm(inches: number) {
  return inches * 2.54;
}
export function cmToIn(cm: number) {
  return cm / 2.54;
}
