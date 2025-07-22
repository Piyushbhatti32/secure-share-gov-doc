#!/usr/bin/env node

/**
 * Build Script for Secure Gov Doc Share
 * This script helps with development setup and validation
 */

const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(color, message) {
  console.log(color + message + colors.reset);
}

function checkFile(filePath) {
  return fs.existsSync(filePath);
}

function validateProject() {
  log(colors.blue, '🔍 Validating Project Structure...\n');
  
  const requiredFiles = [
    'public/index.html',
    'public/login.html', 
    'public/register.html',
    'public/dashboard.html',
    'public/profile.html',
    'assets/css/styles.css',
    'assets/js/firebase-config.js',
    'assets/js/auth.js',
    'assets/js/docManager.js',
    'assets/js/logger.js',
    'assets/js/profile.js',
    'assets/js/otp.js',
    'assets/js/share.js',
    'firebase.json',
    'firestore.rules',
    'storage.rules',
    'package.json'
  ];

  const missingFiles = [];
  const existingFiles = [];

  requiredFiles.forEach(file => {
    if (checkFile(file)) {
      existingFiles.push(file);
      log(colors.green, `✓ ${file}`);
    } else {
      missingFiles.push(file);
      log(colors.red, `✗ ${file}`);
    }
  });

  console.log('\n');
  log(colors.blue, `📊 Project Status:`);
  log(colors.green, `✓ ${existingFiles.length} files found`);
  
  if (missingFiles.length > 0) {
    log(colors.red, `✗ ${missingFiles.length} files missing`);
    return false;
  }
  
  return true;
}

function checkFirebaseConfig() {
  log(colors.blue, '🔥 Checking Firebase Configuration...\n');
  
  const configPath = 'assets/js/firebase-config.js';
  
  if (!checkFile(configPath)) {
    log(colors.red, '✗ Firebase config file missing');
    return false;
  }
  
  const config = fs.readFileSync(configPath, 'utf8');
  
  if (config.includes('YOUR_API_KEY') || config.includes('YOUR_PROJECT_ID') || config.includes('YOUR_SENDER_ID') || config.includes('YOUR_APP_ID')) {
    log(colors.yellow, '⚠️  Firebase config contains placeholder values');
    log(colors.yellow, '   Please update with your actual Firebase project credentials');
    log(colors.blue, '   See FIREBASE_SETUP.md for detailed instructions');
    return false;
  }
  
  log(colors.green, '✓ Firebase configuration appears to be set up');
  return true;
}

function generateReport() {
  log(colors.blue, '\n📋 Build Report\n');
  
  const structureValid = validateProject();
  const configValid = checkFirebaseConfig();
  
  console.log('\n' + '='.repeat(50));
  
  if (structureValid && configValid) {
    log(colors.green, '🎉 Application is ready to run!');
    log(colors.blue, '\n📚 Next Steps:');
    log(colors.reset, '   1. Start local server: npm run start');
    log(colors.reset, '   2. Open browser: http://localhost:5000');
    log(colors.reset, '   3. Test user registration and login');
    log(colors.reset, '   4. Test document upload and sharing');
  } else {
    log(colors.yellow, '⚠️  Application needs configuration:');
    if (!structureValid) {
      log(colors.reset, '   - Some required files are missing');
    }
    if (!configValid) {
      log(colors.reset, '   - Firebase configuration needs to be updated');
      log(colors.reset, '   - Follow instructions in FIREBASE_SETUP.md');
    }
  }
  
  console.log('='.repeat(50));
}

function showHelp() {
  log(colors.blue, `
🏛️ Secure Gov Doc Share - Build Tool

Usage: node build.js [command]

Commands:
  validate    - Check project structure and configuration
  help        - Show this help message
  
Examples:
  node build.js validate
  npm run build
`);
}

// Main execution
const command = process.argv[2] || 'validate';

switch (command) {
  case 'validate':
    generateReport();
    break;
  case 'help':
    showHelp();
    break;
  default:
    log(colors.red, `Unknown command: ${command}`);
    showHelp();
    process.exit(1);
}
