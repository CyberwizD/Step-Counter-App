import { Image } from 'expo-image';
import { Platform, StyleSheet, Button} from 'react-native';

import { HelloWave } from '@/components/hello-wave';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Link } from 'expo-router';

export default function HomeScreen() {
  return (
    <ThemedView style={styles.welcomeText}>
      <ThemedText type="title" style={{ fontFamily: 'System' }}>
        Welcome!
      </ThemedText>
      <ThemedText style={{marginBottom: 20}}>
        Start Counting your steps
      </ThemedText>
      <Button title='Count Steps' onPress={() => {}} />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  welcomeText: {
    flex: 1, 
    alignItems: 'center',
    justifyContent: 'center',
  }
});
