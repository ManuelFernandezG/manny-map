import {
  collection,
  addDoc,
  updateDoc,
  doc,
  getDocs,
  query,
  where,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from './firebase';
import type { Location, AgeGroupData, EmojiWord } from '@/data/mockData';
import { AGE_GROUPS, EMOJI_CATEGORIES } from '@/data/mockData';
import { getUserId } from './userId';

// Build a set of all valid emoji+word combinations from the predefined categories
const VALID_PAIRS = new Set<string>();
for (const emojis of Object.values(EMOJI_CATEGORIES)) {
  for (const { emoji, suggestions } of emojis) {
    for (const word of suggestions) {
      VALID_PAIRS.add(`${emoji}:${word}`);
    }
  }
}

export interface Rating {
  userId: string;
  ageGroup: string;
  pairs: { emoji: string; word: string }[];
  timestamp: any;
}

/**
 * Submit a rating for a location
 */
export interface AggregatedFields {
  totalRatings: number;
  dominantEmoji: string;
  dominantWord: string;
  divergenceScore: number;
  divergenceFlagged: boolean;
  ratingsByAgeGroup: Record<string, AgeGroupData>;
}

export async function submitRating(
  locationId: string,
  emojiWords: { emoji: string; word: string }[],
  ageGroup: string
): Promise<AggregatedFields> {
  // Validate pairs against allowed emoji+word combinations
  if (emojiWords.length < 1 || emojiWords.length > 3) {
    throw new Error('Must provide 1-3 emoji-word pairs');
  }
  for (const pair of emojiWords) {
    if (!VALID_PAIRS.has(`${pair.emoji}:${pair.word}`)) {
      throw new Error(`Invalid emoji-word pair: ${pair.emoji} ${pair.word}`);
    }
  }
  if (!(AGE_GROUPS as readonly string[]).includes(ageGroup)) {
    throw new Error(`Invalid age group: ${ageGroup}`);
  }

  const userId = getUserId();

  // Check if user already rated this location
  const ratingsRef = collection(db, `locations/${locationId}/ratings`);
  const existingQuery = query(ratingsRef, where('userId', '==', userId));
  const existingRatings = await getDocs(existingQuery);

  const ratingData: Rating = {
    userId,
    ageGroup,
    pairs: emojiWords,
    timestamp: serverTimestamp()
  };

  if (!existingRatings.empty) {
    // Update existing rating
    const existingDoc = existingRatings.docs[0];
    await updateDoc(existingDoc.ref, {
      ageGroup,
      pairs: emojiWords,
      timestamp: serverTimestamp()
    });
    console.log('✅ Updated existing rating');
  } else {
    // Create new rating
    await addDoc(ratingsRef, ratingData);
    console.log('✅ Created new rating');
  }

  // Trigger aggregation and return updated fields
  return await aggregateRatings(locationId);

/**
 * Aggregate all ratings for a location
 */
export async function aggregateRatings(locationId: string): Promise<AggregatedFields> {
  try {
    // Fetch all ratings
    const ratingsRef = collection(db, `locations/${locationId}/ratings`);
    const ratingsSnap = await getDocs(ratingsRef);

    if (ratingsSnap.empty) {
      console.log('No ratings to aggregate');
      return {
        totalRatings: 0,
        dominantEmoji: "🔥",
        dominantWord: "New",
        divergenceScore: 0,
        divergenceFlagged: false,
        ratingsByAgeGroup: {},
      };
    }

    const ratings = ratingsSnap.docs.map(doc => doc.data() as Rating);

    // Group by age group
    const byAgeGroup: Record<string, { emoji: string; word: string }[]> = {
      "18-22": [],
      "23-28": [],
      "29-35": [],
      "36+": []
    };

    ratings.forEach(rating => {
      if (byAgeGroup[rating.ageGroup]) {
        byAgeGroup[rating.ageGroup].push(...rating.pairs);
      }
    });

    // Calculate top pairs for each age group
    const ratingsByAgeGroup: Record<string, AgeGroupData> = {};
    const allPairs: { emoji: string; word: string }[] = [];

    AGE_GROUPS.forEach(ageGroup => {
      const pairs = byAgeGroup[ageGroup] || [];
      const counts: Record<string, EmojiWord> = {};

      pairs.forEach(pair => {
        const key = `${pair.emoji}${pair.word}`;
        if (!counts[key]) {
          counts[key] = { emoji: pair.emoji, word: pair.word, count: 0 };
        }
        counts[key].count++;
      });

      const topPairs = Object.values(counts)
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      ratingsByAgeGroup[ageGroup] = {
        totalRatings: pairs.length,
        dominant: topPairs[0] || { emoji: "🔥", word: "New", count: 0 },
        topPairs
      };

      allPairs.push(...pairs);
    });

    // Calculate overall dominant
    const allCounts: Record<string, EmojiWord> = {};
    allPairs.forEach(pair => {
      const key = `${pair.emoji}${pair.word}`;
      if (!allCounts[key]) {
        allCounts[key] = { emoji: pair.emoji, word: pair.word, count: 0 };
      }
      allCounts[key].count++;
    });

    const sortedOverall = Object.values(allCounts)
      .sort((a, b) => b.count - a.count);

    const overall = sortedOverall[0] || { emoji: "🔥", word: "New", count: 0 };

    // Calculate divergence
    const activeGroups = AGE_GROUPS.filter(
      ag => ratingsByAgeGroup[ag].totalRatings >= 5 // Only count groups with 5+ ratings
    );

    let divergenceScore = 0;
    if (activeGroups.length >= 2) {
      const dominantKeys = activeGroups.map(ag =>
        `${ratingsByAgeGroup[ag].dominant.emoji}${ratingsByAgeGroup[ag].dominant.word}`
      );
      const uniqueDominants = new Set(dominantKeys);
      divergenceScore = (uniqueDominants.size - 1) / (activeGroups.length - 1);
    }

    const divergenceFlagged = divergenceScore >= 0.5 && activeGroups.length >= 2;

    const updatedFields: AggregatedFields = {
      totalRatings: ratings.length,
      dominantEmoji: overall.emoji,
      dominantWord: overall.word,
      divergenceScore,
      divergenceFlagged,
      ratingsByAgeGroup,
    };

    // Update location document
    const locationRef = doc(db, 'locations', locationId);
    await updateDoc(locationRef, {
      ...updatedFields,
      lastAggregated: serverTimestamp()
    });

    console.log(`✅ Aggregated ${ratings.length} ratings for location ${locationId}`);
    return updatedFields;
  } catch (error) {
    console.error('❌ Error aggregating ratings:', error);
    throw error;
  }
}

/**
 * Get user's rating for a location (if exists)
 */
export async function getUserRating(locationId: string): Promise<Rating | null> {
  try {
    const userId = getUserId();
    const ratingsRef = collection(db, `locations/${locationId}/ratings`);
    const q = query(ratingsRef, where('userId', '==', userId));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return null;
    }

    return snapshot.docs[0].data() as Rating;
  } catch (error) {
    console.error('Error getting user rating:', error);
    return null;
  }
}
