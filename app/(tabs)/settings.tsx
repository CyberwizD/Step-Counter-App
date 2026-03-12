import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Accent } from '@/constants/theme';
import { api, Settings } from '@/hooks/use-api';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
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
            <ThemedView style={[styles.container, { backgroundColor: bgColor }]}>
                <ThemedText style={styles.loadingText}>Loading settings...</ThemedText>
            </ThemedView>
        );
    }

    return (
        <ThemedView style={[styles.container, { backgroundColor: bgColor }]}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <ThemedText style={styles.pageTitle}>Settings</ThemedText>

                {/* Activity Settings */}
                <ThemedText style={styles.sectionLabel} lightColor="#64748B" darkColor="#94A3B8">
                    ACTIVITY
                </ThemedText>
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
                            <ThemedText style={styles.rowLabel}>Daily Goal</ThemedText>
                        </View>
                        {editingGoal ? (
                            <View style={styles.goalEditRow}>
                                <TextInput
                                    style={[styles.goalInput, { color: textColor, borderColor }]}
                                    value={goalInput}
                                    onChangeText={setGoalInput}
                                    keyboardType="number-pad"
                                    autoFocus
                                    selectTextOnFocus
                                />
                                <TouchableOpacity onPress={handleGoalSave} style={styles.saveBtn}>
                                    <ThemedText style={[styles.saveBtnText, { color: Accent.green }]}>Save</ThemedText>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <ThemedText style={styles.rowValue} lightColor="#64748B" darkColor="#94A3B8">
                                {settings.daily_goal.toLocaleString()} steps
                            </ThemedText>
                        )}
                    </TouchableOpacity>

                    <View style={[styles.divider, { backgroundColor: borderColor }]} />

                    {/* Units */}
                    <TouchableOpacity style={styles.row} onPress={toggleUnit} activeOpacity={0.7}>
                        <View style={styles.rowLeft}>
                            <View style={[styles.iconBg, { backgroundColor: Accent.blue + '18' }]}>
                                <IconSymbol name="ruler.fill" size={18} color={Accent.blue} />
                            </View>
                            <ThemedText style={styles.rowLabel}>Distance Unit</ThemedText>
                        </View>
                        <ThemedText style={styles.rowValue} lightColor="#64748B" darkColor="#94A3B8">
                            {settings.unit === 'km' ? 'Kilometers' : 'Miles'}
                        </ThemedText>
                    </TouchableOpacity>
                </View>

                {/* Notifications */}
                <ThemedText style={styles.sectionLabel} lightColor="#64748B" darkColor="#94A3B8">
                    NOTIFICATIONS
                </ThemedText>
                <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
                    <View style={styles.row}>
                        <View style={styles.rowLeft}>
                            <View style={[styles.iconBg, { backgroundColor: Accent.orange + '18' }]}>
                                <IconSymbol name="bell.fill" size={18} color={Accent.orange} />
                            </View>
                            <ThemedText style={styles.rowLabel}>Reminders</ThemedText>
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
                <ThemedText style={styles.sectionLabel} lightColor="#64748B" darkColor="#94A3B8">
                    ABOUT
                </ThemedText>
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
                            <ThemedText style={styles.rowLabel}>Step Counter App</ThemedText>
                        </View>
                    </View>
                </View>

                <ThemedText style={styles.footerText} lightColor="#CBD5E1" darkColor="#334155">
                    Built with Expo + Go
                </ThemedText>
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
    pageTitle: {
        fontSize: 28,
        fontWeight: '800',
        letterSpacing: -0.5,
        marginBottom: 24,
    },
    sectionLabel: {
        fontSize: 12,
        fontWeight: '600',
        letterSpacing: 1,
        marginBottom: 8,
        marginTop: 16,
        marginLeft: 4,
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
        minHeight: 52,
    },
    rowLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    iconBg: {
        width: 32,
        height: 32,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    rowLabel: {
        fontSize: 15,
        fontWeight: '500',
    },
    rowValue: {
        fontSize: 14,
        fontWeight: '500',
    },
    divider: {
        height: 1,
        marginLeft: 58,
    },
    goalEditRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    goalInput: {
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 6,
        fontSize: 14,
        fontWeight: '600',
        width: 80,
        textAlign: 'center',
    },
    saveBtn: {
        paddingHorizontal: 10,
        paddingVertical: 6,
    },
    saveBtnText: {
        fontSize: 14,
        fontWeight: '700',
    },
    loadingText: {
        fontSize: 16,
        textAlign: 'center',
        marginTop: 100,
    },
    footerText: {
        fontSize: 12,
        textAlign: 'center',
        marginTop: 32,
    },
});
