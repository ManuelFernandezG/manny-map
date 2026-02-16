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
  loc("bar-heart-and-crown-ottawa", "Heart and Crown", "Bar", "Ottawa", 45.42905698437102, -75.69347330133594, "Byward Market"),
  loc("club-sky-lounge-ottawa", "Sky Lounge", "Club", "Ottawa", 45.42886177063804, -75.69211898722112, "Byward Market"),
  loc("club-room-104-ottawa", "Room 104", "Club", "Ottawa", 45.42923836274172, -75.69216773028384, "Byward Market"),
  loc("club-the-show-ottawa", "The Show", "Club", "Ottawa", 45.42943072720328, -75.69174794568526, "Byward Market"),
  loc("bar-lieutenant-pump-ottawa", "Lieutenant's Pump", "Bar", "Ottawa", 45.41569800665839, -75.6878550522195, "Old Ottawa South"),
  loc("bar-happy-fish-elgin-ottawa", "Happy Fish Elgin", "Bar", "Ottawa", 45.41606104115144, -75.6886655515753, "Centretown"),
  loc("club-city-at-night-ottawa", "City at Night", "Club", "Ottawa", 45.41952179545020, -75.69895259768343, "Hintonburg"),
  loc("bar-tomo-restaurant-ottawa", "TOMO Restaurant", "Bar", "Ottawa", 45.42966385785467, -75.69190617893187, "Byward Market"),
  loc("club-berlin-nightclub-ottawa", "Berlin Nightclub", "Club", "Ottawa", 45.42735618172649, -75.69226253985549, "Byward Market"),
  loc("bar-back-to-brooklyn-ottawa", "Back to Brooklyn Restaurant", "Bar", "Ottawa", 45.42943265231875, -75.69278478447669, "Byward Market"),
  loc("bar-el-furniture-warehouse-ottawa", "El Furniture Warehouse Ottawa", "Bar", "Ottawa", 45.42919132095766, -75.69299354603339, "Byward Market"),
  loc("bar-la-ptite-grenouille-ottawa", "La P'tite Grenouille Gatineau", "Bar", "Ottawa", 45.427072832058364, -75.7153850942739, "Gatineau"),
];
