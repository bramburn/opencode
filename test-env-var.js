// Test environment variable detection
process.env.OPENCODE_DEBUG_LOG = 'true';

console.log('Environment variable test:');
console.log('OPENCODE_DEBUG_LOG =', process.env.OPENCODE_DEBUG_LOG);
console.log('Is debug enabled?', process.env.OPENCODE_DEBUG_LOG === 'true');

// Test the log level setting logic
let currentLevel = "INFO";
function setLevel(level) {
  currentLevel = level;
}

if (process.env.OPENCODE_DEBUG_LOG === 'true') {
  setLevel("DEBUG");
  console.log('Debug logging enabled, level set to:', currentLevel);
} else {
  console.log('Debug logging disabled, level remains:', currentLevel);
}

console.log('Environment variable test completed successfully!');
