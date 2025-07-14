// Test configuration display with API key redaction
const fs = require('fs');

// Mock configuration
const testConfig = {
  "$schema": "https://opencode.ai/config.json",
  "provider": {
    "anthropic": {
      "options": {
        "apiKey": "sk-test-secret-key-12345"
      }
    },
    "openai": {
      "options": {
        "apiKey": "sk-another-secret-key-67890"
      }
    }
  },
  "theme": "dark",
  "share": "auto"
};

console.log('Testing configuration display with API key redaction...');
console.log('Original config:', JSON.stringify(testConfig, null, 2));

// Simulate the redaction logic from settings.ts
const safeConfig = JSON.parse(JSON.stringify(testConfig));
if (safeConfig.provider) {
  for (const p in safeConfig.provider) {
    if (safeConfig.provider[p].options?.apiKey) {
      safeConfig.provider[p].options.apiKey = "[REDACTED]";
    }
  }
}

console.log('\nRedacted config:');
console.log(JSON.stringify(safeConfig, null, 2));

console.log('\nConfiguration redaction test completed successfully!');
