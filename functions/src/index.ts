import * as admin from "firebase-admin";
import { onDocumentWritten } from "firebase-functions/v2/firestore";
import type { Rating } from "./aggregate";
import { computeAggregates, getTonightStartUtcMs } from "./aggregate";

admin.initializeApp();

/**
 * On every rating write: re-query all ratings for this location,
 * recompute aggregates (all-time + tonight), write back to the location doc,
 * and update the city leaderboard with the current tonight leader.
 */
export const onRatingWritten = onDocumentWritten(
  "locations/{locationId}/ratings/{ratingId}",
  async (event) => {
    const locationId = event.params.locationId;
    if (!locationId) {
      console.warn("onRatingWritten: missing locationId");
      return;
    }

    const db = admin.firestore();
    const locationRef = db.collection("locations").doc(locationId);
    const ratingsRef = locationRef.collection("ratings");

    try {
      const snap = await ratingsRef.get();
      const ratings: Rating[] = snap.docs.map((d) => d.data() as Rating);

      const tonightStartMs = getTonightStartUtcMs();
      const aggregates = computeAggregates(ratings, tonightStartMs);

      await locationRef.set(
        {
          checkinCount: aggregates.checkinCount,
          maleCount: aggregates.maleCount,
          femaleCount: aggregates.femaleCount,
          dominantVibe: aggregates.dominantVibe,
          ratingsByAgeGroup: aggregates.ratingsByAgeGroup,
          checkinCountTonight: aggregates.checkinCountTonight,
          maleCountTonight: aggregates.maleCountTonight,
          femaleCountTonight: aggregates.femaleCountTonight,
          dominantVibeTonight: aggregates.dominantVibeTonight,
          lastAggregated: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
      );

      // Update city leaderboard — single doc at meta/leaderboard
      const leaderRef = db.doc("meta/leaderboard");
      const leaderSnap = await leaderRef.get();
      const currentLeader = leaderSnap.data();
      const thisCount = aggregates.checkinCountTonight;

      if (
        !currentLeader ||
        thisCount >= (currentLeader.checkinCountTonight ?? 0) ||
        currentLeader.topLocationId === locationId
      ) {
        await leaderRef.set(
          {
            topLocationId: locationId,
            checkinCountTonight: thisCount,
            dominantVibeTonight: aggregates.dominantVibeTonight,
            lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
          },
          { merge: true }
        );
      }
    } catch (error) {
      console.error("onRatingWritten: aggregation failed for location", locationId, error);
      throw error;
    }
  }
);
