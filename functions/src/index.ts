import * as admin from "firebase-admin";
import { onDocumentWritten } from "firebase-functions/v2/firestore";
import type { Rating } from "./aggregate";
import { computeRecentTrendsLast7d, extractScores } from "./aggregate";

admin.initializeApp();

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
const AGE_GROUPS = ["18-22", "23-28", "29-35", "36+"] as const;
const GENDERS = ["Male", "Female"] as const;

/**
 * Incremental aggregation: instead of reading ALL ratings (N reads),
 * we compute the delta from the event's before/after data and update
 * running totals stored on the location doc (1 read + 1 write).
 *
 * Falls back to full recomputation for recent trends (still needs 7-day window).
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

    const beforeData = event.data?.before?.data() as Rating | undefined;
    const afterData = event.data?.after?.data() as Rating | undefined;

    // Determine if this is a create, update, or delete
    const isCreate = !beforeData && !!afterData;
    const isUpdate = !!beforeData && !!afterData;
    const isDelete = !!beforeData && !afterData;

    try {
      // Read current location doc (1 read instead of N)
      const locationSnap = await locationRef.get();
      const locationData = locationSnap.data() || {};

      // Get or initialize running counts
      const emojiCounts: Record<string, number> = locationData._emojiCounts || {};
      const wordCounts: Record<string, string> = locationData._wordForEmoji || {};
      let totalRatings: number = locationData.totalRatings || 0;
      let checkinCount: number = locationData.checkinCount || 0;
      const ageGroupScoreSums: Record<string, number> = locationData._ageGroupScoreSums || {};
      const ageGroupScoreCounts: Record<string, number> = locationData._ageGroupScoreCounts || {};
      const genderScoreSums: Record<string, number> = locationData._genderScoreSums || {};
      const genderScoreCounts: Record<string, number> = locationData._genderScoreCounts || {};
      const ageGroupEmojiCounts: Record<string, Record<string, number>> = locationData._ageGroupEmojiCounts || {};
      const genderEmojiCounts: Record<string, Record<string, number>> = locationData._genderEmojiCounts || {};
      let totalScoreSum: number = locationData._totalScoreSum || 0;
      let totalScoreCount: number = locationData._totalScoreCount || 0;

      // Helper: apply a rating's scores to running counts (add or subtract)
      function applyRating(rating: Rating, sign: 1 | -1) {
        const isReviewed = rating.phase === "reviewed" || rating.pairs || rating.score != null;
        const isCheckin = rating.phase === "checkin" && !isReviewed;

        if (isCheckin) {
          checkinCount += sign;
        }

        if (isReviewed) {
          totalRatings += sign;
          const scores = extractScores(rating);
          if (scores.length > 0) {
            const avg = scores.reduce((s, e) => s + e.score, 0) / scores.length;
            totalScoreSum += avg * sign;
            totalScoreCount += sign;

            for (const { emoji, word, score } of scores) {
              emojiCounts[emoji] = (emojiCounts[emoji] || 0) + sign;
              if (sign > 0) wordCounts[emoji] = word;
              if (emojiCounts[emoji] <= 0) delete emojiCounts[emoji];

              // Per age group
              const ag = rating.ageGroup;
              if (ag) {
                ageGroupScoreSums[ag] = (ageGroupScoreSums[ag] || 0) + score * sign;
                ageGroupScoreCounts[ag] = (ageGroupScoreCounts[ag] || 0) + sign;
                if (!ageGroupEmojiCounts[ag]) ageGroupEmojiCounts[ag] = {};
                ageGroupEmojiCounts[ag][emoji] = (ageGroupEmojiCounts[ag][emoji] || 0) + sign;
                if (ageGroupEmojiCounts[ag][emoji] <= 0) delete ageGroupEmojiCounts[ag][emoji];
              }

              // Per gender
              const g = rating.gender;
              if (g) {
                genderScoreSums[g] = (genderScoreSums[g] || 0) + score * sign;
                genderScoreCounts[g] = (genderScoreCounts[g] || 0) + sign;
                if (!genderEmojiCounts[g]) genderEmojiCounts[g] = {};
                genderEmojiCounts[g][emoji] = (genderEmojiCounts[g][emoji] || 0) + sign;
                if (genderEmojiCounts[g][emoji] <= 0) delete genderEmojiCounts[g][emoji];
              }
            }
          }
        }
      }

      // Subtract old data, add new data
      if (isDelete || isUpdate) applyRating(beforeData!, -1);
      if (isCreate || isUpdate) applyRating(afterData!, 1);

      // Compute derived fields from running counts
      const dominantEmoji = Object.entries(emojiCounts)
        .sort((a, b) => b[1] - a[1])[0]?.[0] || "🔥";
      const dominantWord = wordCounts[dominantEmoji] || "New";
      const averageScore = totalScoreCount > 0
        ? Math.round((totalScoreSum / totalScoreCount) * 100) / 100
        : 0;

      // Compute per-group data
      function computeGroupData(groupEmojiCounts: Record<string, number>, groupWordCounts: Record<string, string>) {
        const sorted = Object.entries(groupEmojiCounts).sort((a, b) => b[1] - a[1]);
        const topPairs = sorted.slice(0, 10).map(([emoji, count]) => ({
          emoji,
          word: groupWordCounts[emoji] || "",
          count,
        }));
        const total = sorted.reduce((s, [, c]) => s + c, 0);
        return {
          totalRatings: total,
          dominant: topPairs[0] || { emoji: "🔥", word: "New", count: 0 },
          topPairs,
        };
      }

      const ratingsByAgeGroup: Record<string, any> = {};
      for (const ag of AGE_GROUPS) {
        ratingsByAgeGroup[ag] = computeGroupData(ageGroupEmojiCounts[ag] || {}, wordCounts);
      }
      const ratingsByGender: Record<string, any> = {};
      for (const g of GENDERS) {
        ratingsByGender[g] = computeGroupData(genderEmojiCounts[g] || {}, wordCounts);
      }

      // Divergence score
      const activeGroups = AGE_GROUPS.filter(
        (ag) => (ageGroupScoreCounts[ag] || 0) >= 5
      );
      let divergenceScore = 0;
      if (activeGroups.length >= 2) {
        const avgScores = activeGroups.map(
          (ag) => (ageGroupScoreSums[ag] || 0) / (ageGroupScoreCounts[ag] || 1)
        );
        let maxDiff = 0;
        for (let i = 0; i < avgScores.length; i++) {
          for (let j = i + 1; j < avgScores.length; j++) {
            maxDiff = Math.max(maxDiff, Math.abs(avgScores[i] - avgScores[j]));
          }
        }
        divergenceScore = maxDiff / 3;
      }
      const divergenceFlagged = divergenceScore >= 0.5 && activeGroups.length >= 2;

      // Recent trends still needs 7-day window — read ratings only for this
      // But we can skip if the rating is older than 7 days
      const ratingsRef = db.collection("locations").doc(locationId).collection("ratings");
      const sevenDaysAgo = new Date(Date.now() - SEVEN_DAYS_MS);
      const recentSnap = await ratingsRef
        .where("timestamp", ">=", sevenDaysAgo)
        .get();
      const recentRatings: Rating[] = recentSnap.docs.map((d) => d.data() as Rating);
      const recentTrends = computeRecentTrendsLast7d(recentRatings, Date.now() - SEVEN_DAYS_MS);

      await locationRef.update({
        totalRatings: Math.max(0, totalRatings),
        dominantEmoji,
        dominantWord,
        averageScore,
        divergenceScore,
        divergenceFlagged,
        ratingsByAgeGroup,
        ratingsByGender,
        checkinCount: Math.max(0, checkinCount),
        // Running count internals (prefixed with _ to indicate internal use)
        _emojiCounts: emojiCounts,
        _wordForEmoji: wordCounts,
        _ageGroupScoreSums: ageGroupScoreSums,
        _ageGroupScoreCounts: ageGroupScoreCounts,
        _genderScoreSums: genderScoreSums,
        _genderScoreCounts: genderScoreCounts,
        _ageGroupEmojiCounts: ageGroupEmojiCounts,
        _genderEmojiCounts: genderEmojiCounts,
        _totalScoreSum: totalScoreSum,
        _totalScoreCount: totalScoreCount,
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
