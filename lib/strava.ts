import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { WorkoutType, WorkoutHealthData } from '@/types';

const CLIENT_ID = process.env.EXPO_PUBLIC_STRAVA_CLIENT_ID!;
// Secret is read from env — never prefix with EXPO_PUBLIC_ in production
const CLIENT_SECRET = (process.env as any).STRAVA_CLIENT_SECRET ?? '';

const AUTH_URL = 'https://www.strava.com/oauth/mobile/authorize';
const TOKEN_URL = 'https://www.strava.com/oauth/token';
const API_BASE = 'https://www.strava.com/api/v3';

export type StravaTokens = {
  accessToken: string;
  refreshToken: string;
  expiresAt: number; // unix seconds
  athleteId: number;
  athleteName: string;
};

// ─── Auth ─────────────────────────────────────────────────────────────────────

export async function connectStrava(): Promise<StravaTokens | null> {
  const redirectUri = 'velo://strava-callback';
  const url =
    `${AUTH_URL}?client_id=${CLIENT_ID}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&response_type=code` +
    `&approval_prompt=auto` +
    `&scope=activity:read_all`;

  const result = await WebBrowser.openAuthSessionAsync(url, redirectUri);
  if (result.type !== 'success') return null;

  const parsed = Linking.parse(result.url);
  const code = parsed.queryParams?.code as string | undefined;
  if (!code) return null;

  return exchangeCode(code);
}

export async function exchangeCode(code: string): Promise<StravaTokens | null> {
  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      code,
      grant_type: 'authorization_code',
    }),
  });
  if (!res.ok) return null;
  const data = await res.json();
  return parseTokenResponse(data);
}

export async function refreshStravaToken(refreshToken: string): Promise<StravaTokens | null> {
  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  });
  if (!res.ok) return null;
  return parseTokenResponse(await res.json());
}

function parseTokenResponse(data: any): StravaTokens {
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: data.expires_at,
    athleteId: data.athlete?.id ?? 0,
    athleteName: `${data.athlete?.firstname ?? ''} ${data.athlete?.lastname ?? ''}`.trim(),
  };
}

// ─── Activities ───────────────────────────────────────────────────────────────

const TYPE_MAP: Record<string, WorkoutType> = {
  Run: 'run', VirtualRun: 'run',
  Ride: 'ride', VirtualRide: 'ride', EBikeRide: 'ride',
  Swim: 'swim',
  WeightTraining: 'lift', Crossfit: 'crossfit',
  Walk: 'walk', Hike: 'walk',
  Yoga: 'yoga', Pilates: 'yoga',
};

export type StravaActivity = {
  stravaId: number;
  type: WorkoutType;
  name: string;
  durationMin: number;
  distanceKm?: number;
  completedAt: string;
  healthData: WorkoutHealthData;
};

export async function fetchStravaActivities(
  accessToken: string,
  after?: number, // unix timestamp
): Promise<StravaActivity[]> {
  const params = new URLSearchParams({ per_page: '50' });
  if (after) params.set('after', String(after));

  const res = await fetch(`${API_BASE}/athlete/activities?${params}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) return [];
  const data: any[] = await res.json();

  return data.map((a) => {
    const durationMin = Math.round((a.moving_time ?? a.elapsed_time ?? 0) / 60);
    const distanceKm = a.distance ? a.distance / 1000 : undefined;
    const avgPaceMinPerKm = distanceKm && durationMin ? durationMin / distanceKm : undefined;

    const healthData: WorkoutHealthData = {
      avgHeartRate: a.average_heartrate ?? undefined,
      maxHeartRate: a.max_heartrate ?? undefined,
      caloriesBurned: a.calories ?? undefined,
      elevationGain: a.total_elevation_gain ?? undefined,
      avgPaceMinPerKm,
      avgCadence: a.average_cadence ?? undefined,
      avgPowerWatts: a.average_watts ?? undefined,
    };

    return {
      stravaId: a.id,
      type: TYPE_MAP[a.sport_type ?? a.type] ?? 'other',
      name: a.name,
      durationMin,
      distanceKm,
      completedAt: a.start_date,
      healthData,
    };
  }).filter((a) => a.durationMin >= 5);
}

export function needsRefresh(tokens: StravaTokens): boolean {
  return Date.now() / 1000 >= tokens.expiresAt - 300;
}
