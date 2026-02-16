import {
  collection,
  addDoc,
  updateDoc,
  doc,
  getDocs,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore/lite';
import { db } from './firebase';
import type { AgeGroupData, EmojiWord } from '@/data/mockData';
import { AGE_GROUPS, GENDERS, REVIEW_CONFIG, POSITIVE_EMOJIS, CATEGORY_GROUPS } from '@/data/mockData';
import type { CategoryGroup } from '@/data/mockData';
import { getUserId, addCheckinLocationId, addRatedLocationId } from './userId';

// --- Types ---

export interface ReviewScore {
  emoji: string;
  word: string;
  score: number;
}

export interface Rating {
  userId: string;
  ageGroup: string;
  gender: string;
  phase: "checkin" | "reviewed";

  // Check-in fields
  travelTime?: string;
  companion?: string;
  groupSize?: string;
  checkinAt: any;

  // Review fields (varies by category group)
  vibe?: ReviewScore;
  taste?: ReviewScore;
  price?: ReviewScore;
  service?: ReviewScore;
  crowd?: ReviewScore;
  reviewedAt?: any;

  timestamp: any;

  // Backward compat
  emoji?: string;
  word?: string;
  score?: number;
  pairs?: { emoji: string; word: string }[];
}

export interface AggregatedFields {
  totalRatings: number;
  dominantEmoji: string;
  dominantWord: string;
  averageScore: number;
  divergenceScore: number;
  divergenceFlagged: boolean;
  ratingsByAgeGroup: Record<string, AgeGroupData>;
  ratingsByGender: Record<string, AgeGroupData>;
  checkinCount: number;
}

// --- Submit Check-in (Phase 1) ---

export interface CheckinData {
  ageGroup: string;
  gender: string;
  travelTime: string;
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

  const ratingDoc = {
    userId,
    ageGroup: data.ageGroup,
    gender: data.gender,
    phase: "checkin",
    travelTime: data.travelTime,
    groupSize: data.groupSize,
    ...(data.companion && { companion: data.companion }),
    checkinAt: serverTimestamp(),
    timestamp: serverTimestamp(),
  };

  await addDoc(ratingsRef, ratingDoc);
  addCheckinLocationId(locationId);
  // Location aggregates (including checkinCount) are updated by the Firestore trigger on ratings
}

// --- Submit Review (Phase 2) ---

export interface ReviewData {
  vibe?: ReviewScore;
  taste?: ReviewScore;
  price?: ReviewScore;
  service?: ReviewScore;
  crowd?: ReviewScore;
}

export async function submitReview(
  locationId: string,
  review: ReviewData
): Promise<{ success: true }> {
  const userId = getUserId();
  const ratingsRef = collection(db, `locations/${locationId}/ratings`);

  // Find the user's most recent checkin
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
  if (review.vibe) reviewFields.vibe = review.vibe;
  if (review.taste) reviewFields.taste = review.taste;
  if (review.price) reviewFields.price = review.price;
  if (review.service) reviewFields.service = review.service;
  if (review.crowd) reviewFields.crowd = review.crowd;

  if (sorted.length > 0 && sorted[0].data().phase === "checkin") {
    // Update existing checkin doc
    await updateDoc(sorted[0].ref, reviewFields);
  } else {
    // No checkin found — create a standalone review (edge case / backward compat)
    const userId2 = getUserId();
    await addDoc(ratingsRef, {
      userId: userId2,
      ageGroup: sorted[0]?.data()?.ageGroup || "18-22",
      gender: sorted[0]?.data()?.gender || "Male",
      ...reviewFields,
      checkinAt: serverTimestamp(),
    });
  }

  // Determine primary emoji for local tracking
  const primary = review.vibe || review.taste || review.crowd || review.price || review.service;
  if (primary) {
    addRatedLocationId(locationId, primary.emoji, POSITIVE_EMOJIS.has(primary.emoji));
  }

  // Invalidate user rating cache for this location so next fetch gets fresh data
  try {
    const raw = localStorage.getItem(USER_RATING_CACHE_KEY);
    if (raw) {
      const cache = JSON.parse(raw);
      delete cache[locationId];
      localStorage.setItem(USER_RATING_CACHE_KEY, JSON.stringify(cache));
    }
  } catch {}

  // Aggregation is done by the Firestore trigger; client refetches locations after a short delay
  return { success: true };
}

// --- Aggregation ---

function extractScores(rating: Rating): { emoji: string; word: string; score: number }[] {
  const results: { emoji: string; word: string; score: number }[] = [];

  // New two-phase format
  if (rating.vibe) results.push(rating.vibe);
  if (rating.taste) results.push(rating.taste);
  if (rating.price) results.push(rating.price);
  if (rating.service) results.push(rating.service);
  if (rating.crowd) results.push(rating.crowd);

  if (results.length > 0) return results;

  // Old single-emoji format
  if (rating.emoji && rating.word && rating.score != null) {
    return [{ emoji: rating.emoji, word: rating.word, score: rating.score }];
  }

  // Very old pairs[] format
  if (rating.pairs && rating.pairs.length > 0) {
    const pair = rating.pairs[0];
    return [{ emoji: pair.emoji, word: pair.word, score: POSITIVE_EMOJIS.has(pair.emoji) ? 3 : 2 }];
  }

  return [];
}

function primaryScore(rating: Rating): number {
  const scores = extractScores(rating);
  if (scores.length === 0) return 0;
  return scores.reduce((sum, s) => sum + s.score, 0) / scores.length;
}

export async function aggregateRatings(locationId: string): Promise<AggregatedFields> {
  try {
    const ratingsRef = collection(db, `locations/${locationId}/ratings`);
    const ratingsSnap = await getDocs(ratingsRef);

    if (ratingsSnap.empty) {
      return {
        totalRatings: 0,
        dominantEmoji: "🔥",
        dominantWord: "New",
        averageScore: 0,
        divergenceScore: 0,
        divergenceFlagged: false,
        ratingsByAgeGroup: {},
        ratingsByGender: {},
        checkinCount: 0,
      };
    }

    const ratings = ratingsSnap.docs.map((d) => d.data() as Rating);
    const reviewed = ratings.filter((r) => r.phase === "reviewed" || r.pairs || r.score != null);
    const checkins = ratings.filter((r) => r.phase === "checkin");

    // Group reviewed ratings
    const byAgeGroup: Record<string, { emoji: string; word: string; score: number }[]> = {};
    for (const ag of AGE_GROUPS) byAgeGroup[ag] = [];
    const byGender: Record<string, { emoji: string; word: string; score: number }[]> = {};
    for (const g of GENDERS) byGender[g] = [];
    const allEntries: { emoji: string; word: string; score: number }[] = [];
    const allScores: number[] = [];

    for (const rating of reviewed) {
      const scores = extractScores(rating);
      const avg = primaryScore(rating);
      if (avg > 0) allScores.push(avg);

      for (const entry of scores) {
        allEntries.push(entry);
        if (byAgeGroup[rating.ageGroup]) byAgeGroup[rating.ageGroup].push(entry);
        if (rating.gender && byGender[rating.gender]) byGender[rating.gender].push(entry);
      }
    }

    function computeGroupData(entries: { emoji: string; word: string; score: number }[]): AgeGroupData {
      const counts: Record<string, EmojiWord> = {};
      for (const { emoji, word } of entries) {
        const key = `${emoji}${word}`;
        if (!counts[key]) counts[key] = { emoji, word, count: 0 };
        counts[key].count++;
      }
      const topPairs = Object.values(counts).sort((a, b) => b.count - a.count).slice(0, 10);
      return {
        totalRatings: entries.length,
        dominant: topPairs[0] || { emoji: "🔥", word: "New", count: 0 },
        topPairs,
      };
    }

    const ratingsByAgeGroup: Record<string, AgeGroupData> = {};
    for (const ag of AGE_GROUPS) ratingsByAgeGroup[ag] = computeGroupData(byAgeGroup[ag]);

    const ratingsByGender: Record<string, AgeGroupData> = {};
    for (const g of GENDERS) ratingsByGender[g] = computeGroupData(byGender[g]);

    const overallData = computeGroupData(allEntries);
    const overall = overallData.dominant;

    const averageScore = allScores.length > 0
      ? allScores.reduce((s, v) => s + v, 0) / allScores.length
      : 0;

    // Divergence
    const activeGroups = AGE_GROUPS.filter((ag) => byAgeGroup[ag].length >= 5);
    let divergenceScore = 0;
    if (activeGroups.length >= 2) {
      const avgScores = activeGroups.map((ag) => {
        const entries = byAgeGroup[ag];
        return entries.reduce((sum, e) => sum + e.score, 0) / entries.length;
      });
      let maxDiff = 0;
      for (let i = 0; i < avgScores.length; i++) {
        for (let j = i + 1; j < avgScores.length; j++) {
          maxDiff = Math.max(maxDiff, Math.abs(avgScores[i] - avgScores[j]));
        }
      }
      divergenceScore = maxDiff / 3;
    }

    const divergenceFlagged = divergenceScore >= 0.5 && activeGroups.length >= 2;

    const updatedFields: AggregatedFields = {
      totalRatings: reviewed.length,
      dominantEmoji: overall.emoji,
      dominantWord: overall.word,
      averageScore: Math.round(averageScore * 100) / 100,
      divergenceScore,
      divergenceFlagged,
      ratingsByAgeGroup,
      ratingsByGender,
      checkinCount: checkins.length,
    };

    const locationRef = doc(db, 'locations', locationId);
    await updateDoc(locationRef, {
      ...updatedFields,
      lastAggregated: serverTimestamp(),
    });

    return updatedFields;
  } catch (error) {
    console.error('Error aggregating ratings:', error);
    throw error;
  }
}

// --- Fetch recent trends (last 7 days) for Pre/Plans modal ---

export interface RecentTrends {
  avgScore: number;
  dominantEmoji: string;
  ratingCount: number;
  topCompanion: string | null;
}

/** Cached trends from location doc (avoids reading ratings subcollection when present). */
export type CachedTrends = { recentTrendsLast7d?: { avgScore: number; dominantEmoji: string; ratingCount: number; topCompanion: string | null } };

export async function getRecentTrends(
  locationId: string,
  cached?: CachedTrends | null
): Promise<RecentTrends> {
  if (cached?.recentTrendsLast7d) {
    const t = cached.recentTrendsLast7d;
    return {
      avgScore: t.avgScore,
      dominantEmoji: t.dominantEmoji,
      ratingCount: t.ratingCount,
      topCompanion: t.topCompanion ?? null,
    };
  }
  try {
    const ratingsRef = collection(db, `locations/${locationId}/ratings`);
    const snap = await getDocs(ratingsRef);
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

    const recent = snap.docs
      .map((d) => d.data() as Rating)
      .filter((r) => {
        const ts = r.timestamp?.toMillis?.() ?? 0;
        return ts >= sevenDaysAgo;
      });

    if (recent.length === 0) {
      return { avgScore: 0, dominantEmoji: "", ratingCount: 0, topCompanion: null };
    }

    // Avg score from reviewed
    const reviewed = recent.filter((r) => r.phase === "reviewed" || r.score != null);
    const scores = reviewed.map(primaryScore).filter((s) => s > 0);
    const avgScore = scores.length > 0
      ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10
      : 0;

    // Dominant emoji
    const emojiCounts: Record<string, number> = {};
    for (const r of reviewed) {
      for (const { emoji } of extractScores(r)) {
        emojiCounts[emoji] = (emojiCounts[emoji] || 0) + 1;
      }
    }
    const dominantEmoji = Object.entries(emojiCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "";

    // Top companion
    const companionCounts: Record<string, number> = {};
    for (const r of recent) {
      if (r.companion) companionCounts[r.companion] = (companionCounts[r.companion] || 0) + 1;
    }
    const topCompanion = Object.entries(companionCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || null;

    return { avgScore, dominantEmoji, ratingCount: recent.length, topCompanion };
  } catch {
    return { avgScore: 0, dominantEmoji: "", ratingCount: 0, topCompanion: null };
  }
}

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
  // Check localStorage cache first (saves 1 Firestore read)
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
