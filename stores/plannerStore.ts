import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { supabase } from '@/lib/supabase';
import { PlannedWorkout, WeekTemplate, WorkoutType } from '@/types';
import { uid } from '@/lib/date';

type PlannerState = {
  plans: PlannedWorkout[];
  templates: WeekTemplate[];

  addPlan: (plan: Omit<PlannedWorkout, 'id'>) => Promise<void>;
  updatePlan: (id: string, data: Partial<PlannedWorkout>) => Promise<void>;
  removePlan: (id: string) => Promise<void>;

  saveTemplate: (name: string, days: WeekTemplate['days']) => void;
  deleteTemplate: (id: string) => void;
  applyTemplate: (templateId: string, weekStart: string, teamId: string, athleteId: string | null, coachId: string) => Promise<void>;

  getPlansForWeek: (teamId: string, weekStart: string) => PlannedWorkout[];
  getPlansForAthlete: (athleteId: string) => PlannedWorkout[];
  refreshPlans: (teamId: string) => Promise<void>;
};

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

export const usePlannerStore = create<PlannerState>()(
  persist(
    (set, get) => ({
      plans: [],
      templates: [],

      addPlan: async (plan) => {
        const newPlan: PlannedWorkout = { id: uid(), ...plan };
        set((s) => ({ plans: [...s.plans, newPlan] }));
        await supabase.from('planned_workouts').insert({
          id: newPlan.id,
          team_id: newPlan.teamId,
          athlete_id: newPlan.athleteId,
          date: newPlan.date,
          type: newPlan.type,
          title: newPlan.title,
          description: newPlan.description,
          duration_min: newPlan.durationMin,
          intensity: newPlan.intensity,
          created_by: newPlan.createdBy,
        });
      },

      updatePlan: async (id, data) => {
        set((s) => ({ plans: s.plans.map((p) => p.id === id ? { ...p, ...data } : p) }));
        const updates: any = {};
        if (data.date) updates.date = data.date;
        if (data.title) updates.title = data.title;
        if (data.description !== undefined) updates.description = data.description;
        if (data.durationMin) updates.duration_min = data.durationMin;
        if (data.intensity) updates.intensity = data.intensity;
        if (data.type) updates.type = data.type;
        if (Object.keys(updates).length) await supabase.from('planned_workouts').update(updates).eq('id', id);
      },

      removePlan: async (id) => {
        set((s) => ({ plans: s.plans.filter((p) => p.id !== id) }));
        await supabase.from('planned_workouts').delete().eq('id', id);
      },

      saveTemplate: (name, days) => {
        const t: WeekTemplate = { id: uid(), name, days };
        set((s) => ({ templates: [...s.templates, t] }));
      },

      deleteTemplate: (id) => set((s) => ({ templates: s.templates.filter((t) => t.id !== id) })),

      applyTemplate: async (templateId, weekStart, teamId, athleteId, coachId) => {
        const t = get().templates.find((t) => t.id === templateId);
        if (!t) return;
        for (const day of t.days) {
          await get().addPlan({
            teamId, athleteId, createdBy: coachId,
            date: addDays(weekStart, day.dayIndex),
            type: day.type,
            title: day.title,
            description: day.description,
            durationMin: day.durationMin,
            intensity: day.intensity,
          });
        }
      },

      getPlansForWeek: (teamId, weekStart) => {
        const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
        return get().plans.filter((p) => p.teamId === teamId && days.includes(p.date));
      },

      getPlansForAthlete: (athleteId) => {
        const today = new Date().toISOString().split('T')[0];
        return get().plans.filter((p) => (p.athleteId === athleteId || p.athleteId === null) && p.date >= today)
          .sort((a, b) => a.date.localeCompare(b.date));
      },

      refreshPlans: async (teamId) => {
        const { data } = await supabase.from('planned_workouts').select('*').eq('team_id', teamId).order('date');
        if (!data) return;
        const plans: PlannedWorkout[] = data.map((r: any) => ({
          id: r.id, teamId: r.team_id, athleteId: r.athlete_id,
          date: r.date, type: r.type as WorkoutType,
          title: r.title, description: r.description,
          durationMin: r.duration_min, intensity: r.intensity,
          createdBy: r.created_by,
        }));
        set((s) => ({
          plans: [...s.plans.filter((p) => p.teamId !== teamId), ...plans],
        }));
      },
    }),
    { name: 'velo-planner', storage: createJSONStorage(() => AsyncStorage) },
  ),
);
