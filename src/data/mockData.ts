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
};

export const AGE_GROUPS = ["18-22", "23-28", "29-35", "36+"] as const;

export const mockLocations: Location[] = [
  {
    id: "loc_1",
    name: "House of TARG",
    category: "Bar",
    address: "1077 Bank St",
    neighborhood: "Old Ottawa South",
    city: "Ottawa",
    coordinates: { lat: 45.3935, lng: -75.6735 },
    hours: "Wed-Sun 5pm-2am",
    description: "Pinball bar with live music and perogies",
    isUserCreated: false,
    isPending: false,
    totalRatings: 312,
    ratingsByAgeGroup: {
      "18-22": { dominant: { emoji: "🔥", word: "Fire", count: 89 }, totalRatings: 145, topPairs: [{ emoji: "🔥", word: "Fire", count: 89 }, { emoji: "👑", word: "Vibes", count: 34 }, { emoji: "🍺", word: "Good drinks", count: 22 }] },
      "23-28": { dominant: { emoji: "👑", word: "Vibes", count: 54 }, totalRatings: 120, topPairs: [{ emoji: "👑", word: "Vibes", count: 54 }, { emoji: "🔥", word: "Lit", count: 38 }, { emoji: "🍺", word: "Strong", count: 28 }] },
      "29-35": { dominant: { emoji: "😊", word: "Great service", count: 12 }, totalRatings: 35, topPairs: [{ emoji: "😊", word: "Great service", count: 12 }, { emoji: "🌙", word: "Date spot", count: 8 }, { emoji: "💵", word: "Worth it", count: 7 }] },
      "36+": { dominant: { emoji: "💰", word: "Expensive", count: 6 }, totalRatings: 12, topPairs: [{ emoji: "💰", word: "Expensive", count: 6 }, { emoji: "👥", word: "Crowded", count: 4 }, { emoji: "😴", word: "Slow", count: 2 }] },
    },
    divergenceScore: 0.45,
    divergenceFlagged: true,
    dominantEmoji: "🔥",
    dominantWord: "Fire",
  },
  {
    id: "loc_2",
    name: "Elgin Street Diner",
    category: "Restaurant",
    address: "374 Elgin St",
    neighborhood: "Centretown",
    city: "Ottawa",
    coordinates: { lat: 45.4145, lng: -75.6880 },
    hours: "24/7",
    description: "Iconic late-night diner",
    isUserCreated: false,
    isPending: false,
    totalRatings: 487,
    ratingsByAgeGroup: {
      "18-22": { dominant: { emoji: "🔥", word: "Lit", count: 120 }, totalRatings: 230, topPairs: [{ emoji: "🔥", word: "Lit", count: 120 }, { emoji: "🍔", word: "Bussin", count: 65 }, { emoji: "👥", word: "Packed", count: 45 }] },
      "23-28": { dominant: { emoji: "🍔", word: "Good food", count: 78 }, totalRatings: 170, topPairs: [{ emoji: "🍔", word: "Good food", count: 78 }, { emoji: "🤑", word: "Cheap", count: 52 }, { emoji: "⏱️", word: "Long wait", count: 40 }] },
      "29-35": { dominant: { emoji: "💀", word: "Mid", count: 32 }, totalRatings: 60, topPairs: [{ emoji: "💀", word: "Mid", count: 32 }, { emoji: "👥", word: "Crowded", count: 18 }, { emoji: "⏱️", word: "Forever", count: 10 }] },
      "36+": { dominant: { emoji: "😴", word: "Slow", count: 15 }, totalRatings: 27, topPairs: [{ emoji: "😴", word: "Slow", count: 15 }, { emoji: "💀", word: "Dead", count: 8 }, { emoji: "💰", word: "Expensive", count: 4 }] },
    },
    divergenceScore: 0.62,
    divergenceFlagged: true,
    dominantEmoji: "🔥",
    dominantWord: "Lit",
  },
  {
    id: "loc_3",
    name: "Dominion City Brewing",
    category: "Bar",
    address: "5510 Canotek Rd",
    neighborhood: "Gloucester",
    city: "Ottawa",
    coordinates: { lat: 45.4530, lng: -75.5930 },
    hours: "Thu-Sun 12pm-9pm",
    description: "Craft brewery taproom",
    isUserCreated: false,
    isPending: false,
    totalRatings: 198,
    ratingsByAgeGroup: {
      "18-22": { dominant: { emoji: "🏜️", word: "Far", count: 22 }, totalRatings: 40, topPairs: [{ emoji: "🏜️", word: "Far", count: 22 }, { emoji: "🍺", word: "Good drinks", count: 12 }, { emoji: "👤", word: "Chill", count: 6 }] },
      "23-28": { dominant: { emoji: "👑", word: "Vibes", count: 55 }, totalRatings: 95, topPairs: [{ emoji: "👑", word: "Vibes", count: 55 }, { emoji: "🍺", word: "Strong", count: 25 }, { emoji: "🌙", word: "Date spot", count: 15 }] },
      "29-35": { dominant: { emoji: "🍺", word: "Good drinks", count: 30 }, totalRatings: 45, topPairs: [{ emoji: "🍺", word: "Good drinks", count: 30 }, { emoji: "💵", word: "Worth it", count: 10 }, { emoji: "😊", word: "Great service", count: 5 }] },
      "36+": { dominant: { emoji: "💵", word: "Worth it", count: 10 }, totalRatings: 18, topPairs: [{ emoji: "💵", word: "Worth it", count: 10 }, { emoji: "🍺", word: "Smooth", count: 5 }, { emoji: "👤", word: "Quiet", count: 3 }] },
    },
    divergenceScore: 0.35,
    divergenceFlagged: false,
    dominantEmoji: "👑",
    dominantWord: "Vibes",
  },
  {
    id: "loc_4",
    name: "Parliament Hill Run",
    category: "Run Route",
    address: "Wellington St",
    neighborhood: "Downtown",
    city: "Ottawa",
    coordinates: { lat: 45.4236, lng: -75.7009 },
    description: "Scenic 5K along the canal and Parliament",
    isUserCreated: true,
    isPending: false,
    totalRatings: 156,
    ratingsByAgeGroup: {
      "18-22": { dominant: { emoji: "🔥", word: "Fire", count: 42 }, totalRatings: 78, topPairs: [{ emoji: "🔥", word: "Fire", count: 42 }, { emoji: "⚡", word: "Energy", count: 22 }, { emoji: "👑", word: "Elite", count: 14 }] },
      "23-28": { dominant: { emoji: "⚡", word: "Hype", count: 28 }, totalRatings: 52, topPairs: [{ emoji: "⚡", word: "Hype", count: 28 }, { emoji: "🔥", word: "Fire", count: 16 }, { emoji: "🤝", word: "Social", count: 8 }] },
      "29-35": { dominant: { emoji: "👑", word: "Vibes", count: 10 }, totalRatings: 18, topPairs: [{ emoji: "👑", word: "Vibes", count: 10 }, { emoji: "⚡", word: "Energy", count: 5 }, { emoji: "🌙", word: "Romantic", count: 3 }] },
      "36+": { dominant: { emoji: "😊", word: "Great", count: 4 }, totalRatings: 8, topPairs: [{ emoji: "😊", word: "Great", count: 4 }, { emoji: "👨‍👩‍👧‍👦", word: "Family", count: 3 }, { emoji: "👑", word: "Vibes", count: 1 }] },
    },
    divergenceScore: 0.15,
    divergenceFlagged: false,
    dominantEmoji: "🔥",
    dominantWord: "Fire",
  },
  {
    id: "loc_5",
    name: "Club SAW",
    category: "Nightclub",
    address: "67 Nicholas St",
    neighborhood: "ByWard Market",
    city: "Ottawa",
    coordinates: { lat: 45.4280, lng: -75.6880 },
    hours: "Fri-Sat 10pm-2am",
    description: "Underground electronic music events",
    isUserCreated: true,
    isPending: false,
    totalRatings: 203,
    ratingsByAgeGroup: {
      "18-22": { dominant: { emoji: "🤯", word: "Crazy", count: 72 }, totalRatings: 130, topPairs: [{ emoji: "🤯", word: "Crazy", count: 72 }, { emoji: "🔥", word: "Lit", count: 38 }, { emoji: "👥", word: "Packed", count: 20 }] },
      "23-28": { dominant: { emoji: "🔥", word: "Fire", count: 28 }, totalRatings: 50, topPairs: [{ emoji: "🔥", word: "Fire", count: 28 }, { emoji: "🤯", word: "Wild", count: 14 }, { emoji: "💰", word: "Expensive", count: 8 }] },
      "29-35": { dominant: { emoji: "💀", word: "Dead", count: 8 }, totalRatings: 15, topPairs: [{ emoji: "💀", word: "Dead", count: 8 }, { emoji: "😴", word: "Slow", count: 4 }, { emoji: "😤", word: "Rude staff", count: 3 }] },
      "36+": { dominant: { emoji: "💀", word: "Boring", count: 5 }, totalRatings: 8, topPairs: [{ emoji: "💀", word: "Boring", count: 5 }, { emoji: "👥", word: "Crowded", count: 2 }, { emoji: "😤", word: "Attitude", count: 1 }] },
    },
    divergenceScore: 0.72,
    divergenceFlagged: true,
    dominantEmoji: "🤯",
    dominantWord: "Crazy",
  },
  {
    id: "loc_6",
    name: "Suzy Q Doughnuts",
    category: "Cafe",
    address: "969 Wellington St W",
    neighborhood: "Hintonburg",
    city: "Ottawa",
    coordinates: { lat: 45.3985, lng: -75.7275 },
    hours: "Daily 7am-5pm",
    description: "Artisan doughnuts and coffee",
    isUserCreated: false,
    isPending: false,
    totalRatings: 274,
    ratingsByAgeGroup: {
      "18-22": { dominant: { emoji: "🍔", word: "Bussin", count: 60 }, totalRatings: 110, topPairs: [{ emoji: "🍔", word: "Bussin", count: 60 }, { emoji: "💸", word: "Overpriced", count: 30 }, { emoji: "👑", word: "Vibes", count: 20 }] },
      "23-28": { dominant: { emoji: "☕", word: "Cozy", count: 55 }, totalRatings: 100, topPairs: [{ emoji: "☕", word: "Cozy", count: 55 }, { emoji: "🍔", word: "Delicious", count: 28 }, { emoji: "💵", word: "Worth it", count: 17 }] },
      "29-35": { dominant: { emoji: "☕", word: "Good coffee", count: 22 }, totalRatings: 42, topPairs: [{ emoji: "☕", word: "Good coffee", count: 22 }, { emoji: "💵", word: "Fair", count: 12 }, { emoji: "🌙", word: "Date spot", count: 8 }] },
      "36+": { dominant: { emoji: "💵", word: "Worth it", count: 12 }, totalRatings: 22, topPairs: [{ emoji: "💵", word: "Worth it", count: 12 }, { emoji: "☕", word: "Warm", count: 7 }, { emoji: "😊", word: "Kind", count: 3 }] },
    },
    divergenceScore: 0.28,
    divergenceFlagged: false,
    dominantEmoji: "🍔",
    dominantWord: "Bussin",
  },
  {
    id: "loc_7",
    name: "Barrymore's",
    category: "Nightclub",
    address: "323 Bank St",
    neighborhood: "Centretown",
    city: "Ottawa",
    coordinates: { lat: 45.4165, lng: -75.6935 },
    hours: "Thu-Sat 9pm-2am",
    description: "Live music venue and nightclub",
    isUserCreated: false,
    isPending: false,
    totalRatings: 389,
    ratingsByAgeGroup: {
      "18-22": { dominant: { emoji: "🔥", word: "Lit", count: 95 }, totalRatings: 190, topPairs: [{ emoji: "🔥", word: "Lit", count: 95 }, { emoji: "🤯", word: "Wild", count: 55 }, { emoji: "👥", word: "Packed", count: 40 }] },
      "23-28": { dominant: { emoji: "🔥", word: "Fire", count: 48 }, totalRatings: 120, topPairs: [{ emoji: "🔥", word: "Fire", count: 48 }, { emoji: "💰", word: "Pricey", count: 38 }, { emoji: "🍺", word: "Strong", count: 34 }] },
      "29-35": { dominant: { emoji: "💀", word: "Mid", count: 25 }, totalRatings: 52, topPairs: [{ emoji: "💀", word: "Mid", count: 25 }, { emoji: "👥", word: "Crowded", count: 15 }, { emoji: "😤", word: "Rude staff", count: 12 }] },
      "36+": { dominant: { emoji: "😴", word: "Slow", count: 14 }, totalRatings: 27, topPairs: [{ emoji: "😴", word: "Slow", count: 14 }, { emoji: "💀", word: "Dead", count: 8 }, { emoji: "💰", word: "Expensive", count: 5 }] },
    },
    divergenceScore: 0.58,
    divergenceFlagged: true,
    dominantEmoji: "🔥",
    dominantWord: "Lit",
  },
  {
    id: "loc_8",
    name: "Major's Hill Park",
    category: "Park",
    address: "Mackenzie Ave",
    neighborhood: "ByWard Market",
    city: "Ottawa",
    coordinates: { lat: 45.4275, lng: -75.6960 },
    description: "Park overlooking Parliament and the Ottawa River",
    isUserCreated: false,
    isPending: false,
    totalRatings: 145,
    ratingsByAgeGroup: {
      "18-22": { dominant: { emoji: "👑", word: "Vibes", count: 28 }, totalRatings: 55, topPairs: [{ emoji: "👑", word: "Vibes", count: 28 }, { emoji: "🌙", word: "Date spot", count: 15 }, { emoji: "👤", word: "Chill", count: 12 }] },
      "23-28": { dominant: { emoji: "🌙", word: "Romantic", count: 22 }, totalRatings: 48, topPairs: [{ emoji: "🌙", word: "Romantic", count: 22 }, { emoji: "👑", word: "Vibes", count: 16 }, { emoji: "👤", word: "Quiet", count: 10 }] },
      "29-35": { dominant: { emoji: "👨‍👩‍👧‍👦", word: "Family", count: 15 }, totalRatings: 28, topPairs: [{ emoji: "👨‍👩‍👧‍👦", word: "Family", count: 15 }, { emoji: "👑", word: "Vibes", count: 8 }, { emoji: "🌙", word: "Cozy", count: 5 }] },
      "36+": { dominant: { emoji: "👨‍👩‍👧‍👦", word: "Kid-friendly", count: 8 }, totalRatings: 14, topPairs: [{ emoji: "👨‍👩‍👧‍👦", word: "Kid-friendly", count: 8 }, { emoji: "😊", word: "Great", count: 4 }, { emoji: "👤", word: "Quiet", count: 2 }] },
    },
    divergenceScore: 0.22,
    divergenceFlagged: false,
    dominantEmoji: "👑",
    dominantWord: "Vibes",
  },
  // Toronto locations
  {
    id: "loc_9",
    name: "Kensington Market",
    category: "Other",
    address: "Kensington Ave",
    neighborhood: "Kensington",
    city: "Toronto",
    coordinates: { lat: 43.6547, lng: -79.4005 },
    description: "Eclectic neighborhood with vintage shops and food",
    isUserCreated: false,
    isPending: false,
    totalRatings: 521,
    ratingsByAgeGroup: {
      "18-22": { dominant: { emoji: "🔥", word: "Fire", count: 130 }, totalRatings: 250, topPairs: [{ emoji: "🔥", word: "Fire", count: 130 }, { emoji: "👑", word: "Vibes", count: 70 }, { emoji: "🍔", word: "Bussin", count: 50 }] },
      "23-28": { dominant: { emoji: "👑", word: "Vibes", count: 80 }, totalRatings: 180, topPairs: [{ emoji: "👑", word: "Vibes", count: 80 }, { emoji: "🔥", word: "Fire", count: 55 }, { emoji: "☕", word: "Cozy", count: 45 }] },
      "29-35": { dominant: { emoji: "👥", word: "Crowded", count: 30 }, totalRatings: 60, topPairs: [{ emoji: "👥", word: "Crowded", count: 30 }, { emoji: "💵", word: "Worth it", count: 18 }, { emoji: "🔥", word: "Fire", count: 12 }] },
      "36+": { dominant: { emoji: "🚗", word: "No parking", count: 15 }, totalRatings: 31, topPairs: [{ emoji: "🚗", word: "No parking", count: 15 }, { emoji: "👥", word: "Packed", count: 10 }, { emoji: "💵", word: "Worth it", count: 6 }] },
    },
    divergenceScore: 0.42,
    divergenceFlagged: true,
    dominantEmoji: "🔥",
    dominantWord: "Fire",
  },
  {
    id: "loc_10",
    name: "Trinity Bellwoods",
    category: "Park",
    address: "790 Queen St W",
    neighborhood: "West Queen West",
    city: "Toronto",
    coordinates: { lat: 43.6432, lng: -79.4137 },
    description: "Iconic Toronto park for hangs",
    isUserCreated: false,
    isPending: false,
    totalRatings: 445,
    ratingsByAgeGroup: {
      "18-22": { dominant: { emoji: "👑", word: "Vibes", count: 110 }, totalRatings: 210, topPairs: [{ emoji: "👑", word: "Vibes", count: 110 }, { emoji: "🤝", word: "Social", count: 55 }, { emoji: "🔥", word: "Fire", count: 45 }] },
      "23-28": { dominant: { emoji: "🤝", word: "Social", count: 65 }, totalRatings: 150, topPairs: [{ emoji: "🤝", word: "Social", count: 65 }, { emoji: "👑", word: "Vibes", count: 50 }, { emoji: "🌙", word: "Date spot", count: 35 }] },
      "29-35": { dominant: { emoji: "👥", word: "Crowded", count: 28 }, totalRatings: 55, topPairs: [{ emoji: "👥", word: "Crowded", count: 28 }, { emoji: "👨‍👩‍👧‍👦", word: "Family", count: 15 }, { emoji: "👑", word: "Vibes", count: 12 }] },
      "36+": { dominant: { emoji: "👥", word: "Packed", count: 18 }, totalRatings: 30, topPairs: [{ emoji: "👥", word: "Packed", count: 18 }, { emoji: "👨‍👩‍👧‍👦", word: "Family", count: 8 }, { emoji: "😊", word: "Great", count: 4 }] },
    },
    divergenceScore: 0.30,
    divergenceFlagged: false,
    dominantEmoji: "👑",
    dominantWord: "Vibes",
  },
  // Montreal locations
  {
    id: "loc_11",
    name: "Stereo Nightclub",
    category: "Nightclub",
    address: "858 Ste Catherine St E",
    neighborhood: "Gay Village",
    city: "Montreal",
    coordinates: { lat: 45.5192, lng: -73.5575 },
    hours: "Fri-Sun 11pm-10am",
    description: "After-hours techno temple",
    isUserCreated: false,
    isPending: false,
    totalRatings: 367,
    ratingsByAgeGroup: {
      "18-22": { dominant: { emoji: "🤯", word: "Insane", count: 80 }, totalRatings: 160, topPairs: [{ emoji: "🤯", word: "Insane", count: 80 }, { emoji: "🔥", word: "Fire", count: 50 }, { emoji: "⚡", word: "Electric", count: 30 }] },
      "23-28": { dominant: { emoji: "🔥", word: "Fire", count: 60 }, totalRatings: 130, topPairs: [{ emoji: "🔥", word: "Fire", count: 60 }, { emoji: "🤯", word: "Wild", count: 40 }, { emoji: "👑", word: "Elite", count: 30 }] },
      "29-35": { dominant: { emoji: "🔥", word: "Lit", count: 25 }, totalRatings: 52, topPairs: [{ emoji: "🔥", word: "Lit", count: 25 }, { emoji: "💰", word: "Pricey", count: 15 }, { emoji: "👥", word: "Packed", count: 12 }] },
      "36+": { dominant: { emoji: "💀", word: "Dead", count: 12 }, totalRatings: 25, topPairs: [{ emoji: "💀", word: "Dead", count: 12 }, { emoji: "😴", word: "Slow", count: 8 }, { emoji: "💰", word: "Expensive", count: 5 }] },
    },
    divergenceScore: 0.55,
    divergenceFlagged: true,
    dominantEmoji: "🤯",
    dominantWord: "Insane",
  },
  {
    id: "loc_12",
    name: "Schwartz's Deli",
    category: "Restaurant",
    address: "3895 St Laurent Blvd",
    neighborhood: "Plateau",
    city: "Montreal",
    coordinates: { lat: 45.5165, lng: -73.5770 },
    hours: "Daily 8am-12:30am",
    description: "Legendary Montreal smoked meat",
    isUserCreated: false,
    isPending: false,
    totalRatings: 598,
    ratingsByAgeGroup: {
      "18-22": { dominant: { emoji: "🍔", word: "Bussin", count: 100 }, totalRatings: 200, topPairs: [{ emoji: "🍔", word: "Bussin", count: 100 }, { emoji: "⏱️", word: "Long wait", count: 55 }, { emoji: "🔥", word: "Fire", count: 45 }] },
      "23-28": { dominant: { emoji: "🍔", word: "Delicious", count: 80 }, totalRatings: 200, topPairs: [{ emoji: "🍔", word: "Delicious", count: 80 }, { emoji: "💵", word: "Worth it", count: 60 }, { emoji: "⏱️", word: "Forever", count: 60 }] },
      "29-35": { dominant: { emoji: "💵", word: "Worth it", count: 50 }, totalRatings: 120, topPairs: [{ emoji: "💵", word: "Worth it", count: 50 }, { emoji: "🍔", word: "Good food", count: 40 }, { emoji: "⏱️", word: "Long wait", count: 30 }] },
      "36+": { dominant: { emoji: "👑", word: "Elite", count: 35 }, totalRatings: 78, topPairs: [{ emoji: "👑", word: "Elite", count: 35 }, { emoji: "🍔", word: "Delicious", count: 25 }, { emoji: "💵", word: "Fair", count: 18 }] },
    },
    divergenceScore: 0.18,
    divergenceFlagged: false,
    dominantEmoji: "🍔",
    dominantWord: "Bussin",
  },
];
