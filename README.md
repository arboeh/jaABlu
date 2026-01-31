<img src="logo.svg" alt="jaABlu" height="40"/>

### Jaalee JHT BLE → Shelly BLU Gateway → Home Assistant MQTT + Auto Discovery

🇬🇧 English | [🇩🇪 **Deutsch**](README.de.md)

[![Version](https://img.shields.io/github/v/release/arboeh/jaABlu?color=brightgreen)](https://github.com/arboeh/jaABlu/releases/latest)
[![Tests](https://github.com/arboeh/jaABlu/workflows/Tests/badge.svg)](https://github.com/arboeh/jaABlu/actions)
[![codecov](https://codecov.io/gh/arboeh/jaABlu/branch/main/graph/badge.svg)](https://codecov.io/gh/arboeh/jaABlu)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18-brightgreen)](https://nodejs.org/)
[![Home Assistant](https://img.shields.io/badge/Home%20Assistant-Compatible-41BDF5.svg)](https://www.home-assistant.io/)
[![Shelly](https://img.shields.io/badge/Shelly-BLU%20Gateway-00A0E3.svg)](https://shelly.cloud/)


The jaABlu script reads **Jaalee JHT** BLE temperature and humidity sensors using **Shelly BLU Gateway** devices as Bluetooth proxies and forwards the data to **Home Assistant** via **MQTT Auto-Discovery**.

## Features

- ✅ **Full MQTT Auto-Discovery support** – sensors are created automatically in Home Assistant
- ✅ **8 optional sensor entities per device**: Temperature, Humidity, Battery, RSSI, Last Seen, Link Quality, Battery Low Warning, Data Age
- ✅ **Configurable temperature unit** – Celsius or Fahrenheit
- ✅ **Online/Offline status** – automatic detection via configurable timeout (default 5 minutes)
- ✅ **Multi-sensor support** – any number of Jaalee JHT sensors per Shelly BLU Gateway
- ✅ **Configurable logging** – DEBUG / INFO / WARN / ERROR
- ✅ **Active BLE scanning** – optimized for the Jaalee iBeacon format
- ✅ **Optimized performance** – MQTT caching, helper functions, reduced code duplication

## Requirements

- Shelly BLU Gateway (e.g. BLU Gateway, BLU Mini, BLU Pro) with **Bluetooth enabled**
- Home Assistant with a running **MQTT broker** (e.g. Mosquitto)
- MQTT Auto-Discovery enabled, Discovery prefix set to `homeassistant` (default)

## Installation

1. **Upload the script to your Shelly BLU Gateway**

   In the web UI:
   - `Settings → Scripts → Add script`
   - Paste the contents of `jaABlu.js`
   - Enable the script

2. **Enable Bluetooth on the Shelly**
   - `Settings → Bluetooth → Enable`

3. **Start the script**
   - `Settings → Scripts → jaABlu.js → Start`
   - Optionally enable autostart for the script

4. **Verify in Home Assistant**
   - After a few seconds, new devices should appear under  
     `Settings → Devices & Services → MQTT`.
   - Each Jaalee sensor will expose several entities (Temperature, Humidity, Battery, etc.).

## Configuration

The script can be configured through the `CONFIG` object:

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
    // 'XX:XX:XX:XX:XX:XX': 'Living Room',
  },
};
```

## Home Assistant Entities

### Primary Sensors (always active)

| Entity                          | Type   | Device Class  | Description            |
| ------------------------------- | ------ | ------------- | ---------------------- |
| `sensor.jaalee_xxx_temperature` | Sensor | `temperature` | Temperature (°C or °F) |
| `sensor.jaalee_xxx_humidity`    | Sensor | `humidity`    | Humidity (%)           |
| `sensor.jaalee_xxx_battery`     | Sensor | `battery`     | Battery level (%)      |

### Optional Diagnostic Sensors (configurable)

| Entity                                 | Type          | Device Class      | Default | Description            |
| -------------------------------------- | ------------- | ----------------- | ------- | ---------------------- |
| `sensor.jaalee_xxx_rssi`               | Sensor        | `signal_strength` | 🔘      | Signal strength (dBm)  |
| `sensor.jaalee_xxx_last_seen`          | Sensor        | `timestamp`       | 🔘      | Last seen timestamp    |
| `sensor.jaalee_xxx_link_quality`       | Sensor        | -                 | ⚪      | Connection quality (%) |
| `binary_sensor.jaalee_xxx_battery_low` | Binary Sensor | `battery`         | ⚪      | Low battery warning    |
| `sensor.jaalee_xxx_data_age`           | Sensor        | -                 | ⚪      | Age of last data (s)   |

**Legend:**

- ✅ = Always enabled
- 🔘 = Enabled by default (configurable)
- ⚪ = Disabled by default (can be enabled manually)

## New Features in v1.3.0

### Temperature Unit

Choose between Celsius and Fahrenheit:

```javascript
temperature: {
  unit: 'fahrenheit', // or 'celsius'
}
```

### Link Quality

RSSI is automatically converted to a user-friendly percentage display (0-100%):

- 100% = Excellent signal (-30 dBm)
- 0% = No usable signal (-90 dBm)

### Battery Low Warning

Binary sensor for automations on low battery:

```yaml
automation:
  - alias: 'Low Battery Notification'
    trigger:
      - platform: state
        entity_id: binary_sensor.jaalee_xxx_battery_low
        to: 'on'
    action:
      - service: notify.mobile_app
        data:
          message: 'Jaalee sensor battery is low!'
```

### Data Age

Monitor the freshness of sensor data - useful for diagnostics and timeout monitoring.

## Troubleshooting

**❌ No sensors/devices appear in Home Assistant**

- Restart Home Assistant once after the script has been started.
- Verify that the MQTT broker is configured correctly in Home Assistant.
- Check the script logs for messages like "MQTT connected" and "MQTT Discovery published for: …".

**❌ Discovery topics missing on the MQTT broker**

- Increase log level to DEBUG in the script:

  ```javascript
  logLevel: LOG_LEVELS.DEBUG;
  ```

- Use an MQTT tool (e.g. MQTT Explorer) to check for topics like

  ```
  homeassistant/sensor/jaABlu_*/config
  ```

**❌ Sensor shows "Unavailable"**

- Check if the sensor is within Bluetooth range (Link Quality sensor can help)
- Adjust timeout settings if sensors transmit less frequently
- Data Age sensor shows how old the last data is

## Logs (INFO mode)

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

## Development

### Running Tests

jaABlu includes a comprehensive test suite with 37 unit tests covering all core functionality.

```bash
# Install dependencies
npm install

# Run all tests
npm test

# Run tests in watch mode (auto-rerun on changes)
npm run test:watch

# Generate coverage report
npm run coverage
```

### Test Coverage

- ✅ **37 test cases** covering helper functions, BLE parsing, and edge cases
- ✅ **100% statement coverage**
- ✅ **96.66% branch coverage**
- ✅ **Continuous Integration** via GitHub Actions

### Project Structure

```
jaABlu/
├── .github/workflows/
│   └── test.yml           # CI/CD pipeline
├── test/
│   └── jaABlu.test.js     # Unit tests
├── jaABlu-core.js         # Testable core module
├── jaABlu.js              # Production Shelly script
├── package.json           # NPM configuration
└── README.md              # Documentation
```

## License

MIT License – see [LICENSE](LICENSE) © 2026 Arend Böhmer

## Repository

[https://github.com/arboeh/jaABlu](https://github.com/arboeh/jaABlu)
