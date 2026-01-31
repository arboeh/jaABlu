// test/jaABlu.test.js
const assert = require('chai').assert;
const JaaleeCore = require('../jaABlu-core.js');

// Aliase für kürzere Notation in Tests
const {
  roundTo2Decimals,
  convertTemperature,
  validateSensorData,
  calculateLinkQuality,
  formatMacForTopic,
  JaaleeDecoder,
} = JaaleeCore;

describe('jaABlu Helper Functions', function () {
  describe('roundTo2Decimals()', function () {
    it('should round 1.234 to 1.23', function () {
      const result = roundTo2Decimals(1.234);
      assert.equal(result, 1.23);
    });

    it('should round 1.235 to 1.24', function () {
      const result = roundTo2Decimals(1.235);
      assert.equal(result, 1.24);
    });

    it('should handle negative numbers', function () {
      const result = roundTo2Decimals(-1.567);
      assert.equal(result, -1.57);
    });
  });

  describe('convertTemperature()', function () {
    it('should convert 0°C to 32°F', function () {
      const result = convertTemperature(0, 'fahrenheit');
      assert.equal(result, 32);
    });

    it('should keep celsius as-is', function () {
      const result = convertTemperature(23.5, 'celsius');
      assert.equal(result, 23.5);
    });

    it('should convert 100°C to 212°F', function () {
      const result = convertTemperature(100, 'fahrenheit');
      assert.equal(result, 212);
    });

    it('should convert -40°C to -40°F', function () {
      const result = convertTemperature(-40, 'fahrenheit');
      assert.equal(result, -40);
    });
  });

  describe('validateSensorData()', function () {
    it('should accept valid temperature and humidity', function () {
      assert.isTrue(validateSensorData(23.5, 45.2));
    });

    it('should reject out-of-range temperature (too low)', function () {
      assert.isFalse(validateSensorData(-50, 50));
    });

    it('should reject out-of-range temperature (too high)', function () {
      assert.isFalse(validateSensorData(100, 50));
    });

    it('should reject out-of-range humidity (negative)', function () {
      assert.isFalse(validateSensorData(20, -5));
    });

    it('should reject out-of-range humidity (over 100)', function () {
      assert.isFalse(validateSensorData(20, 110));
    });

    it('should accept boundary values', function () {
      assert.isTrue(validateSensorData(-40, 0));
      assert.isTrue(validateSensorData(80, 100));
    });
  });

  describe('calculateLinkQuality()', function () {
    it('should return 100% for excellent signal (-30 dBm)', function () {
      assert.equal(calculateLinkQuality(-30), 100);
    });

    it('should return 0% for unusable signal (-90 dBm)', function () {
      assert.equal(calculateLinkQuality(-90), 0);
    });

    it('should return 50% for medium signal (-60 dBm)', function () {
      assert.equal(calculateLinkQuality(-60), 50);
    });

    it('should cap at 100% for signal better than -30 dBm', function () {
      assert.equal(calculateLinkQuality(-20), 100);
      assert.equal(calculateLinkQuality(0), 100);
    });

    it('should cap at 0% for signal worse than -90 dBm', function () {
      assert.equal(calculateLinkQuality(-100), 0);
      assert.equal(calculateLinkQuality(-120), 0);
    });
  });

  describe('formatMacForTopic()', function () {
    it('should convert MAC to lowercase without colons', function () {
      assert.equal(formatMacForTopic('AA:BB:CC:DD:EE:FF'), 'aabbccddeeff');
    });

    it('should handle lowercase input', function () {
      assert.equal(formatMacForTopic('aa:bb:cc:dd:ee:ff'), 'aabbccddeeff');
    });

    it('should handle mixed case', function () {
      assert.equal(formatMacForTopic('Aa:Bb:Cc:Dd:Ee:Ff'), 'aabbccddeeff');
    });

    it('should handle empty string', function () {
      assert.equal(formatMacForTopic(''), '');
    });

    it('should handle null/undefined', function () {
      assert.equal(formatMacForTopic(null), '');
      assert.equal(formatMacForTopic(undefined), '');
    });
  });
});

describe('JaaleeDecoder', function () {
  describe('calculateTemperature()', function () {
    it('should calculate correct temperature from raw value', function () {
      const result = JaaleeDecoder.calculateTemperature(32768);
      assert.approximately(result, 42.5, 0.01);
    });

    it('should calculate minimum temperature', function () {
      const result = JaaleeDecoder.calculateTemperature(0);
      assert.equal(result, -45);
    });

    it('should calculate maximum temperature', function () {
      const result = JaaleeDecoder.calculateTemperature(65535);
      assert.equal(result, 130);
    });
  });

  describe('calculateHumidity()', function () {
    it('should calculate correct humidity from raw value', function () {
      const result = JaaleeDecoder.calculateHumidity(32768);
      assert.approximately(result, 50.0, 0.01);
    });

    it('should calculate 0% humidity', function () {
      const result = JaaleeDecoder.calculateHumidity(0);
      assert.equal(result, 0);
    });

    it('should calculate 100% humidity', function () {
      const result = JaaleeDecoder.calculateHumidity(65535);
      assert.equal(result, 100);
    });
  });

  describe('parseLongFormat()', function () {
    it('should parse valid iBeacon data', function () {
      const mockData = {
        at: function (index) {
          const data = [
            0x02, 0x15, 0xf5, 0x25, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
            0x80, 0x00, 0x80, 0x00, 0x00, 0x64,
          ];
          return data[index];
        },
        length: 24,
      };

      const result = JaaleeDecoder.parseLongFormat(mockData);

      assert.isNotNull(result);
      assert.approximately(result.temperature, 42.5, 0.1);
      assert.approximately(result.humidity, 50.0, 0.1);
      assert.equal(result.battery, 100);
      assert.equal(result.format, 'iBeacon-24');
    });

    it('should reject data with invalid sensor values', function () {
      // Daten mit ungültiger Temperatur (außerhalb -40 bis 80°C)
      const mockData = {
        at: function (index) {
          const data = [
            0x02,
            0x15, // iBeacon header
            0xf5,
            0x25,
            0x00,
            0x00,
            0x00,
            0x00, // Jaalee marker
            0x00,
            0x00,
            0x00,
            0x00,
            0x00,
            0x00,
            0x00,
            0x00,
            0x00,
            0x00,
            0xff,
            0xff, // Temperature raw (ungültig: >130°C)
            0x80,
            0x00, // Humidity 50%
            0x00,
            0x64, // Battery 100%
          ];
          return data[index];
        },
        length: 24,
      };

      const result = JaaleeDecoder.parseLongFormat(mockData);

      // Sollte null zurückgeben wegen ungültiger Temperatur
      assert.isNull(result);
    });

    it('should reject invalid data length', function () {
      const mockData = { at: () => 0, length: 10 };
      assert.isNull(JaaleeDecoder.parseLongFormat(mockData));
    });

    it('should reject data without iBeacon header', function () {
      const mockData = {
        at: function (index) {
          const data = new Array(24).fill(0);
          data[0] = 0xff;
          data[1] = 0xff;
          return data[index];
        },
        length: 24,
      };
      assert.isNull(JaaleeDecoder.parseLongFormat(mockData));
    });

    it('should reject data without Jaalee marker', function () {
      const mockData = {
        at: function (index) {
          const data = new Array(24).fill(0);
          data[0] = 0x02;
          data[1] = 0x15;
          return data[index];
        },
        length: 24,
      };
      assert.isNull(JaaleeDecoder.parseLongFormat(mockData));
    });
  });
});

describe('Edge Cases & Integration', function () {
  it('should handle temperature conversion with validation', function () {
    const validTemp = 23.5;
    const validHumidity = 50;

    assert.isTrue(validateSensorData(validTemp, validHumidity));

    const fahrenheit = convertTemperature(validTemp, 'fahrenheit');
    assert.approximately(fahrenheit, 74.3, 0.1);
  });

  it('should handle RSSI edge cases', function () {
    assert.equal(calculateLinkQuality(-45), 75);
    assert.equal(calculateLinkQuality(-75), 25);
  });
});

it('should find Jaalee marker at different positions in UUID', function () {
  // Test: Jaalee marker am Ende der UUID (Bytes 15-16)
  const mockData = {
    at: function (index) {
      const data = [
        0x02,
        0x15, // iBeacon header
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00, // UUID start
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0xf5,
        0x25,
        0x00, // Jaalee marker am Ende
        0x80,
        0x00, // Temperature
        0x80,
        0x00, // Humidity
        0x00,
        0x64, // Battery
      ];
      return data[index];
    },
    length: 24,
  };

  const result = JaaleeDecoder.parseLongFormat(mockData);

  assert.isNotNull(result);
  assert.approximately(result.temperature, 42.5, 0.1);
  assert.approximately(result.humidity, 50.0, 0.1);

  it('should handle edge case where marker check reaches boundary', function () {
    // Marker-Check läuft bis Index 16, aber bei i+1 würde es außerhalb sein
    const mockData = {
      at: function (index) {
        const data = new Array(24).fill(0);
        data[0] = 0x02;
        data[1] = 0x15;
        data[16] = 0xf5; // Letzter möglicher Index, aber i+1 wäre 17
        data[17] = 0x00; // Kein 0x25 -> sollte fehlschlagen
        return data[index];
      },
      length: 24,
    };

    const result = JaaleeDecoder.parseLongFormat(mockData);
    assert.isNull(result); // Sollte null sein, da kein vollständiger Marker
  });
});
