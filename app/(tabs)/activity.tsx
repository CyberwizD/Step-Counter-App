import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { WeeklyChart } from '@/components/weekly-chart';
import { Accent } from '@/constants/theme';
import { api, DailySummary, StepSession } from '@/hooks/use-api';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';

export default function ActivityScreen() {
    const [weekly, setWeekly] = useState<DailySummary[]>([]);
    const [history, setHistory] = useState<StepSession[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const bgColor = useThemeColor({}, 'background');
    const cardBg = useThemeColor({}, 'card');
    const borderColor = useThemeColor({}, 'border');
    const surfaceAlt = useThemeColor({}, 'surfaceAlt');

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
        } finally {
            setLoading(false);
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

    if (loading) {
        return (
            <ThemedView style={[styles.container, styles.centered, { backgroundColor: bgColor }]}>
                <ActivityIndicator size="large" color={Accent.green} />
                <ThemedText style={styles.loadingText} lightColor="#94A3B8" darkColor="#64748B">
                    Loading activity data...
                </ThemedText>
            </ThemedView>
        );
    }

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
                <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
                    <View style={styles.sectionHeader}>
                        <IconSymbol name="chart.bar.fill" size={18} color={Accent.green} />
                        <ThemedText style={styles.sectionTitle}>This Week</ThemedText>
                    </View>

                    <View style={styles.summaryGrid}>
                        <View style={[styles.summaryItem, { backgroundColor: surfaceAlt }]}>
                            <View style={[styles.summaryIcon, { backgroundColor: Accent.green + '18' }]}>
                                <IconSymbol name="figure.walk" size={16} color={Accent.green} />
                            </View>
                            <ThemedText style={styles.summaryValue}>
                                {weeklyTotals.steps.toLocaleString()}
                            </ThemedText>
                            <ThemedText style={styles.summaryLabel} lightColor="#64748B" darkColor="#94A3B8">
                                Total Steps
                            </ThemedText>
                        </View>

                        <View style={[styles.summaryItem, { backgroundColor: surfaceAlt }]}>
                            <View style={[styles.summaryIcon, { backgroundColor: Accent.blue + '18' }]}>
                                <IconSymbol name="target" size={16} color={Accent.blue} />
                            </View>
                            <ThemedText style={styles.summaryValue}>
                                {avgDailySteps.toLocaleString()}
                            </ThemedText>
                            <ThemedText style={styles.summaryLabel} lightColor="#64748B" darkColor="#94A3B8">
                                Daily Avg
                            </ThemedText>
                        </View>

                        <View style={[styles.summaryItem, { backgroundColor: surfaceAlt }]}>
                            <View style={[styles.summaryIcon, { backgroundColor: Accent.teal + '18' }]}>
                                <IconSymbol name="map.fill" size={16} color={Accent.teal} />
                            </View>
                            <ThemedText style={styles.summaryValue}>
                                {weeklyTotals.distance.toFixed(1)}
                            </ThemedText>
                            <ThemedText style={styles.summaryLabel} lightColor="#64748B" darkColor="#94A3B8">
                                km Walked
                            </ThemedText>
                        </View>

                        <View style={[styles.summaryItem, { backgroundColor: surfaceAlt }]}>
                            <View style={[styles.summaryIcon, { backgroundColor: Accent.orange + '18' }]}>
                                <IconSymbol name="flame.fill" size={16} color={Accent.orange} />
                            </View>
                            <ThemedText style={styles.summaryValue}>
                                {weeklyTotals.calories.toFixed(0)}
                            </ThemedText>
                            <ThemedText style={styles.summaryLabel} lightColor="#64748B" darkColor="#94A3B8">
                                kcal Burned
                            </ThemedText>
                        </View>
                    </View>
                </View>

                {/* Recent Sessions */}
                <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
                    <View style={styles.sectionHeader}>
                        <IconSymbol name="clock.fill" size={18} color={Accent.purple} />
                        <ThemedText style={styles.sectionTitle}>Recent Sessions</ThemedText>
                    </View>

                    {history.length === 0 ? (
                        <View style={styles.emptyState}>
                            <View style={[styles.emptyIconCircle, { backgroundColor: surfaceAlt }]}>
                                <IconSymbol name="figure.walk" size={32} color={Accent.green + '55'} />
                            </View>
                            <ThemedText style={styles.emptyTitle}>No sessions yet</ThemedText>
                            <ThemedText style={styles.emptySubtitle} lightColor="#94A3B8" darkColor="#64748B">
                                Start walking with the app open to record your first session
                            </ThemedText>
                        </View>
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
                                    <View style={[styles.sessionIcon, { backgroundColor: Accent.green + '18' }]}>
                                        <IconSymbol name="figure.walk" size={16} color={Accent.green} />
                                    </View>
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
                                    <View style={styles.sessionStat}>
                                        <IconSymbol name="clock.fill" size={12} color={Accent.purple + '88'} />
                                        <ThemedText style={styles.sessionDetail} lightColor="#64748B" darkColor="#94A3B8">
                                            {session.duration_minutes.toFixed(0)}m
                                        </ThemedText>
                                    </View>
                                    <View style={styles.sessionStat}>
                                        <IconSymbol name="flame.fill" size={12} color={Accent.orange + '88'} />
                                        <ThemedText style={styles.sessionDetail} lightColor="#64748B" darkColor="#94A3B8">
                                            {session.calories.toFixed(0)}
                                        </ThemedText>
                                    </View>
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
    centered: {
        alignItems: 'center',
        justifyContent: 'center',
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
    card: {
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 14,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
    },
    summaryGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    summaryItem: {
        width: '47%',
        borderRadius: 12,
        padding: 12,
        alignItems: 'flex-start',
    },
    summaryIcon: {
        width: 28,
        height: 28,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
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
    // Empty state
    emptyState: {
        alignItems: 'center',
        paddingVertical: 28,
    },
    emptyIconCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    emptyTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    emptySubtitle: {
        fontSize: 13,
        textAlign: 'center',
        paddingHorizontal: 20,
        lineHeight: 18,
    },
    // Session rows
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
    sessionIcon: {
        width: 34,
        height: 34,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
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
        gap: 4,
    },
    sessionStat: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    sessionDetail: {
        fontSize: 12,
        fontWeight: '500',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 14,
    },
});
