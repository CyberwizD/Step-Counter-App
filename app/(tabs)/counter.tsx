import { Pedometer } from 'expo-sensors';
import { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function CounterScreen() {
  const [steps, setSteps] = useState(0);
  const [isPedometerAvailable, setIsPedometerAvailable] = useState<boolean | null>(null);

  useEffect(() => {
    const checkPedometerAvailability = async () => {
      const isAvailable = await Pedometer.isAvailableAsync();
      setIsPedometerAvailable(isAvailable);
    };

    checkPedometerAvailability();
  }, []);

  useEffect(() => {
    let subscription: ReturnType<typeof Pedometer.watchStepCount> | null = null;
    if (isPedometerAvailable) {
      subscription = Pedometer.watchStepCount((result) => {
        setSteps(result.steps);
      });
    }

    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, [isPedometerAvailable]);

  if (isPedometerAvailable === null) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Checking pedometer availability...</ThemedText>
      </ThemedView>
    );
  }

  if (!isPedometerAvailable) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Pedometer is not available on this device.</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="subtitle" style={styles.subtitle}>
        Keep moving to increase your step count!
      </ThemedText>
      <ThemedText type="title">Steps Counted</ThemedText>
      <ThemedText style={styles.steps}>{steps}</ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  steps: {
    fontSize: 30,
    fontWeight: 'bold',
    marginTop: 20,
  },
  subtitle: {
    fontSize: 16,
    marginTop: 10,
    marginBottom: 10,
  },
});

