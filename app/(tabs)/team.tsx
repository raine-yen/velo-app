import { useEffect, useState } from 'react';
import { View, StyleSheet, Pressable, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Users, Plus, LogIn, Copy, Bell, ChevronRight, Calendar, Settings, ChevronDown, Check, LogOut } from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';

import { Screen } from '@/components/velo/Screen';
import { Text } from '@/components/velo/Text';
import { Card } from '@/components/velo/Card';
import { Button } from '@/components/velo/Button';
import { Spacing, Radius } from '@/constants/theme';
import { useColors } from '@/hooks/useColors';
import { useTeamStore, Team } from '@/stores/teamStore';
import { useConsentStore } from '@/stores/consentStore';
import { usePlannerStore } from '@/stores/plannerStore';
import { WORKOUT_LABEL } from '@/lib/constants';
import { WorkoutType } from '@/types';

const STATUS_COLORS: Record<string, string> = {
  healthy: '#4CAF50', sore: '#FF9800', injured: '#F44336',
};

// ─── Header (top-right team selector) ──────────────────────────────────────────

function TeamHeader({ teams, activeTeam, onSelect, onNew, onJoin, colors, role }: any) {
  const [open, setOpen] = useState(false);
  const hasMultiple = teams.length > 1;

  return (
    <View style={styles.headerWrap}>
      <View style={{ flex: 1 }}>
        <Text variant="label" color="muted">{role === 'coach' ? 'Coaching' : 'My team'}</Text>
        <Text variant="display" weight="bold" style={{ marginTop: 2 }}>{activeTeam.name}</Text>
        {activeTeam.description ? (
          <Text variant="small" color="muted" style={{ marginTop: 4 }} numberOfLines={1}>{activeTeam.description}</Text>
        ) : activeTeam.school ? (
          <Text variant="small" color="dim" style={{ marginTop: 4 }}>{activeTeam.school}</Text>
        ) : null}
      </View>

      {hasMultiple && (
        <Pressable onPress={() => setOpen(!open)} style={[styles.switcherButton, { backgroundColor: colors.surfaceElevated }]}>
          <Text variant="small" weight="semibold" numberOfLines={1} style={{ maxWidth: 90 }}>{activeTeam.name}</Text>
          <ChevronDown size={14} color={colors.textMuted} strokeWidth={2} />
        </Pressable>
      )}

      {open && hasMultiple && (
        <>
          <Pressable style={styles.dropdownOverlay} onPress={() => setOpen(false)} />
          <View style={[styles.dropdown, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
            {teams.map((t: Team) => {
              const active = t.id === activeTeam.id;
              return (
                <Pressable key={t.id} onPress={() => { onSelect(t.id); setOpen(false); }}
                  style={styles.dropdownRow}>
                  <View style={{ flex: 1 }}>
                    <Text variant="body" weight={active ? 'bold' : 'regular'}>{t.name}</Text>
                    <Text variant="small" color="dim">{t.myRole === 'coach' ? 'Coach' : 'Athlete'}</Text>
                  </View>
                  {active && <Check size={16} color={colors.accent} strokeWidth={2.5} />}
                </Pressable>
              );
            })}
            <View style={[styles.dropdownDivider, { backgroundColor: colors.border }]} />
            <Pressable onPress={() => { setOpen(false); onNew(); }} style={styles.dropdownRow}>
              <Plus size={14} color={colors.textMuted} strokeWidth={2} />
              <Text variant="body" color="muted">Create new team</Text>
            </Pressable>
            <Pressable onPress={() => { setOpen(false); onJoin(); }} style={styles.dropdownRow}>
              <LogIn size={14} color={colors.textMuted} strokeWidth={2} />
              <Text variant="body" color="muted">Join a team</Text>
            </Pressable>
          </View>
        </>
      )}
    </View>
  );
}

// ─── Main Screen ───────────────────────────────────────────────────────────────

export default function TeamScreen() {
  const router = useRouter();
  const colors = useColors();
  const teams = useTeamStore((s) => s.teams);
  const activeTeamId = useTeamStore((s) => s.activeTeamId);
  const setActiveTeam = useTeamStore((s) => s.setActiveTeam);
  const refreshTeams = useTeamStore((s) => s.refreshTeams);
  const activeTeam = teams.find((t) => t.id === activeTeamId) ?? teams[0];
  const incomingRequests = useConsentStore((s) => s.incomingRequests);
  const refreshConsents = useConsentStore((s) => s.refreshConsents);

  const [devRole, setDevRole] = useState<'coach' | 'athlete' | null>(null);

  useEffect(() => { refreshTeams(); refreshConsents(); }, []);
  useEffect(() => { setDevRole(null); }, [activeTeamId]);

  if (teams.length === 0) {
    return (
      <Screen>
        <View style={styles.emptyWrap}>
          <View style={[styles.emptyIcon, { backgroundColor: colors.surfaceElevated }]}>
            <Users size={32} color={colors.accent} strokeWidth={1.5} />
          </View>
          <Text variant="title" weight="bold" style={{ marginTop: Spacing.lg }}>No team yet</Text>
          <Text variant="body" color="muted" style={{ marginTop: Spacing.sm, textAlign: 'center', lineHeight: 22 }}>
            Create a team as a coach, or join one with a code from your coach.
          </Text>
          <Button label="Create a team" icon={<Plus size={18} color="#0a0a0a" strokeWidth={2.5} />}
            onPress={() => router.push('/team-create')} fullWidth style={{ marginTop: Spacing.xl }} />
          <Button label="Join a team" variant="secondary" icon={<LogIn size={18} color={colors.text} strokeWidth={2.5} />}
            onPress={() => router.push('/team-join')} fullWidth style={{ marginTop: Spacing.md }} />
        </View>
      </Screen>
    );
  }

  if (!activeTeam) return null;

  const effectiveRole = devRole ?? activeTeam.myRole;
  const devToggle = (
    <Pressable onPress={() => setDevRole(effectiveRole === 'coach' ? 'athlete' : 'coach')}
      style={[styles.devToggle, { backgroundColor: colors.surfaceElevated }]}>
      <Text variant="small" color="muted">DEV · </Text>
      <Text variant="small" weight="bold" color="accent">{effectiveRole}</Text>
      <Text variant="small" color="dim"> · tap to switch</Text>
    </Pressable>
  );

  const header = (
    <TeamHeader teams={teams} activeTeam={activeTeam} role={effectiveRole}
      onSelect={setActiveTeam} colors={colors}
      onNew={() => router.push('/team-create')}
      onJoin={() => router.push('/team-join')} />
  );

  if (effectiveRole === 'coach') {
    return <CoachDashboard team={activeTeam} colors={colors} router={router}
      header={header} devToggle={devToggle} />;
  }
  return <AthleteView team={activeTeam} colors={colors} router={router}
    header={header} devToggle={devToggle} incomingRequests={incomingRequests} />;
}

// ─── Coach Dashboard ───────────────────────────────────────────────────────────

function CoachDashboard({ team, colors, router, header, devToggle }: any) {
  const outgoingConsents = useConsentStore((s) => s.outgoingConsents);
  const athletes = team.members.filter((m: any) => m.role === 'athlete');

  const copyCode = async () => { await Clipboard.setStringAsync(team.code); };

  return (
    <Screen>
      {header}

      {/* Action row: edit team + join code */}
      <View style={styles.actionRow}>
        <Pressable onPress={() => router.push(`/team-edit?teamId=${team.id}`)}
          style={[styles.actionBtn, { backgroundColor: colors.surfaceElevated }]}>
          <Settings size={14} color={colors.textMuted} strokeWidth={2} />
          <Text variant="small" weight="semibold" color="muted">Edit team</Text>
        </Pressable>
        <Pressable onPress={copyCode}
          style={[styles.actionBtn, { backgroundColor: colors.surfaceElevated }]}>
          <Copy size={12} color={colors.textMuted} strokeWidth={2} />
          <Text variant="small" weight="bold" style={{ color: colors.accent, letterSpacing: 2 }}>{team.code}</Text>
        </Pressable>
      </View>

      {devToggle}

      {/* Squad */}
      <Text variant="label" color="muted" style={styles.sectionLabel}>
        Squad · {athletes.length} athlete{athletes.length !== 1 ? 's' : ''}
      </Text>
      {athletes.length === 0 ? (
        <Card>
          <Text variant="caption" color="dim">NO ATHLETES YET</Text>
          <Text variant="body" color="muted" style={{ marginTop: Spacing.sm }}>
            Share your join code and athletes will appear here once they join.
          </Text>
        </Card>
      ) : (
        athletes.map((m: any) => {
          const consent = outgoingConsents.find((c: any) => c.athleteId === m.userId && c.teamId === team.id);
          const statusColor = m.status ? STATUS_COLORS[m.status] : null;
          const hasData = consent?.status === 'responded';
          const consentLabel = !consent ? 'No data access' : consent.status === 'pending' ? 'Awaiting consent' : `${consent.approved.length} categories shared`;

          return (
            <Card key={m.userId} style={styles.athleteCard}
              onPress={() => router.push(`/athlete-detail?teamId=${team.id}&athleteId=${m.userId}&athleteName=${encodeURIComponent(m.name || 'Athlete')}`)}>
              <View style={styles.avatarWrap}>
                <View style={[styles.avatarRing, { borderColor: statusColor ?? colors.border }]}>
                  <View style={[styles.avatar, { backgroundColor: colors.surfaceElevated }]}>
                    <Text variant="body" weight="bold">{m.name?.[0]?.toUpperCase() ?? '?'}</Text>
                  </View>
                </View>
                {statusColor && <View style={[styles.statusDot, { backgroundColor: statusColor }]} />}
              </View>
              <View style={styles.athleteInfo}>
                <View style={styles.nameRow}>
                  <Text variant="body" weight="semibold">{m.name || 'Athlete'}</Text>
                  {m.position ? (
                    <View style={[styles.posTag, { backgroundColor: colors.surfaceElevated }]}>
                      <Text variant="small" weight="semibold" color="muted" style={{ fontSize: 10 }}>{m.position}</Text>
                    </View>
                  ) : null}
                </View>
                <Text variant="small" color={hasData ? 'accent' : 'dim'}>{consentLabel}</Text>
              </View>
              {hasData && m.readiness != null && (
                <View style={[styles.readinessBadge, {
                  backgroundColor: m.readiness >= 70 ? '#4CAF5022' : m.readiness >= 50 ? '#FF980022' : '#F4433622',
                }]}>
                  <Text variant="small" weight="bold" style={{
                    color: m.readiness >= 70 ? '#4CAF50' : m.readiness >= 50 ? '#FF9800' : '#F44336',
                  }}>{m.readiness}</Text>
                </View>
              )}
              <Pressable hitSlop={8} style={{ marginLeft: Spacing.xs }}
                onPress={(e: any) => { e.stopPropagation?.(); router.push(`/coach-planner?teamId=${team.id}&athleteId=${m.userId}&athleteName=${encodeURIComponent(m.name || 'Athlete')}`); }}>
                <Calendar size={18} color={colors.accent} strokeWidth={2} />
              </Pressable>
            </Card>
          );
        })
      )}

      {/* Team plan link */}
      <Pressable onPress={() => router.push(`/coach-planner?teamId=${team.id}`)}
        style={[styles.teamPlanBtn, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
        <Calendar size={18} color={colors.accent} strokeWidth={2} />
        <View style={{ flex: 1 }}>
          <Text variant="body" weight="semibold">Team-wide plan</Text>
          <Text variant="small" color="dim">Workouts everyone follows</Text>
        </View>
        <ChevronRight size={16} color={colors.textDim} strokeWidth={2} />
      </Pressable>
    </Screen>
  );
}

// ─── Athlete View ──────────────────────────────────────────────────────────────

function AthleteView({ team, colors, router, header, devToggle, incomingRequests }: any) {
  const request = incomingRequests.find((r: any) => r.teamId === team.id);
  const coach = team.members.find((m: any) => m.role === 'coach');
  const teammates = team.members.filter((m: any) => m.role === 'athlete');
  const leaveTeam = useTeamStore((s) => s.leaveTeam);
  const getPlansForAthlete = usePlannerStore((s) => s.getPlansForAthlete);
  const upcomingPlans = getPlansForAthlete(team.id);

  const confirmLeave = () => Alert.alert('Leave team?', '', [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Leave', style: 'destructive', onPress: () => leaveTeam(team.id) },
  ]);

  return (
    <Screen>
      {header}

      {devToggle}

      {/* Consent banner */}
      {request && (
        <Card style={[styles.banner, {
          borderColor: request.status === 'pending' ? colors.accent : colors.border,
          backgroundColor: request.status === 'pending' ? colors.accent + '11' : colors.surface,
        }]} onPress={() => router.push(`/consent?teamId=${team.id}`)}>
          <Bell size={18} color={request.status === 'pending' ? colors.accent : colors.textMuted} strokeWidth={2} />
          <View style={{ flex: 1 }}>
            <Text variant="body" weight="semibold">
              {request.status === 'pending' ? 'Data request from your coach' : 'Data sharing active'}
            </Text>
            <Text variant="small" color="muted">
              {request.status === 'pending' ? 'Tap to review what your coach wants to see' : `${request.approved.length} categor${request.approved.length !== 1 ? 'ies' : 'y'} shared · tap to manage`}
            </Text>
          </View>
          <ChevronRight size={16} color={colors.textDim} strokeWidth={2} />
        </Card>
      )}

      {/* Coach's plan */}
      {upcomingPlans.length > 0 && (
        <>
          <Text variant="label" color="muted" style={styles.sectionLabel}>Coach's plan</Text>
          {upcomingPlans.slice(0, 3).map((p: any) => {
            const workoutType = p.type as WorkoutType;

            return (
              <Card key={p.id} style={styles.planCard}>
                <Text variant="caption" color="accent">
                  {new Date(p.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }).toUpperCase()}
                </Text>
                <Text variant="title" style={{ marginTop: 2 }}>{p.title}</Text>
                <Text variant="body" color="muted" style={{ marginTop: Spacing.xs }}>
                  {WORKOUT_LABEL[workoutType]} · {p.durationMin} min · intensity {p.intensity}/10
                </Text>
                {p.description ? <Text variant="small" color="dim" style={{ marginTop: 2 }}>{p.description}</Text> : null}
              </Card>
            );
          })}
        </>
      )}

      {/* Coach */}
      {coach && (
        <>
          <Text variant="label" color="muted" style={styles.sectionLabel}>Coach</Text>
          <Card style={styles.coachCard}>
            <View style={[styles.avatar, { backgroundColor: colors.accent }]}>
              <Text variant="body" weight="bold" style={{ color: '#0a0a0a' }}>{coach.name?.[0]?.toUpperCase() ?? 'C'}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text variant="body" weight="semibold">{coach.name || 'Coach'}</Text>
              <Text variant="small" color="dim">{team.name}</Text>
            </View>
          </Card>
        </>
      )}

      {/* Teammates */}
      {teammates.length > 0 && (
        <>
          <Text variant="label" color="muted" style={[styles.sectionLabel, { marginTop: Spacing.xl }]}>
            Teammates · {teammates.length}
          </Text>
          <View style={styles.teammateGrid}>
            {teammates.map((m: any) => (
              <View key={m.userId} style={[styles.teammateChip, { backgroundColor: colors.surfaceElevated }]}>
                <View style={[styles.avatarSm, { backgroundColor: colors.surface }]}>
                  <Text variant="small" weight="bold">{m.name?.[0]?.toUpperCase() ?? '?'}</Text>
                </View>
                <Text variant="small" weight="semibold" numberOfLines={1}>{m.name || 'Athlete'}</Text>
                {m.position && <Text variant="small" color="dim" style={{ fontSize: 10 }}>· {m.position}</Text>}
              </View>
            ))}
          </View>
        </>
      )}

      <Pressable onPress={confirmLeave} style={styles.leaveBtn}>
        <LogOut size={14} color={colors.danger} strokeWidth={2} />
        <Text variant="small" color="danger">Leave team</Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: Spacing.xl },
  emptyIcon: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center' },

  headerWrap: { flexDirection: 'row', alignItems: 'flex-start', marginTop: Spacing.lg, marginBottom: Spacing.md, position: 'relative' },
  switcherButton: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: Spacing.sm, paddingVertical: 6, borderRadius: Radius.pill, marginTop: 4 },
  dropdownOverlay: { position: 'absolute', top: -1000, left: -1000, right: -1000, bottom: -1000, zIndex: 10 },
  dropdown: { position: 'absolute', top: 56, right: 0, minWidth: 220, borderRadius: Radius.lg, borderWidth: 1, paddingVertical: 4, zIndex: 20 },
  dropdownRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingHorizontal: Spacing.md, paddingVertical: 12 },
  dropdownDivider: { height: 1, marginVertical: 4 },

  actionRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: Radius.pill },

  devToggle: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 8, borderRadius: Radius.pill, marginBottom: Spacing.md },
  sectionLabel: { marginBottom: Spacing.md, marginTop: Spacing.sm },

  athleteCard: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.sm },
  avatarWrap: { position: 'relative' },
  avatarRing: { width: 48, height: 48, borderRadius: 24, borderWidth: 2, padding: 2, alignItems: 'center', justifyContent: 'center' },
  avatar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  statusDot: { position: 'absolute', bottom: 0, right: 0, width: 12, height: 12, borderRadius: 6, borderWidth: 2, borderColor: '#0a0a0a' },
  athleteInfo: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  posTag: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: Radius.sm },
  readinessBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: Radius.pill, minWidth: 36, alignItems: 'center' },

  teamPlanBtn: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, padding: Spacing.md, marginTop: Spacing.lg, borderRadius: Radius.lg, borderWidth: 1 },

  banner: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.lg, borderWidth: 1 },
  planCard: { marginBottom: Spacing.sm },
  coachCard: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  teammateGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  teammateChip: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: Radius.pill },
  avatarSm: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },

  leaveBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, marginTop: Spacing.xl, paddingVertical: Spacing.md },
});
