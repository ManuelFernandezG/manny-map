import type { Location } from "./mockData";

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
  };
}

/**
 * Static nightlife locations (Bar, Club only).
 * Use Firebase only for reviews; no Firestore reads for locations.
 * Edit this file to add or remove venues.
 */
export const NIGHTLIFE_LOCATIONS: Location[] = [
  // Ottawa
  loc("bar-heart-and-crown-ottawa", "Heart and Crown", "Bar", "Ottawa", 45.4291035420482, -75.69345368407755, "Byward Market"),
  loc("club-sky-lounge-ottawa", "Sky Lounge", "Club", "Ottawa", 45.42876073695236, -75.69210954507004, "Byward Market"),
  loc("club-room-104-ottawa", "Room 104", "Club", "Ottawa", 45.429222334303475, -75.6923900883509, "Byward Market"),
  loc("club-the-show-ottawa", "The Show", "Club", "Ottawa", 45.42928303996109, -75.6922760944692, "Byward Market"),
  loc("bar-lieutenant-pump-ottawa", "Lieutenant's Pump", "Bar", "Ottawa", 45.41553157926998, -75.68810676680073, "Old Ottawa South"),
  loc("bar-happy-fish-elgin-ottawa", "Happy Fish Elgin", "Bar", "Ottawa", 45.41602029665137, -75.688957888434, "Centretown"),
  loc("club-city-at-night-ottawa", "City at Night", "Club", "Ottawa", 45.41937851080014, -75.6994562583093, "Hintonburg"),
  loc("bar-tomo-restaurant-ottawa", "TOMO Restaurant", "Bar", "Ottawa", 45.4295289779174, -75.69230626521792, "Byward Market"),
  loc("club-berlin-nightclub-ottawa", "Berlin Nightclub", "Club", "Ottawa", 45.42726589859753, -75.69259240635273, "Byward Market"),
  loc("bar-back-to-brooklyn-ottawa", "Back to Brooklyn Restaurant", "Bar", "Ottawa", 45.429227582395534, -75.69299447119337, "Byward Market"),
  loc("bar-el-furniture-warehouse-ottawa", "El Furniture Warehouse Ottawa", "Bar", "Ottawa", 45.42914658460657, -75.69321705199387, "Byward Market"),
  loc("bar-la-ptite-grenouille-ottawa", "La P'tite Grenouille Gatineau", "Bar", "Ottawa", 45.426885375655445, -75.71568610926099, "Gatineau"),
];
