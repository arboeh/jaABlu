// jaABlu-core.js
const JaaleeCore = {
  VERSION: '1.3.1',

  // Konstanten
  CONSTANTS: {
    TEMP_SCALE_FACTOR: 175,
    TEMP_OFFSET: -45,
    HUMIDITY_SCALE_FACTOR: 100,
    ADC_MAX_VALUE: 65535,
    TEMP_MIN: -40,
    TEMP_MAX: 80,
    HUMIDITY_MIN: 0,
    HUMIDITY_MAX: 100,
    RSSI_EXCELLENT: -30,
    RSSI_UNUSABLE: -90,
  },

  // Helper-Funktionen
  roundTo2Decimals: function (value) {
    return Math.round(value * 100) / 100;
  },

  convertTemperature: function (celsius, unit) {
    if (unit === 'fahrenheit') {
      return JaaleeCore.roundTo2Decimals((celsius * 9) / 5 + 32);
    }
    return celsius;
  },

  validateSensorData: function (temperature, humidity) {
    if (temperature < JaaleeCore.CONSTANTS.TEMP_MIN || temperature > JaaleeCore.CONSTANTS.TEMP_MAX) {
      return false;
    }
    if (humidity < JaaleeCore.CONSTANTS.HUMIDITY_MIN || humidity > JaaleeCore.CONSTANTS.HUMIDITY_MAX) {
      return false;
    }
    return true;
  },

  calculateLinkQuality: function (rssi) {
    const range = JaaleeCore.CONSTANTS.RSSI_EXCELLENT - JaaleeCore.CONSTANTS.RSSI_UNUSABLE;
    const quality = ((rssi - JaaleeCore.CONSTANTS.RSSI_UNUSABLE) * 100) / range;
    return Math.round(Math.min(100, Math.max(0, quality)));
  },

  formatMacForTopic: function (mac) {
    if (!mac) return '';
    const parts = mac.split(':');
    let result = '';
    for (let i = 0; i < parts.length; i++) {
      result += parts[i].toLowerCase();
    }
    return result;
  },

  // JaaleeDecoder
  JaaleeDecoder: {
    getUInt16BE: function (buffer, offset) {
      return (buffer.at(offset) << 8) | buffer.at(offset + 1);
    },

    calculateTemperature: function (rawValue) {
      const celsius =
        (JaaleeCore.CONSTANTS.TEMP_SCALE_FACTOR * rawValue) / JaaleeCore.CONSTANTS.ADC_MAX_VALUE +
        JaaleeCore.CONSTANTS.TEMP_OFFSET;
      return JaaleeCore.roundTo2Decimals(celsius);
    },

    calculateHumidity: function (rawValue) {
      const humidity = (JaaleeCore.CONSTANTS.HUMIDITY_SCALE_FACTOR * rawValue) / JaaleeCore.CONSTANTS.ADC_MAX_VALUE;
      return JaaleeCore.roundTo2Decimals(humidity);
    },

    parseLongFormat: function (data) {
      if (data.length !== 24) return null;

      if (data.at(0) !== 0x02 || data.at(1) !== 0x15) {
        return null;
      }

      let hasJaaleeMarker = false;
      for (let i = 2; i < 17; i++) {
        if (data.at(i) === 0xf5 && data.at(i + 1) === 0x25) {
          hasJaaleeMarker = true;
          break;
        }
      }

      if (!hasJaaleeMarker) return null;

      const tempRaw = JaaleeCore.JaaleeDecoder.getUInt16BE(data, 18);
      const temperature = JaaleeCore.JaaleeDecoder.calculateTemperature(tempRaw);

      const humiRaw = JaaleeCore.JaaleeDecoder.getUInt16BE(data, 20);
      const humidity = JaaleeCore.JaaleeDecoder.calculateHumidity(humiRaw);

      const battery = data.at(23);

      if (!JaaleeCore.validateSensorData(temperature, humidity)) {
        return null;
      }

      return {
        temperature: temperature,
        humidity: humidity,
        battery: battery,
        format: 'iBeacon-24',
      };
    },
  },
};

// Export für Node.js Tests
if (typeof module !== 'undefined' && module.exports) {
  module.exports = JaaleeCore;
}
