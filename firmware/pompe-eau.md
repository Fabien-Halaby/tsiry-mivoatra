```cpp
#include <Arduino.h>

// Définir la broche de la pompe
#define PUMP_PIN 2  // GPIO2 - Changez selon votre branchement

void setup() {
  Serial.begin(115200);
  pinMode(PUMP_PIN, OUTPUT);
  digitalWrite(PUMP_PIN, LOW); // Éteint au démarrage
  
  Serial.println("=== Test Pompe à Eau ===");
  Serial.println("La pompe va s'allumer 2s, puis s'éteindre 2s");
  Serial.println("Appuyez sur RST pour arrêter");
  delay(2000);
}

void loop() {
  // Allumer la pompe
  Serial.println("🔴 POMPE ON (2 secondes)");
  digitalWrite(PUMP_PIN, HIGH);
  delay(2000);
  
  // Éteindre la pompe
  Serial.println("🟢 POMPE OFF (2 secondes)");
  digitalWrite(PUMP_PIN, LOW);
  delay(2000);
}
```