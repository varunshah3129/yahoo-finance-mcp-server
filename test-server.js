#!/usr/bin/env node

/**
 * Simple test script to verify the Yahoo Finance MCP server is working
 * Run this after building the server: node test-server.js
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🧪 Testing Yahoo Finance MCP Server...\n');

// Test cases
const testCases = [
  {
    name: 'List Tools',
    request: {
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/list',
      params: {}
    }
  },
  {
    name: 'Get Quote (AAPL)',
    request: {
      jsonrpc: '2.0',
      id: 2,
      method: 'tools/call',
      params: {
        name: 'get_quote',
        arguments: {
          symbol: 'AAPL'
        }
      }
    }
  },
  {
    name: 'Search Symbols (Apple)',
    request: {
      jsonrpc: '2.0',
      id: 3,
      method: 'tools/call',
      params: {
        name: 'search_symbols',
        arguments: {
          query: 'Apple'
        }
      }
    }
  }
];

async function runTest(testCase) {
  return new Promise((resolve, reject) => {
    console.log(`📋 Running test: ${testCase.name}`);
    
    const serverPath = join(__dirname, 'dist', 'index.js');
    const server = spawn('node', [serverPath], {
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let output = '';
    let errorOutput = '';

    server.stdout.on('data', (data) => {
      output += data.toString();
    });

    server.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    server.on('close', (code) => {
      if (code !== 0) {
        console.log(`❌ Test failed: ${testCase.name}`);
        console.log('Error output:', errorOutput);
        reject(new Error(`Server exited with code ${code}`));
        return;
      }

      try {
        const lines = output.trim().split('\n');
        const lastLine = lines[lines.length - 1];
        const response = JSON.parse(lastLine);
        
        if (response.error) {
          console.log(`❌ Test failed: ${testCase.name}`);
          console.log('Error:', response.error);
          reject(new Error(response.error.message));
        } else {
          console.log(`✅ Test passed: ${testCase.name}`);
          console.log('Response:', JSON.stringify(response.result, null, 2));
          resolve(response.result);
        }
      } catch (parseError) {
        console.log(`❌ Test failed: ${testCase.name} - Invalid JSON response`);
        console.log('Raw output:', output);
        reject(parseError);
      }
    });

    // Send the request
    server.stdin.write(JSON.stringify(testCase.request) + '\n');
    server.stdin.end();

    // Set timeout
    setTimeout(() => {
      server.kill();
      reject(new Error('Test timeout'));
    }, 10000);
  });
}

async function runAllTests() {
  try {
    console.log('🚀 Starting MCP server tests...\n');
    
    for (const testCase of testCases) {
      await runTest(testCase);
      console.log(''); // Empty line for readability
    }
    
    console.log('🎉 All tests completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('1. Add the server to your LibreChat configuration');
    console.log('2. Restart LibreChat');
    console.log('3. Start using Yahoo Finance tools in your chats!');
    
  } catch (error) {
    console.error('💥 Test suite failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Make sure you have run "npm run build"');
    console.log('2. Check that all dependencies are installed with "npm install"');
    console.log('3. Verify your internet connection for Yahoo Finance API calls');
    process.exit(1);
  }
}

runAllTests();



