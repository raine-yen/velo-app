import { useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { X, Trash2 } from 'lucide-react-native';

import { Button } from '@/components/velo/Button';
import { Card } from '@/components/velo/Card';
import { Text } from '@/components/velo/Text';
import { Spacing, Radius } from '@/constants/theme';
import { useColors } from '@/hooks/useColors';
import { useTeamStore } from '@/stores/teamStore';
import { SPORTS } from '@/lib/constants';

const POSITIONS_BY_SPORT: Record<string, string[]> = {
  running:       ['Sprinter', 'Mid-distance', 'Distance', 'Hurdles'],
  cross_country: ['Varsity', 'JV', 'Open'],
  track:         ['Sprints', 'Mid-distance', 'Distance', 'Hurdles', 'Jumps', 'Throws'],
  cycling:       ['Sprinter', 'Climber', 'TT', 'All-rounder'],
  swimming:      ['Sprint', 'Mid', 'Distance', 'IM', 'Sprint freestyle', 'Backstroke', 'Breaststroke', 'Butterfly'],
  triathlon:     ['Sprint', 'Olympic', '70.3', 'Ironman'],
  soccer:        ['GK', 'CB', 'FB', 'CDM', 'CM', 'CAM', 'W', 'ST'],
  basketball:    ['PG', 'SG', 'SF', 'PF', 'C'],
  football:      ['QB', 'RB', 'WR', 'TE', 'OL', 'DL', 'LB', 'DB', 'K'],
  baseball:      ['P', 'C', '1B', '2B', '3B', 'SS', 'LF', 'CF', 'RF'],
  tennis:        ['Singles', 'Doubles'],
  volleyball:    ['OH', 'MB', 'OPP', 'S', 'L', 'DS'],
  hockey:        ['G', 'D', 'C', 'LW', 'RW'],
  wrestling:     ['Lightweight', 'Middleweight', 'Heavyweight'],
  crossfit:      ['Rx', 'Scaled', 'Masters'],
  lifting:       ['Powerlifter', 'Olympic', 'Bodybuilder'],
  other:         [],
};

export default function TeamEditScreen() {
  const router = useRouter();
  const colors = useColors();
  const { teamId } = useLocalSearchParams<{ teamId: string }>();
  const team = useTeamStore((s) => s.teams.find((t) => t.id === teamId));
  const updateTeam = useTeamStore((s) => s.updateTeam);
  const setMemberPosition = useTeamStore((s) => s.setMemberPosition);
  const leaveTeam = useTeamStore((s) => s.leaveTeam);

  const [name, setName] = useState(team?.name ?? '');
  const [description, setDescription] = useState(team?.description ?? '');
  const [school, setSchool] = useState(team?.school ?? '');
  const [season, setSeason] = useState(team?.season ?? '');
  const [sport, setSport] = useState(team?.sport ?? 'other');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  if (!team) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <Pressable hitSlop={12} onPress={() => router.back()}><X size={24} color={colors.text} strokeWidth={2} /></Pressable>
          <Text variant="title" weight="semibold">Edit team</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text color="muted">Team not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const positions = POSITIONS_BY_SPORT[sport] ?? [];
  const athletes = team.members.filter((m) => m.role === 'athlete');

  const save = async () => {
    if (!name.trim()) return;
    setSaving(true);
    const err = await updateTeam(team.id, {
      name: name.trim(),
      description: description.trim(),
      school: school.trim(),
      season: season.trim(),
      sport,
    });
    setSaving(false);
    if (err) setError(err);
    else router.back();
  };

  const setPosition = (userId: string, pos: string) => {
    setMemberPosition(team.id, userId, pos);
  };

  const confirmDelete = () => Alert.alert('Delete team?', 'This will remove all athletes and plans permanently.', [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Delete', style: 'destructive', onPress: async () => { await leaveTeam(team.id); router.back(); } },
  ]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable hitSlop={12} onPress={() => router.back()}><X size={24} color={colors.text} strokeWidth={2} /></Pressable>
        <Text variant="title" weight="semibold">Edit team</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
        {/* Team info */}
        <Text variant="label" color="muted" style={styles.section}>Team name</Text>
        <TextInput style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
          value={name} onChangeText={setName} placeholder="Team name" placeholderTextColor={colors.textDim} />

        <Text variant="label" color="muted" style={styles.section}>Description</Text>
        <TextInput style={[styles.input, styles.multilineInput, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
          value={description} onChangeText={setDescription}
          placeholder="What is this team about?" placeholderTextColor={colors.textDim}
          multiline numberOfLines={3} />

        <View style={styles.row2}>
          <View style={{ flex: 1 }}>
            <Text variant="label" color="muted" style={styles.section}>School / org</Text>
            <TextInput style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
              value={school} onChangeText={setSchool} placeholder="Optional" placeholderTextColor={colors.textDim} />
          </View>
          <View style={{ flex: 1 }}>
            <Text variant="label" color="muted" style={styles.section}>Season</Text>
            <TextInput style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
              value={season} onChangeText={setSeason} placeholder="e.g. Spring 2026" placeholderTextColor={colors.textDim} />
          </View>
        </View>

        <Text variant="label" color="muted" style={styles.section}>Sport</Text>
        <View style={styles.chipRow}>
          {SPORTS.map((s) => (
            <Pressable key={s.id} onPress={() => setSport(s.id)}
              style={[styles.chip, { backgroundColor: colors.surface, borderColor: colors.border },
                sport === s.id && { backgroundColor: colors.accent, borderColor: colors.accent }]}>
              <Text variant="small" weight="semibold" style={{ color: sport === s.id ? '#0a0a0a' : colors.text }}>{s.label}</Text>
            </Pressable>
          ))}
        </View>

        {/* Roster */}
        {athletes.length > 0 && (
          <>
            <Text variant="label" color="muted" style={[styles.section, { marginTop: Spacing.xl }]}>
              Roster · {athletes.length}
            </Text>
            {athletes.map((m) => (
              <Card key={m.userId} style={styles.athleteRow}>
                <View style={[styles.avatar, { backgroundColor: colors.surfaceElevated }]}>
                  <Text variant="body" weight="bold">{m.name?.[0]?.toUpperCase() ?? '?'}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text variant="body" weight="semibold">{m.name || 'Athlete'}</Text>
                  {positions.length > 0 ? (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}
                      contentContainerStyle={{ gap: Spacing.xs, marginTop: 6 }}>
                      {positions.map((p) => {
                        const active = m.position === p;
                        return (
                          <Pressable key={p} onPress={() => setPosition(m.userId, active ? '' : p)}
                            style={[styles.posChip, {
                              backgroundColor: active ? colors.accent : colors.surfaceElevated,
                              borderColor: active ? colors.accent : colors.border,
                            }]}>
                            <Text variant="small" weight="semibold"
                              style={{ color: active ? '#0a0a0a' : colors.textMuted, fontSize: 11 }}>
                              {p}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </ScrollView>
                  ) : (
                    <Text variant="small" color="dim">No positions for this sport</Text>
                  )}
                </View>
              </Card>
            ))}
          </>
        )}

        {error ? <Text variant="small" color="danger" style={{ marginTop: Spacing.md }}>{error}</Text> : null}

        {/* Danger zone */}
        <Pressable onPress={confirmDelete} style={styles.deleteBtn}>
          <Trash2 size={14} color={colors.danger} strokeWidth={2} />
          <Text variant="small" color="danger">Delete team</Text>
        </Pressable>
      </ScrollView>

      <View style={[styles.footer, { borderTopColor: colors.borderMuted }]}>
        <Button label={saving ? 'Saving…' : 'Save changes'} onPress={save} fullWidth
          style={saving || !name.trim() ? { opacity: 0.5 } : undefined} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md },
  body: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xl },
  section: { marginTop: Spacing.lg, marginBottom: Spacing.sm },
  input: { borderWidth: 1, borderRadius: Radius.lg, paddingHorizontal: Spacing.md, paddingVertical: 14, fontSize: 15 },
  multilineInput: { minHeight: 70, textAlignVertical: 'top' },
  row2: { flexDirection: 'row', gap: Spacing.md },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  chip: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: Radius.pill, borderWidth: 1 },
  athleteRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.sm },
  avatar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  posChip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.pill, borderWidth: 1 },
  deleteBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, marginTop: Spacing.xl, paddingVertical: Spacing.md },
  footer: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.md, paddingBottom: Spacing.md, borderTopWidth: 1 },
});
