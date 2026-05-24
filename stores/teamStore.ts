import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { supabase } from '@/lib/supabase';

export type TeamRole = 'coach' | 'athlete';

export type TeamMember = {
  userId: string;
  name: string;
  role: TeamRole;
  position?: string;
};

export type Team = {
  id: string;
  name: string;
  code: string;
  myRole: TeamRole;
  members: TeamMember[];
  description?: string;
  sport?: string;
  season?: string;
  school?: string;
};

type TeamState = {
  teams: Team[];
  activeTeamId: string | null;
  createTeam: (name: string) => Promise<string | null>;
  joinTeam: (code: string) => Promise<string | null>;
  leaveTeam: (teamId: string) => Promise<void>;
  renameTeam: (teamId: string, name: string) => Promise<string | null>;
  updateTeam: (teamId: string, fields: Partial<Pick<Team, 'name' | 'description' | 'sport' | 'season' | 'school'>>) => Promise<string | null>;
  setMemberPosition: (teamId: string, userId: string, position: string) => Promise<string | null>;
  setActiveTeam: (id: string) => void;
  setTeams: (teams: Team[]) => void;
  refreshTeams: () => Promise<void>;
};

export const useTeamStore = create<TeamState>()(
  persist(
    (set, get) => ({
      teams: [],
      activeTeamId: null,

      createTeam: async (name) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return 'Not signed in';

        const code = Math.random().toString(36).slice(2, 8).toUpperCase();

        const { data: team, error } = await supabase
          .from('teams')
          .insert({ name, code, created_by: user.id })
          .select()
          .single();
        if (error) return error.message;

        await supabase.from('team_members').insert({ team_id: team.id, user_id: user.id, role: 'coach' });

        const newTeam: Team = { id: team.id, name: team.name, code: team.code, myRole: 'coach', members: [] };
        set((s) => ({ teams: [...s.teams, newTeam], activeTeamId: team.id }));
        return null;
      },

      joinTeam: async (code) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return 'Not signed in';

        const { data: team, error } = await supabase
          .from('teams')
          .select('*')
          .eq('code', code.toUpperCase())
          .single();
        if (error || !team) return 'Team not found — check the code';

        const already = get().teams.find((t) => t.id === team.id);
        if (already) return 'You already belong to this team';

        const { error: joinError } = await supabase
          .from('team_members')
          .insert({ team_id: team.id, user_id: user.id, role: 'athlete' });
        if (joinError) return joinError.message;

        const newTeam: Team = { id: team.id, name: team.name, code: team.code, myRole: 'athlete', members: [] };
        set((s) => ({ teams: [...s.teams, newTeam], activeTeamId: s.activeTeamId ?? team.id }));
        return null;
      },

      leaveTeam: async (teamId) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) await supabase.from('team_members').delete().eq('team_id', teamId).eq('user_id', user.id);
        set((s) => {
          const teams = s.teams.filter((t) => t.id !== teamId);
          return { teams, activeTeamId: teams[0]?.id ?? null };
        });
      },

      renameTeam: async (teamId, name) => {
        const { error } = await supabase.from('teams').update({ name }).eq('id', teamId);
        if (error) return error.message;
        set((s) => ({ teams: s.teams.map((t) => t.id === teamId ? { ...t, name } : t) }));
        return null;
      },

      updateTeam: async (teamId, fields) => {
        const { error } = await supabase.from('teams').update(fields).eq('id', teamId);
        if (error) return error.message;
        set((s) => ({ teams: s.teams.map((t) => t.id === teamId ? { ...t, ...fields } : t) }));
        return null;
      },

      setMemberPosition: async (teamId, userId, position) => {
        const { error } = await supabase.from('team_members').update({ position }).eq('team_id', teamId).eq('user_id', userId);
        if (error) return error.message;
        set((s) => ({
          teams: s.teams.map((t) => t.id !== teamId ? t : {
            ...t,
            members: t.members.map((m) => m.userId === userId ? { ...m, position } : m),
          }),
        }));
        return null;
      },

      setActiveTeam: (id) => set({ activeTeamId: id }),
      setTeams: (teams) => set({ teams }),

      refreshTeams: async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: memberships } = await supabase
          .from('team_members')
          .select('role, teams(id, name, code)')
          .eq('user_id', user.id);
        if (!memberships) return;

        const teams: Team[] = memberships.map((m: any) => ({
          id: m.teams.id,
          name: m.teams.name,
          code: m.teams.code,
          myRole: m.role as TeamRole,
          members: [],
        }));
        set((s) => ({ teams, activeTeamId: s.activeTeamId ?? teams[0]?.id ?? null }));
      },
    }),
    { name: 'velo-teams', storage: createJSONStorage(() => AsyncStorage) },
  ),
);
