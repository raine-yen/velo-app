import { View, StyleSheet } from 'react-native';
import { ChevronRight, Heart, Watch, Users, Bell, Shield, HelpCircle } from 'lucide-react-native';

import { Screen } from '@/components/velo/Screen';
import { Text } from '@/components/velo/Text';
import { Card } from '@/components/velo/Card';
import { Colors, Spacing } from '@/constants/theme';

export default function ProfileScreen() {
  return (
    <Screen>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text variant="title" weight="bold" style={{ color: '#0a0a0a' }}>
            A
          </Text>
        </View>
        <Text variant="display" weight="bold" style={{ marginTop: Spacing.md }}>
          Athlete
        </Text>
        <Text variant="body" color="muted">
          Setup your profile to personalize Velo
        </Text>
      </View>

      <Text variant="label" color="muted" style={styles.sectionLabel}>
        Connections
      </Text>

      <SettingRow
        icon={<Heart size={20} color={Colors.dark.accent} strokeWidth={2} />}
        title="Apple Health"
        subtitle="Not connected"
      />
      <SettingRow
        icon={<Watch size={20} color={Colors.dark.textMuted} strokeWidth={2} />}
        title="Strava"
        subtitle="Not connected"
      />
      <SettingRow
        icon={<Users size={20} color={Colors.dark.textMuted} strokeWidth={2} />}
        title="Join a team"
        subtitle="Enter coach invite code"
      />

      <Text variant="label" color="muted" style={[styles.sectionLabel, { marginTop: Spacing.xl }]}>
        Preferences
      </Text>

      <SettingRow
        icon={<Bell size={20} color={Colors.dark.textMuted} strokeWidth={2} />}
        title="Notifications"
        subtitle="Reminders, summaries"
      />
      <SettingRow
        icon={<Shield size={20} color={Colors.dark.textMuted} strokeWidth={2} />}
        title="Privacy"
        subtitle="Data & permissions"
      />
      <SettingRow
        icon={<HelpCircle size={20} color={Colors.dark.textMuted} strokeWidth={2} />}
        title="Help"
        subtitle="Support, FAQ"
      />

      <View style={styles.footer}>
        <Text variant="caption" color="dim">
          Velo v0.1.0 · Early access
        </Text>
      </View>
    </Screen>
  );
}

function SettingRow({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <Card style={styles.row} onPress={() => {}}>
      <View style={styles.iconWrap}>{icon}</View>
      <View style={styles.content}>
        <Text variant="body" weight="semibold">
          {title}
        </Text>
        <Text variant="small" color="dim">
          {subtitle}
        </Text>
      </View>
      <ChevronRight size={18} color={Colors.dark.textDim} strokeWidth={2} />
    </Card>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xl,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.dark.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionLabel: {
    marginBottom: Spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.sm,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.dark.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
});
