import AppleHealthKit, {
  HealthKitPermissions,
  HealthValue,
} from 'react-native-health';
import { NativeModules, Platform } from 'react-native';
import { Workout, WorkoutType, WorkoutHealthData } from '@/types';
import { DailyHealthSnapshot } from '@/stores/healthStore';
import { uid, isoDate } from '@/lib/date';

const healthKit = AppleHealthKit as typeof AppleHealthKit & {
  initHealthKit?: typeof AppleHealthKit.initHealthKit;
  isAvailable?: (callback: (error: unknown, result: boolean) => void) => void;
};

const PERMS = {
  permissions: {
    read: [
      AppleHealthKit.Constants.Permissions.Workout,
      AppleHealthKit.Constants.Permissions.HeartRate,
      AppleHealthKit.Constants.Permissions.RestingHeartRate,
      AppleHealthKit.Constants.Permissions.HeartRateVariability,
      AppleHealthKit.Constants.Permissions.ActiveEnergyBurned,
      AppleHealthKit.Constants.Permissions.DistanceWalkingRunning,
      AppleHealthKit.Constants.Permissions.DistanceCycling,
      AppleHealthKit.Constants.Permissions.DistanceSwimming,
      AppleHealthKit.Constants.Permissions.StepCount,
      AppleHealthKit.Constants.Permissions.SleepAnalysis,
      AppleHealthKit.Constants.Permissions.Vo2Max,
      AppleHealthKit.Constants.Permissions.Weight,
    ],
    write: [],
  },
} as HealthKitPermissions;

// Apple HKWorkoutActivityType → our WorkoutType
const ACTIVITY_MAP: Record<number, WorkoutType> = {
  37: 'run',
  13: 'ride',
  46: 'swim',
  50: 'walk',
  20: 'lift',
  79: 'lift',
  30: 'yoga',
  3:  'crossfit',
  1:  'other',
};

function mapActivity(typeId: number): WorkoutType {
  return ACTIVITY_MAP[typeId] ?? 'other';
}

function workoutName(activityId: number): string {
  const names: Record<number, string> = {
    37: 'Run', 13: 'Ride', 46: 'Swim', 50: 'Walk',
    20: 'Strength', 79: 'Strength', 30: 'Yoga', 3: 'Cross-training',
  };
  return names[activityId] ?? 'Workout';
}

export function isHealthKitAvailable(): boolean {
  return Platform.OS === 'ios' && typeof healthKit.initHealthKit === 'function';
}

export function getHealthKitAvailabilityMessage(): string | null {
  if (Platform.OS !== 'ios') return 'Apple Health is only available on iOS.';
  if (!NativeModules.AppleHealthKit) {
    return 'Apple Health is not available in this build yet. Rebuild the iOS development client and reinstall it on your iPhone.';
  }
  if (typeof healthKit.initHealthKit !== 'function') {
    return 'Apple Health loaded without its permission API. Rebuild the iOS development client with the legacy React Native architecture.';
  }
  return null;
}

export function requestHealthKitPermissions(): Promise<boolean> {
  return new Promise((resolve) => {
    if (!isHealthKitAvailable()) return resolve(false);
    healthKit.initHealthKit(PERMS, (err) => resolve(!err));
  });
}

export type HealthKitWorkout = Workout & { appleId: string };

export async function fetchRecentWorkouts(days = 30): Promise<HealthKitWorkout[]> {
  return new Promise((resolve) => {
    if (!isHealthKitAvailable()) return resolve([]);

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    AppleHealthKit.getSamples(
      {
        startDate: startDate.toISOString(),
        endDate: new Date().toISOString(),
        type: 'Workout',
      } as any,
      async (err: any, results: any[]) => {
        if (err || !results) return resolve([]);

        const workouts: HealthKitWorkout[] = await Promise.all(
          results.map(async (r) => {
            const type = mapActivity(r.activityType ?? 0);
            const durationMin = Math.round((r.duration ?? 0) / 60);
            const distanceKm = r.totalDistance ? r.totalDistance / 1000 : undefined;

            const healthData: WorkoutHealthData = {
              caloriesBurned: r.totalEnergyBurned ? Math.round(r.totalEnergyBurned) : undefined,
              avgPaceMinPerKm: distanceKm && durationMin ? durationMin / distanceKm : undefined,
            };

            await fetchAvgHR(r.startDate, r.endDate, healthData);

            return {
              id: uid(),
              appleId: r.uuid ?? r.startDate,
              type,
              name: workoutName(r.activityType ?? 0),
              durationMin,
              distanceKm,
              intensity: estimateIntensity(healthData.avgHeartRate),
              completedAt: r.startDate,
              source: 'apple_health' as const,
              healthData,
            };
          })
        );
        resolve(workouts.filter((w) => w.durationMin >= 5));
      }
    );
  });
}

// Fetch a full daily health snapshot (sleep, HRV, resting HR, steps, VO2Max, weight)
export async function fetchDailySnapshot(): Promise<DailyHealthSnapshot> {
  const snap: DailyHealthSnapshot = {
    date: isoDate(),
    syncedAt: new Date().toISOString(),
  };

  await Promise.allSettled([
    fetchSleep(snap),
    fetchRestingHR(snap),
    fetchHRV(snap),
    fetchSteps(snap),
    fetchVO2Max(snap),
    fetchWeight(snap),
  ]);

  return snap;
}

function fetchSleep(out: DailyHealthSnapshot): Promise<void> {
  return new Promise((resolve) => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(18, 0, 0, 0); // 6pm yesterday

    const now = new Date();
    now.setHours(14, 0, 0, 0); // 2pm today

    AppleHealthKit.getSleepSamples(
      { startDate: yesterday.toISOString(), endDate: now.toISOString() } as any,
      (err: any, samples: any[]) => {
        if (!err && samples?.length) {
          // Sum asleep stages only (value 1 = asleep, 2 = core, 3 = deep, 4 = REM)
          const asleepMs = samples
            .filter((s) => s.value !== 'INBED')
            .reduce((acc, s) => {
              const start = new Date(s.startDate).getTime();
              const end = new Date(s.endDate).getTime();
              return acc + (end - start);
            }, 0);
          const hours = asleepMs / (1000 * 60 * 60);
          if (hours > 0) out.sleepHours = Math.round(hours * 10) / 10;
        }
        resolve();
      }
    );
  });
}

function fetchRestingHR(out: DailyHealthSnapshot): Promise<void> {
  return new Promise((resolve) => {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 1);

    AppleHealthKit.getRestingHeartRate(
      { startDate: startDate.toISOString(), limit: 1 } as any,
      (err: any, result: any) => {
        if (!err && result?.value) out.restingHR = Math.round(result.value);
        resolve();
      }
    );
  });
}

function fetchHRV(out: DailyHealthSnapshot): Promise<void> {
  return new Promise((resolve) => {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 1);

    AppleHealthKit.getHeartRateVariabilitySamples(
      { startDate: startDate.toISOString(), limit: 10, ascending: false } as any,
      (err: any, samples: HealthValue[]) => {
        if (!err && samples?.length) {
          const avg = samples.reduce((a, s) => a + s.value, 0) / samples.length;
          out.avgHRV = Math.round(avg);
        }
        resolve();
      }
    );
  });
}

function fetchSteps(out: DailyHealthSnapshot): Promise<void> {
  return new Promise((resolve) => {
    const startDate = new Date();
    startDate.setHours(0, 0, 0, 0);

    AppleHealthKit.getStepCount(
      { startDate: startDate.toISOString() } as any,
      (err: any, result: any) => {
        if (!err && result?.value) out.steps = Math.round(result.value);
        resolve();
      }
    );
  });
}

function fetchVO2Max(out: DailyHealthSnapshot): Promise<void> {
  return new Promise((resolve) => {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 3);

    AppleHealthKit.getVo2MaxSamples(
      { startDate: startDate.toISOString(), limit: 1, ascending: false } as any,
      (err: any, samples: HealthValue[]) => {
        if (!err && samples?.length) out.vo2Max = Math.round(samples[0].value * 10) / 10;
        resolve();
      }
    );
  });
}

function fetchWeight(out: DailyHealthSnapshot): Promise<void> {
  return new Promise((resolve) => {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 1);

    AppleHealthKit.getLatestWeight(
      { unit: 'kg' } as any,
      (err: any, result: any) => {
        if (!err && result?.value) out.weightKg = Math.round(result.value * 10) / 10;
        resolve();
      }
    );
  });
}

function fetchAvgHR(start: string, end: string, out: WorkoutHealthData): Promise<void> {
  return new Promise((resolve) => {
    AppleHealthKit.getHeartRateSamples(
      { startDate: start, endDate: end, ascending: false, limit: 100 } as any,
      (err: any, samples: HealthValue[]) => {
        if (!err && samples?.length) {
          const avg = samples.reduce((a, s) => a + s.value, 0) / samples.length;
          out.avgHeartRate = Math.round(avg);
          out.maxHeartRate = Math.round(Math.max(...samples.map((s) => s.value)));
        }
        resolve();
      }
    );
  });
}

function estimateIntensity(avgHR?: number): number {
  if (!avgHR) return 5;
  if (avgHR >= 170) return 9;
  if (avgHR >= 160) return 8;
  if (avgHR >= 150) return 7;
  if (avgHR >= 140) return 6;
  if (avgHR >= 130) return 5;
  if (avgHR >= 120) return 4;
  return 3;
}
