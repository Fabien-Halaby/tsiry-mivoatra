import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    RefreshControl,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import mqttService, { SensorData } from '../../services/mqttService';

export default function HomeScreen() {
    const [sensorData, setSensorData] = useState<SensorData>({
        t: 0,
        h: 0,
        l: 0,
        c: 0,
        sm: 0,
        ph: 0,
        ec: 0,
    });
    const [connected, setConnected] = useState(false);
    const [lastUpdate, setLastUpdate] = useState<string>('--:--:--');
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
      //! Configuration des callbacks MQTT
        mqttService.setOnMessage((data: SensorData) => {
            setSensorData(data);
            setLastUpdate(data.timestamp || new Date().toLocaleTimeString());
        });

        mqttService.setOnConnection((isConnected: boolean) => {
            setConnected(isConnected);
        });

        //! Connexion au broker MQTT
        mqttService.connect();

        //! Nettoyage à la fermeture
        return () => {
            mqttService.disconnect();
        };
    }, []);

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        mqttService.disconnect();
        setTimeout(() => {
            mqttService.connect();
            setRefreshing(false);
        }, 1000);
    }, []);

    const SensorCard = ({ icon, title, value, unit, color }: any) => (
        <View style={[styles.card, { borderLeftColor: color, borderLeftWidth: 4 }]}>
            <View style={styles.cardHeader}>
                <Ionicons name={icon} size={24} color={color} />
                <Text style={styles.cardTitle}>{title}</Text>
            </View>
            <View style={styles.cardBody}>
                <Text style={styles.cardValue}>{value}</Text>
                <Text style={styles.cardUnit}>{unit}</Text>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* Header Status */}
            <View style={styles.header}>
                <View style={styles.statusContainer}>
                    <View style={[styles.statusDot, { backgroundColor: connected ? '#10b981' : '#ef4444' }]} />
                    <Text style={styles.statusText}>
                        {connected ? 'Connecté' : 'Déconnecté'}
                    </Text>
                </View>
                <Text style={styles.lastUpdate}>Dernière mise à jour: {lastUpdate}</Text>
            </View>

            <ScrollView
                style={styles.scrollView}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {/* Environnement */}
                <Text style={styles.sectionTitle}>Environnement</Text>
                <SensorCard
                    icon="thermometer-outline"
                    title="Température"
                    value={sensorData.t.toFixed(1)}
                    unit="°C"
                    color="#ef4444"
                />
                <SensorCard
                    icon="water-outline"
                    title="Humidité Air"
                    value={sensorData.h.toFixed(1)}
                    unit="%"
                    color="#3b82f6"
                />
                <SensorCard
                    icon="sunny-outline"
                    title="Luminosité"
                    value={Math.round(sensorData.l).toLocaleString()}
                    unit="lux"
                    color="#f59e0b"
                />
                <SensorCard
                    icon="cloud-outline"
                    title="CO₂"
                    value={Math.round(sensorData.c).toLocaleString()}
                    unit="ppm"
                    color="#6b7280"
                />

                {/* Sol */}
                <Text style={styles.sectionTitle}>Paramètres du Sol</Text>
                <SensorCard
                    icon="leaf-outline"
                    title="Humidité Sol"
                    value={sensorData.sm.toFixed(1)}
                    unit="%"
                    color="#10b981"
                />
                <SensorCard
                    icon="flask-outline"
                    title="pH du Sol"
                    value={sensorData.ph.toFixed(1)}
                    unit=""
                    color="#8b5cf6"
                />
                <SensorCard
                    icon="flash-outline"
                    title="Conductivité"
                    value={sensorData.ec.toFixed(2)}
                    unit="mS/cm"
                    color="#f97316"
                />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f3f4f6',
    },
    header: {
        backgroundColor: '#fff',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    statusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    statusDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginRight: 8,
    },
    statusText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#374151',
    },
    lastUpdate: {
        fontSize: 12,
        color: '#6b7280',
    },
    scrollView: {
        flex: 1,
        padding: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#374151',
        marginTop: 16,
        marginBottom: 12,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    cardTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#6b7280',
        marginLeft: 8,
    },
    cardBody: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },
    cardValue: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#111827',
    },
    cardUnit: {
        fontSize: 16,
        color: '#6b7280',
        marginLeft: 4,
    },
});