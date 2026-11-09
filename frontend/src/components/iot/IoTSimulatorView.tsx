import React, { useState } from 'react';
import { 
  Cpu, 
  CloudRain, 
  Flame, 
  RotateCcw, 
  Power, 
  Code, 
  Check, 
  Copy, 
  Download, 
  Radio, 
  Layers, 
  Activity, 
  Zap 
} from 'lucide-react';
import { GardenZone } from '../../types';

interface IoTSimulatorViewProps {
  zones: GardenZone[];
  onToggleSimulator: () => Promise<void>;
  onTriggerRain: () => Promise<void>;
  onTriggerHeatwave: () => Promise<void>;
  onResetSensors: () => Promise<void>;
}

export const IoTSimulatorView: React.FC<IoTSimulatorViewProps> = ({
  zones,
  onToggleSimulator,
  onTriggerRain,
  onTriggerHeatwave,
  onResetSensors,
}) => {
  const [copied, setCopied] = useState(false);
  const [activeCodeTab, setActiveCodeTab] = useState<'arduino' | 'payload'>('arduino');

  const esp32CodeSnippet = `/*
 * Smart Irrigation Agent - ESP32 IoT Node Firmware
 * Microcontroller: ESP32 DevKit V1
 * Sensors: Capacitive Moisture (GPIO 34), DHT22 (GPIO 4), Relay (GPIO 26)
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <DHT.h>

const char* WIFI_SSID = "CAMPUS_IOT_WIFI";
const char* WIFI_PASS = "secure_password";
const char* SERVER_URL = "http://192.168.1.100:8000/api/iot/sensors";
const int ZONE_ID = 1;

#define DHTPIN 4
#define DHTTYPE DHT22
#define SOIL_PIN 34
#define RELAY_PIN 26

DHT dht(DHTPIN, DHTTYPE);

void setup() {
  Serial.begin(115200);
  pinMode(RELAY_PIN, OUTPUT);
  digitalWrite(RELAY_PIN, HIGH); // Default OFF
  dht.begin();
  WiFi.begin(WIFI_SSID, WIFI_PASS);
}

void loop() {
  if (WiFi.status() == WL_CONNECTED) {
    float soilMoist = map(analogRead(SOIL_PIN), 3200, 1450, 0, 100);
    float temp = dht.readTemperature();
    float hum = dht.readHumidity();

    HTTPClient http;
    http.begin(SERVER_URL);
    http.addHeader("Content-Type", "application/json");

    StaticJsonDocument<200> doc;
    doc["zone_id"] = ZONE_ID;
    doc["moisture"] = constrain(soilMoist, 0, 100);
    doc["temperature"] = temp;
    doc["humidity"] = hum;

    String jsonString;
    serializeJson(doc, jsonString);
    int httpCode = http.POST(jsonString);

    if (httpCode > 0) {
      String payload = http.getString();
      StaticJsonDocument<200> resDoc;
      deserializeJson(resDoc, payload);
      const char* valve = resDoc["valve_state"];
      if (valve && strcmp(valve, "OPEN") == 0) {
        digitalWrite(RELAY_PIN, LOW); // Turn Pump ON
      } else {
        digitalWrite(RELAY_PIN, HIGH); // Turn Pump OFF
      }
    }
    http.end();
  }
  delay(10000); // 10 second telemetry cycle
}`;

  const jsonPayloadSnippet = `{
  "zone_id": 1,
  "moisture": 42.5,
  "temperature": 27.2,
  "humidity": 58.0,
  "light_intensity": 850.0,
  "battery_level": 94.0
}`;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Simulator Control Board */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">
                <Radio className="w-4 h-4 animate-pulse" />
              </span>
              <h3 className="font-bold text-slate-800 text-lg">Interactive IoT Hardware Simulator</h3>
            </div>
            <p className="text-xs text-slate-500">
              Inject synthetic environmental conditions to test real-time soil response, AI decision triggers, and automatic valve shutoffs.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onResetSensors}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 font-bold text-xs transition cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Baseline</span>
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <button
            onClick={onTriggerRain}
            className="p-4 rounded-2xl border border-blue-200 bg-blue-50/70 hover:bg-blue-100/70 text-blue-900 transition flex items-center gap-3 text-left cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-500 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition">
              <CloudRain className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-xs block">Simulate Rain Shower</span>
              <span className="text-[11px] text-blue-700">Increases moisture across all campus garden zones</span>
            </div>
          </button>

          <button
            onClick={onTriggerHeatwave}
            className="p-4 rounded-2xl border border-amber-200 bg-amber-50/70 hover:bg-amber-100/70 text-amber-900 transition flex items-center gap-3 text-left cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-xs block">Simulate Heatwave</span>
              <span className="text-[11px] text-amber-700">Raises temp to 38°C and accelerates soil evaporation</span>
            </div>
          </button>

          <button
            onClick={onToggleSimulator}
            className="p-4 rounded-2xl border border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100/70 text-emerald-900 transition flex items-center gap-3 text-left cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-xs block">Background Physics Engine</span>
              <span className="text-[11px] text-emerald-700">Continuous 4s diurnal microclimate tick active</span>
            </div>
          </button>
        </div>
      </div>

      {/* ESP32 Hardware Wiring & Specs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-800 text-base">ESP32 Pinout Guide</h4>
              <p className="text-xs text-slate-500">Hardware GPIO mapping</p>
            </div>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-800 block">Capacitive Moisture Sensor</span>
                <span className="text-slate-500 text-[11px]">Analog V1.2 Output</span>
              </div>
              <span className="font-mono font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md">
                GPIO 34 (ADC1)
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-800 block">DHT22 Digital Sensor</span>
                <span className="text-slate-500 text-[11px]">Temp & Humidity Bus</span>
              </div>
              <span className="font-mono font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-md">
                GPIO 4
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-800 block">5V Relay Module</span>
                <span className="text-slate-500 text-[11px]">Solenoid Valve Actuator</span>
              </div>
              <span className="font-mono font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md">
                GPIO 26
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-800 block">Status Diagnostic LED</span>
                <span className="text-slate-500 text-[11px]">Built-in Node Indicator</span>
              </div>
              <span className="font-mono font-bold bg-purple-100 text-purple-800 px-2 py-0.5 rounded-md">
                GPIO 2
              </span>
            </div>
          </div>
        </div>

        {/* ESP32 Arduino Code Explorer */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Code className="w-5 h-5 text-emerald-600" />
              <h4 className="font-bold text-slate-800 text-base">ESP32 Firmware Code</h4>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex bg-slate-100 p-0.5 rounded-lg text-xs font-semibold">
                <button
                  onClick={() => setActiveCodeTab('arduino')}
                  className={`px-3 py-1 rounded-md transition ${
                    activeCodeTab === 'arduino' ? 'bg-white shadow-xs text-slate-800' : 'text-slate-500'
                  }`}
                >
                  Arduino C++
                </button>
                <button
                  onClick={() => setActiveCodeTab('payload')}
                  className={`px-3 py-1 rounded-md transition ${
                    activeCodeTab === 'payload' ? 'bg-white shadow-xs text-slate-800' : 'text-slate-500'
                  }`}
                >
                  HTTP JSON
                </button>
              </div>

              <button
                onClick={() => handleCopy(activeCodeTab === 'arduino' ? esp32CodeSnippet : jsonPayloadSnippet)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          <pre className="p-4 rounded-2xl bg-slate-900 text-slate-200 text-xs font-mono overflow-x-auto max-h-80 leading-relaxed">
            <code>{activeCodeTab === 'arduino' ? esp32CodeSnippet : jsonPayloadSnippet}</code>
          </pre>
        </div>
      </div>
    </div>
  );
};

