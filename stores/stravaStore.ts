import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import {
  connectStrava, refreshStravaToken, fetchStravaActivities,
  needsRefresh, StravaTokens,
} from '@/lib/strava';
import { useWorkoutStore } from '@/stores/workoutStore';
import { uid } from '@/lib/date';

type StravaState = {
  tokens: StravaTokens | null;
  lastSync: string | null;
  syncing: boolean;
  connect: () => Promise<string | null>;
  disconnect: () => void;
  sync: () => Promise<number>; // returns count of new workouts imported
};

export const useStravaStore = create<StravaState>()(
  persist(
    (set, get) => ({
      tokens: null,
      lastSync: null,
      syncing: false,

      connect: async () => {
        const tokens = await connectStrava();
        if (!tokens) return 'Connection cancelled';
        set({ tokens });
        await get().sync();
        return null;
      },

      disconnect: () => set({ tokens: null, lastSync: null }),

      sync: async () => {
        const { tokens, lastSync, syncing } = get();
        if (!tokens || syncing) return 0;

        set({ syncing: true });

        try {
          let activeTokens = tokens;

          // Refresh token if expired
          if (needsRefresh(tokens)) {
            const refreshed = await refreshStravaToken(tokens.refreshToken);
            if (!refreshed) { set({ syncing: false }); return 0; }
            activeTokens = refreshed;
            set({ tokens: refreshed });
          }

          const after = lastSync
            ? Math.floor(new Date(lastSync).getTime() / 1000)
            : Math.floor(Date.now() / 1000) - 30 * 24 * 60 * 60; // last 30 days

          const activities = await fetchStravaActivities(activeTokens.accessToken, after);

          const workoutStore = useWorkoutStore.getState();
          const existingStravaIds = new Set(
            workoutStore.workouts
              .filter((w) => w.source === 'strava' as any)
              .map((w) => (w as any).stravaId)
              .filter(Boolean)
          );

          const fresh = activities.filter((a) => !existingStravaIds.has(a.stravaId));

          for (const a of fresh) {
            workoutStore.logWorkout({
              type: a.type,
              name: a.name,
              durationMin: a.durationMin,
              distanceKm: a.distanceKm,
              intensity: 5, // will be refined by HR if available
              source: 'strava' as any,
              healthData: a.healthData,
              stravaId: a.stravaId,
              completedAt: a.completedAt,
            } as any);
          }

          set({ lastSync: new Date().toISOString(), syncing: false });
          return fresh.length;
        } catch {
          set({ syncing: false });
          return 0;
        }
      },
    }),
    { name: 'velo-strava', storage: createJSONStorage(() => AsyncStorage) },
  ),
);
