/**
 * Delete all seed ratings written by seed-saturday-night.js.
 * Only deletes docs tagged  isSeedData: true  — real user ratings are untouched.
 *
 * After deleting seed docs the script re-aggregates each affected location
 * so live stats reflect only real user data.
 *
 * Usage:
 *   node scripts/delete-seed-data.js                                     # Dry run
 *   node scripts/delete-seed-data.js --execute                           # Delete ALL seed data
 *   node scripts/delete-seed-data.js --execute --batch saturday-night-2026-02-28
 */

import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';

const EXECUTE    = process.argv.includes('--execute');
const batchIdx   = process.argv.indexOf('--batch');
const SEED_BATCH = batchIdx !== -1 ? process.argv[batchIdx + 1] : null;

const __dirname = dirname(fileURLToPath(import.meta.url));
const keyPath    = join(__dirname, 'serviceAccountKey.json');
const envKeyPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;

let credential;
if (envKeyPath && existsSync(envKeyPath)) {
  credential = cert(JSON.parse(readFileSync(envKeyPath, 'utf8')));
} else if (existsSync(keyPath)) {
  credential = cert(JSON.parse(readFileSync(keyPath, 'utf8')));
} else {
  console.error('Missing Firebase service account key.');
  console.error('  Option A: Save key as scripts/serviceAccountKey.json');
  console.error('  Option B: Set GOOGLE_APPLICATION_CREDENTIALS=C:\\path\\to\\key.json');
  process.exit(1);
}

initializeApp({ credential });
const db = getFirestore();

// ─── Location IDs (all Ottawa venues from nightlifeLocations.ts) ──────────────

const LOCATION_IDS = [
  'bar-heart-and-crown-ottawa',
  'club-sky-lounge-ottawa',
  'club-room-104-ottawa',
  'club-the-show-ottawa',
  'bar-lieutenant-pump-ottawa',
  'bar-happy-fish-elgin-ottawa',
  'club-city-at-night-ottawa',
  'bar-tomo-restaurant-ottawa',
  'club-berlin-nightclub-ottawa',
  'bar-back-to-brooklyn-ottawa',
  'bar-el-furniture-warehouse-ottawa',
  'bar-la-ptite-grenouille-ottawa',
];

// ─── Aggregate computation (mirrors functions/src/aggregate.ts) ───────────────

function computeAggregates(ratings) {
  const checkins = ratings.filter(r => r.phase === 'checkin');
  const reviewed = ratings.filter(r => r.phase === 'reviewed');

  const checkinCount = checkins.length;
  const maleCount    = checkins.filter(r => r.gender === 'Male').length;
  const femaleCount  = checkins.filter(r => r.gender === 'Female').length;

  const vibeCounts = {};
  for (const r of reviewed) {
    if (r.vibe?.emoji) vibeCounts[r.vibe.emoji] = (vibeCounts[r.vibe.emoji] || 0) + 1;
  }
  const dominantVibe = Object.entries(vibeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '';

  const ageGroupNames = ['18-22', '23-28', '29-35', '36+'];
  const ageCounts = Object.fromEntries(ageGroupNames.map(ag => [ag, 0]));
  const ageVibe   = Object.fromEntries(ageGroupNames.map(ag => [ag, {}]));

  for (const r of checkins) {
    if (ageCounts[r.ageGroup] !== undefined) ageCounts[r.ageGroup]++;
  }
  for (const r of reviewed) {
    if (r.vibe?.emoji && ageVibe[r.ageGroup]) {
      ageVibe[r.ageGroup][r.vibe.emoji] = (ageVibe[r.ageGroup][r.vibe.emoji] || 0) + 1;
    }
  }

  const ratingsByAgeGroup = {};
  for (const ag of ageGroupNames) {
    const count   = ageCounts[ag];
    const percent = checkinCount > 0 ? Math.round((count / checkinCount) * 100) : 0;
    const top     = Object.entries(ageVibe[ag]).sort((a, b) => b[1] - a[1])[0];
    ratingsByAgeGroup[ag] = { count, percent, ...(top && { dominantVibe: top[0] }) };
  }

  return { checkinCount, maleCount, femaleCount, dominantVibe, ratingsByAgeGroup };
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const batchLabel = SEED_BATCH ? `batch "${SEED_BATCH}"` : 'ALL seed batches (isSeedData: true)';
  console.log(EXECUTE
    ? `🔴  EXECUTE MODE — deleting seed data (${batchLabel})`
    : `🟡  DRY RUN — no deletes (pass --execute to delete)`
  );
  if (SEED_BATCH) console.log(`     Filtering to seedBatch = "${SEED_BATCH}"`);
  console.log('');

  let totalFound   = 0;
  let totalDeleted = 0;

  for (const locationId of LOCATION_IDS) {
    const ratingsRef = db.collection(`locations/${locationId}/ratings`);
    let q = ratingsRef.where('isSeedData', '==', true);
    if (SEED_BATCH) q = q.where('seedBatch', '==', SEED_BATCH);

    const snap = await q.get();
    totalFound += snap.size;

    console.log(`  ${locationId.padEnd(50)}  ${snap.size} seed docs`);
    if (!EXECUTE || snap.size === 0) continue;

    // Delete in batches of 499
    const docs = snap.docs;
    for (let i = 0; i < docs.length; i += 499) {
      const batch = db.batch();
      docs.slice(i, i + 499).forEach(d => batch.delete(d.ref));
      await batch.commit();
      totalDeleted += Math.min(499, docs.length - i);
    }
  }

  console.log('');
  console.log(`  Seed docs found: ${totalFound}`);

  if (!EXECUTE) {
    console.log('');
    console.log('Run with --execute to delete:');
    console.log('  node scripts/delete-seed-data.js --execute');
    return;
  }

  console.log(`  ✓ Deleted: ${totalDeleted} seed rating docs`);

  // ── Re-aggregate each location with real data only ────────────────────────
  console.log('');
  console.log('Re-aggregating with real data only...');

  for (const locationId of LOCATION_IDS) {
    const snap    = await db.collection(`locations/${locationId}/ratings`).get();
    const ratings = snap.docs.map(d => d.data());
    const agg     = computeAggregates(ratings);

    await db.collection('locations').doc(locationId).set(
      {
        checkinCount:      agg.checkinCount,
        maleCount:         agg.maleCount,
        femaleCount:       agg.femaleCount,
        dominantVibe:      agg.dominantVibe,
        ratingsByAgeGroup: agg.ratingsByAgeGroup,
        lastAggregated:    Timestamp.now(),
      },
      { merge: true }
    );
    console.log(`  ✓ ${locationId.padEnd(50)}  ${agg.checkinCount} real checkins remain`);
  }

  console.log('');
  console.log(`✅  Done. ${totalDeleted} seed docs removed. Stats now reflect real users only.`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
