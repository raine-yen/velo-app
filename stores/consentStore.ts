import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { supabase } from '@/lib/supabase';

export type DataCategory = 'readiness' | 'workouts' | 'nutrition' | 'wellness';

export const DATA_CATEGORY_LABELS: Record<DataCategory, { label: string; description: string }> = {
  readiness: { label: 'Readiness score', description: 'Daily readiness and recovery score' },
  workouts:  { label: 'Workouts', description: 'Training logs, duration, intensity' },
  nutrition: { label: 'Nutrition', description: 'Meals and daily macro totals' },
  wellness:  { label: 'Wellness check-ins', description: 'Sleep, energy, soreness, mood' },
};

export type ConsentRecord = {
  teamId: string;
  teamName: string;
  coachId: string;
  coachName: string;
  requested: DataCategory[];   // what coach wants
  approved: DataCategory[];    // what athlete agreed to
  status: 'pending' | 'responded';
  updatedAt: string;
};

// Coach's view of one athlete's consent
export type AthleteConsent = {
  athleteId: string;
  teamId: string;
  requested: DataCategory[];
  approved: DataCategory[];
  status: 'pending' | 'responded';
};

type ConsentState = {
  // Athlete side
  incomingRequests: ConsentRecord[];
  // Coach side
  outgoingConsents: AthleteConsent[];

  // Coach: request data from an athlete
  requestData: (teamId: string, athleteId: string, categories: DataCategory[]) => Promise<string | null>;
  // Athlete: respond to a consent request
  respondToRequest: (teamId: string, approved: DataCategory[]) => Promise<string | null>;
  // Athlete: revoke consent
  revokeConsent: (teamId: string) => Promise<void>;
  // Refresh from Supabase
  refreshConsents: () => Promise<void>;
};

export const useConsentStore = create<ConsentState>()(
  persist(
    (set, get) => ({
      incomingRequests: [],
      outgoingConsents: [],

      requestData: async (teamId, athleteId, categories) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return 'Not signed in';

        const { error } = await supabase.from('data_consent').upsert({
          team_id: teamId,
          athlete_id: athleteId,
          coach_id: user.id,
          requested_categories: categories,
          approved_categories: [],
          status: 'pending',
          updated_at: new Date().toISOString(),
        }, { onConflict: 'team_id,athlete_id' });

        if (error) return error.message;

        set((s) => {
          const filtered = s.outgoingConsents.filter((c) => !(c.teamId === teamId && c.athleteId === athleteId));
          return { outgoingConsents: [...filtered, { athleteId, teamId, requested: categories, approved: [], status: 'pending' }] };
        });
        return null;
      },

      respondToRequest: async (teamId, approved) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return 'Not signed in';

        const { error } = await supabase.from('data_consent')
          .update({ approved_categories: approved, status: 'responded', consented_at: new Date().toISOString(), updated_at: new Date().toISOString() })
          .eq('team_id', teamId)
          .eq('athlete_id', user.id);

        if (error) return error.message;

        set((s) => ({
          incomingRequests: s.incomingRequests.map((r) =>
            r.teamId === teamId ? { ...r, approved, status: 'responded', updatedAt: new Date().toISOString() } : r
          ),
        }));
        return null;
      },

      revokeConsent: async (teamId) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        await supabase.from('data_consent').delete().eq('team_id', teamId).eq('athlete_id', user.id);
        set((s) => ({ incomingRequests: s.incomingRequests.filter((r) => r.teamId !== teamId) }));
      },

      refreshConsents: async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Athlete: fetch incoming requests
        const { data: incoming } = await supabase
          .from('data_consent')
          .select('*, teams(name), coach:coach_id(raw_user_meta_data)')
          .eq('athlete_id', user.id);

        if (incoming) {
          const requests: ConsentRecord[] = incoming.map((r: any) => ({
            teamId: r.team_id,
            teamName: r.teams?.name ?? 'Unknown team',
            coachId: r.coach_id,
            coachName: r.coach?.raw_user_meta_data?.full_name ?? 'Coach',
            requested: r.requested_categories ?? [],
            approved: r.approved_categories ?? [],
            status: r.status ?? 'pending',
            updatedAt: r.updated_at,
          }));
          set({ incomingRequests: requests });
        }

        // Coach: fetch outgoing consents
        const { data: outgoing } = await supabase
          .from('data_consent')
          .select('*')
          .eq('coach_id', user.id);

        if (outgoing) {
          const consents: AthleteConsent[] = outgoing.map((r: any) => ({
            athleteId: r.athlete_id,
            teamId: r.team_id,
            requested: r.requested_categories ?? [],
            approved: r.approved_categories ?? [],
            status: r.status ?? 'pending',
          }));
          set({ outgoingConsents: consents });
        }
      },
    }),
    { name: 'velo-consents', storage: createJSONStorage(() => AsyncStorage) },
  ),
);
