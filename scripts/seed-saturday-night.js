/**
 * Seed 1000 fake Saturday-night check-ins across Ottawa venues.
 * Each of the 1000 "people" independently picks a venue at random
 * (weighted by popularity), so the spread is organic — not pre-assigned.
 *
 * All docs are tagged  isSeedData: true  +  seedBatch: "saturday-night-2026-02-28"
 * so they can be removed cleanly with delete-seed-data.js.
 *
 * ⚠️  Each write triggers the onRatingWritten Cloud Function (~1000 invocations).
 *     That is expected and acceptable for a one-time seed. After all docs are
 *     written the script also writes final aggregates directly to each location
 *     doc so the UI reflects accurate counts immediately.
 *
 * Setup (pick one):
 *   A) Save service account JSON as  scripts/serviceAccountKey.json
 *   B) Set  GOOGLE_APPLICATION_CREDENTIALS  to path of your key JSON
 *   Get key: Firebase Console → Project Settings → Service Accounts → Generate new private key
 *
 * Usage:
 *   node scripts/seed-saturday-night.js            # Dry run (prints plan, no writes)
 *   node scripts/seed-saturday-night.js --execute  # Actually write to Firestore
 */

import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';

const EXECUTE    = process.argv.includes('--execute');
const SEED_BATCH = 'saturday-night-2026-02-28';
const TOTAL      = 1000;

// ─── Firebase init ────────────────────────────────────────────────────────────

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
  console.error('  Get key: Firebase Console → Project Settings → Service Accounts → Generate new private key');
  process.exit(1);
}

initializeApp({ credential });
const db = getFirestore();

// ─── Venue roster + popularity weights ───────────────────────────────────────
// Higher weight = more likely to be picked by a random person on Saturday night.
// Actual per-venue totals will vary each run.

const VENUES = [
  { id: 'club-berlin-nightclub-ottawa',       name: 'Berlin Nightclub',       type: 'Club', weight: 13 },
  { id: 'club-the-show-ottawa',               name: 'The Show',               type: 'Club', weight: 12 },
  { id: 'club-room-104-ottawa',               name: 'Room 104',               type: 'Club', weight: 10 },
  { id: 'club-sky-lounge-ottawa',             name: 'Sky Lounge',             type: 'Club', weight: 9  },
  { id: 'club-city-at-night-ottawa',          name: 'City at Night',          type: 'Club', weight: 9  },
  { id: 'bar-heart-and-crown-ottawa',         name: 'Heart and Crown',        type: 'Bar',  weight: 8  },
  { id: 'bar-el-furniture-warehouse-ottawa',  name: 'El Furniture Warehouse', type: 'Bar',  weight: 8  },
  { id: 'bar-tomo-restaurant-ottawa',         name: 'TOMO Restaurant',        type: 'Bar',  weight: 7  },
  { id: 'bar-la-ptite-grenouille-ottawa',     name: "La P'tite Grenouille",   type: 'Bar',  weight: 7  },
  { id: 'bar-back-to-brooklyn-ottawa',        name: 'Back to Brooklyn',       type: 'Bar',  weight: 6  },
  { id: 'bar-happy-fish-elgin-ottawa',        name: 'Happy Fish Elgin',       type: 'Bar',  weight: 6  },
  { id: 'bar-lieutenant-pump-ottawa',         name: "Lieutenant's Pump",      type: 'Bar',  weight: 5  },
];

const totalWeight = VENUES.reduce((s, v) => s + v.weight, 0);

function pickVenue() {
  let r = Math.random() * totalWeight;
  for (const v of VENUES) {
    r -= v.weight;
    if (r <= 0) return v;
  }
  return VENUES[VENUES.length - 1];
}

// ─── Saturday-night time window ───────────────────────────────────────────────
// 2026-02-28 10:00 PM EST → 2026-03-01 03:00 AM EST  (UTC: 03:00 → 08:00)

const SAT_START_MS = new Date('2026-02-29T03:00:00Z').getTime();
const SAT_END_MS   = new Date('2026-03-01T08:00:00Z').getTime();

// ─── Population distributions (Saturday nightlife) ────────────────────────────

const AGE_GROUPS   = ['18-22', '23-28', '29-35', '36+'];
const AGE_WEIGHTS  = [0.28,    0.42,    0.22,    0.08];

const GENDERS      = ['Male', 'Female'];
const GENDER_W     = [0.55, 0.45];

// ~55% of people complete a review the same night
const REVIEW_RATE = 0.55;

const VIBE_EMOJIS = {
  Club: [
    { emoji: '🔥', word: 'Fire',  w: 0.45 },
    { emoji: '🤯', word: 'Crazy', w: 0.35 },
    { emoji: '😴', word: 'Slow',  w: 0.15 },
    { emoji: '💀', word: 'Dead',  w: 0.05 },
  ],
  Bar: [
    { emoji: '🔥', word: 'Fire',  w: 0.40 },
    { emoji: '😴', word: 'Slow',  w: 0.30 },
    { emoji: '🤯', word: 'Crazy', w: 0.20 },
    { emoji: '💀', word: 'Dead',  w: 0.10 },
  ],
};

const WAIT_OPTIONS = ['No wait', '<15 min', '15-30 min', '30+ min'];
const WAIT_W       = [0.15,      0.35,       0.30,        0.20];

const GROUP_OPTIONS = ['Solo', '2-3', '4-6', '7+'];
const GROUP_W       = [0.08,   0.38,  0.38,  0.16];

const COMP_OPTIONS  = ['Friends', 'Date', 'Mixed', 'Family'];
const COMP_W        = [0.55,      0.20,   0.20,    0.05];

// ─── Utility ──────────────────────────────────────────────────────────────────

function pick(options, weights) {
  let r = Math.random();
  for (let i = 0; i < options.length; i++) {
    r -= weights[i];
    if (r <= 0) return options[i];
  }
  return options[options.length - 1];
}

function pickObj(arr) {
  return pick(arr, arr.map(o => o.w));
}

function randMs(min, max) {
  return min + Math.random() * (max - min);
}

function seedUserId(i) {
  return `seed_${SEED_BATCH}_${String(i).padStart(4, '0')}`;
}

// ─── Rating builder ───────────────────────────────────────────────────────────

function buildRating(userId, venueType) {
  const ageGroup  = pick(AGE_GROUPS, AGE_WEIGHTS);
  const gender    = pick(GENDERS, GENDER_W);
  const groupSize = pick(GROUP_OPTIONS, GROUP_W);
  const companion = groupSize === 'Solo' ? null : pick(COMP_OPTIONS, COMP_W);

  // Check-in time: random within the Saturday window, weighted toward 10pm–1am
  const checkinTime = new Date(randMs(SAT_START_MS, SAT_END_MS - 3_600_000));

  const base = {
    userId,
    ageGroup,
    gender,
    groupSize,
    ...(companion && { companion }),
    checkinAt:  Timestamp.fromDate(checkinTime),
    timestamp:  Timestamp.fromDate(checkinTime),
    isSeedData: true,
    seedBatch:  SEED_BATCH,
  };

  const willReview = Math.random() < REVIEW_RATE;
  if (!willReview) return { ...base, phase: 'checkin' };

  const vibe     = pickObj(VIBE_EMOJIS[venueType]);
  const waitTime = pick(WAIT_OPTIONS, WAIT_W);
  // Review comes 1–4 hours after check-in
  const reviewTime = new Date(checkinTime.getTime() + randMs(3_600_000, 14_400_000));

  return {
    ...base,
    phase:      'reviewed',
    vibe:       { emoji: vibe.emoji, word: vibe.word },
    waitTime,
    reviewedAt: Timestamp.fromDate(reviewTime),
  };
}

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
  console.log(EXECUTE
    ? `🔴  EXECUTE MODE — seeding ${TOTAL} ratings to Firestore`
    : `🟡  DRY RUN — no writes (pass --execute to seed)`
  );
  console.log(`     Batch tag: ${SEED_BATCH}`);
  console.log('');

  // ── Generate all ratings, randomly assigned to venues ─────────────────────
  const byVenue = Object.fromEntries(VENUES.map(v => [v.id, []]));

  for (let i = 0; i < TOTAL; i++) {
    const venue  = pickVenue();
    const rating = buildRating(seedUserId(i), venue.type);
    byVenue[venue.id].push(rating);
  }

  // ── Print plan ─────────────────────────────────────────────────────────────
  let actualTotal = 0;
  for (const venue of VENUES) {
    const ratings   = byVenue[venue.id];
    const checkins  = ratings.filter(r => r.phase === 'checkin').length;
    const reviewed  = ratings.filter(r => r.phase === 'reviewed').length;
    const vibeCounts = {};
    ratings.filter(r => r.vibe).forEach(r => {
      vibeCounts[r.vibe.emoji] = (vibeCounts[r.vibe.emoji] || 0) + 1;
    });
    const vibeStr = Object.entries(vibeCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([e, n]) => `${e}×${n}`)
      .join(' ');

    console.log(
      `  ${venue.name.padEnd(36)} ${String(ratings.length).padStart(3)} total` +
      `  |  ${String(checkins).padStart(2)} checking in  ${String(reviewed).padStart(2)} reviewed` +
      `  |  ${vibeStr || '(none reviewed)'}`
    );
    actualTotal += ratings.length;
  }

  console.log('');
  console.log(`  Total: ${actualTotal} ratings across ${VENUES.length} venues`);

  if (!EXECUTE) {
    console.log('');
    console.log('Run with --execute to write to Firestore:');
    console.log('  node scripts/seed-saturday-night.js --execute');
    console.log('');
    console.log('To delete seed data later:');
    console.log('  node scripts/delete-seed-data.js --execute');
    return;
  }

  // ── Batch write all docs ──────────────────────────────────────────────────
  const allWrites = [];
  for (const venue of VENUES) {
    for (const data of byVenue[venue.id]) {
      allWrites.push({ locationId: venue.id, data });
    }
  }

  console.log('');
  console.log(`Writing ${allWrites.length} docs in batches of 499...`);

  const BATCH_SIZE = 499;
  let written = 0;

  for (let i = 0; i < allWrites.length; i += BATCH_SIZE) {
    const chunk = allWrites.slice(i, i + BATCH_SIZE);
    const batch = db.batch();
    for (const { locationId, data } of chunk) {
      const ref = db.collection(`locations/${locationId}/ratings`).doc();
      batch.set(ref, data);
    }
    await batch.commit();
    written += chunk.length;
    process.stdout.write(`\r  ${written}/${allWrites.length} written...`);
  }

  console.log(`\n  ✓ ${written} rating docs written`);

  // ── Write final aggregates directly to each location doc ──────────────────
  // Guarantees accurate counts without waiting for all Cloud Function triggers.
  console.log('');
  console.log('Writing final aggregates to location docs...');

  for (const venue of VENUES) {
    const snap    = await db.collection(`locations/${venue.id}/ratings`).get();
    const ratings = snap.docs.map(d => d.data());
    const agg     = computeAggregates(ratings);

    await db.collection('locations').doc(venue.id).set(
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
    console.log(`  ✓ ${venue.name.padEnd(36)}  ${agg.checkinCount} total checkins  ${agg.dominantVibe || '—'}`);
  }

  console.log('');
  console.log(`✅  Done. ${written} seed ratings live on Firestore.`);
  console.log(`   Tag: seedBatch = "${SEED_BATCH}"`);
  console.log('');
  console.log('To delete this seed data:');
  console.log('  node scripts/delete-seed-data.js --execute');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
