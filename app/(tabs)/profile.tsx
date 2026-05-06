import { Alert, View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import {
  ChevronRight,
  Heart,
  Watch,
  Users,
  Bell,
  Shield,
  HelpCircle,
  Sun,
  RotateCcw,
} from 'lucide-react-native';

import { Screen } from '@/components/velo/Screen';
import { Text } from '@/components/velo/Text';
import { Card } from '@/components/velo/Card';
import { Colors, Spacing } from '@/constants/theme';
import { useUserStore } from '@/stores/userStore';
import { SPORT_LABEL } from '@/lib/constants';

export default function ProfileScreen() {
  const router = useRouter();
  const profile = useUserStore((s) => s.profile);
  const resetForDev = useUserStore((s) => s.resetForDev);

  const initial = profile.name?.[0]?.toUpperCase() ?? 'V';
  const sportLabel = profile.sport ? SPORT_LABEL[profile.sport] : 'Athlete';

  const handleReset = () => {
    Alert.alert(
      'Reset onboarding?',
      'For testing only. Clears your profile and sends you back to onboarding.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            resetForDev();
            router.replace('/');
          },
        },
      ],
    );
  };

  return (
    <Screen>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text variant="title" weight="bold" style={{ color: '#0a0a0a' }}>
            {initial}
          </Text>
        </View>
        <Text variant="display" weight="bold" style={{ marginTop: Spacing.md }}>
          {profile.name || sportLabel}
        </Text>
        <Text variant="body" color="muted">
          {sportLabel} · {profile.targets.calories} kcal/day
        </Text>
      </View>

      <Text variant="label" color="muted" style={styles.sectionLabel}>
        Today
      </Text>

      <SettingRow
        icon={<Sun size={20} color={Colors.dark.accent} strokeWidth={2} />}
        title="Wellness check-in"
        subtitle="Log sleep, energy, soreness"
        onPress={() => router.push('/wellness')}
      />

      <Text variant="label" color="muted" style={[styles.sectionLabel, { marginTop: Spacing.xl }]}>
        Connections
      </Text>

      <SettingRow
        icon={<Heart size={20} color={Colors.dark.accent} strokeWidth={2} />}
        title="Apple Health"
        subtitle="Coming soon"
      />
      <SettingRow
        icon={<Watch size={20} color={Colors.dark.textMuted} strokeWidth={2} />}
        title="Strava"
        subtitle="Coming soon"
      />
      <SettingRow
        icon={<Users size={20} color={Colors.dark.textMuted} strokeWidth={2} />}
        title="Join a team"
        subtitle="Coming soon"
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

      <Text variant="label" color="muted" style={[styles.sectionLabel, { marginTop: Spacing.xl }]}>
        Developer
      </Text>

      <SettingRow
        icon={<RotateCcw size={20} color={Colors.dark.danger} strokeWidth={2} />}
        title="Reset onboarding"
        subtitle="Clear profile and start over"
        onPress={handleReset}
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
  onPress,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  onPress?: () => void;
}) {
  return (
    <Card style={styles.row} onPress={onPress}>
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
