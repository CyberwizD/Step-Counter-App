import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Accent } from '@/constants/theme';
import { api, Settings } from '@/hooks/use-api';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Switch,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

export default function SettingsScreen() {
    const [settings, setSettings] = useState<Settings | null>(null);
    const [goalInput, setGoalInput] = useState('');
    const [editingGoal, setEditingGoal] = useState(false);
    const bgColor = useThemeColor({}, 'background');
    const cardBg = useThemeColor({}, 'card');
    const borderColor = useThemeColor({}, 'border');
    const textColor = useThemeColor({}, 'text');
    const surfaceAlt = useThemeColor({}, 'surfaceAlt');

    const fetchSettings = useCallback(async () => {
        try {
            const data = await api.getSettings();
            setSettings(data);
            setGoalInput(data.daily_goal.toString());
        } catch (err) {
            console.warn('Failed to fetch settings:', err);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            fetchSettings();
        }, [fetchSettings])
    );

    const updateSetting = async (data: Partial<Omit<Settings, 'id'>>) => {
        try {
            const updated = await api.updateSettings(data);
            setSettings(updated);
        } catch (err) {
            console.warn('Failed to update settings:', err);
            Alert.alert('Error', 'Failed to save settings');
        }
    };

    const handleGoalSave = () => {
        const goal = parseInt(goalInput, 10);
        if (isNaN(goal) || goal < 100) {
            Alert.alert('Invalid Goal', 'Please enter a number of at least 100 steps.');
            return;
        }
        updateSetting({ daily_goal: goal });
        setEditingGoal(false);
    };

    const toggleUnit = () => {
        const newUnit = settings?.unit === 'km' ? 'miles' : 'km';
        updateSetting({ unit: newUnit });
    };

    const toggleNotifications = () => {
        updateSetting({ notifications_enabled: !settings?.notifications_enabled });
    };

    if (!settings) {
        return (
            <ThemedView style={[styles.container, styles.centered, { backgroundColor: bgColor }]}>
                <ActivityIndicator size="large" color={Accent.green} />
                <ThemedText style={styles.loadingText} lightColor="#94A3B8" darkColor="#64748B">
                    Loading settings...
                </ThemedText>
            </ThemedView>
        );
    }

    return (
        <ThemedView style={[styles.container, { backgroundColor: bgColor }]}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <View style={styles.headerRow}>
                    <ThemedText style={styles.pageTitle}>Settings</ThemedText>
                    <View style={[styles.headerIcon, { backgroundColor: surfaceAlt }]}>
                        <IconSymbol name="gearshape.fill" size={20} color={Accent.green} />
                    </View>
                </View>

                {/* Activity Settings */}
                <View style={styles.sectionLabelRow}>
                    <IconSymbol name="figure.walk" size={14} color={Accent.green} />
                    <ThemedText style={styles.sectionLabel} lightColor="#64748B" darkColor="#94A3B8">
                        ACTIVITY
                    </ThemedText>
                </View>
                <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
                    {/* Daily Goal */}
                    <TouchableOpacity
                        style={styles.row}
                        onPress={() => setEditingGoal(true)}
                        activeOpacity={0.7}
                    >
                        <View style={styles.rowLeft}>
                            <View style={[styles.iconBg, { backgroundColor: Accent.green + '18' }]}>
                                <IconSymbol name="target" size={18} color={Accent.green} />
                            </View>
                            <View>
                                <ThemedText style={styles.rowLabel}>Daily Goal</ThemedText>
                                <ThemedText style={styles.rowHint} lightColor="#94A3B8" darkColor="#64748B">
                                    Tap to edit your daily target
                                </ThemedText>
                            </View>
                        </View>
                        {editingGoal ? (
                            <View style={styles.goalEditRow}>
                                <TextInput
                                    style={[styles.goalInput, { color: textColor, borderColor: Accent.green }]}
                                    value={goalInput}
                                    onChangeText={setGoalInput}
                                    keyboardType="number-pad"
                                    autoFocus
                                    selectTextOnFocus
                                />
                                <TouchableOpacity onPress={handleGoalSave} style={[styles.saveBtn, { backgroundColor: Accent.green + '18' }]}>
                                    <ThemedText style={[styles.saveBtnText, { color: Accent.green }]}>Save</ThemedText>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <View style={[styles.valueBadge, { backgroundColor: Accent.green + '18' }]}>
                                <ThemedText style={[styles.valueBadgeText, { color: Accent.green }]}>
                                    {settings.daily_goal.toLocaleString()}
                                </ThemedText>
                            </View>
                        )}
                    </TouchableOpacity>

                    <View style={[styles.divider, { backgroundColor: borderColor }]} />

                    {/* Units */}
                    <TouchableOpacity style={styles.row} onPress={toggleUnit} activeOpacity={0.7}>
                        <View style={styles.rowLeft}>
                            <View style={[styles.iconBg, { backgroundColor: Accent.blue + '18' }]}>
                                <IconSymbol name="ruler.fill" size={18} color={Accent.blue} />
                            </View>
                            <View>
                                <ThemedText style={styles.rowLabel}>Distance Unit</ThemedText>
                                <ThemedText style={styles.rowHint} lightColor="#94A3B8" darkColor="#64748B">
                                    Tap to switch units
                                </ThemedText>
                            </View>
                        </View>
                        <View style={[styles.valueBadge, { backgroundColor: Accent.blue + '18' }]}>
                            <ThemedText style={[styles.valueBadgeText, { color: Accent.blue }]}>
                                {settings.unit === 'km' ? 'km' : 'mi'}
                            </ThemedText>
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Notifications */}
                <View style={styles.sectionLabelRow}>
                    <IconSymbol name="bell.fill" size={14} color={Accent.orange} />
                    <ThemedText style={styles.sectionLabel} lightColor="#64748B" darkColor="#94A3B8">
                        NOTIFICATIONS
                    </ThemedText>
                </View>
                <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
                    <View style={styles.row}>
                        <View style={styles.rowLeft}>
                            <View style={[styles.iconBg, { backgroundColor: Accent.orange + '18' }]}>
                                <IconSymbol name="bell.fill" size={18} color={Accent.orange} />
                            </View>
                            <View>
                                <ThemedText style={styles.rowLabel}>Reminders</ThemedText>
                                <ThemedText style={styles.rowHint} lightColor="#94A3B8" darkColor="#64748B">
                                    Get reminded to stay active
                                </ThemedText>
                            </View>
                        </View>
                        <Switch
                            value={settings.notifications_enabled}
                            onValueChange={toggleNotifications}
                            trackColor={{ false: '#64748B', true: Accent.green + '66' }}
                            thumbColor={settings.notifications_enabled ? Accent.green : '#f4f3f4'}
                        />
                    </View>
                </View>

                {/* About */}
                <View style={styles.sectionLabelRow}>
                    <IconSymbol name="info.circle.fill" size={14} color={Accent.purple} />
                    <ThemedText style={styles.sectionLabel} lightColor="#64748B" darkColor="#94A3B8">
                        ABOUT
                    </ThemedText>
                </View>
                <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
                    <View style={styles.row}>
                        <View style={styles.rowLeft}>
                            <View style={[styles.iconBg, { backgroundColor: Accent.purple + '18' }]}>
                                <IconSymbol name="info.circle.fill" size={18} color={Accent.purple} />
                            </View>
                            <ThemedText style={styles.rowLabel}>Version</ThemedText>
                        </View>
                        <ThemedText style={styles.rowValue} lightColor="#94A3B8" darkColor="#64748B">
                            1.0.0
                        </ThemedText>
                    </View>
                    <View style={[styles.divider, { backgroundColor: borderColor }]} />
                    <View style={styles.row}>
                        <View style={styles.rowLeft}>
                            <View style={[styles.iconBg, { backgroundColor: Accent.teal + '18' }]}>
                                <IconSymbol name="figure.walk" size={18} color={Accent.teal} />
                            </View>
                            <View>
                                <ThemedText style={styles.rowLabel}>Step Counter App</ThemedText>
                                <ThemedText style={styles.rowHint} lightColor="#94A3B8" darkColor="#64748B">
                                    Built with Expo + Go
                                </ThemedText>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <View style={[styles.footerDot, { backgroundColor: Accent.green }]} />
                    <ThemedText style={styles.footerText} lightColor="#CBD5E1" darkColor="#334155">
                        Identiko © 2026
                    </ThemedText>
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
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    headerIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    pageTitle: {
        fontSize: 28,
        fontWeight: '800',
        letterSpacing: -0.5,
    },
    sectionLabelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 8,
        marginTop: 20,
        marginLeft: 4,
    },
    sectionLabel: {
        fontSize: 12,
        fontWeight: '600',
        letterSpacing: 1,
    },
    card: {
        borderRadius: 16,
        borderWidth: 1,
        overflow: 'hidden',
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 14,
        paddingVertical: 14,
        minHeight: 58,
    },
    rowLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        flex: 1,
    },
    iconBg: {
        width: 34,
        height: 34,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    rowLabel: {
        fontSize: 15,
        fontWeight: '600',
    },
    rowHint: {
        fontSize: 11,
        marginTop: 1,
    },
    rowValue: {
        fontSize: 14,
        fontWeight: '500',
    },
    valueBadge: {
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 8,
    },
    valueBadgeText: {
        fontSize: 13,
        fontWeight: '700',
    },
    divider: {
        height: 1,
        marginLeft: 60,
    },
    goalEditRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    goalInput: {
        borderWidth: 1.5,
        borderRadius: 10,
        paddingHorizontal: 10,
        paddingVertical: 6,
        fontSize: 14,
        fontWeight: '600',
        width: 80,
        textAlign: 'center',
    },
    saveBtn: {
        paddingHorizontal: 14,
        paddingVertical: 7,
        borderRadius: 8,
    },
    saveBtnText: {
        fontSize: 13,
        fontWeight: '700',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 14,
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        marginTop: 32,
    },
    footerDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    footerText: {
        fontSize: 12,
    },
});
