import { useThemeColor } from '@/hooks/use-theme-color';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from './themed-text';
import { IconSymbol } from './ui/icon-symbol';

interface StatCardProps {
    icon: string;
    iconColor: string;
    label: string;
    value: string;
    unit?: string;
}

export function StatCard({ icon, iconColor, label, value, unit }: StatCardProps) {
    const bgColor = useThemeColor({}, 'card');
    const borderColor = useThemeColor({}, 'border');

    return (
        <View style={[styles.card, { backgroundColor: bgColor, borderColor }]}>
            <View style={[styles.iconContainer, { backgroundColor: iconColor + '18' }]}>
                <IconSymbol name={icon as any} size={20} color={iconColor} />
            </View>
            <ThemedText style={styles.label} lightColor="#64748B" darkColor="#94A3B8">
                {label}
            </ThemedText>
            <View style={styles.valueRow}>
                <ThemedText style={styles.value}>{value}</ThemedText>
                {unit && (
                    <ThemedText style={styles.unit} lightColor="#94A3B8" darkColor="#64748B">
                        {' '}{unit}
                    </ThemedText>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        flex: 1,
        borderRadius: 16,
        padding: 14,
        borderWidth: 1,
        minWidth: 100,
    },
    iconContainer: {
        width: 36,
        height: 36,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
    },
    label: {
        fontSize: 12,
        fontWeight: '500',
        marginBottom: 4,
    },
    valueRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },
    value: {
        fontSize: 20,
        fontWeight: '700',
    },
    unit: {
        fontSize: 12,
        fontWeight: '500',
    },
});
