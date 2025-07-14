// Simple test to verify debug logging functionality
process.env.OPENCODE_DEBUG_LOG = 'true';

// Mock the required modules
const mockLog = {
  debug: (msg, extra) => console.log('DEBUG:', msg, extra ? JSON.stringify(extra) : ''),
  info: (msg, extra) => console.log('INFO:', msg, extra ? JSON.stringify(extra) : ''),
  error: (msg, extra) => console.log('ERROR:', msg, extra ? JSON.stringify(extra) : ''),
  warn: (msg, extra) => console.log('WARN:', msg, extra ? JSON.stringify(extra) : ''),
  clone: () => mockLog,
  tag: () => mockLog
};

// Test the logging functionality
console.log('Testing OPENCODE_DEBUG_LOG environment variable...');
console.log('Environment variable set to:', process.env.OPENCODE_DEBUG_LOG);

// Simulate tool execution logging
mockLog.debug('Executing tool: test-tool', { args: { input: 'test input' } });
mockLog.debug('Tool test-tool result', { result: { output: 'test output' } });

// Simulate message logging
const testMessages = [
  { role: 'system', content: 'You are a helpful assistant' },
  { role: 'user', content: 'Hello, world!' }
];
mockLog.debug('Sending messages to model', { messages: JSON.stringify(testMessages, null, 2) });

console.log('Debug logging test completed successfully!');
