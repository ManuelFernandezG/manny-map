/**
 * Delete locations that are NOT Bar, Club, Nightclub, Restaurant, or Cafe.
 * Keeps only nightlife and food categories.
 *
 * Setup (pick one):
 * A) Save service account JSON as scripts/serviceAccountKey.json
 * B) Set GOOGLE_APPLICATION_CREDENTIALS to path of your key JSON
 *
 * Get key: Firebase Console -> Project Settings -> Service Accounts -> Generate new private key
 *
 * Usage:
 *   npm run delete-locations          # Dry run (no deletes)
 *   npm run delete-locations -- --execute   # Actually delete
 */

import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const KEEP_CATEGORIES = ['Bar', 'Club', 'Nightclub', 'Restaurant', 'Cafe'];
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

async function deleteLocation(locId) {
  const ratingsRef = db.collection('locations').doc(locId).collection('ratings');
  const snap = await ratingsRef.get();
  const batch = db.batch();
  snap.docs.forEach((d) => batch.delete(d.ref));
  await batch.commit();
  await db.collection('locations').doc(locId).delete();
}

async function main() {
  console.log(EXECUTE ? 'EXECUTE MODE - Deleting locations' : 'DRY RUN - No deletes will occur');
  console.log('Keeping categories:', KEEP_CATEGORIES.join(', '));
  console.log('');

  const snap = await db.collection('locations').get();
  const toKeep = [];
  const toDelete = [];
  const categoryCounts = {};

  snap.docs.forEach((d) => {
    const data = d.data();
    const category = data.category || 'Other';
    categoryCounts[category] = (categoryCounts[category] || 0) + 1;

    if (KEEP_CATEGORIES.includes(category)) {
      toKeep.push({ id: d.id, name: data.name, category });
    } else {
      toDelete.push({ id: d.id, name: data.name, category });
    }
  });

  console.log('Summary by category:');
  Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1])
    .forEach(([cat, n]) => {
      const action = KEEP_CATEGORIES.includes(cat) ? 'KEEP' : 'DELETE';
      console.log(`  ${cat}: ${n} (${action})`);
    });
  console.log('');
  console.log(`Keeping: ${toKeep.length} locations`);
  console.log(`Deleting: ${toDelete.length} locations`);
  console.log('');

  if (toDelete.length === 0) {
    console.log('Nothing to delete.');
    return;
  }

  if (!EXECUTE) {
    console.log('First 20 to be deleted:');
    toDelete.slice(0, 20).forEach((l) => console.log(`  - ${l.name} (${l.category})`));
    if (toDelete.length > 20) {
      console.log(`  ... and ${toDelete.length - 20} more`);
    }
    console.log('');
    console.log('Run with --execute to perform deletes: npm run delete-locations -- --execute');
    return;
  }

  console.log('Deleting...');
  let done = 0;
  for (const loc of toDelete) {
    await deleteLocation(loc.id);
    done++;
    if (done % 50 === 0) {
      console.log(`  Deleted ${done}/${toDelete.length}`);
    }
  }
  console.log(`Done. Deleted ${toDelete.length} locations.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
