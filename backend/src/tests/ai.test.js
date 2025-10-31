import axios from 'axios';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({
  path: path.resolve(__dirname, '../../.env')
});

const API_URL = 'http://localhost:3001'; // Adjust port if needed
const TEST_TIMEOUT = 10000; // 10 seconds

const testArtisan = {
  artisanName: "Rajesh Kumar",
  craft: "Traditional Pottery",
  location: "Jaipur, Rajasthan",
  experience: 25,
  keywords: ["clay pottery", "blue pottery", "traditional crafts"],
  tone: "inspiring"
};

async function runTests() {
  try {
    // Test 1: Generate Artisan Story
    console.log('\n🧪 Testing: Generate Artisan Story');
    const storyResponse = await axios.post(`${API_URL}/api/ai/story`, testArtisan);
    if (storyResponse.data.success && storyResponse.data.story) {
      console.log('✅ Story generation successful');
      console.log('Preview:', storyResponse.data.story.substring(0, 100) + '...');
    } else {
      throw new Error('Story generation failed');
    }

    // Test 2: Enhance Product Description
    console.log('\n🧪 Testing: Enhance Product Description');
    const productData = {
      productName: "Blue Pottery Vase",
      originalDescription: "A handmade vase with traditional designs.",
      category: "Home Decor",
      keywords: ["handmade", "pottery", "traditional"],
      style: "professional"
    };
    const descriptionResponse = await axios.post(`${API_URL}/api/ai/enhance-description`, productData);
    if (descriptionResponse.data.success && descriptionResponse.data.description) {
      console.log('✅ Description enhancement successful');
      console.log('Preview:', descriptionResponse.data.description.substring(0, 100) + '...');
    } else {
      throw new Error('Description enhancement failed');
    }

    console.log('\n✨ All tests passed successfully!');
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    if (error.response) {
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
      console.error('Status code:', error.response.status);
    }
    console.error('Full error:', error.stack);
  }
}

// Run the tests
console.log('🚀 Starting AI endpoint smoke tests...');
runTests();