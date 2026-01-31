<img src="logo.svg" alt="jaABlu" height="40"/>

### Jaalee JHT BLE → Shelly BLU Gateway → Home Assistant MQTT + Auto Discovery

[🇬🇧 English](README.md) | 🇩🇪 **Deutsch**

[![Version](https://img.shields.io/github/v/release/arboeh/jaABlu?color=brightgreen)](https://github.com/arboeh/jaABlu/releases/latest)
[![Tests](https://github.com/arboeh/jaABlu/workflows/Tests/badge.svg)](https://github.com/arboeh/jaABlu/actions)
[![codecov](https://codecov.io/gh/arboeh/jaABlu/branch/main/graph/badge.svg)](https://codecov.io/gh/arboeh/jaABlu)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18-brightgreen)](https://nodejs.org/)
[![Home Assistant](https://img.shields.io/badge/Home%20Assistant-Compatible-41BDF5.svg)](https://www.home-assistant.io/)
[![Shelly](https://img.shields.io/badge/Shelly-BLU%20Gateway-00A0E3.svg)](https://shelly.cloud/)

Das jaABlu Script liest **Jaalee JHT** BLE Temperatur-/Feuchtigkeitssensoren über **Shelly BLU Gateway** Geräte (als Bluetooth-Proxy) aus und übermittelt die Daten per **MQTT Auto-Discovery** automatisch an **Home Assistant**.

## Features

- ✅ **Volle MQTT Auto-Discovery-Unterstützung** – Sensoren erscheinen automatisch in Home Assistant
- ✅ **8 optionale Sensor-Entities pro Gerät**: Temperature, Humidity, Battery, RSSI, Last Seen, Link Quality, Battery Low Warning, Data Age
- ✅ **Konfigurierbare Temperatur-Einheit** – Celsius oder Fahrenheit
- ✅ **Online-/Offline-Status** – automatische Erkennung nach konfigurierbarem Timeout (Standard 5 Minuten)
- ✅ **Multi-Sensor-Support** – beliebig viele Jaalee JHT pro Shelly BLU Gateway
- ✅ **Konfigurierbares Logging** – DEBUG / INFO / WARN / ERROR
- ✅ **Aktives BLE-Scanning** – optimiert für das Jaalee iBeacon-Format
- ✅ **Optimierte Performance** – MQTT-Caching, Helper-Funktionen, reduzierte Code-Duplikation

## Voraussetzungen

- Shelly BLU Gateway (z.B. BLU Gateway, BLU Mini, BLU Pro) mit **aktiviertem Bluetooth**
- Home Assistant mit laufendem **MQTT Broker** (z.B. Mosquitto)
- MQTT Auto-Discovery aktiviert, Discovery Prefix: `homeassistant` (Standardwert)

## Installation

1. **Script auf das Shelly BLU Gateway hochladen**

   Im Webinterface:
   - `Settings → Scripts → Add script`
   - Inhalt von `jaABlu.js` einfügen
   - Script aktivieren (Enable)

2. **Bluetooth auf dem Shelly aktivieren**
   - `Settings → Bluetooth → Enable`

3. **Script starten**
   - `Settings → Scripts → jaABlu.js → Start`
   - Optional: Autostart aktivieren

4. **Home Assistant prüfen**
   - Nach wenigen Sekunden sollten die neuen Geräte unter  
     `Einstellungen → Geräte & Dienste → MQTT` auftauchen.
   - Pro Sensor werden mehrere Entities (Temperature, Humidity, Battery, etc.) angelegt.

## Konfiguration

Im Script kann die Konfiguration über das `CONFIG`-Objekt angepasst werden:

```javascript
const CONFIG = {
  // Temperature unit configuration
  temperature: {
    unit: 'celsius', // 'celsius' or 'fahrenheit'
  },

  mqtt: {
    enabled: true,
    discovery_prefix: 'homeassistant',
    device_prefix: 'jaABlu',

    // Optional diagnostic sensors (disabled by default)
    publish_rssi: true, // Signal strength (RSSI in dBm)
    publish_last_seen: true, // Last seen timestamp
    publish_link_quality: false, // Link quality in % (0-100)
    publish_battery_low: false, // Binary sensor for low battery warning
    publish_data_age: false, // Age of last data in seconds

    // Status & Timeout
    sensor_timeout: 300, // Seconds without update -> offline (5 min)
    timeout_check_interval: 120, // Check interval in seconds (2 min)
    battery_low_threshold: 20, // Battery percentage threshold for warning
  },

  knownDevices: {
    // Optional: Format: "mac-address": "friendly_name"
    // 'XX:XX:XX:XX:XX:XX': 'Jaalee JHT Küche',
  },
};
```

## Home Assistant Entities

### Primäre Sensoren (immer aktiv)

| Entity                          | Typ    | Device Class  | Beschreibung            |
| ------------------------------- | ------ | ------------- | ----------------------- |
| `sensor.jaalee_xxx_temperature` | Sensor | `temperature` | Temperatur (°C oder °F) |
| `sensor.jaalee_xxx_humidity`    | Sensor | `humidity`    | Luftfeuchtigkeit (%)    |
| `sensor.jaalee_xxx_battery`     | Sensor | `battery`     | Batteriestand (%)       |

### Optionale Diagnose-Sensoren (konfigurierbar)

| Entity                                 | Typ           | Device Class      | Standard | Beschreibung                |
| -------------------------------------- | ------------- | ----------------- | -------- | --------------------------- |
| `sensor.jaalee_xxx_rssi`               | Sensor        | `signal_strength` | 🔘       | Signalstärke (dBm)          |
| `sensor.jaalee_xxx_last_seen`          | Sensor        | `timestamp`       | 🔘       | Letzter Empfangszeitpunkt   |
| `sensor.jaalee_xxx_link_quality`       | Sensor        | -                 | ⚪       | Verbindungsqualität (%)     |
| `binary_sensor.jaalee_xxx_battery_low` | Binary Sensor | `battery`         | ⚪       | Batterie niedrig Warnung    |
| `sensor.jaalee_xxx_data_age`           | Sensor        | -                 | ⚪       | Alter der letzten Daten (s) |

**Legende:**

- ✅ = Immer aktiviert
- 🔘 = Standardmäßig aktiviert (konfigurierbar)
- ⚪ = Standardmäßig deaktiviert (manuell aktivierbar)

## Neue Features in v1.3.0

### Temperatur-Einheit

Wähle zwischen Celsius und Fahrenheit:

```javascript
temperature: {
  unit: 'fahrenheit', // oder 'celsius'
}
```

### Link Quality

RSSI wird automatisch in eine benutzerfreundliche Prozentanzeige (0-100%) umgerechnet:

- 100% = Exzellentes Signal (-30 dBm)
- 0% = Kein nutzbares Signal (-90 dBm)

### Battery Low Warning

Binary Sensor für Automatisierungen bei niedrigem Batteriestand:

```yaml
automation:
  - alias: 'Batterie niedrig Benachrichtigung'
    trigger:
      - platform: state
        entity_id: binary_sensor.jaalee_xxx_battery_low
        to: 'on'
    action:
      - service: notify.mobile_app
        data:
          message: 'Jaalee Sensor Batterie niedrig!'
```

### Data Age

Überwache die Aktualität der Sensordaten - nützlich für Diagnose und Timeout-Überwachung.

## Troubleshooting

**❌ Keine Sensoren / Geräte in Home Assistant sichtbar?**

- Home Assistant nach dem ersten Start des Scripts einmal neu starten.
- Prüfen, ob der MQTT Broker in Home Assistant korrekt konfiguriert ist.
- Im Log des Scripts nachsehen, ob „MQTT connected" und „MQTT Discovery published for: …" erscheint.

**❌ Discovery-Topics fehlen auf dem Broker?**

- Log-Level im Script auf DEBUG erhöhen:

  ```javascript
  logLevel: LOG_LEVELS.DEBUG;
  ```

- Mit einem MQTT-Tool (z.B. MQTT Explorer) prüfen, ob Topics wie

  ```
  homeassistant/sensor/jaABlu_*/config
  ```

  vorhanden sind.

**❌ Sensor zeigt "Unavailable"?**

- Prüfe ob der Sensor in Bluetooth-Reichweite ist (Link Quality Sensor kann helfen)
- Timeout-Einstellungen anpassen wenn Sensoren seltener senden
- Data Age Sensor zeigt wie alt die letzten Daten sind

## Logs (INFO Mode)

```
[INFO] jaABlu v1.3.0: MQTT connected                                                                      08:58:43
[INFO] jaABlu v1.3.0: BLE scanner already running                                                         08:58:43
[INFO] jaABlu v1.3.0: Timeout monitoring started (interval: 120s)                                         08:58:43
[INFO] jaABlu v1.3.0: jaABlu parser initialized (v1.3.0)                                                  08:58:43
[INFO] jaABlu v1.3.0: Log level: INFO                                                                     08:58:43
[INFO] jaABlu v1.3.0: Temperature unit: °C                                                                08:58:43
[INFO] jaABlu v1.3.0: Optional sensors enabled: RSSI, Last Seen, Link Quality, Battery Low, Data Age      08:58:43
[INFO] jaABlu v1.3.0: Jaalee JHT found - MAC: XX:XX:XX:XX:XX:XX | Temp: 0.58°C | Humidity: 92.01%         08:58:44
[INFO] jaABlu v1.3.0: MQTT Discovery published for: XX:XX:XX:XX:XX:XX                                     08:58:52
```

## Entwicklung

### Tests ausführen

jaABlu enthält eine umfassende Test-Suite mit 37 Unit-Tests für alle Kernfunktionen.

```bash
# Dependencies installieren
npm install

# Alle Tests ausführen
npm test

# Tests im Watch-Mode (automatisch bei Änderungen)
npm run test:watch

# Coverage-Report generieren
npm run coverage
```

### Test-Abdeckung

- ✅ **37 Testfälle** für Helper-Funktionen, BLE-Parsing und Edge-Cases
- ✅ **100% Statement Coverage**
- ✅ **96,66% Branch Coverage**
- ✅ **Continuous Integration** via GitHub Actions

### Projekt-Struktur

```
jaABlu/
├── .github/workflows/
│   └── test.yml           # CI/CD Pipeline
├── test/
│   └── jaABlu.test.js     # Unit Tests
├── jaABlu-core.js         # Testbares Core-Modul
├── jaABlu.js              # Produktions-Script für Shelly
├── package.json           # NPM-Konfiguration
└── README.md              # Dokumentation
```

## Lizenz

MIT License – siehe [LICENSE](LICENSE) © 2026 Arend Böhmer

## Repository

[https://github.com/arboeh/jaABlu](https://github.com/arboeh/jaABlu)
