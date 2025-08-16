const { execSync } = require('child_process');
const path = require('path');

console.log('🚀 Deploying Firestore indexes...');

try {
  // Deploy indexes only
  console.log('📋 Deploying Firestore indexes...');
  execSync('firebase deploy --only firestore:indexes', {
    stdio: 'inherit',
    cwd: path.join(__dirname, '..')
  });
  
  console.log('✅ Firestore indexes deployed successfully!');
  console.log('📝 Note: Index creation may take a few minutes to complete.');
  console.log('🔍 You can monitor the progress in the Firebase Console:');
  console.log('   https://console.firebase.google.com/project/_/firestore/indexes');
  
} catch (error) {
  console.error('❌ Error deploying indexes:', error.message);
  console.log('\n📋 Manual steps to create indexes:');
  console.log('1. Go to Firebase Console: https://console.firebase.google.com');
  console.log('2. Select your project');
  console.log('3. Go to Firestore Database > Indexes');
  console.log('4. Click "Add Index" and create the following indexes:');
  console.log('\n   Collection: notifications');
  console.log('   Fields: userId (Ascending), createdAt (Descending)');
  console.log('\n   Collection: notifications');
  console.log('   Fields: userId (Ascending), read (Ascending)');
  console.log('\n   Collection: documents');
  console.log('   Fields: userId (Ascending), createdAt (Descending)');
  console.log('\n   Collection: activities');
  console.log('   Fields: userId (Ascending), timestamp (Descending)');
}
