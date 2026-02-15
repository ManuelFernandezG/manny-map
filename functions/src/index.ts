import * as admin from "firebase-admin";
import { onDocumentWritten } from "firebase-functions/v2/firestore";
import type { Rating } from "./aggregate";
import { computeAggregates, computeRecentTrendsLast7d } from "./aggregate";

admin.initializeApp();

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * When a rating doc is created or updated under locations/{locationId}/ratings/{ratingId},
 * re-run aggregation and recent-trends and update the location document.
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
    const ratingsRef = db.collection("locations").doc(locationId).collection("ratings");
    const locationRef = db.collection("locations").doc(locationId);

    try {
      const ratingsSnap = await ratingsRef.get();
      const ratings: Rating[] = ratingsSnap.docs.map((d) => d.data() as Rating);

      const aggregates = computeAggregates(ratings);
      const sevenDaysAgo = Date.now() - SEVEN_DAYS_MS;
      const recentTrends = computeRecentTrendsLast7d(ratings, sevenDaysAgo);

      await locationRef.update({
        ...aggregates,
        recentTrendsLast7d: {
          ...recentTrends,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        lastAggregated: admin.firestore.FieldValue.serverTimestamp(),
      });
    } catch (error) {
      console.error("onRatingWritten: aggregation failed for location", locationId, error);
      throw error;
    }
  }
);
