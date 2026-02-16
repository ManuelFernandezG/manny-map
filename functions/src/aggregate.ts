/**
 * Pure aggregation and recent-trends logic for location ratings.
 * Mirrors src/lib/ratings.ts logic for use in Cloud Functions (no client Firebase imports).
 */

export const AGE_GROUPS = ["18-22", "23-28", "29-35", "36+"] as const;
export const GENDERS = ["Male", "Female"] as const;

// Positive emojis (score >= 3 from review configs): Fire, Crazy, Unreal, Fair, Steal, Good, Great, Busy, Packed
const POSITIVE_EMOJIS = new Set([
  "🔥", "🤯", "🤤", "💵", "🤑", "👍", "😊", "👥", "❌",
]);

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
  travelTime?: string;
  companion?: string;
  groupSize?: string;
  checkinAt?: unknown;
  vibe?: ReviewScore;
  taste?: ReviewScore;
  price?: ReviewScore;
  service?: ReviewScore;
  crowd?: ReviewScore;
  reviewedAt?: unknown;
  timestamp?: { toMillis?: () => number };
  emoji?: string;
  word?: string;
  score?: number;
  pairs?: { emoji: string; word: string }[];
}

export interface EmojiWord {
  emoji: string;
  word: string;
  count: number;
}

export interface AgeGroupData {
  dominant: EmojiWord;
  totalRatings: number;
  topPairs: EmojiWord[];
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

export interface RecentTrendsLast7d {
  avgScore: number;
  dominantEmoji: string;
  ratingCount: number;
  topCompanion: string | null;
}

export function extractScores(rating: Rating): { emoji: string; word: string; score: number }[] {
  const results: { emoji: string; word: string; score: number }[] = [];
  if (rating.vibe) results.push(rating.vibe);
  if (rating.taste) results.push(rating.taste);
  if (rating.price) results.push(rating.price);
  if (rating.service) results.push(rating.service);
  if (rating.crowd) results.push(rating.crowd);
  if (results.length > 0) return results;
  if (rating.emoji && rating.word && rating.score != null) {
    return [{ emoji: rating.emoji, word: rating.word, score: rating.score }];
  }
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

export function computeAggregates(ratings: Rating[]): AggregatedFields {
  const reviewed = ratings.filter((r) => r.phase === "reviewed" || (r.pairs != null) || r.score != null);
  const checkins = ratings.filter((r) => r.phase === "checkin");

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

  const ratingsByAgeGroup: Record<string, AgeGroupData> = {};
  for (const ag of AGE_GROUPS) ratingsByAgeGroup[ag] = computeGroupData(byAgeGroup[ag]);

  const ratingsByGender: Record<string, AgeGroupData> = {};
  for (const g of GENDERS) ratingsByGender[g] = computeGroupData(byGender[g]);

  const overallData = computeGroupData(allEntries);
  const overall = overallData.dominant;

  const averageScore =
    allScores.length > 0 ? allScores.reduce((s, v) => s + v, 0) / allScores.length : 0;

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

  return {
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
}

export function computeRecentTrendsLast7d(
  ratings: Rating[],
  sevenDaysAgoMs: number
): RecentTrendsLast7d {
  const recent = ratings.filter((r) => {
    const ts = r.timestamp?.toMillis?.() ?? 0;
    return ts >= sevenDaysAgoMs;
  });

  if (recent.length === 0) {
    return { avgScore: 0, dominantEmoji: "", ratingCount: 0, topCompanion: null };
  }

  const reviewed = recent.filter((r) => r.phase === "reviewed" || r.score != null);
  const scores = reviewed.map(primaryScore).filter((s) => s > 0);
  const avgScore =
    scores.length > 0
      ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10
      : 0;

  const emojiCounts: Record<string, number> = {};
  for (const r of reviewed) {
    for (const { emoji } of extractScores(r)) {
      emojiCounts[emoji] = (emojiCounts[emoji] || 0) + 1;
    }
  }
  const dominantEmoji = Object.entries(emojiCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "";

  const companionCounts: Record<string, number> = {};
  for (const r of recent) {
    if (r.companion) companionCounts[r.companion] = (companionCounts[r.companion] || 0) + 1;
  }
  const topCompanion =
    Object.entries(companionCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

  return {
    avgScore,
    dominantEmoji,
    ratingCount: recent.length,
    topCompanion,
  };
}
