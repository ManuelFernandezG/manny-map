/**
 * Local mock stats for Saturday-night previewing.
 * Used when VITE_MOCK_STATS=true in .env.local — zero Firestore reads.
 * To disable: remove VITE_MOCK_STATS from .env.local.
 */

import type { LocationStats } from "@/lib/ratings";

function stats(
  checkinCount: number,
  maleCount: number,
  dominantVibe: string,
  age1822: number,
  age2328: number,
  age2935: number,
  age36: number,
  vibe1822: string,
  vibe2328: string,
  vibe2935: string,
  vibe36: string
): LocationStats {
  const femaleCount = checkinCount - maleCount;
  return {
    checkinCount,
    maleCount,
    femaleCount,
    dominantVibe,
    ratingsByAgeGroup: {
      "18-22": { count: age1822, percent: Math.round((age1822 / checkinCount) * 100), dominantVibe: vibe1822 },
      "23-28": { count: age2328, percent: Math.round((age2328 / checkinCount) * 100), dominantVibe: vibe2328 },
      "29-35": { count: age2935, percent: Math.round((age2935 / checkinCount) * 100), dominantVibe: vibe2935 },
      "36+":   { count: age36,   percent: Math.round((age36   / checkinCount) * 100), dominantVibe: vibe36   },
    },
  };
}

export const SEED_STATS: Record<string, LocationStats> = {
  // Clubs — skew young, fire/crazy vibes
  "club-berlin-nightclub-ottawa":
    stats(128, 69, "🔥", 38, 54, 26, 10, "🤯", "🔥", "🔥", "😴"),

  "club-the-show-ottawa":
    stats(112, 62, "🔥", 34, 47, 22,  9, "🤯", "🔥", "🔥", "😴"),

  "club-room-104-ottawa":
    stats(103, 58, "🤯", 32, 43, 20,  8, "🤯", "🤯", "🔥", "😴"),

  "club-sky-lounge-ottawa":
    stats(91,  49, "🔥", 26, 38, 20,  7, "🔥", "🔥", "🤯", "😴"),

  "club-city-at-night-ottawa":
    stats(88,  46, "🔥", 28, 36, 18,  6, "🤯", "🔥", "🔥", "😴"),

  // Bars — older mix, more fire + slow split
  "bar-heart-and-crown-ottawa":
    stats(82,  46, "🔥", 20, 34, 20,  8, "🔥", "🔥", "😴", "😴"),

  "bar-el-furniture-warehouse-ottawa":
    stats(79,  44, "🔥", 22, 33, 17,  7, "🔥", "🔥", "😴", "💀"),

  "bar-tomo-restaurant-ottawa":
    stats(68,  35, "🔥", 16, 28, 17,  7, "🔥", "🔥", "😴", "😴"),

  "bar-la-ptite-grenouille-ottawa":
    stats(72,  40, "😴", 14, 30, 19,  9, "🔥", "😴", "😴", "💀"),

  "bar-back-to-brooklyn-ottawa":
    stats(58,  31, "🔥", 14, 24, 14,  6, "🔥", "🔥", "😴", "😴"),

  "bar-happy-fish-elgin-ottawa":
    stats(54,  28, "🔥", 12, 22, 14,  6, "🔥", "🔥", "🔥", "😴"),

  "bar-lieutenant-pump-ottawa":
    stats(47,  24, "😴",  8, 18, 14,  7, "🔥", "😴", "😴", "💀"),
};
