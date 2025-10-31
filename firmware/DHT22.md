```cpp
#include "DHT.h"

#define YL_PIN 36          // VP  (YL-69)
#define DHT_PIN 4          // D4  (DHT22 data)
#define DHT_TYPE DHT22

DHT dht(DHT_PIN, DHT_TYPE);

void setup() {
  Serial.begin(115200);
  dht.begin();
}

void loop() {
  /* ---------- YL-69 ---------- */
  int ylRaw = analogRead(YL_PIN);
  int ylPct = map(ylRaw, 3100, 250, 0, 100);   // mesuré avec votre sonde
  ylPct = constrain(ylPct, 0, 100);

  /* ---------- DHT22 ---------- */
  float t = dht.readTemperature();
  float h = dht.readHumidity();

  /* ---------- affichage ---------- */
  Serial.print("Sol : "); Serial.print(ylPct); Serial.print(" %  |  ");
  Serial.print("T : "); Serial.print(t); Serial.print(" °C  |  ");
  Serial.print("H : "); Serial.print(h); Serial.println(" %");

  delay(2000);
}
```