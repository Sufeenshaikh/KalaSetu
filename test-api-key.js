/**
 * Test script to verify Gemini API key is configured and working
 */

import { GoogleGenAI } from "@google/genai";
import { readFileSync, existsSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env.local or .env
function loadEnvFile() {
  const envFiles = ['.env.local', '.env'];
  for (const file of envFiles) {
    const filePath = join(__dirname, file);
    if (existsSync(filePath)) {
      const content = readFileSync(filePath, 'utf-8');
      for (const line of content.split('\n')) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
          const [key, ...values] = trimmed.split('=');
          const value = values.join('=').trim().replace(/^["']|["']$/g, '');
          if (!process.env[key.trim()]) {
            process.env[key.trim()] = value;
          }
        }
      }
    }
  }
}

loadEnvFile();

const apiKey = process.env.GEMINI_API_KEY;

console.log('\n🔍 Checking Gemini API Key Configuration...\n');

// Check if API key exists
if (!apiKey) {
  console.error('❌ ERROR: GEMINI_API_KEY is not set in environment variables');
  console.log('\n📝 To fix this:');
  console.log('   1. Create a .env.local file in the root directory');
  console.log('   2. Add: GEMINI_API_KEY=your_actual_api_key_here');
  console.log('   3. Get your API key from: https://aistudio.google.com/app/apikey');
  process.exit(1);
}

// Check if it's still a placeholder
if (apiKey === 'PLACEHOLDER_API_KEY' || apiKey.includes('PLACEHOLDER') || apiKey.length < 20) {
  console.warn('⚠️  WARNING: API key appears to be a placeholder or invalid');
  console.log(`   Current value: ${apiKey.substring(0, 10)}...`);
  console.log('\n📝 To fix this:');
  console.log('   1. Get your API key from: https://aistudio.google.com/app/apikey');
  console.log('   2. Update GEMINI_API_KEY in .env.local with your actual key');
  process.exit(1);
}

console.log('✅ API key is set in environment');
console.log(`   Key preview: ${apiKey.substring(0, 10)}...${apiKey.substring(apiKey.length - 4)}\n`);

// Test the API key with a simple request
console.log('🧪 Testing API key with a simple request...\n');

try {
  const genAI = new GoogleGenAI({ apiKey });
  
  const response = await genAI.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: 'Say "Hello, API key is working!" in one sentence.',
  });

  if (response && response.text) {
    console.log('✅ SUCCESS! API key is working correctly!\n');
    console.log('📝 Response from Gemini:');
    console.log(`   "${response.text}"\n`);
    console.log('✅ Your story generation should work now!\n');
    process.exit(0);
  } else {
    console.error('❌ ERROR: Received empty response from API');
    process.exit(1);
  }
} catch (error) {
  console.error('❌ ERROR: API key test failed\n');
  console.error('Error details:', {
    message: error?.message,
    code: error?.code,
    status: error?.status,
    statusCode: error?.statusCode,
  });
  
  console.log('\n🔧 Common issues:');
  
  if (error?.code === 401 || error?.message?.includes('API key')) {
    console.log('   • Invalid API key - Check that your API key is correct');
    console.log('   • Get a new key from: https://aistudio.google.com/app/apikey');
  } else if (error?.code === 429) {
    console.log('   • Rate limit exceeded - Wait a moment and try again');
  } else if (error?.code === 'ENOTFOUND' || error?.code === 'ECONNREFUSED') {
    console.log('   • Network error - Check your internet connection');
  } else {
    console.log('   • Unexpected error - Check error details above');
  }
  
  console.log('');
  process.exit(1);
}

