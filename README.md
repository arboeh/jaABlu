# Jaalee JHT BLE → Home Assistant via Shelly BLU Gateway & MQTT

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Home Assistant](https://img.shields.io/badge/Home%20Assistant-Compatible-41BDF5.svg)](https://www.home-assistant.io/)
[![Shelly](https://img.shields.io/badge/Shelly-BLU%20Gateway-00A0E3.svg)](https://shelly.cloud/)
[![Version](https://img.shields.io/badge/Version-1.2.1-brightgreen.svg)](https://github.com/arboeh/jaalee-shelly-mqtt)

Parse **Jaalee JHT** BLE temperature/humidity sensors using **Shelly BLU Gateway** devices as Bluetooth proxies and forward data to **Home Assistant** via **MQTT Auto-Discovery**.

## Features

- ✅ **Full MQTT Auto-Discovery** - Sensors erscheinen automatisch in Home Assistant
- ✅ **5 Sensors pro Gerät**: Temperature, Humidity, Battery, RSSI, Last Seen
- ✅ **Online/Offline Status** - Automatische Erkennung bei 5min Timeout
- ✅ **Multi-Sensor Support** - Unbegrenzt viele Jaalee JHT pro Gateway
- ✅ **Configurable Logging** - DEBUG/INFO/WARN/ERROR Levels
- ✅ **Active BLE Scanning** - Optimiert für Jaalee iBeacon-Format

## Voraussetzungen

- Shelly BLU Gateway (BLU Mini, BLU Pro, etc.) mit **Bluetooth aktiviert**
- Home Assistant mit **MQTT Broker** (Mosquitto)
- MQTT Discovery Prefix: `homeassistant` (Standard)

## Installation

1. **Script hochladen** auf dein Shelly BLU Gateway:
2. **Bluetooth aktivieren**:
3. **Script starten**:
4. **Home Assistant**: Sensors erscheinen automatisch unter **MQTT Devices**

## Konfiguration

    const CONFIG = {
        mqtt: {
            publish_rssi: true, // Signalstärke (dBm)
            publish_last_seen: true, // Timestamp (ISO 8601)
            sensor_timeout: 300 // Offline nach 5min
        },
        knownDevices: {
            "aa:bb:cc:dd:ee:ff": "Wohnzimmer" // Friendly Names
        }
    };

## Home Assistant Entities

| Entity | Typ | Device Class | Standard |
|--------|-----|--------------|----------|
| `sensor.jaalee_xxx_temperature` | Sensor | temperature | ✅ |
| `sensor.jaalee_xxx_humidity` | Sensor | humidity | ✅ |
| `sensor.jaalee_xxx_battery` | Sensor | battery | ✅ |
| `sensor.jaalee_xxx_rssi` | Sensor | signal_strength | 🔘 |
| `sensor.jaalee_xxx_last_seen` | Sensor | timestamp | 🔘 |

## Troubleshooting

❌ Keine Sensors in HA?
→ HA neu starten nach Script-Start
→ MQTT Logs aktivieren: homeassistant.components.mqtt: debug

❌ Discovery Topics fehlen?
→ Log Level auf DEBUG: logLevel: LOG_LEVELS.DEBUG
→ MQTT Explorer: homeassistant/sensor/jaalee_*/config

## Logs (DEBUG Mode)

    [INFO] Jaalee JHT parser initialized (v1.2.1)
    [INFO] MQTT connected
    [INFO] Jaalee JHT found - MAC: c5:c7:14:4d:2b:35 | Temp: 21.5°C | Humidity: 52%
    [INFO] MQTT Discovery published for: c5:c7:14:4d:2b:35


## License

MIT License - siehe [LICENSE](LICENSE) © 2025 Arend Böhmer

## Repository

[![GitHub Repo](https://github.com/arboeh/jaalee-shelly-mqtt/actions/workflows/ci.yml/badge.svg)](https://github.com/arboeh/jaalee-shelly-mqtt)
