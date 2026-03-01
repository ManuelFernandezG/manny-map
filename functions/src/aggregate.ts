/**
 * Pure aggregation logic for location ratings.
 * Used by the Cloud Function (no Firebase imports).
 */

export const AGE_GROUPS = ["18-22", "23-28", "29-35", "36+"] as const;
export const GENDERS = ["Male", "Female"] as const;

export interface Rating {
  userId: string;
  ageGroup: string;
  gender: string;
  phase: "checkin" | "reviewed";
  companion?: string;
  groupSize?: string;
  checkinAt?: unknown;
  vibe?: { emoji: string; word: string };
  waitTime?: string;
  reviewedAt?: unknown;
  timestamp?: { toMillis?: () => number };
}

export interface AggregatedFields {
  checkinCount: number;
  maleCount: number;
  femaleCount: number;
  dominantVibe: string; // emoji
  ratingsByAgeGroup: Record<string, { count: number; percent: number; dominantVibe?: string }>;
  // Tonight sub-aggregate (since 8pm America/Toronto)
  checkinCountTonight: number;
  maleCountTonight: number;
  femaleCountTonight: number;
  dominantVibeTonight: string;
}

/** Returns the UTC epoch ms for 8pm today in America/Toronto timezone. */
export function getTonightStartUtcMs(): number {
  const now = new Date();

  // Today's date string in Toronto (e.g. "2026-02-28")
  const todayInToronto = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Toronto",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);

  // Probe: use 8pm UTC of that date as reference, then measure the Toronto hour offset
  const refUtc = new Date(`${todayInToronto}T20:00:00Z`);
  const torontoHourStr = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Toronto",
    hour: "2-digit",
    hour12: false,
  }).format(refUtc);
  const torontoHour = parseInt(torontoHourStr, 10);

  // Shift so Toronto reads 20:00
  return refUtc.getTime() + (20 - torontoHour) * 60 * 60 * 1000;
}

/** Safely extract milliseconds from a Firestore Timestamp-like value. */
function toMs(val: unknown): number {
  if (!val || typeof val !== "object") return 0;
  const ts = val as { toMillis?: () => number; seconds?: number };
  if (typeof ts.toMillis === "function") return ts.toMillis();
  if (typeof ts.seconds === "number") return ts.seconds * 1000;
  return 0;
}

export function computeAggregates(ratings: Rating[], tonightStartMs?: number): AggregatedFields {
  const checkins = ratings.filter((r) => r.phase === "checkin");
  const reviewed = ratings.filter((r) => r.phase === "reviewed");

  const checkinCount = checkins.length;
  const maleCount = checkins.filter((r) => r.gender === "Male").length;
  const femaleCount = checkins.filter((r) => r.gender === "Female").length;

  // Dominant vibe from reviewed ratings
  const vibeCounts: Record<string, number> = {};
  for (const r of reviewed) {
    if (r.vibe?.emoji) {
      vibeCounts[r.vibe.emoji] = (vibeCounts[r.vibe.emoji] || 0) + 1;
    }
  }
  const dominantVibe = Object.entries(vibeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "";

  // Age group breakdown (by checkins)
  const ageGroupCounts: Record<string, number> = {};
  const ageGroupVibeCounts: Record<string, Record<string, number>> = {};
  for (const ag of AGE_GROUPS) {
    ageGroupCounts[ag] = 0;
    ageGroupVibeCounts[ag] = {};
  }

  for (const r of checkins) {
    if (ageGroupCounts[r.ageGroup] !== undefined) {
      ageGroupCounts[r.ageGroup]++;
    }
  }
  for (const r of reviewed) {
    if (r.vibe?.emoji && ageGroupVibeCounts[r.ageGroup]) {
      ageGroupVibeCounts[r.ageGroup][r.vibe.emoji] =
        (ageGroupVibeCounts[r.ageGroup][r.vibe.emoji] || 0) + 1;
    }
  }

  const ratingsByAgeGroup: Record<string, { count: number; percent: number; dominantVibe?: string }> = {};
  for (const ag of AGE_GROUPS) {
    const count = ageGroupCounts[ag];
    const percent = checkinCount > 0 ? Math.round((count / checkinCount) * 100) : 0;
    const vibeEntries = Object.entries(ageGroupVibeCounts[ag]).sort((a, b) => b[1] - a[1]);
    ratingsByAgeGroup[ag] = {
      count,
      percent,
      ...(vibeEntries[0] && { dominantVibe: vibeEntries[0][0] }),
    };
  }

  // Tonight sub-aggregate
  let checkinCountTonight = 0;
  let maleCountTonight = 0;
  let femaleCountTonight = 0;
  let dominantVibeTonight = "";

  if (tonightStartMs) {
    const tonightCheckins = checkins.filter((r) => toMs(r.checkinAt) >= tonightStartMs);
    checkinCountTonight = tonightCheckins.length;
    maleCountTonight = tonightCheckins.filter((r) => r.gender === "Male").length;
    femaleCountTonight = tonightCheckins.filter((r) => r.gender === "Female").length;

    const tonightReviewed = reviewed.filter((r) => toMs(r.reviewedAt) >= tonightStartMs);
    const tonightVibeCounts: Record<string, number> = {};
    for (const r of tonightReviewed) {
      if (r.vibe?.emoji) {
        tonightVibeCounts[r.vibe.emoji] = (tonightVibeCounts[r.vibe.emoji] || 0) + 1;
      }
    }
    dominantVibeTonight =
      Object.entries(tonightVibeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "";
  }

  return {
    checkinCount,
    maleCount,
    femaleCount,
    dominantVibe,
    ratingsByAgeGroup,
    checkinCountTonight,
    maleCountTonight,
    femaleCountTonight,
    dominantVibeTonight,
  };
}
