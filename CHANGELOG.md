# Changelog

## [1.2.3] - 2026-01-26

### Changed

- Rename repository to `jaABlu`
- Update README and Badges to new repository name

## [1.2.2] - 2025-12-04

### Fixed

- GitHub Actions release workflow permissions
- Release process now works with `softprops/action-gh-release@v2`

## [1.2.1] - 2025-12-04

### Fixed

- MQTT discovery timing issue by adding connection check before publishing
- Discovery messages now only sent when MQTT is confirmed connected
