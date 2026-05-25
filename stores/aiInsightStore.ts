import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { InsightKind, VeloInsight } from '@/lib/aiInsights';

type InsightState = {
  insights: Record<string, VeloInsight>;
  loading: Record<string, boolean>;
  setInsight: (date: string, kind: InsightKind, insight: VeloInsight) => void;
  setLoading: (date: string, kind: InsightKind, loading: boolean) => void;
};

export function insightKey(date: string, kind: InsightKind) {
  return `${date}:${kind}`;
}

export const useAIInsightStore = create<InsightState>()(
  persist(
    (set) => ({
      insights: {},
      loading: {},
      setInsight: (date, kind, insight) => set((state) => ({
        insights: { ...state.insights, [insightKey(date, kind)]: insight },
      })),
      setLoading: (date, kind, loading) => set((state) => ({
        loading: { ...state.loading, [insightKey(date, kind)]: loading },
      })),
    }),
    {
      name: 'velo-ai-insights',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ insights: state.insights, loading: {} }),
    },
  ),
);
