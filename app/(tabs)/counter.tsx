import { Pedometer } from 'expo-sensors';
import { useEffect, useState } from 'react';
import { Platform, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function CounterScreen() {
  const [steps, setSteps] = useState(0);
  const [pastSteps, setPastSteps] = useState<number | null>(null);
  const [isPedometerAvailable, setIsPedometerAvailable] = useState<boolean | null>(null);
  const [status, setStatus] = useState('Initializing...');

  useEffect(() => {
    const init = async () => {
      try {
        // Request permission on Android
        if (Platform.OS === 'android') {
          const { status: permStatus } = await Pedometer.requestPermissionsAsync();
          if (permStatus !== 'granted') {
            setStatus('Permission denied');
            setIsPedometerAvailable(false);
            return;
          }
        }

        const isAvailable = await Pedometer.isAvailableAsync();
        setIsPedometerAvailable(isAvailable);

        if (isAvailable) {
          setStatus('Pedometer active — walk to count steps!');

          // Get past 24 hours of step data as proof it works
          const end = new Date();
          const start = new Date();
          start.setDate(end.getDate() - 1);

          try {
            const pastResult = await Pedometer.getStepCountAsync(start, end);
            setPastSteps(pastResult.steps);
          } catch {
            setPastSteps(null); // Not supported on all devices
          }
        } else {
          setStatus('Pedometer not available on this device');
        }
      } catch (error) {
        console.error('Pedometer init error:', error);
        setStatus(`Error: ${error}`);
        setIsPedometerAvailable(false);
      }
    };

    init();
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
        <ThemedText>{status}</ThemedText>
      </ThemedView>
    );
  }

  if (!isPedometerAvailable) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText style={styles.statusText}>{status}</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="subtitle" style={styles.subtitle}>
        {status}
      </ThemedText>
      <ThemedText type="title">Steps Counted</ThemedText>
      <ThemedText style={styles.steps}>{steps}</ThemedText>

      {pastSteps !== null && (
        <ThemedView style={styles.pastContainer}>
          <ThemedText style={styles.pastLabel}>Last 24 hours</ThemedText>
          <ThemedText style={styles.pastSteps}>{pastSteps} steps</ThemedText>
        </ThemedView>
      )}
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
  statusText: {
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  pastContainer: {
    marginTop: 40,
    alignItems: 'center',
  },
  pastLabel: {
    fontSize: 14,
    opacity: 0.6,
  },
  pastSteps: {
    fontSize: 24,
    fontWeight: '600',
    marginTop: 4,
  },
});

