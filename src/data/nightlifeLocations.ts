import type { Location, AgeGroupData } from "./mockData";
import { AGE_GROUPS } from "./mockData";

const defaultAgeGroupData: AgeGroupData = {
  dominant: { emoji: "🔥", word: "New", count: 0 },
  totalRatings: 0,
  topPairs: [],
};

function defaultRatingsByAgeGroup(): Record<string, AgeGroupData> {
  return Object.fromEntries(
    AGE_GROUPS.map((ag) => [ag, { ...defaultAgeGroupData }])
  );
}

function loc(
  id: string,
  name: string,
  category: "Bar" | "Club",
  city: string,
  lat: number,
  lng: number,
  neighborhood: string,
  address?: string,
  hours?: string
): Location {
  return {
    id,
    name,
    category,
    address: address ?? "",
    neighborhood,
    city,
    coordinates: { lat, lng },
    hours,
    isUserCreated: false,
    isPending: false,
    totalRatings: 0,
    ratingsByAgeGroup: defaultRatingsByAgeGroup(),
    divergenceScore: 0,
    divergenceFlagged: false,
    dominantEmoji: "🔥",
    dominantWord: "New",
  };
}

/**
 * Static nightlife locations (Bar, Club only).
 * Use Firebase only for reviews; no Firestore reads for locations.
 * Edit this file to add or remove venues.
 */
export const NIGHTLIFE_LOCATIONS: Location[] = [
  // Ottawa
  loc("bar-standard-ottawa", "The Standard", "Bar", "Ottawa", 45.4284, -75.6924, "Byward Market", "335 Elgin St"),
  loc("bar-clocktower-ottawa", "Clocktower Brew Pub", "Bar", "Ottawa", 45.4272, -75.6931, "Byward Market", "200 Elgin St"),
  loc("bar-lowertown-ottawa", "Lowertown Brewery", "Bar", "Ottawa", 45.4301, -75.6845, "Lowertown", "73 York St"),
  loc("bar-lieutenant-ottawa", "The Lieutenant's Pump", "Bar", "Ottawa", 45.4178, -75.6942, "Old Ottawa South", "361 Elgin St"),
  loc("club-sky-lounge-ottawa", "Sky Lounge", "Club", "Ottawa", 45.4289, -75.6912, "Byward Market"),
  loc("bar-brass-monkey-ottawa", "The Brass Monkey", "Bar", "Ottawa", 45.4182, -75.7021, "Westboro", "250 Greenbank Rd"),

  // Toronto
  loc("bar-republic-toronto", "Republic", "Bar", "Toronto", 43.6452, -79.3891, "Entertainment District", "480 King St W"),
  loc("bar-baro-toronto", "Baro", "Bar", "Toronto", 43.6489, -79.3932, "King West", "485 King St W"),
  loc("club-rebel-toronto", "REBEL", "Club", "Toronto", 43.6365, -79.3521, "Port Lands", "11 Polson St"),
  loc("bar-madison-avenue-toronto", "Madison Avenue Pub", "Bar", "Toronto", 43.6634, -79.4065, "Annex", "14 Madison Ave"),
  loc("bar-sweaty-betty-toronto", "Sweaty Betty's", "Bar", "Toronto", 43.6512, -79.3989, "Queen West"),

  // Montreal
  loc("bar-saint-sulpice-montreal", "Café Saint-Sulpice", "Bar", "Montreal", 45.5041, -73.5692, "Plateau", "1680 Saint-Denis"),
  loc("club-sterco-montreal", "Stereo", "Club", "Montreal", 45.5142, -73.5651, "Quartier Latin", "858 Saint-Catherine E"),
  loc("bar-théâtre-montreal", "Le Théâtre Sainte-Catherine", "Bar", "Montreal", 45.5102, -73.5621, "Quartier Latin"),
  loc("club-soubois-montreal", "Soubois", "Club", "Montreal", 45.5165, -73.5732, "Plateau", "1433 Saint-Denis"),

  // Guelph
  loc("bar-slye-fox-guelph", "Slye Fox", "Bar", "Guelph", 43.5452, -80.2489, "Downtown", "18 Wyndham St S"),
  loc("bar-frank-n-steins-guelph", "Frank n Steins", "Bar", "Guelph", 43.5448, -80.2491, "Downtown", "72 Wyndham St N"),
];
