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
  totalRatings: number;
  ratingsByAgeGroup: Record<string, AgeGroupData>;
  divergenceScore: number;
  divergenceFlagged: boolean;
  dominantEmoji: string;
  dominantWord: string;
  averageScore?: number;
  ratingsByGender?: Record<string, AgeGroupData>;
  checkinCount?: number;
}

// --- Categories ---

export const CATEGORIES = [
  "Bar", "Club", "Restaurant", "Cafe", "Gym",
  "Beach", "Trail", "Run Club", "Festival", "Concert",
] as const;

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

// --- Review emoji configs per group ---

export interface ReviewEmoji {
  emoji: string;
  word: string;
  score: number; // 4=best, 1=worst
}

export interface ReviewDimension {
  key: string;
  label: string;
  emojis: ReviewEmoji[];
}

export const REVIEW_CONFIG: Record<CategoryGroup, ReviewDimension[]> = {
  nightlife: [
    {
      key: "vibe",
      label: "Vibe",
      emojis: [
        { emoji: "💀", word: "Dead", score: 1 },
        { emoji: "😴", word: "Slow", score: 2 },
        { emoji: "🔥", word: "Fire", score: 3 },
        { emoji: "🤯", word: "Crazy", score: 4 },
      ],
    },
  ],
  food: [
    {
      key: "taste",
      label: "Taste",
      emojis: [
        { emoji: "🤢", word: "Nasty", score: 1 },
        { emoji: "😴", word: "Mid", score: 2 },
        { emoji: "🔥", word: "Fire", score: 3 },
        { emoji: "🤤", word: "Unreal", score: 4 },
      ],
    },
    {
      key: "price",
      label: "Price",
      emojis: [
        { emoji: "💸", word: "Ripoff", score: 1 },
        { emoji: "💰", word: "Pricey", score: 2 },
        { emoji: "💵", word: "Fair", score: 3 },
        { emoji: "🤑", word: "Steal", score: 4 },
      ],
    },
    {
      key: "service",
      label: "Service",
      emojis: [
        { emoji: "😤", word: "Rude", score: 1 },
        { emoji: "😐", word: "Mid", score: 2 },
        { emoji: "👍", word: "Good", score: 3 },
        { emoji: "😊", word: "Great", score: 4 },
      ],
    },
  ],
  outdoors: [
    {
      key: "crowd",
      label: "Crowd",
      emojis: [
        { emoji: "🏜️", word: "Empty", score: 1 },
        { emoji: "👤", word: "Quiet", score: 2 },
        { emoji: "👥", word: "Busy", score: 3 },
        { emoji: "❌", word: "Packed", score: 4 },
      ],
    },
  ],
  events: [
    {
      key: "vibe",
      label: "Vibe",
      emojis: [
        { emoji: "💀", word: "Dead", score: 1 },
        { emoji: "😴", word: "Slow", score: 2 },
        { emoji: "🔥", word: "Fire", score: 3 },
        { emoji: "🤯", word: "Crazy", score: 4 },
      ],
    },
  ],
};

// --- Check-in field configs (unified across all groups) ---

export const TRAVEL_TIME_OPTIONS = ["<5 min", "5-15 min", "15-30 min", "30+ min"] as const;
export const GROUP_SIZE_OPTIONS = ["Solo", "2-3", "4-6", "7+"] as const;
export const COMPANION_OPTIONS = ["Friends", "Date", "Family", "Mixed"] as const;

// --- Positive emojis (score >= 3 from all review configs) ---

export const POSITIVE_EMOJIS = new Set(
  Object.values(REVIEW_CONFIG)
    .flat()
    .flatMap((dim) => dim.emojis)
    .filter((e) => e.score >= 3)
    .map((e) => e.emoji)
);

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
  Ottawa: { lat: 45.4215, lng: -75.6972, zoom: 13 },
  Toronto: { lat: 43.6532, lng: -79.3832, zoom: 13 },
  Montreal: { lat: 45.5017, lng: -73.5673, zoom: 13 },
  Guelph: { lat: 43.5448, lng: -80.2482, zoom: 13 },
};
