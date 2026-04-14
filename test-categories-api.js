#!/usr/bin/env node

// Test script to verify categories API
import axios from 'axios';

const API_URL = process.env.VITE_API_URL || 'http://localhost:5000/api';

async function testCategoriesAPI() {
  console.log('🧪 Testing Categories API...\n');
  console.log(`API Base URL: ${API_URL}\n`);

  try {
    // Test 1: Get all categories
    console.log('📍 Test 1: GET /products/categories');
    const response = await axios.get(`${API_URL}/products/categories`);
    
    console.log('Response Status:', response.status);
    console.log('Response Headers:', response.headers);
    console.log('Response Data:');
    console.log(JSON.stringify(response.data, null, 2));
    
    if (response.data && Array.isArray(response.data.data)) {
      console.log(`\n✅ SUCCESS: Found ${response.data.data.length} categories\n`);
      response.data.data.forEach(cat => {
        console.log(`  - ${cat.icon} ${cat.name} (order: ${cat.display_order})`);
      });
    } else {
      console.log('\n⚠️  WARNING: Response format unexpected');
      console.log('Expected: { data: [{id, name, icon, description, ...}] }');
      console.log(`Actual: ${JSON.stringify(response.data, null, 2)}`);
    }

  } catch (err) {
    console.error('❌ ERROR:', err.message);
    if (err.response) {
      console.log('Response Status:', err.response.status);
      console.log('Response Data:', err.response.data);
    }
  }
}

testCategoriesAPI();
