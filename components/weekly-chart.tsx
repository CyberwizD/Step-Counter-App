import { Accent } from '@/constants/theme';
import type { DailySummary } from '@/hooks/use-api';
import { useThemeColor } from '@/hooks/use-theme-color';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from './themed-text';

interface WeeklyChartProps {
    data: DailySummary[];
    goal?: number;
}

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function WeeklyChart({ data, goal = 10000 }: WeeklyChartProps) {
    const bgColor = useThemeColor({}, 'card');
    const borderColor = useThemeColor({}, 'border');
    const barBg = useThemeColor(
        { light: 'rgba(148, 163, 184, 0.12)', dark: 'rgba(148, 163, 184, 0.08)' },
        'background'
    );

    // Find max for scaling
    const maxSteps = Math.max(...data.map(d => d.total_steps), goal);
    const chartHeight = 140;

    const todayStr = new Date().toISOString().split('T')[0];

    return (
        <View style={[styles.container, { backgroundColor: bgColor, borderColor }]}>
            <ThemedText style={styles.title}>Weekly Activity</ThemedText>
            <View style={styles.chartRow}>
                {data.map((day, index) => {
                    const height = maxSteps > 0
                        ? Math.max((day.total_steps / maxSteps) * chartHeight, 4)
                        : 4;
                    const isToday = day.date === todayStr;
                    const barColor = isToday ? Accent.green : Accent.green + '55';
                    const dayDate = new Date(day.date + 'T12:00:00');
                    const dayLabel = DAY_LABELS[dayDate.getDay()];

                    return (
                        <View key={day.date} style={styles.barColumn}>
                            <ThemedText
                                style={[styles.barValue, isToday && styles.barValueToday]}
                                lightColor="#94A3B8"
                                darkColor="#64748B"
                            >
                                {day.total_steps > 0
                                    ? day.total_steps >= 1000
                                        ? `${(day.total_steps / 1000).toFixed(1)}k`
                                        : day.total_steps
                                    : ''}
                            </ThemedText>
                            <View style={[styles.barTrack, { height: chartHeight, backgroundColor: barBg }]}>
                                <View
                                    style={[
                                        styles.barFill,
                                        {
                                            height,
                                            backgroundColor: barColor,
                                        },
                                    ]}
                                />
                            </View>
                            <ThemedText
                                style={[styles.dayLabel, isToday && { color: Accent.green, fontWeight: '700' }]}
                                lightColor="#94A3B8"
                                darkColor="#64748B"
                            >
                                {dayLabel}
                            </ThemedText>
                        </View>
                    );
                })}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
    },
    title: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 16,
    },
    chartRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
    },
    barColumn: {
        flex: 1,
        alignItems: 'center',
        gap: 6,
    },
    barValue: {
        fontSize: 10,
        fontWeight: '500',
        minHeight: 14,
    },
    barValueToday: {
        fontWeight: '700',
    },
    barTrack: {
        width: 28,
        borderRadius: 14,
        justifyContent: 'flex-end',
        overflow: 'hidden',
    },
    barFill: {
        width: '100%',
        borderRadius: 14,
    },
    dayLabel: {
        fontSize: 11,
        fontWeight: '500',
    },
});
