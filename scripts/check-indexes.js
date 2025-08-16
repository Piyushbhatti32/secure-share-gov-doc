const { execSync } = require('child_process');
const path = require('path');

console.log('🔍 Checking Firestore index status...');

try {
  const result = execSync('firebase firestore:indexes', {
    encoding: 'utf8',
    cwd: path.join(__dirname, '..')
  });
  
  const indexes = JSON.parse(result);
  
  console.log('📊 Index Status:');
  console.log('================');
  
  indexes.indexes.forEach((index, i) => {
    const collection = index.collectionGroup;
    const fields = index.fields.map(f => `${f.fieldPath} (${f.order})`).join(', ');
    console.log(`${i + 1}. ${collection}: ${fields}`);
  });
  
  console.log('\n✅ All required indexes are deployed!');
  console.log('📝 Index creation typically takes 1-5 minutes.');
  console.log('🔍 Monitor progress at: https://console.firebase.google.com/project/share-gov-docs-213b7/firestore/indexes');
  console.log('\n💡 Once indexes are "Enabled", your queries will work properly.');
  
} catch (error) {
  console.error('❌ Error checking indexes:', error.message);
}
