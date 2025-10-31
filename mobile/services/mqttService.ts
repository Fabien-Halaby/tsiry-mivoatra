// services/mqttService.ts
import mqtt from 'mqtt';
import 'react-native-url-polyfill/auto';

const MQTT_BROKER = 'ws://broker.hivemq.com:8000/mqtt';
const MQTT_TOPIC = 'tsiry/mivoatra/sensors';
const CLIENT_ID = 'ReactNativeClient_' + Math.random().toString(16).substr(2, 8);

export interface SensorData {
    t: number;      //! Température (°C)
    h: number;      //! Humidité (%RH)
    l: number;      //! Luminosité (lux)
    c: number;      //! CO2 (ppm)
    sm: number;     //! Humidité du sol (%)
    ph: number;     //! pH du sol (0-14)
    ec: number;     //! Conductivité du sol (mS/cm)
    timestamp?: string;
}

class MQTTService {
    private client: any = null;
    private onMessageCallback: ((data: SensorData) => void) | null = null;
    private onConnectionCallback: ((connected: boolean) => void) | null = null;

    connect() {
        try {
            console.log('Tentative de connexion MQTT...');
            console.log('Broker:', MQTT_BROKER);
            console.log('Client ID:', CLIENT_ID);
            
            this.client = mqtt.connect(MQTT_BROKER, {
                clientId: CLIENT_ID,
                clean: true,
                connectTimeout: 4000,
                reconnectPeriod: 5000,
            });
          
            this.client.on('connect', () => {
                console.log('Connecté au broker MQTT');
                if(this.onConnectionCallback) {
                    this.onConnectionCallback(true);
                }
              
                this.client.subscribe(MQTT_TOPIC, (err: any) => {
                    if(err) {
                        console.error('Erreur abonnement:', err);
                    } else {
                        console.log(`Abonné au topic: ${MQTT_TOPIC}`);
                    }
                });
            });

            this.client.on('error', (error: any) => {
                console.error('Erreur MQTT:', error);
                if(this.onConnectionCallback) {
                    this.onConnectionCallback(false);
                }
            });

            this.client.on('offline', () => {
                console.log('Client MQTT hors ligne');
                if(this.onConnectionCallback) {
                    this.onConnectionCallback(false);
                }
            });

            this.client.on('reconnect', () => {
                console.log('Reconnexion MQTT...');
            });

            this.client.on('close', () => {
                console.log('Connexion MQTT fermée');
                if(this.onConnectionCallback) {
                    this.onConnectionCallback(false);
                }
            });

            this.client.on('message', (topic: string, message: Buffer) => {
                try {
                    const payload = message.toString();
                    console.log('Message reçu sur', topic, ':', payload);

                    const data: SensorData = JSON.parse(payload);
                    data.timestamp = new Date().toLocaleTimeString();

                    if(this.onMessageCallback) {
                        this.onMessageCallback(data);
                    }
                } catch(error) {
                    console.error('Erreur parsing message:', error);
                }
            });

        } catch(error) {
            console.error('Erreur de connexion MQTT:', error);
            if(this.onConnectionCallback) {
                this.onConnectionCallback(false);
            }
        }
    }

    setOnMessage(callback: (data: SensorData) => void) {
        this.onMessageCallback = callback;
    }

    setOnConnection(callback: (connected: boolean) => void) {
        this.onConnectionCallback = callback;
    }

    disconnect() {
        if(this.client) {
            this.client.end();
            console.log('Déconnecté du broker MQTT');
            this.client = null;
        }
    }

    publish(topic: string, message: string) {
        if(this.client && this.client.connected) {
            this.client.publish(topic, message, (err: any) => {
                if(err) {
                    console.error('Erreur publication:', err);
                } else {
                    console.log(`Message publié sur ${topic}:`, message);
                }
            });
        } else {
            console.error('Client non connecté, impossible de publier');
        }
    }

    isConnected(): boolean {
        return this.client && this.client.connected;
    }
}

export default new MQTTService();