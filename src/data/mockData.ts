export interface AgeGroupStats {
  count: number;
  percent: number;
  dominantVibe?: string; // emoji
}

export interface Location {
  id: string;
  name: string;
  category: string;
  address: string;
  neighborhood: string;
  city: string;
  coordinates: { lat: number; lng: number };
  hours?: string;
  description?: string;
  isUserCreated: boolean;
  isPending: boolean;
  // Live aggregates (from Firestore via Cloud Function, optional in static data)
  checkinCount?: number;
  maleCount?: number;
  femaleCount?: number;
  dominantVibe?: string; // emoji (🔥 🤯 😴 💀)
  ratingsByAgeGroup?: Record<string, AgeGroupStats>;
}

// --- Categories ---

export const CATEGORIES = [
  "Bar", "Club", "Restaurant", "Cafe", "Gym",
  "Beach", "Trail", "Run Club", "Festival", "Concert",
] as const;

/** Nightlife-only categories (Phase 1 scope) */
export const NIGHTLIFE_CATEGORIES = ["Bar", "Club"] as const;

export type CategoryGroup = "nightlife" | "food" | "outdoors" | "events";

export const CATEGORY_GROUPS: Record<string, CategoryGroup> = {
  Bar: "nightlife",
  Club: "nightlife",
  Restaurant: "food",
  Cafe: "food",
  Gym: "outdoors",
  Beach: "outdoors",
  Trail: "outdoors",
  "Run Club": "events",
  Festival: "events",
  Concert: "events",
};

export const CATEGORY_COLORS: Record<string, string> = {
  Bar: "bg-indigo-500/20 text-indigo-400",
  Club: "bg-purple-500/20 text-purple-400",
  Restaurant: "bg-red-500/20 text-red-400",
  Cafe: "bg-amber-500/20 text-amber-400",
  Gym: "bg-orange-500/20 text-orange-400",
  Beach: "bg-cyan-500/20 text-cyan-400",
  Trail: "bg-green-500/20 text-green-400",
  "Run Club": "bg-lime-500/20 text-lime-400",
  Festival: "bg-pink-500/20 text-pink-400",
  Concert: "bg-rose-500/20 text-rose-400",
};

export interface ReviewEmoji {
  emoji: string;
  word: string;
}

// Nightlife vibe options (the only active review dimension)
export const VIBE_EMOJIS: ReviewEmoji[] = [
  { emoji: "💀", word: "Dead" },
  { emoji: "😴", word: "Slow" },
  { emoji: "🔥", word: "Fire" },
  { emoji: "🤯", word: "Crazy" },
];

// Positive vibe emojis (shown as "good" on map/profile)
export const POSITIVE_EMOJIS = new Set(["🔥", "🤯"]);

// --- Check-in field configs (unified across all groups) ---

export const WAIT_TIME_OPTIONS = ["No wait", "<15 min", "15-30 min", "30+ min"] as const;
export const GROUP_SIZE_OPTIONS = ["Solo", "2-3", "4-6", "7+"] as const;
export const COMPANION_OPTIONS = ["Friends", "Date", "Family", "Mixed"] as const;

// --- Demographics ---

export const GENDERS = ["Male", "Female"] as const;
export const AGE_GROUPS = ["18-22", "23-28", "29-35", "36+"] as const;

// --- Gender-specific terminology ---

export const PHASE_LABELS = {
  Male: { phase1: "Pre", phase2: "Afters" },
  Female: { phase1: "Plans", phase2: "Debrief" },
} as const;

// --- Cities ---

export const CITIES: Record<string, { lat: number; lng: number; zoom: number }> = {
  Ottawa: { lat: 45.4285, lng: -75.6930, zoom: 13 }, // Centered on Byward Market cluster
  Toronto: { lat: 43.6532, lng: -79.3832, zoom: 13 },
  Montreal: { lat: 45.5017, lng: -73.5673, zoom: 13 },
  Guelph: { lat: 43.5448, lng: -80.2482, zoom: 13 },
};
