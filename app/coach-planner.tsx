import { useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { X, ChevronLeft, ChevronRight, Plus, Sparkles, Trash2, BookOpen } from 'lucide-react-native';

import { Card } from '@/components/velo/Card';
import { Text } from '@/components/velo/Text';
import { Button } from '@/components/velo/Button';
import { Spacing, Radius } from '@/constants/theme';
import { useColors } from '@/hooks/useColors';
import { usePlannerStore } from '@/stores/plannerStore';
import { useAuthStore } from '@/stores/authStore';
import { WORKOUT_LABEL } from '@/lib/constants';
import { PlannedWorkout, WorkoutType } from '@/types';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function getMondayOf(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function dateStr(d: Date): string { return d.toISOString().split('T')[0]; }

function addDays(d: Date, n: number): Date {
  const copy = new Date(d);
  copy.setDate(copy.getDate() + n);
  return copy;
}

const TYPE_COLORS: Record<WorkoutType, string> = {
  run: '#FF6B6B', ride: '#4ECDC4', swim: '#45B7D1', lift: '#96CEB4',
  crossfit: '#FFEAA7', sport: '#DDA0DD', walk: '#98D8C8', yoga: '#F0A500', other: '#B0B0B0',
};

export default function CoachPlannerScreen() {
  const router = useRouter();
  const colors = useColors();
  const { teamId, athleteId, athleteName } = useLocalSearchParams<{ teamId: string; athleteId?: string; athleteName?: string }>();
  const userId = useAuthStore((s) => s.user?.id ?? '');
  const getPlansForWeek = usePlannerStore((s) => s.getPlansForWeek);
  const removePlan = usePlannerStore((s) => s.removePlan);
  const templates = usePlannerStore((s) => s.templates);
  const applyTemplate = usePlannerStore((s) => s.applyTemplate);

  const [weekStart, setWeekStart] = useState(getMondayOf(new Date()));
  const weekLabel = `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${addDays(weekStart, 6).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;

  const plans = getPlansForWeek(teamId, dateStr(weekStart));
  const plansByDay = DAYS.map((_, i) => {
    const d = dateStr(addDays(weekStart, i));
    return plans.filter((p) => p.date === d && (athleteId ? (p.athleteId === athleteId || p.athleteId === null) : true));
  });

  const prevWeek = () => setWeekStart((w) => addDays(w, -7));
  const nextWeek = () => setWeekStart((w) => addDays(w, 7));

  const confirmDelete = (plan: PlannedWorkout) => {
    Alert.alert('Remove workout?', plan.title, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => removePlan(plan.id) },
    ]);
  };

  const useTemplate = () => {
    if (templates.length === 0) {
      Alert.alert('No templates', 'Generate a plan with AI and save it as a template first.');
      return;
    }
    Alert.alert('Apply template', 'Choose a template', [
      ...templates.map((t) => ({
        text: t.name,
        onPress: () => applyTemplate(t.id, dateStr(weekStart), teamId, athleteId ?? null, userId),
      })),
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable hitSlop={12} onPress={() => router.back()}><X size={24} color={colors.text} strokeWidth={2} /></Pressable>
        <Text variant="title" weight="semibold">{athleteName ? `${athleteName}'s plan` : 'Team plan'}</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Week navigator */}
      <View style={styles.weekNav}>
        <Pressable hitSlop={12} onPress={prevWeek}><ChevronLeft size={22} color={colors.text} strokeWidth={2} /></Pressable>
        <Text variant="body" weight="semibold">{weekLabel}</Text>
        <Pressable hitSlop={12} onPress={nextWeek}><ChevronRight size={22} color={colors.text} strokeWidth={2} /></Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.calendar}>
        {DAYS.map((day, i) => {
          const dayDate = addDays(weekStart, i);
          const isToday = dateStr(dayDate) === dateStr(new Date());
          const dayPlans = plansByDay[i];
          return (
            <View key={day} style={styles.dayRow}>
              <View style={styles.dayLabel}>
                <Text variant="label" color={isToday ? 'accent' : 'muted'}>{day}</Text>
                <Text variant="small" color={isToday ? 'accent' : 'dim'}>{dayDate.getDate()}</Text>
              </View>
              <View style={styles.dayContent}>
                {dayPlans.map((plan) => (
                  <Pressable key={plan.id} onLongPress={() => confirmDelete(plan)}>
                    <View style={[styles.planChip, { backgroundColor: (TYPE_COLORS[plan.type] ?? '#888') + '33', borderLeftColor: TYPE_COLORS[plan.type] ?? '#888' }]}>
                      <Text variant="small" weight="semibold" style={{ color: colors.text }}>{plan.title}</Text>
                      <Text variant="small" color="dim">{WORKOUT_LABEL[plan.type]} · {plan.durationMin}min · {plan.intensity}/10</Text>
                      {plan.description ? <Text variant="small" color="muted" numberOfLines={1}>{plan.description}</Text> : null}
                    </View>
                  </Pressable>
                ))}
                <Pressable style={styles.addDay} onPress={() =>
                  router.push(`/coach-plan-workout?teamId=${teamId}&athleteId=${athleteId ?? ''}&date=${dateStr(dayDate)}`)
                }>
                  <Plus size={14} color={colors.textDim} strokeWidth={2} />
                  <Text variant="small" color="dim">Add</Text>
                </Pressable>
              </View>
            </View>
          );
        })}
      </ScrollView>

      <View style={[styles.footer, { borderTopColor: colors.borderMuted }]}>
        <View style={styles.footerRow}>
          <Button label="AI Generate" icon={<Sparkles size={15} color="#0a0a0a" strokeWidth={2.5} />}
            onPress={() => router.push(`/coach-plan-ai?teamId=${teamId}&athleteId=${athleteId ?? ''}&weekStart=${dateStr(weekStart)}`)}
            style={{ flex: 1 }} />
          <Button label="Template" variant="secondary" icon={<BookOpen size={15} color={colors.text} strokeWidth={2} />}
            onPress={useTemplate} style={{ flex: 1 }} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md },
  weekNav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.lg, paddingBottom: Spacing.md },
  calendar: { paddingHorizontal: Spacing.lg, paddingBottom: 120 },
  dayRow: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.md, minHeight: 48 },
  dayLabel: { width: 36, alignItems: 'center', paddingTop: 2 },
  dayContent: { flex: 1, gap: 6 },
  planChip: { borderLeftWidth: 3, paddingLeft: Spacing.sm, paddingVertical: 6, borderRadius: Radius.sm },
  addDay: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 4, opacity: 0.5 },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: Spacing.lg, paddingTop: Spacing.md, paddingBottom: 28, borderTopWidth: 1, backgroundColor: 'transparent' },
  footerRow: { flexDirection: 'row', gap: Spacing.md },
});
