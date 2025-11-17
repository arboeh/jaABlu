# Jaalee to Home Assistant via Shelly & MQTT

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Home Assistant](https://img.shields.io/badge/Home%20Assistant-Compatible-41BDF5.svg)](https://www.home-assistant.io/)
[![Shelly](https://img.shields.io/badge/Shelly-Gen2%2FGen3-00A0E3.svg)](https://shelly.cloud/)

Parse Jaalee JHT BLE sensor data using Shelly devices as Bluetooth gateways and forward to Home Assistant via MQTT Auto-Discovery.

**Data Flow:** `Jaalee BLE Sensor` → `Shelly Gateway` → `MQTT Broker` → `Home Assistant`
