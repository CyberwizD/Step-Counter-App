import { CircularProgress } from '@/components/circular-progress';
import { PermissionModal } from '@/components/permission-modal';
import { StatCard } from '@/components/stat-card';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Accent } from '@/constants/theme';
import { api, TodayStats } from '@/hooks/use-api';
import { usePedometer } from '@/hooks/use-pedometer';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useFocusEffect } from 'expo-router';
import { Pedometer } from 'expo-sensors';
import React, { useCallback, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';

export default function HomeScreen() {
  const pedometer = usePedometer();
  const [stats, setStats] = useState<TodayStats | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const bgColor = useThemeColor({}, 'background');

  const fetchStats = useCallback(async () => {
    try {
      const data = await api.getTodayStats();
      setStats(data);
    } catch (err) {
      console.warn('Failed to fetch today stats:', err);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchStats();
    }, [fetchStats])
  );

  // Show the permission modal if permission is denied/not determined on focus
  useFocusEffect(
    useCallback(() => {
      if (pedometer.status === 'denied') {
        setShowPermissionModal(true);
      }
    }, [pedometer.status])
  );

  const handlePermissionAllow = async () => {
    setShowPermissionModal(false);
    try {
      await Pedometer.requestPermissionsAsync();
    } catch {
      // silently fail
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchStats();
    setRefreshing(false);
  };

  const totalSteps = (stats?.total_steps ?? 0) + pedometer.liveSteps;
  const goal = stats?.daily_goal ?? 10000;
  const calories = (stats?.total_calories ?? 0) + pedometer.liveSteps * 0.04;
  const distance = (stats?.total_distance_km ?? 0) + pedometer.liveSteps * 0.000762;
  const duration = (stats?.total_duration_minutes ?? 0) + pedometer.liveSteps / 100;

  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';
  const dateStr = now.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const statusConfig = {
    loading: { color: Accent.orange, text: 'Initializing pedometer...' },
    active: { color: Accent.green, text: 'Tracking active' },
    unavailable: { color: Accent.red, text: 'Pedometer not available on this device' },
    denied: { color: Accent.orange, text: 'Permission not granted — enable in Settings tab' },
  };
  const currentStatus = statusConfig[pedometer.status];

  return (
    <ThemedView style={[styles.container, { backgroundColor: bgColor }]}>
      {/* Permission Modal — shown on first launch if denied */}
      <PermissionModal
        visible={showPermissionModal}
        onAllow={handlePermissionAllow}
        onDismiss={() => setShowPermissionModal(false)}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Accent.green} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <ThemedText style={styles.greeting}>{greeting} 👋</ThemedText>
          <ThemedText style={styles.date} lightColor="#64748B" darkColor="#94A3B8">
            {dateStr}
          </ThemedText>
        </View>

        {/* Circular Progress */}
        <View style={styles.progressContainer}>
          <CircularProgress current={totalSteps} goal={goal} />
        </View>

        {/* Status */}
        <View style={styles.statusRow}>
          <View style={[styles.statusDot, { backgroundColor: currentStatus.color }]} />
          <ThemedText style={styles.statusText} lightColor="#64748B" darkColor="#94A3B8">
            {currentStatus.text}
          </ThemedText>
        </View>

        {/* Stat Cards */}
        <View style={styles.statsRow}>
          <StatCard
            icon="flame.fill"
            iconColor={Accent.orange}
            label="Calories"
            value={calories.toFixed(0)}
            unit="kcal"
          />
          <View style={{ width: 10 }} />
          <StatCard
            icon="map.fill"
            iconColor={Accent.blue}
            label="Distance"
            value={distance.toFixed(2)}
            unit="km"
          />
        </View>
        <View style={[styles.statsRow, { marginTop: 10 }]}>
          <StatCard
            icon="clock.fill"
            iconColor={Accent.purple}
            label="Active Time"
            value={duration.toFixed(0)}
            unit="min"
          />
          <View style={{ width: 10 }} />
          <StatCard
            icon="target"
            iconColor={Accent.teal}
            label="Daily Goal"
            value={goal.toLocaleString()}
            unit="steps"
          />
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 30,
  },
  header: {
    marginBottom: 28,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  date: {
    fontSize: 14,
    marginTop: 4,
  },
  progressContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '500',
  },
  statsRow: {
    flexDirection: 'row',
  },
});
