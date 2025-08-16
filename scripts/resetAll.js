#!/usr/bin/env node

// This script deletes all documents in the 'documents' and 'shares' Firestore collections
// and removes all files under the 'documents/' prefix in Cloud Storage.
// WARNING: This is destructive. Do NOT run without confirming.

const admin = require('firebase-admin');
const path = require('path');

const serviceAccountPath = path.join(__dirname, '..', 'firebase-service-account.json');

try {
  const serviceAccount = require(serviceAccountPath);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || serviceAccount.project_id + '.appspot.com'
  });
} catch (e) {
  console.error('Failed to initialize Firebase Admin. Ensure firebase-service-account.json exists and is valid.');
  console.error(e);
  process.exit(1);
}

const db = admin.firestore();
const bucket = admin.storage().bucket();

async function deleteCollection(collPath, batchSize = 500) {
  const collectionRef = db.collection(collPath);
  const query = collectionRef.limit(batchSize);

  return new Promise((resolve, reject) => {
    deleteQueryBatch(query, resolve).catch(reject);
  });
}

async function deleteQueryBatch(query, resolve) {
  const snapshot = await query.get();

  if (snapshot.size === 0) {
    resolve();
    return;
  }

  const batch = db.batch();
  snapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });

  await batch.commit();

  // Recurse on the next process tick, to avoid exploding the stack.
  process.nextTick(() => {
    deleteQueryBatch(query, resolve);
  });
}

async function deleteStoragePrefix(prefix) {
  console.log(`Listing files with prefix: ${prefix}`);
  const [files] = await bucket.getFiles({ prefix });
  if (!files || files.length === 0) {
    console.log('No files found under', prefix);
    return;
  }

  console.log(`Deleting ${files.length} files from storage...`);
  await Promise.all(files.map(f => f.delete()));
  console.log('Storage deletion complete.');
}

async function main() {
  console.log('This script will delete all documents and shares from Firestore and remove stored files under documents/ in Cloud Storage.');
  console.log('Make sure you have a backup.');
  // Do not auto-run; require explicit confirmation via an environment variable.
  if (process.env.CONFIRM_RESET !== 'true') {
    console.log('\nTo execute, run:');
    console.log('CONFIRM_RESET=true node scripts/resetAll.js');
    process.exit(0);
  }

  try {
    console.log('Deleting Firestore `shares` collection...');
    await deleteCollection('shares');
    console.log('Deleted shares.');

    console.log('Deleting Firestore `documents` collection...');
    await deleteCollection('documents');
    console.log('Deleted documents.');

    console.log('Deleting files under storage prefix `documents/`...');
    await deleteStoragePrefix('documents/');

    console.log('Reset complete.');
  } catch (err) {
    console.error('Error during reset:', err);
    process.exit(1);
  }
}

main();
