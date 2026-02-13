# Rating Algorithm Review

## ✅ What's Working (UI/Display Layer)

### 1. **Rating Collection** ([EmojiRatingModal.tsx](src/components/EmojiRatingModal.tsx))
- ✅ Users select 1-3 emoji-word pairs
- ✅ Categories organized logically (Energy, Price, Crowd, Food, Service, Location)
- ✅ Age group collection with localStorage persistence
- ✅ Clean UX with word suggestions per emoji

### 2. **Rating Display** ([LocationCard.tsx](src/components/LocationCard.tsx))
- ✅ Shows dominant emoji/word for user's age group
- ✅ Compares with other age groups (if 20+ ratings)
- ✅ Displays divergence warning when age groups disagree
- ✅ Safe null-checking after fixes

### 3. **Detailed View** ([LocationDetailModal.tsx](src/components/LocationDetailModal.tsx))
- ✅ Aggregates emoji counts across all age groups
- ✅ Shows top 6 overall emojis with bar charts
- ✅ Breaks down ratings by age group
- ✅ Highlights user's age group

## ❌ Critical Issues

### **1. RATINGS ARE NOT BEING SAVED!** 🚨

Current implementation ([Index.tsx:69-86](src/pages/Index.tsx#L69-L86)):
```typescript
const handleRatingSubmit = (
  emojiWords: { emoji: string; word: string }[],
  ageGroup: string
) => {
  setUserAgeGroup(ageGroup);
  localStorage.setItem("poppin_age_group", ageGroup);

  toast.success("Rating saved! Swipe to continue.");

  setTimeout(() => {
    setRatingLocation(null);
  }, 1500);
};
```

**Problem:** No Firebase write operation! Users think they're rating locations, but nothing is persisted.

### **2. No Aggregation Algorithm**

The app expects pre-calculated fields in Firebase:
- `dominantEmoji` / `dominantWord`
- `divergenceScore` / `divergenceFlagged`
- `ratingsByAgeGroup.{ageGroup}.dominant`
- `ratingsByAgeGroup.{ageGroup}.topPairs`

But there's **no code** to calculate these when new ratings arrive.

### **3. No Rating Data Model**

Missing:
- Individual rating documents
- Rating timestamp
- User identification (anonymous IDs)
- Abuse prevention

## 📐 Recommended Algorithm

### **Data Structure**

```typescript
// Firestore Collections

// 1. Individual Ratings (subcollection)
locations/{locationId}/ratings/{ratingId}
{
  userId: string,           // Anonymous ID from localStorage
  ageGroup: string,         // "18-22", "23-28", etc.
  pairs: [
    { emoji: "🔥", word: "Lit" },
    { emoji: "💰", word: "Expensive" },
    { emoji: "👥", word: "Crowded" }
  ],
  timestamp: serverTimestamp()
}

// 2. Aggregated Data (on location doc)
locations/{locationId}
{
  name: string,
  category: string,
  // ... other fields

  // Aggregated ratings (updated via Cloud Function)
  totalRatings: number,
  dominantEmoji: string,
  dominantWord: string,
  divergenceScore: number,
  divergenceFlagged: boolean,
  ratingsByAgeGroup: {
    "18-22": {
      totalRatings: number,
      dominant: { emoji: "🔥", word: "Lit", count: 12 },
      topPairs: [
        { emoji: "🔥", word: "Lit", count: 12 },
        { emoji: "💰", word: "Expensive", count: 8 },
        // ...
      ]
    },
    // ...
  },
  lastAggregated: timestamp
}
```

### **Rating Submission Flow**

```typescript
// When user submits rating
async function submitRating(
  locationId: string,
  emojiWords: { emoji: string; word: string }[],
  ageGroup: string
) {
  // 1. Get or create anonymous user ID
  let userId = localStorage.getItem('poppin_user_id');
  if (!userId) {
    userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('poppin_user_id', userId);
  }

  // 2. Check if user already rated this location (prevent spam)
  const existingRating = await getDocs(
    query(
      collection(db, `locations/${locationId}/ratings`),
      where('userId', '==', userId)
    )
  );

  if (!existingRating.empty) {
    // Update existing rating
    await updateDoc(existingRating.docs[0].ref, {
      pairs: emojiWords,
      ageGroup,
      timestamp: serverTimestamp()
    });
  } else {
    // Create new rating
    await addDoc(collection(db, `locations/${locationId}/ratings`), {
      userId,
      ageGroup,
      pairs: emojiWords,
      timestamp: serverTimestamp()
    });
  }

  // 3. Trigger aggregation (option A: client-side, option B: Cloud Function)
  await aggregateRatings(locationId);
}
```

### **Aggregation Algorithm**

```typescript
async function aggregateRatings(locationId: string) {
  // 1. Fetch all ratings for this location
  const ratingsSnap = await getDocs(
    collection(db, `locations/${locationId}/ratings`)
  );

  const ratings = ratingsSnap.docs.map(doc => doc.data());

  // 2. Group by age group
  const byAgeGroup: Record<string, any[]> = {
    "18-22": [],
    "23-28": [],
    "29-35": [],
    "36+": []
  };

  ratings.forEach(rating => {
    if (byAgeGroup[rating.ageGroup]) {
      byAgeGroup[rating.ageGroup].push(...rating.pairs);
    }
  });

  // 3. Calculate top pairs for each age group
  const ratingsByAgeGroup: Record<string, any> = {};
  const allPairs: { emoji: string; word: string }[] = [];

  Object.entries(byAgeGroup).forEach(([ageGroup, pairs]) => {
    const counts: Record<string, { emoji: string; word: string; count: number }> = {};

    pairs.forEach(pair => {
      const key = `${pair.emoji}${pair.word}`;
      if (!counts[key]) {
        counts[key] = { emoji: pair.emoji, word: pair.word, count: 0 };
      }
      counts[key].count++;
    });

    const topPairs = Object.values(counts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    ratingsByAgeGroup[ageGroup] = {
      totalRatings: pairs.length,
      dominant: topPairs[0] || { emoji: "🔥", word: "New", count: 0 },
      topPairs
    };

    allPairs.push(...pairs);
  });

  // 4. Calculate overall dominant
  const allCounts: Record<string, { emoji: string; word: string; count: number }> = {};
  allPairs.forEach(pair => {
    const key = `${pair.emoji}${pair.word}`;
    if (!allCounts[key]) {
      allCounts[key] = { emoji: pair.emoji, word: pair.word, count: 0 };
    }
    allCounts[key].count++;
  });

  const overall = Object.values(allCounts)
    .sort((a, b) => b.count - a.count)[0] || { emoji: "🔥", word: "New" };

  // 5. Calculate divergence
  const ageGroups = Object.keys(ratingsByAgeGroup);
  let divergenceScore = 0;

  if (ageGroups.length >= 2) {
    // Compare dominant emoji/word between age groups
    const dominants = ageGroups.map(ag =>
      `${ratingsByAgeGroup[ag].dominant.emoji}${ratingsByAgeGroup[ag].dominant.word}`
    );

    const uniqueDominants = new Set(dominants);
    divergenceScore = uniqueDominants.size / ageGroups.length;
  }

  const divergenceFlagged = divergenceScore > 0.5; // Flag if >50% different

  // 6. Update location document
  await updateDoc(doc(db, 'locations', locationId), {
    totalRatings: ratings.length,
    dominantEmoji: overall.emoji,
    dominantWord: overall.word,
    divergenceScore,
    divergenceFlagged,
    ratingsByAgeGroup,
    lastAggregated: serverTimestamp()
  });
}
```

## 💡 Better Approach: Firebase Cloud Functions

Instead of client-side aggregation, use Cloud Functions:

```typescript
// functions/src/index.ts
export const onRatingCreated = functions.firestore
  .document('locations/{locationId}/ratings/{ratingId}')
  .onCreate(async (snap, context) => {
    const locationId = context.params.locationId;
    await aggregateRatings(locationId);
  });

export const onRatingUpdated = functions.firestore
  .document('locations/{locationId}/ratings/{ratingId}')
  .onUpdate(async (change, context) => {
    const locationId = context.params.locationId;
    await aggregateRatings(locationId);
  });
```

**Benefits:**
- ✅ Real-time updates
- ✅ No client-side computation cost
- ✅ Consistent aggregation
- ✅ Can't be tampered with

## 🎯 Implementation Priority

1. **Immediate:** Add Firebase write operation to `handleRatingSubmit`
2. **High:** Implement client-side aggregation (for now)
3. **Medium:** Add user ID tracking and duplicate prevention
4. **Long-term:** Migrate to Cloud Functions for aggregation

## ⚠️ Current State Summary

**Rating UI:** ✅ Excellent
**Rating Persistence:** ❌ Not implemented
**Aggregation Logic:** ❌ Missing
**Divergence Detection:** ⚠️ Data exists but no calculation
**Scalability:** ❌ Won't work with real users

**Verdict:** The UI/UX for ratings is solid, but there's **no backend logic**.
Users can submit ratings, but they disappear into the void.
