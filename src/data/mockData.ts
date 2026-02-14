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
}

export const CATEGORIES = [
  "Restaurant", "Nightclub", "Park", "Gym", "Run Route",
  "Event", "Pop-up", "Bar", "Cafe", "Other"
] as const;

export const CATEGORY_COLORS: Record<string, string> = {
  Restaurant: "bg-red-500/20 text-red-400",
  Nightclub: "bg-purple-500/20 text-purple-400",
  Park: "bg-blue-500/20 text-blue-400",
  Gym: "bg-orange-500/20 text-orange-400",
  "Run Route": "bg-green-500/20 text-green-400",
  Event: "bg-pink-500/20 text-pink-400",
  "Pop-up": "bg-yellow-500/20 text-yellow-400",
  Bar: "bg-indigo-500/20 text-indigo-400",
  Cafe: "bg-amber-500/20 text-amber-400",
  Other: "bg-gray-500/20 text-gray-400",
};

export const EMOJI_CATEGORIES = {
  "Energy": [
    { emoji: "🔥", suggestions: ["Fire", "Lit", "Heat"] },
    { emoji: "💀", suggestions: ["Dead", "Boring", "Mid"] },
    { emoji: "👑", suggestions: ["Vibes", "Royal", "Elite"] },
    { emoji: "😴", suggestions: ["Slow", "Sleepy", "Dead"] },
    { emoji: "🤯", suggestions: ["Crazy", "Wild", "Insane"] },
    { emoji: "⚡", suggestions: ["Electric", "Hype", "Energy"] },
  ],
  "Price": [
    { emoji: "💰", suggestions: ["Expensive", "Pricey", "Steep"] },
    { emoji: "🤑", suggestions: ["Cheap", "Steal", "Budget"] },
    { emoji: "💸", suggestions: ["Overpriced", "Ripoff", "Waste"] },
    { emoji: "💵", suggestions: ["Worth it", "Fair", "Good deal"] },
  ],
  "Crowd": [
    { emoji: "👥", suggestions: ["Crowded", "Packed", "Busy"] },
    { emoji: "🤝", suggestions: ["Social", "Friendly", "Warm"] },
    { emoji: "🧑‍🤝‍🧑", suggestions: ["Clique-y", "Exclusive", "Tight"] },
    { emoji: "👤", suggestions: ["Quiet", "Chill", "Empty"] },
  ],
  "Food": [
    { emoji: "🍔", suggestions: ["Good food", "Delicious", "Bussin"] },
    { emoji: "🤢", suggestions: ["Bad food", "Nasty", "Skip"] },
    { emoji: "🍺", suggestions: ["Good drinks", "Strong", "Smooth"] },
    { emoji: "☕", suggestions: ["Good coffee", "Cozy", "Warm"] },
  ],
  "Service": [
    { emoji: "😤", suggestions: ["Rude staff", "Attitude", "Slow"] },
    { emoji: "😊", suggestions: ["Great service", "Kind", "Attentive"] },
    { emoji: "⏱️", suggestions: ["Long wait", "Forever", "Slow"] },
    { emoji: "⚡", suggestions: ["Fast", "Quick", "Instant"] },
  ],
  "Location": [
    { emoji: "🏜️", suggestions: ["Remote", "Far", "Hidden"] },
    { emoji: "🚗", suggestions: ["Hard to park", "No parking", "Drive"] },
    { emoji: "🌙", suggestions: ["Date spot", "Romantic", "Cozy"] },
    { emoji: "👨‍👩‍👧‍👦", suggestions: ["Family", "Kid-friendly", "Safe"] },
  ],
};

export const CITIES: Record<string, { lat: number; lng: number; zoom: number }> = {
  Ottawa: { lat: 45.4215, lng: -75.6972, zoom: 13 },
  Toronto: { lat: 43.6532, lng: -79.3832, zoom: 13 },
  Montreal: { lat: 45.5017, lng: -73.5673, zoom: 13 },
  Guelph: { lat: 43.5448, lng: -80.2482, zoom: 13 },
};

export const AGE_GROUPS = ["18-22", "23-28", "29-35", "36+"] as const;
