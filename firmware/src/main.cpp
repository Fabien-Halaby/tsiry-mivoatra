#include <Arduino.h>
#include <WiFi.h>
#include <PubSubClient.h>

//! WiFi
const char* ssid = "Airbox-F1DF";
const char* password = "MsmcSXWZ5yYH";

//! MQTT
const char* mqtt_server = "broker.hivemq.com";
const int mqtt_port = 1883;
const char* mqtt_client_id = "tsiry-esp32-001";
const char* mqtt_topic = "tsiry/mivoatra/sensors";

WiFiClient espClient;
PubSubClient client(espClient);

//! Données simulées
struct SensorData {
  float temp;      //! °C
  float hum;       //! %RH
  float lux;       //! lux
  float co2;       //! ppm
  float soilMoist; //! %
  float soilPH;    //! 0-14
  float soilEC;    //! mS/cm
};

SensorData data;

void setup_wifi() {
  delay(10);
  Serial.print("Connecting to WiFi...");
  WiFi.begin(ssid, password);
  while(WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println(" WiFi connected");
}

void reconnect_mqtt() {
  while(!client.connected()) {
    Serial.print("MQTT connecting...");
    if(client.connect(mqtt_client_id)) {
      Serial.println("connected");
    } else {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" retry in 5s");
      delay(5000);
    }
  }
}

SensorData generate_realistic_data() {
  SensorData d;
  d.temp = 18.0 + random(0, 150) / 10.0;       // 18.0 - 33.0 °C
  d.hum = 50.0 + random(0, 400) / 10.0;        // 50.0 - 90.0 %
  d.lux = 5000.0 + random(0, 20000) / 10.0;    // 5 000 - 25 000 lux
  d.co2 = 400.0 + random(0, 800);              // 400 - 1 200 ppm
  d.soilMoist = 20.0 + random(0, 600) / 10.0;  // 20.0 - 80.0 %
  d.soilPH = 5.0 + random(0, 40) / 10.0;       // 5.0 - 9.0
  d.soilEC = 0.5 + random(0, 30) / 10.0;       // 0.5 - 3.5 mS/cm
  return d;
}

void publish_data() {
  char payload[256];
  snprintf(payload, sizeof(payload),
    "{\"t\":%.1f,\"h\":%.1f,\"l\":%.0f,\"c\":%.0f,\"sm\":%.1f,\"ph\":%.1f,\"ec\":%.1f}",
    data.temp, data.hum, data.lux, data.co2, data.soilMoist, data.soilPH, data.soilEC
  );
  client.publish(mqtt_topic, payload);
  Serial.print("Published: ");
  Serial.println(payload);
}

void setup() {
  Serial.begin(115200);
  randomSeed(analogRead(0));
  setup_wifi();
  client.setServer(mqtt_server, mqtt_port);
}

void loop() {
  if(!client.connected()) {
    reconnect_mqtt();
  }
  client.loop();

  data = generate_realistic_data();
  publish_data();

  delay(5000);
}
