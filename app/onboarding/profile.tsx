import { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

import { OnboardingShell } from '@/components/velo/OnboardingShell';
import { Card } from '@/components/velo/Card';
import { NumberStepper } from '@/components/velo/NumberStepper';
import { Text } from '@/components/velo/Text';
import { SelectionCard } from '@/components/velo/SelectionCard';
import { Spacing } from '@/constants/theme';
import { useUserStore } from '@/stores/userStore';
import { Gender, Units } from '@/types';
import { cmToIn, inToCm, kgToLbs, lbsToKg } from '@/lib/nutrition';

export default function ProfileStep() {
  const router = useRouter();
  const profile = useUserStore((s) => s.profile);
  const setProfile = useUserStore((s) => s.setProfile);

  const [units, setUnits] = useState<Units>(profile.units);
  const [gender, setGender] = useState<Gender>(profile.gender);
  const [age, setAge] = useState(profile.age);
  // Internal store is metric. Display in chosen units.
  const [weightLbs, setWeightLbs] = useState(Math.round(kgToLbs(profile.weightKg)));
  const [weightKg, setWeightKg] = useState(profile.weightKg);
  const [heightIn, setHeightIn] = useState(Math.round(cmToIn(profile.heightCm)));
  const [heightCm, setHeightCm] = useState(profile.heightCm);

  const isMetric = units === 'metric';

  const next = () => {
    setProfile({
      gender,
      age,
      units,
      weightKg: isMetric ? weightKg : Math.round(lbsToKg(weightLbs)),
      heightCm: isMetric ? heightCm : Math.round(inToCm(heightIn)),
    });
    router.push('/onboarding/connect');
  };

  return (
    <OnboardingShell
      step={3}
      totalSteps={6}
      title="About you"
      subtitle="We use this to personalize your daily targets."
      primaryLabel="Continue"
      onPrimary={next}>
      <View style={styles.section}>
        <Text variant="label" color="muted" style={styles.label}>
          Gender
        </Text>
        <View style={styles.row}>
          {(['male', 'female', 'other'] as Gender[]).map((g) => (
            <View key={g} style={{ flex: 1 }}>
              <SelectionCard
                label={g === 'male' ? 'Male' : g === 'female' ? 'Female' : 'Other'}
                selected={gender === g}
                onPress={() => setGender(g)}
                compact
              />
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text variant="label" color="muted" style={styles.label}>
          Units
        </Text>
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <SelectionCard
              label="Imperial"
              description="lbs / in"
              selected={units === 'imperial'}
              onPress={() => setUnits('imperial')}
            />
          </View>
          <View style={{ flex: 1 }}>
            <SelectionCard
              label="Metric"
              description="kg / cm"
              selected={units === 'metric'}
              onPress={() => setUnits('metric')}
            />
          </View>
        </View>
      </View>

      <Card style={{ marginTop: Spacing.lg }}>
        <NumberStepper
          label="Age"
          value={age}
          onChange={setAge}
          min={13}
          max={90}
          suffix="yrs"
        />
        {isMetric ? (
          <>
            <NumberStepper
              label="Weight"
              value={weightKg}
              onChange={setWeightKg}
              min={30}
              max={200}
              suffix="kg"
            />
            <NumberStepper
              label="Height"
              value={heightCm}
              onChange={setHeightCm}
              min={120}
              max={230}
              suffix="cm"
            />
          </>
        ) : (
          <>
            <NumberStepper
              label="Weight"
              value={weightLbs}
              onChange={setWeightLbs}
              min={70}
              max={400}
              suffix="lbs"
            />
            <NumberStepper
              label="Height"
              value={heightIn}
              onChange={setHeightIn}
              min={48}
              max={90}
              suffix="in"
            />
          </>
        )}
      </Card>
    </OnboardingShell>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: Spacing.lg,
  },
  label: {
    marginBottom: Spacing.sm,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
});
