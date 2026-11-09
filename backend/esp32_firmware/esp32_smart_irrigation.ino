/*
 * Smart Irrigation Agent - ESP32 IoT Node Firmware
 * Campus Garden Intelligent Watering System
 * 
 * Hardware:
 * - ESP32 DevKit V1
 * - Capacitive Soil Moisture Sensor v1.2 (or resistive) -> GPIO 34 (ADC)
 * - DHT22 Temperature & Humidity Sensor -> GPIO 4
 * - 5V Single Channel Relay Module (Valve / Submersible Pump) -> GPIO 26
 * - Status LED -> GPIO 2 (Built-in)
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <DHT.h>

// --- Configuration ---
const char* WIFI_SSID = "YOUR_WIFI_SSID";
const char* WIFI_PASS = "YOUR_WIFI_PASSWORD";

// Server API Endpoint (Replace with your backend server IP)
const char* SERVER_URL = "http://192.168.1.100:8000/api/iot/sensors";

// Target Campus Garden Zone ID for this hardware node
const int ZONE_ID = 1; // 1: Botanical, 2: Flower, 3: Herbal, 4: Lawn, 5: Vegetable

// --- Pin Definitions ---
#define DHTPIN 4
#define DHTTYPE DHT22
#define SOIL_PIN 34
#define RELAY_PIN 26
#define LED_PIN 2

// Calibration values for Capacitive Soil Moisture Sensor
// Calibrate by measuring raw analog in air (AirValue) and in cup of water (WaterValue)
const int AirValue = 3200;    // 0% moisture
const int WaterValue = 1450;  // 100% moisture

DHT dht(DHTPIN, DHTTYPE);

unsigned long lastSendTime = 0;
const unsigned long sendInterval = 10000; // Send telemetry every 10 seconds

// Safety shutoff timer (max 20 minutes continuously open)
unsigned long valveOpenedAt = 0;
bool isValveOpen = false;
const unsigned long MAX_FAILSAFE_WATERING_MS = 20 * 60 * 1000;

void setup() {
  Serial.begin(115200);
  delay(1000);
  Serial.println("\n[Smart Irrigation Agent] Booting ESP32 IoT Node...");

  pinMode(RELAY_PIN, OUTPUT);
  pinMode(LED_PIN, OUTPUT);
  
  // Keep relay OFF at startup (Relays are typically active LOW)
  digitalWrite(RELAY_PIN, HIGH);
  digitalWrite(LED_PIN, LOW);

  dht.begin();
  connectWiFi();
}

void loop() {
  // Check WiFi status
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("[WiFi] Connection lost. Reconnecting...");
    connectWiFi();
  }

  // Safety failsafe check: prevent campus flooding
  if (isValveOpen && (millis() - valveOpenedAt > MAX_FAILSAFE_WATERING_MS)) {
    Serial.println("[SAFETY ALERT] Failsafe timer exceeded! Force closing valve.");
    setValveState(false);
  }

  // Periodic Telemetry Transmission
  if (millis() - lastSendTime >= sendInterval) {
    lastSendTime = millis();
    sendTelemetry();
  }

  delay(100);
}

void connectWiFi() {
  Serial.print("[WiFi] Connecting to: ");
  Serial.println(WIFI_SSID);
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASS);

  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    digitalWrite(LED_PIN, !digitalRead(LED_PIN));
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n[WiFi] Connected successfully!");
    Serial.print("[WiFi] IP Address: ");
    Serial.println(WiFi.localIP());
    digitalWrite(LED_PIN, HIGH);
  } else {
    Serial.println("\n[WiFi] Connection failed. Will retry later.");
    digitalWrite(LED_PIN, LOW);
  }
}

float readSoilMoisture() {
  int rawAnalog = analogRead(SOIL_PIN);
  float moisture = map(rawAnalog, AirValue, WaterValue, 0, 100);
  return constrain(moisture, 0.0, 100.0);
}

void setValveState(bool open) {
  isValveOpen = open;
  if (open) {
    digitalWrite(RELAY_PIN, LOW); // Active LOW relay ON
    valveOpenedAt = millis();
    Serial.println("[ACTUATOR] Solenoid Valve / Pump: OPEN");
  } else {
    digitalWrite(RELAY_PIN, HIGH); // Active LOW relay OFF
    Serial.println("[ACTUATOR] Solenoid Valve / Pump: CLOSED");
  }
}

void sendTelemetry() {
  if (WiFi.status() != WL_CONNECTED) return;

  float soilMoist = readSoilMoisture();
  float temp = dht.readTemperature();
  float hum = dht.readHumidity();

  if (isnan(temp) || isnan(hum)) {
    Serial.println("[DHT22] Warning: Failed to read from sensor!");
    temp = 25.0;
    hum = 55.0;
  }

  Serial.printf("[Sensors] Zone: %d | Moisture: %.1f%% | Temp: %.1f C | Hum: %.1f%%\n",
                ZONE_ID, soilMoist, temp, hum);

  HTTPClient http;
  http.begin(SERVER_URL);
  http.addHeader("Content-Type", "application/json");

  StaticJsonDocument<256> doc;
  doc["zone_id"] = ZONE_ID;
  doc["moisture"] = round(soilMoist * 10) / 10.0;
  doc["temperature"] = round(temp * 10) / 10.0;
  doc["humidity"] = round(hum * 10) / 10.0;
  doc["light_intensity"] = 850.0;
  doc["battery_level"] = 98.0;

  String requestBody;
  serializeJson(doc, requestBody);

  int httpCode = http.POST(requestBody);

  if (httpCode > 0) {
    String payload = http.getString();
    Serial.printf("[HTTP] POST Result Code: %d\n", httpCode);

    StaticJsonDocument<256> responseDoc;
    DeserializationError error = deserializeJson(responseDoc, payload);

    if (!error) {
      const char* valveCommand = responseDoc["valve_state"];
      if (valveCommand != nullptr) {
        if (strcmp(valveCommand, "OPEN") == 0 && !isValveOpen) {
          setValveState(true);
        } else if (strcmp(valveCommand, "CLOSED") == 0 && isValveOpen) {
          setValveState(false);
        }
      }
    }
  } else {
    Serial.printf("[HTTP] POST failed, error: %s\n", http.errorToString(httpCode).c_str());
  }

  http.end();
}

