/**
 * Delete ALL Firestore data: locations (+ their ratings subcollections) and suggestions.
 * Also handles phantom documents (deleted parents with orphaned subcollections).
 *
 * Setup (pick one):
 * A) Save service account JSON as scripts/serviceAccountKey.json
 * B) Set GOOGLE_APPLICATION_CREDENTIALS to path of your key JSON
 *
 * Get key: Firebase Console -> Project Settings -> Service Accounts -> Generate new private key
 *
 * Usage:
 *   node scripts/deleteAllFirebaseData.js          # Dry run (no deletes)
 *   node scripts/deleteAllFirebaseData.js --execute # Actually delete
 */

import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const EXECUTE = process.argv.includes('--execute');

const __dirname = dirname(fileURLToPath(import.meta.url));
const keyPath = join(__dirname, 'serviceAccountKey.json');
const envKeyPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;

let credential;
if (envKeyPath && existsSync(envKeyPath)) {
  credential = cert(JSON.parse(readFileSync(envKeyPath, 'utf8')));
} else if (existsSync(keyPath)) {
  credential = cert(JSON.parse(readFileSync(keyPath, 'utf8')));
} else {
  console.error('Missing Firebase service account key.');
  console.error('Option A: Save key as scripts/serviceAccountKey.json');
  console.error('Option B: Set GOOGLE_APPLICATION_CREDENTIALS=C:\\path\\to\\key.json');
  console.error('Get key: Firebase Console -> Project Settings -> Service Accounts -> Generate new private key');
  process.exit(1);
}

initializeApp({ credential });
const db = getFirestore();

async function main() {
  console.log(EXECUTE ? '🔴 EXECUTE MODE - Deleting ALL Firestore data' : '🟡 DRY RUN - No deletes will occur');
  console.log('');

  // Use recursiveDelete to wipe the entire locations collection,
  // including all subcollections (ratings) and phantom documents.
  const locationsRef = db.collection('locations');
  const suggestionsRef = db.collection('suggestions');

  if (!EXECUTE) {
    const locSnap = await locationsRef.get();
    const sugSnap = await suggestionsRef.get();

    // Also check for orphaned ratings subcollections by listing all docs
    // (including phantom ones that have subcollections but no data)
    console.log(`  locations: ${locSnap.size} documents (+ any orphaned subcollections)`);
    locSnap.docs.slice(0, 10).forEach((d) => {
      const data = d.data();
      console.log(`    - ${data.name || d.id}`);
    });
    if (locSnap.size > 10) console.log(`    ... and ${locSnap.size - 10} more`);

    console.log(`  suggestions: ${sugSnap.size} documents`);
    console.log('');
    console.log('Will use recursiveDelete to remove ALL data including orphaned subcollections.');
    console.log('');
    console.log('Run with --execute to perform deletes:');
    console.log('  node scripts/deleteAllFirebaseData.js --execute');
    return;
  }

  console.log('Deleting locations collection (recursive - includes all subcollections)...');
  await db.recursiveDelete(locationsRef);
  console.log('  ✓ locations deleted');

  console.log('Deleting suggestions collection...');
  await db.recursiveDelete(suggestionsRef);
  console.log('  ✓ suggestions deleted');

  console.log('');
  console.log('Done. All Firestore data has been deleted (including orphaned subcollections).');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
