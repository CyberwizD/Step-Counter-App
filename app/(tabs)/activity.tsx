import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { WeeklyChart } from '@/components/weekly-chart';
import { Accent } from '@/constants/theme';
import { api, DailySummary, StepSession } from '@/hooks/use-api';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';

export default function ActivityScreen() {
    const [weekly, setWeekly] = useState<DailySummary[]>([]);
    const [history, setHistory] = useState<StepSession[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const bgColor = useThemeColor({}, 'background');
    const cardBg = useThemeColor({}, 'card');
    const borderColor = useThemeColor({}, 'border');

    const fetchData = useCallback(async () => {
        try {
            const [weeklyData, historyData] = await Promise.all([
                api.getWeeklyStats(),
                api.getHistory(),
            ]);
            setWeekly(weeklyData);
            setHistory(historyData);
        } catch (err) {
            console.warn('Failed to fetch activity data:', err);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            fetchData();
        }, [fetchData])
    );

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchData();
        setRefreshing(false);
    };

    // Calculate weekly totals
    const weeklyTotals = weekly.reduce(
        (acc, day) => ({
            steps: acc.steps + day.total_steps,
            calories: acc.calories + day.total_calories,
            distance: acc.distance + day.total_distance_km,
            duration: acc.duration + day.total_duration_minutes,
        }),
        { steps: 0, calories: 0, distance: 0, duration: 0 }
    );

    const avgDailySteps = weekly.length > 0 ? Math.round(weeklyTotals.steps / 7) : 0;

    // Format time for session display
    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);

        if (date.toDateString() === today.toDateString()) return 'Today';
        if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    return (
        <ThemedView style={[styles.container, { backgroundColor: bgColor }]}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Accent.green} />
                }
            >
                {/* Header */}
                <ThemedText style={styles.pageTitle}>Activity</ThemedText>

                {/* Weekly Chart */}
                <WeeklyChart data={weekly} />

                {/* Weekly Summary */}
                <View style={[styles.summaryCard, { backgroundColor: cardBg, borderColor }]}>
                    <ThemedText style={styles.sectionTitle}>This Week</ThemedText>
                    <View style={styles.summaryGrid}>
                        <View style={styles.summaryItem}>
                            <ThemedText style={styles.summaryValue}>
                                {weeklyTotals.steps.toLocaleString()}
                            </ThemedText>
                            <ThemedText style={styles.summaryLabel} lightColor="#64748B" darkColor="#94A3B8">
                                Total Steps
                            </ThemedText>
                        </View>
                        <View style={styles.summaryItem}>
                            <ThemedText style={styles.summaryValue}>
                                {avgDailySteps.toLocaleString()}
                            </ThemedText>
                            <ThemedText style={styles.summaryLabel} lightColor="#64748B" darkColor="#94A3B8">
                                Daily Avg
                            </ThemedText>
                        </View>
                        <View style={styles.summaryItem}>
                            <ThemedText style={styles.summaryValue}>
                                {weeklyTotals.distance.toFixed(1)}
                            </ThemedText>
                            <ThemedText style={styles.summaryLabel} lightColor="#64748B" darkColor="#94A3B8">
                                km walked
                            </ThemedText>
                        </View>
                        <View style={styles.summaryItem}>
                            <ThemedText style={styles.summaryValue}>
                                {weeklyTotals.calories.toFixed(0)}
                            </ThemedText>
                            <ThemedText style={styles.summaryLabel} lightColor="#64748B" darkColor="#94A3B8">
                                kcal burned
                            </ThemedText>
                        </View>
                    </View>
                </View>

                {/* Recent Sessions */}
                <View style={[styles.sessionsCard, { backgroundColor: cardBg, borderColor }]}>
                    <ThemedText style={styles.sectionTitle}>Recent Sessions</ThemedText>
                    {history.length === 0 ? (
                        <ThemedText style={styles.emptyText} lightColor="#94A3B8" darkColor="#64748B">
                            No sessions recorded yet. Start walking!
                        </ThemedText>
                    ) : (
                        history.map((session, index) => (
                            <View
                                key={session.id}
                                style={[
                                    styles.sessionRow,
                                    index < history.length - 1 && {
                                        borderBottomWidth: 1,
                                        borderBottomColor: borderColor,
                                    },
                                ]}
                            >
                                <View style={styles.sessionLeft}>
                                    <View style={[styles.sessionDot, { backgroundColor: Accent.green }]} />
                                    <View>
                                        <ThemedText style={styles.sessionSteps}>
                                            {session.steps.toLocaleString()} steps
                                        </ThemedText>
                                        <ThemedText style={styles.sessionMeta} lightColor="#94A3B8" darkColor="#64748B">
                                            {formatDate(session.recorded_at)} · {formatTime(session.recorded_at)}
                                        </ThemedText>
                                    </View>
                                </View>
                                <View style={styles.sessionRight}>
                                    <ThemedText style={styles.sessionDetail} lightColor="#64748B" darkColor="#94A3B8">
                                        {session.duration_minutes.toFixed(0)} min
                                    </ThemedText>
                                    <ThemedText style={styles.sessionDetail} lightColor="#64748B" darkColor="#94A3B8">
                                        {session.calories.toFixed(0)} kcal
                                    </ThemedText>
                                </View>
                            </View>
                        ))
                    )}
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
        gap: 16,
    },
    pageTitle: {
        fontSize: 28,
        fontWeight: '800',
        letterSpacing: -0.5,
        marginBottom: 4,
    },
    summaryCard: {
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 14,
    },
    summaryGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    summaryItem: {
        width: '50%',
        paddingVertical: 8,
    },
    summaryValue: {
        fontSize: 22,
        fontWeight: '700',
    },
    summaryLabel: {
        fontSize: 12,
        fontWeight: '500',
        marginTop: 2,
    },
    sessionsCard: {
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
    },
    emptyText: {
        fontSize: 14,
        textAlign: 'center',
        paddingVertical: 20,
    },
    sessionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
    },
    sessionLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    sessionDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    sessionSteps: {
        fontSize: 15,
        fontWeight: '600',
    },
    sessionMeta: {
        fontSize: 12,
        marginTop: 2,
    },
    sessionRight: {
        alignItems: 'flex-end',
    },
    sessionDetail: {
        fontSize: 12,
        fontWeight: '500',
    },
});
