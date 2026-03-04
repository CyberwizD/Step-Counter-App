import React, { useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet, Text, View, Platform } from 'react-native';
import {
  isStepCountingSupported,
  startStepCounterUpdate,
  stopStepCounterUpdate,
  // parseStepData, // Use if needed for detailed data
} from '@dongminyu/react-native-step-counter';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions'; // Recommended for robust permission handling

export default function StepCounterApp () {
  const [steps, setSteps] = useState(0);
  const [isSupported, setIsSupported] = useState(false);
  const [isGranted, setIsGranted] = useState(false);

  useEffect(() => {
    // Function to check and request permissions
    const checkAndRequestPermission = async () => {
      const permission = Platform.select({
        ios: PERMISSIONS.IOS.MOTION,
        android: PERMISSIONS.ANDROID.ACTIVITY_RECOGNITION,
      });

      if (!permission) return;

      try {
        let result = await check(permission);
        if (result === RESULTS.DENIED) {
          result = await request(permission);
        }
        if (result === RESULTS.GRANTED) {
          setIsGranted(true);
        } else {
          console.log('Permission not granted');
        }
      } catch (error) {
        console.error(error);
      }
    };

    // Check if step counting is supported by the device
    isStepCountingSupported().then((result) => {
      setIsSupported(result.supported);
      if (result.supported && result.granted) {
        setIsGranted(true);
      } else if (result.supported && !result.granted) {
        checkAndRequestPermission();
      }
    });
  }, []);

  useEffect(() => {
    if (isSupported && isGranted) {
      // Start the step counter update
      const startDate = new Date(); // Track from now
      startStepCounterUpdate(startDate, (data) => {
        setSteps(data.steps);
      });
    }

    // Stop the counter when the component unmounts
    return () => {
      stopStepCounterUpdate();
    };
  }, [isSupported, isGranted]); // Depend on supported and granted status

  if (!isSupported) {
    return (
      <View style={styles.screen}>
        <Text>Step counting is not supported on this device.</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <Text style={styles.stepText}>Current Steps</Text>
      <Text style={styles.steps}>{steps}</Text>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepText: {
    fontSize: 20,
    marginBottom: 10,
  },
  steps: {
    fontSize: 48,
    fontWeight: 'bold',
  },
});


// import { Pedometer } from 'expo-sensors';
// import { useEffect, useState } from 'react';
// import { StyleSheet } from 'react-native';

// import { ThemedText } from '@/components/themed-text';
// import { ThemedView } from '@/components/themed-view';

// export default function CounterScreen() {
//   const [steps, setSteps] = useState(0);
//   const [isPedometerAvailable, setIsPedometerAvailable] = useState(false);

//     useEffect(() => {
//       const checkPedometerAvailability = async () => {
//         const isAvailable = await Pedometer.isAvailableAsync();
//         setIsPedometerAvailable(isAvailable);
//       };

//       checkPedometerAvailability();
//     }, []);

//     useEffect(() => {
//         let subscription = null;
//         if (isPedometerAvailable) {
//             subscription = Pedometer.watchStepCount((result) => {
//                 setSteps(result.steps);
//             });
//         }

//         return () => {
//             if (subscription) {
//                 subscription.remove();
//             }
//         };  
//     }, [isPedometerAvailable]);

//   if (!isPedometerAvailable) {
//     return (
//       <ThemedView style={styles.container}>
//         <ThemedText>Pedometer is not available on this device.</ThemedText>
//       </ThemedView>
//     );
//   }

// return (
//     <ThemedView style={styles.container}>
//       <ThemedText type="subtitle" style={styles.subtitle}>
//         Keep moving to increase your step count!
//       </ThemedText>
//       <ThemedText type="title">Steps Counted</ThemedText>
//       <ThemedText style={styles.steps}>{steps}</ThemedText>
//     </ThemedView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },    
//   steps: {
//     fontSize: 30,
//     fontWeight: 'bold',
//     marginTop: 20,
//   },
//   subtitle: {
//     fontSize: 16,
//     marginTop: 10,
//     marginBottom: 10
//   }
// });

