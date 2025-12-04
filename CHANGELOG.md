# Changelog

Alle signifikanten Änderungen am Projekt werden hier dokumentiert.

## [1.2.1] - 2025-12-04

### Fixed

- MQTT discovery timing issue by adding connection check before publishing
- Discovery messages now only sent when MQTT is confirmed connected

## [1.2.0] - 2025-12-03

### Added

- Per-sensor online/offline status topic (retained) for availability
- Availability to Home Assistant discovery entities (`availability_topic`, payloads)
- Sensor timeout monitoring with periodic checker (5 min default)

### Changed

- Minor logging improvements for BLE parsing and MQTT publishing

## [1.1.0] - 2025-11-17

### Added

- Configurable log levels (ERROR, WARN, INFO, DEBUG)
- Diagnostic entities (Battery always enabled, RSSI/Last Seen optional)

### Fixed

- Last Seen timestamp format (ISO 8601 UTC)
- Improved sensor detection and parsing

## [1.0.0] - 2025-11-17

### Added

- Initial release
- Support for Jaalee JHT sensors
- MQTT Auto-Discovery integration
- Multi-sensor support
