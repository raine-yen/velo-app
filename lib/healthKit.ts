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

type HealthKitNativeModule = typeof AppleHealthKit & {
  initHealthKit?: typeof AppleHealthKit.initHealthKit;
  isAvailable?: (callback: (error: unknown, result: boolean) => void) => void;
};

function getHealthKitModule(): HealthKitNativeModule {
  return (NativeModules.AppleHealthKit as HealthKitNativeModule | undefined) ?? healthKit;
}

const PERMS = {
  permissions: {
    read: [
      AppleHealthKit.Constants.Permissions.Workout,
      AppleHealthKit.Constants.Permissions.HeartRate,
      AppleHealthKit.Constants.Permissions.RestingHeartRate,
      AppleHealthKit.Constants.Permissions.HeartRateVariability,
      AppleHealthKit.Constants.Permissions.ActiveEnergyBurned,
      AppleHealthKit.Constants.Permissions.BasalEnergyBurned,
      AppleHealthKit.Constants.Permissions.AppleExerciseTime,
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

// Apple HKWorkoutActivityType -> our WorkoutType
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
  return Platform.OS === 'ios' && typeof getHealthKitModule().initHealthKit === 'function';
}

export type HealthKitAvailability = {
  platform: typeof Platform.OS;
  nativeModuleLoaded: boolean;
  permissionApiLoaded: boolean;
  available: boolean;
  message: string | null;
};

export type HealthKitPermissionResult = {
  requested: boolean;
  granted: boolean;
  status: 'granted' | 'unavailable' | 'error';
  message: string | null;
};

export function getHealthKitAvailability(): HealthKitAvailability {
  const nativeModuleLoaded = !!NativeModules.AppleHealthKit;
  const permissionApiLoaded = typeof getHealthKitModule().initHealthKit === 'function';
  let message: string | null = null;

  if (Platform.OS !== 'ios') message = 'Apple Health is only available on iOS.';
  else if (!nativeModuleLoaded) {
    message = 'Apple Health is not available in this build yet. Rebuild the iOS development client and reinstall it on your iPhone.';
  } else if (!permissionApiLoaded) {
    message = 'Apple Health loaded without its permission API. Rebuild the iOS development client with the legacy React Native architecture.';
  }

  return {
    platform: Platform.OS,
    nativeModuleLoaded,
    permissionApiLoaded,
    available: Platform.OS === 'ios' && permissionApiLoaded,
    message,
  };
}

export function getHealthKitAvailabilityMessage(): string | null {
  return getHealthKitAvailability().message;
}

export function requestHealthKitPermissions(): Promise<HealthKitPermissionResult> {
  return new Promise((resolve) => {
    const availability = getHealthKitAvailability();
    if (!availability.available) {
      resolve({
        requested: false,
        granted: false,
        status: 'unavailable',
        message: availability.message,
      });
      return;
    }

    getHealthKitModule().initHealthKit?.(PERMS, (err) => {
      if (err) {
        resolve({
          requested: true,
          granted: false,
          status: 'error',
          message: String(err),
        });
        return;
      }

      resolve({
        requested: true,
        granted: true,
        status: 'granted',
        message: null,
      });
    });
  });
}

export function getHealthKitSettingsGuidance(): string {
  if (Platform.OS !== 'ios') return 'Apple Health is only available on iOS.';
  return 'Open iPhone Settings > Health > Data Access & Devices > Velo and enable the requested read permissions. If Velo does not appear there, delete and reinstall the dev build, then tap Connect Apple Health again.';
}

export type HealthKitWorkout = Workout & { appleId: string };

export async function fetchRecentWorkouts(days = 30): Promise<HealthKitWorkout[]> {
  return new Promise((resolve) => {
    if (!isHealthKitAvailable()) return resolve([]);

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    getHealthKitModule().getSamples(
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
              sourceName: r.sourceName,
              sourceId: r.sourceId,
              device: r.device,
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
    fetchActiveEnergy(snap),
    fetchBasalEnergy(snap),
    fetchExerciseTime(snap),
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

    getHealthKitModule().getSleepSamples(
      { startDate: yesterday.toISOString(), endDate: now.toISOString() } as any,
      (err: any, samples: any[]) => {
        if (!err && samples?.length) {
          const totals = samples.reduce(
            (acc, s) => {
              const minutes = Math.max(0, (new Date(s.endDate).getTime() - new Date(s.startDate).getTime()) / 60000);
              if (s.value === 'REM') acc.remMin += minutes;
              else if (s.value === 'CORE') acc.coreMin += minutes;
              else if (s.value === 'DEEP') acc.deepMin += minutes;
              else if (s.value === 'ASLEEP') acc.asleepMin += minutes;
              else if (s.value === 'AWAKE') acc.awakeMin += minutes;
              return acc;
            },
            { remMin: 0, coreMin: 0, deepMin: 0, asleepMin: 0, awakeMin: 0 },
          );
          const stagedMin = totals.remMin + totals.coreMin + totals.deepMin;
          const sleepMin = stagedMin > 0 ? stagedMin : totals.asleepMin;
          const hours = sleepMin / 60;
          if (hours > 0) out.sleepHours = Math.round(hours * 10) / 10;
          out.sleepStages = {
            remMin: Math.round(totals.remMin),
            coreMin: Math.round(totals.coreMin),
            deepMin: Math.round(totals.deepMin),
            asleepMin: Math.round(sleepMin),
          };
          out.sleepAwakeMinutes = Math.round(totals.awakeMin);
        }
        resolve();
      }
    );
  });
}

function fetchActiveEnergy(out: DailyHealthSnapshot): Promise<void> {
  return new Promise((resolve) => {
    const startDate = new Date();
    startDate.setHours(0, 0, 0, 0);

    getHealthKitModule().getActiveEnergyBurned(
      { startDate: startDate.toISOString(), endDate: new Date().toISOString() } as any,
      (err: any, samples: HealthValue[]) => {
        if (!err && samples?.length) {
          out.activeCalories = Math.round(samples.reduce((sum, sample) => sum + (sample.value ?? 0), 0));
        }
        resolve();
      }
    );
  });
}

function fetchBasalEnergy(out: DailyHealthSnapshot): Promise<void> {
  return new Promise((resolve) => {
    const startDate = new Date();
    startDate.setHours(0, 0, 0, 0);

    getHealthKitModule().getBasalEnergyBurned(
      { startDate: startDate.toISOString(), endDate: new Date().toISOString() } as any,
      (err: any, samples: HealthValue[]) => {
        if (!err && samples?.length) {
          out.basalCalories = Math.round(samples.reduce((sum, sample) => sum + (sample.value ?? 0), 0));
        }
        resolve();
      }
    );
  });
}

function fetchExerciseTime(out: DailyHealthSnapshot): Promise<void> {
  return new Promise((resolve) => {
    const startDate = new Date();
    startDate.setHours(0, 0, 0, 0);

    getHealthKitModule().getAppleExerciseTime(
      { startDate: startDate.toISOString(), endDate: new Date().toISOString() } as any,
      (err: any, samples: HealthValue[]) => {
        if (!err && samples?.length) {
          out.activeMinutes = Math.round(samples.reduce((sum, sample) => sum + (sample.value ?? 0), 0));
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

    getHealthKitModule().getRestingHeartRate(
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

    getHealthKitModule().getHeartRateVariabilitySamples(
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

    getHealthKitModule().getStepCount(
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

    getHealthKitModule().getVo2MaxSamples(
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

    getHealthKitModule().getLatestWeight(
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
    getHealthKitModule().getHeartRateSamples(
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
