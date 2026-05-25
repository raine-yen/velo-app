import { useEffect, useMemo } from 'react';

import { generateInsight, InsightKind } from '@/lib/aiInsights';
import { summarizeForAI } from '@/lib/healthContext';
import { isoDate } from '@/lib/date';
import { insightKey, useAIInsightStore } from '@/stores/aiInsightStore';
import { useHealthStore } from '@/stores/healthStore';
import { useNutritionStore } from '@/stores/nutritionStore';
import { useUserStore } from '@/stores/userStore';
import { useWellnessStore } from '@/stores/wellnessStore';
import { useWorkoutStore } from '@/stores/workoutStore';

export function useVeloInsight(kind: InsightKind) {
  const profile = useUserStore((s) => s.profile);
  const health = useHealthStore((s) => s.snapshot);
  const meals = useNutritionStore((s) => s.meals);
  const workouts = useWorkoutStore((s) => s.workouts);
  const checkIns = useWellnessStore((s) => s.checkIns);
  const insights = useAIInsightStore((s) => s.insights);
  const loading = useAIInsightStore((s) => s.loading);
  const setInsight = useAIInsightStore((s) => s.setInsight);
  const setLoading = useAIInsightStore((s) => s.setLoading);
  const date = isoDate();
  const key = insightKey(date, kind);

  const context = useMemo(() => summarizeForAI({
    profile,
    health,
    meals,
    workouts,
    checkIn: checkIns[date] ?? null,
  }), [checkIns, date, health, meals, profile, workouts]);

  useEffect(() => {
    if (insights[key] || loading[key]) return;

    let cancelled = false;
    setLoading(date, kind, true);
    generateInsight(kind, context)
      .then((insight) => {
        if (!cancelled) setInsight(date, kind, insight);
      })
      .finally(() => {
        if (!cancelled) setLoading(date, kind, false);
      });

    return () => {
      cancelled = true;
    };
  }, [context, date, insights, key, kind, loading, setInsight, setLoading]);

  return {
    context,
    insight: insights[key] ?? null,
    loading: !!loading[key],
  };
}
