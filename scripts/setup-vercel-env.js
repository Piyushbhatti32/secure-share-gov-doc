#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up environment variables for Vercel deployment...\n');

// Check if .env.local exists
const envPath = path.join(process.cwd(), '.env.local');
if (!fs.existsSync(envPath)) {
  console.error('❌ .env.local file not found!');
  console.log('Please create a .env.local file with your environment variables first.');
  console.log('You can copy from ENVIRONMENT_VARIABLES.md for reference.');
  process.exit(1);
}

// Read .env.local file
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};

// Parse environment variables
envContent.split('\n').forEach(line => {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#')) {
    const [key, ...valueParts] = trimmed.split('=');
    if (key && valueParts.length > 0) {
      envVars[key] = valueParts.join('=');
    }
  }
});

console.log('📋 Found environment variables:');
Object.keys(envVars).forEach(key => {
  console.log(`  ${key}`);
});

console.log('\n🔧 Setting up environment variables in Vercel...\n');

// Set environment variables in Vercel
Object.entries(envVars).forEach(([key, value]) => {
  try {
    console.log(`Setting ${key}...`);
    execSync(`vercel env add ${key} production`, { 
      input: value,
      stdio: ['pipe', 'pipe', 'pipe']
    });
    console.log(`✅ ${key} set successfully`);
  } catch (error) {
    console.log(`⚠️  ${key} might already be set or there was an error`);
  }
});

console.log('\n🎉 Environment variables setup complete!');
console.log('\n📝 Next steps:');
console.log('1. Run: vercel --prod');
console.log('2. Your app should now deploy successfully');
console.log('\n💡 If you need to update environment variables later:');
console.log('   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables');
console.log('   - Or use: vercel env ls to see current variables');
