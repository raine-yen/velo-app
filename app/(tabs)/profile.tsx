import { Alert, View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronRight, Heart, Watch, Users, Bell, Shield, HelpCircle, Sun, RotateCcw, Moon, LogOut } from 'lucide-react-native';

import { Screen } from '@/components/velo/Screen';
import { Text } from '@/components/velo/Text';
import { Card } from '@/components/velo/Card';
import { Spacing } from '@/constants/theme';
import { useColors } from '@/hooks/useColors';
import { useThemeStore } from '@/stores/themeStore';
import { useUserStore } from '@/stores/userStore';
import { useAuthStore } from '@/stores/authStore';
import { SPORT_LABEL } from '@/lib/constants';

export default function ProfileScreen() {
  const router = useRouter();
  const colors = useColors();
  const profile = useUserStore((s) => s.profile);
  const resetForDev = useUserStore((s) => s.resetForDev);
  const isDark = useThemeStore((s) => s.isDark);
  const toggle = useThemeStore((s) => s.toggle);
  const signOut = useAuthStore((s) => s.signOut);
  const userEmail = useAuthStore((s) => s.user?.email ?? '');

  const initial = profile.name?.[0]?.toUpperCase() ?? 'V';
  const sportLabel = profile.sport ? SPORT_LABEL[profile.sport] : 'Athlete';

  const handleReset = () => {
    Alert.alert('Reset onboarding?', 'Clears your profile and sends you back to onboarding.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Reset', style: 'destructive', onPress: () => { resetForDev(); router.replace('/'); } },
    ]);
  };

  return (
    <Screen>
      <View style={styles.header}>
        <View style={[styles.avatar, { backgroundColor: colors.accent }]}>
          <Text variant="title" weight="bold" style={{ color: '#0a0a0a' }}>{initial}</Text>
        </View>
        <Text variant="display" weight="bold" style={{ marginTop: Spacing.md }}>
          {profile.name || sportLabel}
        </Text>
        <Text variant="body" color="muted">{sportLabel} · {profile.targets.calories} kcal/day</Text>
        {userEmail ? <Text variant="small" color="dim" style={{ marginTop: 2 }}>{userEmail}</Text> : null}
      </View>

      <Text variant="label" color="muted" style={styles.sectionLabel}>Today</Text>
      <SettingRow icon={<Sun size={20} color={colors.accent} strokeWidth={2} />}
        title="Wellness check-in" subtitle="Log sleep, energy, soreness"
        colors={colors} onPress={() => router.push('/wellness')} />

      <Text variant="label" color="muted" style={[styles.sectionLabel, { marginTop: Spacing.xl }]}>Appearance</Text>
      <SettingRow
        icon={isDark ? <Moon size={20} color={colors.accent} strokeWidth={2} /> : <Sun size={20} color={colors.accent} strokeWidth={2} />}
        title={isDark ? 'Dark mode' : 'Light mode'}
        subtitle="Tap to switch"
        colors={colors}
        onPress={toggle}
        trailing={
          <View style={[styles.toggle, { backgroundColor: isDark ? colors.accent : colors.border }]}>
            <View style={[styles.toggleThumb, { transform: [{ translateX: isDark ? 20 : 2 }], backgroundColor: isDark ? '#0a0a0a' : colors.textMuted }]} />
          </View>
        }
      />

      <Text variant="label" color="muted" style={[styles.sectionLabel, { marginTop: Spacing.xl }]}>Connections</Text>
      <SettingRow icon={<Heart size={20} color={colors.accent} strokeWidth={2} />} title="Apple Health" subtitle="Coming soon" colors={colors} />
      <SettingRow icon={<Watch size={20} color={colors.textMuted} strokeWidth={2} />} title="Strava" subtitle="Coming soon" colors={colors} />
      <SettingRow icon={<Users size={20} color={colors.textMuted} strokeWidth={2} />} title="Join a team" subtitle="Coming soon" colors={colors} />

      <Text variant="label" color="muted" style={[styles.sectionLabel, { marginTop: Spacing.xl }]}>Preferences</Text>
      <SettingRow icon={<Bell size={20} color={colors.textMuted} strokeWidth={2} />} title="Notifications" subtitle="Reminders, summaries" colors={colors} />
      <SettingRow icon={<Shield size={20} color={colors.textMuted} strokeWidth={2} />} title="Privacy" subtitle="Data & permissions" colors={colors} />
      <SettingRow icon={<HelpCircle size={20} color={colors.textMuted} strokeWidth={2} />} title="Help" subtitle="Support, FAQ" colors={colors} />

      <Text variant="label" color="muted" style={[styles.sectionLabel, { marginTop: Spacing.xl }]}>Account</Text>
      <SettingRow icon={<LogOut size={20} color={colors.danger} strokeWidth={2} />}
        title="Sign out" subtitle={userEmail} colors={colors}
        onPress={() => Alert.alert('Sign out?', '', [{ text: 'Cancel', style: 'cancel' }, { text: 'Sign out', style: 'destructive', onPress: signOut }])} />

      <Text variant="label" color="muted" style={[styles.sectionLabel, { marginTop: Spacing.xl }]}>Developer</Text>
      <SettingRow icon={<RotateCcw size={20} color={colors.danger} strokeWidth={2} />}
        title="Reset onboarding" subtitle="Clear profile and start over" colors={colors} onPress={handleReset} />

      <View style={styles.footer}>
        <Text variant="caption" color="dim">Velo v0.1.0 · Early access</Text>
      </View>
    </Screen>
  );
}

function SettingRow({ icon, title, subtitle, colors, onPress, trailing }: {
  icon: React.ReactNode; title: string; subtitle: string;
  colors: ReturnType<typeof useColors>; onPress?: () => void; trailing?: React.ReactNode;
}) {
  return (
    <Card style={styles.row} onPress={onPress}>
      <View style={[styles.iconWrap, { backgroundColor: colors.surfaceElevated }]}>{icon}</View>
      <View style={styles.content}>
        <Text variant="body" weight="semibold">{title}</Text>
        <Text variant="small" color="dim">{subtitle}</Text>
      </View>
      {trailing ?? <ChevronRight size={18} color={colors.textDim} strokeWidth={2} />}
    </Card>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: 'center', paddingTop: Spacing.xl, paddingBottom: Spacing.xl },
  avatar: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center' },
  sectionLabel: { marginBottom: Spacing.md },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.sm },
  iconWrap: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  content: { flex: 1 },
  footer: { alignItems: 'center', paddingVertical: Spacing.xl },
  toggle: { width: 44, height: 26, borderRadius: 13, justifyContent: 'center' },
  toggleThumb: { width: 20, height: 20, borderRadius: 10 },
});
