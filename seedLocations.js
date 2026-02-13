import dotenv from 'dotenv';
dotenv.config();
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc } from "firebase/firestore";

// Your Firebase config
const firebaseConfig = {
apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Ottawa city center: 45.4215, -75.6972

function generateOttawaLocations() {
  const ottawaCenterLat = 45.4215;
  const ottawaCenterLng = -75.6972;
  
  const restaurants = [
    "Elgin Street Diner", "Manx Pub", "The Rec Room", "Zest Kitchen", "Shinto Ramen",
    "Bison Restaurant", "Atelier", "Navarre", "Beckta Dining & Wine", "Play Food & Wine",
    "Art Is In Bakery", "Copper Brandy Bar", "The Waiting Room", "Piri Piri Grillhouse",
    "Paramount Fine Foods", "Naam Vietnamese", "Pressed Cafe", "Black Squirrel Books Cafe",
  ];

  const bars = [
    "Bellwoods Brewery", "Play Lounge", "The Byward", "Sneaky Dee's", "Maverick's",
    "The Lakeview", "Clocktower Brew Pub", "Alchemy Bar", "The Fox and Fiddle", "D'Arcy Mcgees",
    "Taps On Tap", "Whisper Restaurant & Lounge", "Copper Brandy", "The Churchill", "Bar Robo",
  ];

  const parks = [
    "Lansdowne Park", "Confederation Park", "Budd Park", "Green Island Park", "Lake Leamy Park",
    "Brittania Park", "Shirley Bay Park", "Major's Hill Park", "Parliament Hill", "Dow's Lake",
  ];

  const gyms = [
    "Goodlife Fitness Downtown", "Goodlife Fitness Byward", "Goodlife Fitness Kanata",
    "Club Fit", "Movati Athletic", "CrossFit 613",
    "Barry's Bootcamp", "F45 Training", "Yoga Hot Flow", "Pure Yoga",
  ];

  const cafes = [
    "Second Cup Downtown", "Second Cup Byward", "Bridgehead Coffee", "Happy Goat Coffee",
    "Cafe Koi", "Pressed Cafe", "Black Squirrel Books Cafe", "Art Is In Bakery",
    "Supply and Demand", "Thimble Theatre",
  ];

  const nightclubs = [
    "Play Lounge", "Sneaky Dee's", "The Byward", "Zaphods Diner", "The Tube",
    "Marquee Club", "The House of Commons", "The Jungle Bar", "Stoney Monday's",
    "Mercury Lounge",
  ];

  const runRoutes = [
    "Rideau Canal Path", "Ottawa River Path", "Rideau Valley Trail", "Greenbelt Trail",
    "Britannia Park Trail", "Kars Park Loop", "Gatineau Park Trails", "Petrie Island Loop",
  ];

  // Combine all categories
  const allLocations = [
    ...restaurants.map((name) => ({
      name,
      category: "Restaurant",
      lat: ottawaCenterLat + (Math.random() - 0.5) * 0.15,
      lng: ottawaCenterLng + (Math.random() - 0.5) * 0.15,
    })),
    ...bars.map((name) => ({
      name,
      category: "Bar",
      lat: ottawaCenterLat + (Math.random() - 0.5) * 0.15,
      lng: ottawaCenterLng + (Math.random() - 0.5) * 0.15,
    })),
    ...parks.map((name) => ({
      name,
      category: "Park",
      lat: ottawaCenterLat + (Math.random() - 0.5) * 0.15,
      lng: ottawaCenterLng + (Math.random() - 0.5) * 0.15,
    })),
    ...gyms.map((name) => ({
      name,
      category: "Gym",
      lat: ottawaCenterLat + (Math.random() - 0.5) * 0.15,
      lng: ottawaCenterLng + (Math.random() - 0.5) * 0.15,
    })),
    ...cafes.map((name) => ({
      name,
      category: "Cafe",
      lat: ottawaCenterLat + (Math.random() - 0.5) * 0.15,
      lng: ottawaCenterLng + (Math.random() - 0.5) * 0.15,
    })),
    ...nightclubs.map((name) => ({
      name,
      category: "Nightclub",
      lat: ottawaCenterLat + (Math.random() - 0.5) * 0.15,
      lng: ottawaCenterLng + (Math.random() - 0.5) * 0.15,
    })),
    ...runRoutes.map((name) => ({
      name,
      category: "Running Route",
      lat: ottawaCenterLat + (Math.random() - 0.5) * 0.15,
      lng: ottawaCenterLng + (Math.random() - 0.5) * 0.15,
    })),
  ];

  return allLocations;
}

async function seedLocations() {
  const locations = generateOttawaLocations();
  console.log(`Starting to seed ${locations.length} Ottawa locations...`);
  
  let added = 0;
  let failed = 0;

  try {
    for (const loc of locations) {
      try {
        await addDoc(collection(db, "locations"), {
          name: loc.name,
          category: loc.category,
          city: "Ottawa",
          address: `${loc.name}, Ottawa, ON`,
          neighborhood: "Ottawa",
          lat: loc.lat,
          lng: loc.lng,
          googlePlaceId: null,
          googleRating: 0,
          googlePhotoUrl: null,
          isUserCreated: false,
          isPending: false,
          totalRatings: 0,
          ratingsByAgeGroup: {
            "18-22": 0,
            "23-28": 0,
            "29-35": 0,
            "36+": 0,
          },
          dominantRatingByAgeGroup: {
            "18-22": null,
            "23-28": null,
            "29-35": null,
            "36+": null,
          },
          ageGroupDivergence: {
            score: 0,
            flagged: false,
            groups: [],
          },
          flaggedForReview: false,
          flagReason: null,
          createdAt: new Date(),
          lastUpdated: new Date(),
        });

        added++;
        if (added % 10 === 0) {
          console.log(`✅ Added ${added} locations...`);
        }
      } catch (error) {
        console.error(`❌ Error adding ${loc.name}:`, error.message);
        failed++;
      }
    }

    console.log(`\n🎉 Seeding complete!`);
    console.log(`✅ Successfully added: ${added} locations`);
    console.log(`❌ Failed: ${failed} locations`);
    console.log(`📍 Total: ${added + failed} locations`);
  } catch (error) {
    console.error("❌ Fatal error:", error);
  }

  process.exit(0);
}

seedLocations();
