import {
  collection,
  addDoc,
  updateDoc,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore/lite';
import { db } from './firebase';
import { AGE_GROUPS, GENDERS, POSITIVE_EMOJIS } from '@/data/mockData';
import { getUserId, addCheckinLocationId, addRatedLocationId } from './userId';
import type { AgeGroupStats } from '@/data/mockData';

// --- Types ---

export interface Rating {
  userId: string;
  ageGroup: string;
  gender: string;
  phase: "checkin" | "reviewed";
  companion?: string;
  groupSize?: string;
  checkinAt: any;
  vibe?: { emoji: string; word: string };
  waitTime?: string;
  reviewedAt?: any;
  timestamp: any;
}

// --- Submit Check-in (Phase 1) ---

export interface CheckinData {
  ageGroup: string;
  gender: string;
  groupSize: string;
  companion?: string;
}

export async function submitCheckin(
  locationId: string,
  data: CheckinData
): Promise<void> {
  if (!(AGE_GROUPS as readonly string[]).includes(data.ageGroup)) {
    throw new Error(`Invalid age group: ${data.ageGroup}`);
  }
  if (!(GENDERS as readonly string[]).includes(data.gender)) {
    throw new Error(`Invalid gender: ${data.gender}`);
  }

  const userId = getUserId();
  const ratingsRef = collection(db, `locations/${locationId}/ratings`);

  await addDoc(ratingsRef, {
    userId,
    ageGroup: data.ageGroup,
    gender: data.gender,
    phase: "checkin",
    groupSize: data.groupSize,
    ...(data.companion && { companion: data.companion }),
    checkinAt: serverTimestamp(),
    timestamp: serverTimestamp(),
  });

  addCheckinLocationId(locationId);
}

// --- Submit Review (Phase 2) ---

export interface ReviewData {
  vibe?: { emoji: string; word: string };
  waitTime?: string;
}

export async function submitReview(
  locationId: string,
  review: ReviewData
): Promise<{ success: true }> {
  const userId = getUserId();
  const ratingsRef = collection(db, `locations/${locationId}/ratings`);

  const userQuery = query(ratingsRef, where('userId', '==', userId));
  const userRatings = await getDocs(userQuery);

  const sorted = userRatings.docs.sort((a, b) => {
    const ta = a.data().timestamp?.toMillis?.() ?? 0;
    const tb = b.data().timestamp?.toMillis?.() ?? 0;
    return tb - ta;
  });

  const reviewFields: Record<string, any> = {
    phase: "reviewed",
    reviewedAt: serverTimestamp(),
    timestamp: serverTimestamp(),
  };
  if (review.waitTime) reviewFields.waitTime = review.waitTime;
  if (review.vibe) reviewFields.vibe = review.vibe;

  if (sorted.length > 0 && sorted[0].data().phase === "checkin") {
    await updateDoc(sorted[0].ref, reviewFields);
  } else {
    await addDoc(ratingsRef, {
      userId,
      ageGroup: sorted[0]?.data()?.ageGroup || "18-22",
      gender: sorted[0]?.data()?.gender || "Male",
      ...reviewFields,
      checkinAt: serverTimestamp(),
    });
  }

  if (review.vibe) {
    addRatedLocationId(locationId, review.vibe.emoji, POSITIVE_EMOJIS.has(review.vibe.emoji));
  }

  try {
    const raw = localStorage.getItem(USER_RATING_CACHE_KEY);
    if (raw) {
      const cache = JSON.parse(raw);
      delete cache[locationId];
      localStorage.setItem(USER_RATING_CACHE_KEY, JSON.stringify(cache));
    }
  } catch {}

  return { success: true };
}

// --- Fetch live location stats from Firestore ---

export interface LocationStats {
  checkinCount: number;
  maleCount: number;
  femaleCount: number;
  dominantVibe?: string;
  ratingsByAgeGroup?: Record<string, AgeGroupStats>;
  // Tonight sub-aggregate (since 8pm America/Toronto)
  checkinCountTonight?: number;
  maleCountTonight?: number;
  femaleCountTonight?: number;
  dominantVibeTonight?: string;
}

export async function getLocationStats(locationId: string): Promise<LocationStats> {
  if (import.meta.env.VITE_MOCK_STATS === 'true') {
    const { SEED_STATS } = await import('@/data/seedStats');
    return SEED_STATS[locationId] ?? { checkinCount: 0, maleCount: 0, femaleCount: 0 };
  }
  try {
    const locationRef = doc(db, 'locations', locationId);
    const snap = await getDoc(locationRef);
    if (!snap.exists()) return { checkinCount: 0, maleCount: 0, femaleCount: 0 };
    const d = snap.data();
    return {
      checkinCount: d.checkinCount ?? 0,
      maleCount: d.maleCount ?? 0,
      femaleCount: d.femaleCount ?? 0,
      dominantVibe: d.dominantVibe,
      ratingsByAgeGroup: d.ratingsByAgeGroup,
      checkinCountTonight: d.checkinCountTonight,
      maleCountTonight: d.maleCountTonight,
      femaleCountTonight: d.femaleCountTonight,
      dominantVibeTonight: d.dominantVibeTonight,
    };
  } catch {
    return { checkinCount: 0, maleCount: 0, femaleCount: 0 };
  }
}

// --- City leaderboard (top location by tonight checkins) ---

export interface LeaderboardEntry {
  topLocationId: string;
  checkinCountTonight: number;
  dominantVibeTonight: string;
}

export async function getLeaderboard(): Promise<LeaderboardEntry | null> {
  try {
    const leaderRef = doc(db, 'meta', 'leaderboard');
    const snap = await getDoc(leaderRef);
    if (!snap.exists()) return null;
    const d = snap.data();
    if (!d.topLocationId || !d.checkinCountTonight) return null;
    return {
      topLocationId: d.topLocationId,
      checkinCountTonight: d.checkinCountTonight,
      dominantVibeTonight: d.dominantVibeTonight ?? '',
    };
  } catch {
    return null;
  }
}

// --- User rating cache ---

const USER_RATING_CACHE_KEY = 'mannymap_user_ratings_cache';

function getCachedUserRating(locationId: string): Rating | null {
  try {
    const raw = localStorage.getItem(USER_RATING_CACHE_KEY);
    if (!raw) return null;
    const cache = JSON.parse(raw);
    return cache[locationId] ?? null;
  } catch {
    return null;
  }
}

function setCachedUserRating(locationId: string, rating: Rating): void {
  try {
    const raw = localStorage.getItem(USER_RATING_CACHE_KEY);
    const cache = raw ? JSON.parse(raw) : {};
    cache[locationId] = rating;
    localStorage.setItem(USER_RATING_CACHE_KEY, JSON.stringify(cache));
  } catch {}
}

export async function getUserRating(locationId: string): Promise<Rating | null> {
  const cached = getCachedUserRating(locationId);
  if (cached) return cached;

  try {
    const userId = getUserId();
    const ratingsRef = collection(db, `locations/${locationId}/ratings`);
    const q = query(ratingsRef, where('userId', '==', userId));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    const rating = snapshot.docs[0].data() as Rating;
    setCachedUserRating(locationId, rating);
    return rating;
  } catch {
    return null;
  }
}
