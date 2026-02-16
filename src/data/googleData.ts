/**
 * Google Maps scraped data for all 12 nightlife locations.
 * Scraped: Feb 15, 2026.
 */

export interface HourData {
  hour: number;
  percentage: number;
  title: string;
  time: string;
}

export interface DayPopularTimes {
  day: number | "live";
  day_text?: string;
  popular_times?: HourData[];
  percentage?: number;
  title?: string;
  time?: number;
}

export interface GoogleLocationData {
  googleRating: number;
  googleReviewCount: number;
  reviewsPerScore: Record<number, number>;
  popularTimes: DayPopularTimes[] | null;
  typicalTimeSpent: string | null;
}

export const GOOGLE_DATA: Record<string, GoogleLocationData> = {
  "club-sky-lounge-ottawa": {
    googleRating: 3.1,
    googleReviewCount: 171,
    reviewsPerScore: { 1: 68, 2: 8, 3: 7, 4: 14, 5: 74 },
    popularTimes: null,
    typicalTimeSpent: null,
  },
  "club-the-show-ottawa": {
    googleRating: 2.9,
    googleReviewCount: 251,
    reviewsPerScore: { 1: 112, 2: 16, 3: 12, 4: 16, 5: 95 },
    popularTimes: null,
    typicalTimeSpent: null,
  },
  "club-room-104-ottawa": {
    googleRating: 4.2,
    googleReviewCount: 223,
    reviewsPerScore: { 1: 25, 2: 9, 3: 12, 4: 36, 5: 141 },
    popularTimes: [
      { day: 7, day_text: "Sunday", popular_times: [{ hour: 6, percentage: 0, title: "", time: "6am" }, { hour: 7, percentage: 0, title: "", time: "6am" }, { hour: 8, percentage: 0, title: "", time: "6am" }, { hour: 9, percentage: 0, title: "", time: "9am" }, { hour: 10, percentage: 0, title: "", time: "9am" }, { hour: 11, percentage: 0, title: "", time: "9am" }, { hour: 12, percentage: 0, title: "", time: "12pm" }, { hour: 13, percentage: 0, title: "", time: "12pm" }, { hour: 14, percentage: 0, title: "", time: "12pm" }, { hour: 15, percentage: 0, title: "", time: "3pm" }, { hour: 16, percentage: 0, title: "", time: "3pm" }, { hour: 17, percentage: 0, title: "", time: "3pm" }, { hour: 18, percentage: 0, title: "", time: "6pm" }, { hour: 19, percentage: 0, title: "", time: "6pm" }, { hour: 20, percentage: 0, title: "", time: "6pm" }, { hour: 21, percentage: 8, title: "Usually not busy", time: "9pm" }, { hour: 22, percentage: 14, title: "Usually not busy", time: "9pm" }, { hour: 23, percentage: 20, title: "Usually not too busy", time: "9pm" }, { hour: 0, percentage: 17, title: "Usually not busy", time: "12am" }, { hour: 1, percentage: 18, title: "Usually not busy", time: "12am" }] },
      { day: 1, day_text: "Monday", popular_times: [] },
      { day: 2, day_text: "Tuesday", popular_times: [] },
      { day: 3, day_text: "Wednesday", popular_times: [{ hour: 6, percentage: 0, title: "", time: "6am" }, { hour: 7, percentage: 0, title: "", time: "6am" }, { hour: 8, percentage: 0, title: "", time: "6am" }, { hour: 9, percentage: 0, title: "", time: "9am" }, { hour: 10, percentage: 0, title: "", time: "9am" }, { hour: 11, percentage: 0, title: "", time: "9am" }, { hour: 12, percentage: 0, title: "", time: "12pm" }, { hour: 13, percentage: 0, title: "", time: "12pm" }, { hour: 14, percentage: 0, title: "", time: "12pm" }, { hour: 15, percentage: 0, title: "", time: "3pm" }, { hour: 16, percentage: 0, title: "", time: "3pm" }, { hour: 17, percentage: 0, title: "", time: "3pm" }, { hour: 18, percentage: 0, title: "", time: "6pm" }, { hour: 19, percentage: 0, title: "", time: "6pm" }, { hour: 20, percentage: 0, title: "", time: "6pm" }, { hour: 21, percentage: 27, title: "Usually not too busy", time: "9pm" }, { hour: 22, percentage: 40, title: "Usually not too busy", time: "9pm" }, { hour: 23, percentage: 43, title: "Usually not too busy", time: "9pm" }, { hour: 0, percentage: 36, title: "Usually not too busy", time: "12am" }, { hour: 1, percentage: 24, title: "Usually not too busy", time: "12am" }] },
      { day: 4, day_text: "Thursday", popular_times: [{ hour: 6, percentage: 0, title: "", time: "6am" }, { hour: 7, percentage: 0, title: "", time: "6am" }, { hour: 8, percentage: 0, title: "", time: "6am" }, { hour: 9, percentage: 0, title: "", time: "9am" }, { hour: 10, percentage: 0, title: "", time: "9am" }, { hour: 11, percentage: 0, title: "", time: "9am" }, { hour: 12, percentage: 0, title: "", time: "12pm" }, { hour: 13, percentage: 0, title: "", time: "12pm" }, { hour: 14, percentage: 0, title: "", time: "12pm" }, { hour: 15, percentage: 0, title: "", time: "3pm" }, { hour: 16, percentage: 0, title: "", time: "3pm" }, { hour: 17, percentage: 0, title: "", time: "3pm" }, { hour: 18, percentage: 0, title: "", time: "6pm" }, { hour: 19, percentage: 0, title: "", time: "6pm" }, { hour: 20, percentage: 0, title: "", time: "6pm" }, { hour: 21, percentage: 13, title: "Usually not busy", time: "9pm" }, { hour: 22, percentage: 18, title: "Usually not busy", time: "9pm" }, { hour: 23, percentage: 22, title: "Usually not too busy", time: "9pm" }, { hour: 0, percentage: 19, title: "Usually not busy", time: "12am" }, { hour: 1, percentage: 12, title: "Usually not busy", time: "12am" }] },
      { day: 5, day_text: "Friday", popular_times: [{ hour: 6, percentage: 0, title: "", time: "6am" }, { hour: 7, percentage: 0, title: "", time: "6am" }, { hour: 8, percentage: 0, title: "", time: "6am" }, { hour: 9, percentage: 0, title: "", time: "9am" }, { hour: 10, percentage: 0, title: "", time: "9am" }, { hour: 11, percentage: 0, title: "", time: "9am" }, { hour: 12, percentage: 0, title: "", time: "12pm" }, { hour: 13, percentage: 0, title: "", time: "12pm" }, { hour: 14, percentage: 0, title: "", time: "12pm" }, { hour: 15, percentage: 0, title: "", time: "3pm" }, { hour: 16, percentage: 0, title: "", time: "3pm" }, { hour: 17, percentage: 0, title: "", time: "3pm" }, { hour: 18, percentage: 0, title: "", time: "6pm" }, { hour: 19, percentage: 0, title: "", time: "6pm" }, { hour: 20, percentage: 0, title: "", time: "6pm" }, { hour: 21, percentage: 48, title: "Usually not too busy", time: "9pm" }, { hour: 22, percentage: 78, title: "Usually a little busy", time: "9pm" }, { hour: 23, percentage: 100, title: "Usually as busy as it gets", time: "9pm" }, { hour: 0, percentage: 90, title: "Usually as busy as it gets", time: "12am" }, { hour: 1, percentage: 71, title: "Usually a little busy", time: "12am" }] },
      { day: 6, day_text: "Saturday", popular_times: [{ hour: 6, percentage: 0, title: "", time: "6am" }, { hour: 7, percentage: 0, title: "", time: "6am" }, { hour: 8, percentage: 0, title: "", time: "6am" }, { hour: 9, percentage: 0, title: "", time: "9am" }, { hour: 10, percentage: 0, title: "", time: "9am" }, { hour: 11, percentage: 0, title: "", time: "9am" }, { hour: 12, percentage: 0, title: "", time: "12pm" }, { hour: 13, percentage: 0, title: "", time: "12pm" }, { hour: 14, percentage: 0, title: "", time: "12pm" }, { hour: 15, percentage: 0, title: "", time: "3pm" }, { hour: 16, percentage: 0, title: "", time: "3pm" }, { hour: 17, percentage: 0, title: "", time: "3pm" }, { hour: 18, percentage: 0, title: "", time: "6pm" }, { hour: 19, percentage: 0, title: "", time: "6pm" }, { hour: 20, percentage: 0, title: "", time: "6pm" }, { hour: 21, percentage: 43, title: "Usually not too busy", time: "9pm" }, { hour: 22, percentage: 66, title: "Usually a little busy", time: "9pm" }, { hour: 23, percentage: 81, title: "Usually as busy as it gets", time: "9pm" }, { hour: 0, percentage: 64, title: "Usually a little busy", time: "12am" }, { hour: 1, percentage: 44, title: "Usually not too busy", time: "12am" }] },
      { day: "live", percentage: 3, title: "Not busy", time: 23 },
    ],
    typicalTimeSpent: null,
  },
  "bar-la-ptite-grenouille-ottawa": {
    googleRating: 3.3,
    googleReviewCount: 383,
    reviewsPerScore: { 1: 140, 2: 15, 3: 12, 4: 24, 5: 192 },
    popularTimes: [
      { day: 7, day_text: "Sunday", popular_times: [{ hour: 6, percentage: 0, title: "", time: "6am" }, { hour: 7, percentage: 0, title: "", time: "6am" }, { hour: 8, percentage: 0, title: "", time: "6am" }, { hour: 9, percentage: 0, title: "", time: "9am" }, { hour: 10, percentage: 0, title: "", time: "9am" }, { hour: 11, percentage: 0, title: "", time: "9am" }, { hour: 12, percentage: 0, title: "", time: "12pm" }, { hour: 13, percentage: 0, title: "", time: "12pm" }, { hour: 14, percentage: 0, title: "", time: "12pm" }, { hour: 15, percentage: 0, title: "", time: "3pm" }, { hour: 16, percentage: 2, title: "Usually not busy", time: "3pm" }, { hour: 17, percentage: 3, title: "Usually not busy", time: "3pm" }, { hour: 18, percentage: 5, title: "Usually not busy", time: "6pm" }, { hour: 19, percentage: 4, title: "Usually not busy", time: "6pm" }, { hour: 20, percentage: 4, title: "Usually not busy", time: "6pm" }, { hour: 21, percentage: 6, title: "Usually not busy", time: "9pm" }, { hour: 22, percentage: 6, title: "Usually not busy", time: "9pm" }, { hour: 23, percentage: 5, title: "Usually not busy", time: "9pm" }, { hour: 0, percentage: 4, title: "Usually not busy", time: "12am" }, { hour: 1, percentage: 2, title: "Usually not busy", time: "12am" }, { hour: 2, percentage: 2, title: "Usually not busy", time: "12am" }] },
      { day: 1, day_text: "Monday", popular_times: [{ hour: 6, percentage: 0, title: "", time: "6am" }, { hour: 7, percentage: 0, title: "", time: "6am" }, { hour: 8, percentage: 0, title: "", time: "6am" }, { hour: 9, percentage: 0, title: "", time: "9am" }, { hour: 10, percentage: 0, title: "", time: "9am" }, { hour: 11, percentage: 0, title: "", time: "9am" }, { hour: 12, percentage: 0, title: "", time: "12pm" }, { hour: 13, percentage: 0, title: "", time: "12pm" }, { hour: 14, percentage: 0, title: "", time: "12pm" }, { hour: 15, percentage: 0, title: "", time: "3pm" }, { hour: 16, percentage: 5, title: "Usually not busy", time: "3pm" }, { hour: 17, percentage: 7, title: "Usually not busy", time: "3pm" }, { hour: 18, percentage: 5, title: "Usually not busy", time: "6pm" }, { hour: 19, percentage: 5, title: "Usually not busy", time: "6pm" }, { hour: 20, percentage: 4, title: "Usually not busy", time: "6pm" }, { hour: 21, percentage: 5, title: "Usually not busy", time: "9pm" }, { hour: 22, percentage: 5, title: "Usually not busy", time: "9pm" }, { hour: 23, percentage: 4, title: "Usually not busy", time: "9pm" }] },
      { day: 2, day_text: "Tuesday", popular_times: [{ hour: 6, percentage: 0, title: "", time: "6am" }, { hour: 7, percentage: 0, title: "", time: "6am" }, { hour: 8, percentage: 0, title: "", time: "6am" }, { hour: 9, percentage: 0, title: "", time: "9am" }, { hour: 10, percentage: 0, title: "", time: "9am" }, { hour: 11, percentage: 4, title: "Usually not busy", time: "9am" }, { hour: 12, percentage: 8, title: "Usually not busy", time: "12pm" }, { hour: 13, percentage: 8, title: "Usually not busy", time: "12pm" }, { hour: 14, percentage: 7, title: "Usually not busy", time: "12pm" }, { hour: 15, percentage: 5, title: "Usually not busy", time: "3pm" }, { hour: 16, percentage: 7, title: "Usually not busy", time: "3pm" }, { hour: 17, percentage: 7, title: "Usually not busy", time: "3pm" }, { hour: 18, percentage: 8, title: "Usually not busy", time: "6pm" }, { hour: 19, percentage: 5, title: "Usually not busy", time: "6pm" }, { hour: 20, percentage: 4, title: "Usually not busy", time: "6pm" }, { hour: 21, percentage: 5, title: "Usually not busy", time: "9pm" }, { hour: 22, percentage: 5, title: "Usually not busy", time: "9pm" }, { hour: 23, percentage: 4, title: "Usually not busy", time: "9pm" }] },
      { day: 3, day_text: "Wednesday", popular_times: [{ hour: 6, percentage: 0, title: "", time: "6am" }, { hour: 7, percentage: 0, title: "", time: "6am" }, { hour: 8, percentage: 0, title: "", time: "6am" }, { hour: 9, percentage: 0, title: "", time: "9am" }, { hour: 10, percentage: 0, title: "", time: "9am" }, { hour: 11, percentage: 1, title: "Usually not busy", time: "9am" }, { hour: 12, percentage: 2, title: "Usually not busy", time: "12pm" }, { hour: 13, percentage: 4, title: "Usually not busy", time: "12pm" }, { hour: 14, percentage: 4, title: "Usually not busy", time: "12pm" }, { hour: 15, percentage: 3, title: "Usually not busy", time: "3pm" }, { hour: 16, percentage: 3, title: "Usually not busy", time: "3pm" }, { hour: 17, percentage: 2, title: "Usually not busy", time: "3pm" }, { hour: 18, percentage: 1, title: "Usually not busy", time: "6pm" }, { hour: 19, percentage: 4, title: "Usually not busy", time: "6pm" }, { hour: 20, percentage: 9, title: "Usually not busy", time: "6pm" }, { hour: 21, percentage: 14, title: "Usually not busy", time: "9pm" }, { hour: 22, percentage: 17, title: "Usually not busy", time: "9pm" }, { hour: 23, percentage: 20, title: "Usually not too busy", time: "9pm" }, { hour: 0, percentage: 17, title: "Usually not busy", time: "12am" }, { hour: 1, percentage: 15, title: "Usually not busy", time: "12am" }, { hour: 2, percentage: 11, title: "Usually not busy", time: "12am" }] },
      { day: 4, day_text: "Thursday", popular_times: [{ hour: 6, percentage: 0, title: "", time: "6am" }, { hour: 7, percentage: 0, title: "", time: "6am" }, { hour: 8, percentage: 0, title: "", time: "6am" }, { hour: 9, percentage: 0, title: "", time: "9am" }, { hour: 10, percentage: 0, title: "", time: "9am" }, { hour: 11, percentage: 4, title: "Usually not busy", time: "9am" }, { hour: 12, percentage: 3, title: "Usually not busy", time: "12pm" }, { hour: 13, percentage: 5, title: "Usually not busy", time: "12pm" }, { hour: 14, percentage: 5, title: "Usually not busy", time: "12pm" }, { hour: 15, percentage: 7, title: "Usually not busy", time: "3pm" }, { hour: 16, percentage: 6, title: "Usually not busy", time: "3pm" }, { hour: 17, percentage: 7, title: "Usually not busy", time: "3pm" }, { hour: 18, percentage: 6, title: "Usually not busy", time: "6pm" }, { hour: 19, percentage: 5, title: "Usually not busy", time: "6pm" }, { hour: 20, percentage: 4, title: "Usually not busy", time: "6pm" }, { hour: 21, percentage: 5, title: "Usually not busy", time: "9pm" }, { hour: 22, percentage: 8, title: "Usually not busy", time: "9pm" }, { hour: 23, percentage: 9, title: "Usually not busy", time: "9pm" }, { hour: 0, percentage: 9, title: "Usually not busy", time: "12am" }, { hour: 1, percentage: 7, title: "Usually not busy", time: "12am" }, { hour: 2, percentage: 7, title: "Usually not busy", time: "12am" }] },
      { day: 5, day_text: "Friday", popular_times: [{ hour: 6, percentage: 0, title: "", time: "6am" }, { hour: 7, percentage: 0, title: "", time: "6am" }, { hour: 8, percentage: 0, title: "", time: "6am" }, { hour: 9, percentage: 0, title: "", time: "9am" }, { hour: 10, percentage: 0, title: "", time: "9am" }, { hour: 11, percentage: 1, title: "Usually not busy", time: "9am" }, { hour: 12, percentage: 1, title: "Usually not busy", time: "12pm" }, { hour: 13, percentage: 3, title: "Usually not busy", time: "12pm" }, { hour: 14, percentage: 5, title: "Usually not busy", time: "12pm" }, { hour: 15, percentage: 3, title: "Usually not busy", time: "3pm" }, { hour: 16, percentage: 2, title: "Usually not busy", time: "3pm" }, { hour: 17, percentage: 1, title: "Usually not busy", time: "3pm" }, { hour: 18, percentage: 2, title: "Usually not busy", time: "6pm" }, { hour: 19, percentage: 4, title: "Usually not busy", time: "6pm" }, { hour: 20, percentage: 14, title: "Usually not busy", time: "6pm" }, { hour: 21, percentage: 39, title: "Usually not too busy", time: "9pm" }, { hour: 22, percentage: 70, title: "Usually a little busy", time: "9pm" }, { hour: 23, percentage: 100, title: "Usually as busy as it gets", time: "9pm" }, { hour: 0, percentage: 90, title: "Usually as busy as it gets", time: "12am" }, { hour: 1, percentage: 74, title: "Usually a little busy", time: "12am" }, { hour: 2, percentage: 45, title: "Usually not too busy", time: "12am" }] },
      { day: 6, day_text: "Saturday", popular_times: [{ hour: 6, percentage: 0, title: "", time: "6am" }, { hour: 7, percentage: 0, title: "", time: "6am" }, { hour: 8, percentage: 0, title: "", time: "6am" }, { hour: 9, percentage: 0, title: "", time: "9am" }, { hour: 10, percentage: 0, title: "", time: "9am" }, { hour: 11, percentage: 0, title: "", time: "9am" }, { hour: 12, percentage: 0, title: "", time: "12pm" }, { hour: 13, percentage: 0, title: "", time: "12pm" }, { hour: 14, percentage: 0, title: "", time: "12pm" }, { hour: 15, percentage: 0, title: "", time: "3pm" }, { hour: 16, percentage: 2, title: "Usually not busy", time: "3pm" }, { hour: 17, percentage: 2, title: "Usually not busy", time: "3pm" }, { hour: 18, percentage: 7, title: "Usually not busy", time: "6pm" }, { hour: 19, percentage: 9, title: "Usually not busy", time: "6pm" }, { hour: 20, percentage: 15, title: "Usually not busy", time: "6pm" }, { hour: 21, percentage: 32, title: "Usually not too busy", time: "9pm" }, { hour: 22, percentage: 53, title: "Usually a little busy", time: "9pm" }, { hour: 23, percentage: 73, title: "Usually a little busy", time: "9pm" }, { hour: 0, percentage: 68, title: "Usually a little busy", time: "12am" }, { hour: 1, percentage: 59, title: "Usually a little busy", time: "12am" }, { hour: 2, percentage: 43, title: "Usually not too busy", time: "12am" }] },
      { day: "live", percentage: 7, title: "Not busy", time: 23 },
    ],
    typicalTimeSpent: "1.5-3.5 hours",
  },
  "bar-happy-fish-elgin-ottawa": {
    googleRating: 3.7,
    googleReviewCount: 215,
    reviewsPerScore: { 1: 50, 2: 8, 3: 16, 4: 31, 5: 110 },
    popularTimes: null,
    typicalTimeSpent: null,
  },
  "bar-tomo-restaurant-ottawa": {
    googleRating: 4.3,
    googleReviewCount: 1075,
    reviewsPerScore: { 1: 79, 2: 28, 3: 89, 4: 204, 5: 675 },
    popularTimes: null,
    typicalTimeSpent: "1.5-3 hours",
  },
  "bar-back-to-brooklyn-ottawa": {
    googleRating: 3.8,
    googleReviewCount: 450,
    reviewsPerScore: { 1: 84, 2: 34, 3: 32, 4: 44, 5: 256 },
    popularTimes: null,
    typicalTimeSpent: null,
  },
  "bar-el-furniture-warehouse-ottawa": {
    googleRating: 4.0,
    googleReviewCount: 2459,
    reviewsPerScore: { 1: 247, 2: 95, 3: 283, 4: 655, 5: 1179 },
    popularTimes: [
      { day: 7, day_text: "Sunday", popular_times: [{ hour: 6, percentage: 0, title: "", time: "6am" }, { hour: 7, percentage: 0, title: "", time: "6am" }, { hour: 8, percentage: 0, title: "", time: "6am" }, { hour: 9, percentage: 0, title: "", time: "9am" }, { hour: 10, percentage: 0, title: "", time: "9am" }, { hour: 11, percentage: 8, title: "Usually not busy", time: "9am" }, { hour: 12, percentage: 10, title: "Usually not busy", time: "12pm" }, { hour: 13, percentage: 13, title: "Usually not busy", time: "12pm" }, { hour: 14, percentage: 21, title: "Usually not too busy", time: "12pm" }, { hour: 15, percentage: 23, title: "Usually not too busy", time: "3pm" }, { hour: 16, percentage: 28, title: "Usually not too busy", time: "3pm" }, { hour: 17, percentage: 30, title: "Usually not too busy", time: "3pm" }, { hour: 18, percentage: 35, title: "Usually not too busy", time: "6pm" }, { hour: 19, percentage: 36, title: "Usually not too busy", time: "6pm" }, { hour: 20, percentage: 38, title: "Usually not too busy", time: "6pm" }, { hour: 21, percentage: 35, title: "Usually not too busy", time: "9pm" }, { hour: 22, percentage: 33, title: "Usually not too busy", time: "9pm" }, { hour: 23, percentage: 26, title: "Usually not too busy", time: "9pm" }, { hour: 0, percentage: 16, title: "Usually not busy", time: "12am" }, { hour: 1, percentage: 10, title: "Usually not busy", time: "12am" }] },
      { day: 1, day_text: "Monday", popular_times: [{ hour: 6, percentage: 0, title: "", time: "6am" }, { hour: 7, percentage: 0, title: "", time: "6am" }, { hour: 8, percentage: 0, title: "", time: "6am" }, { hour: 9, percentage: 0, title: "", time: "9am" }, { hour: 10, percentage: 0, title: "", time: "9am" }, { hour: 11, percentage: 8, title: "Usually not busy", time: "9am" }, { hour: 12, percentage: 10, title: "Usually not busy", time: "12pm" }, { hour: 13, percentage: 10, title: "Usually not busy", time: "12pm" }, { hour: 14, percentage: 13, title: "Usually not busy", time: "12pm" }, { hour: 15, percentage: 16, title: "Usually not busy", time: "3pm" }, { hour: 16, percentage: 21, title: "Usually not too busy", time: "3pm" }, { hour: 17, percentage: 24, title: "Usually not too busy", time: "3pm" }, { hour: 18, percentage: 25, title: "Usually not too busy", time: "6pm" }, { hour: 19, percentage: 24, title: "Usually not too busy", time: "6pm" }, { hour: 20, percentage: 23, title: "Usually not too busy", time: "6pm" }, { hour: 21, percentage: 27, title: "Usually not too busy", time: "9pm" }, { hour: 22, percentage: 26, title: "Usually not too busy", time: "9pm" }, { hour: 23, percentage: 27, title: "Usually not too busy", time: "9pm" }, { hour: 0, percentage: 22, title: "Usually not too busy", time: "12am" }, { hour: 1, percentage: 18, title: "Usually not busy", time: "12am" }] },
      { day: 2, day_text: "Tuesday", popular_times: [{ hour: 6, percentage: 0, title: "", time: "6am" }, { hour: 7, percentage: 0, title: "", time: "6am" }, { hour: 8, percentage: 0, title: "", time: "6am" }, { hour: 9, percentage: 0, title: "", time: "9am" }, { hour: 10, percentage: 0, title: "", time: "9am" }, { hour: 11, percentage: 12, title: "Usually not busy", time: "9am" }, { hour: 12, percentage: 16, title: "Usually not busy", time: "12pm" }, { hour: 13, percentage: 16, title: "Usually not busy", time: "12pm" }, { hour: 14, percentage: 19, title: "Usually not busy", time: "12pm" }, { hour: 15, percentage: 23, title: "Usually not too busy", time: "3pm" }, { hour: 16, percentage: 23, title: "Usually not too busy", time: "3pm" }, { hour: 17, percentage: 24, title: "Usually not too busy", time: "3pm" }, { hour: 18, percentage: 27, title: "Usually not too busy", time: "6pm" }, { hour: 19, percentage: 29, title: "Usually not too busy", time: "6pm" }, { hour: 20, percentage: 30, title: "Usually not too busy", time: "6pm" }, { hour: 21, percentage: 29, title: "Usually not too busy", time: "9pm" }, { hour: 22, percentage: 26, title: "Usually not too busy", time: "9pm" }, { hour: 23, percentage: 21, title: "Usually not too busy", time: "9pm" }, { hour: 0, percentage: 13, title: "Usually not busy", time: "12am" }, { hour: 1, percentage: 9, title: "Usually not busy", time: "12am" }] },
      { day: 3, day_text: "Wednesday", popular_times: [{ hour: 6, percentage: 0, title: "", time: "6am" }, { hour: 7, percentage: 0, title: "", time: "6am" }, { hour: 8, percentage: 0, title: "", time: "6am" }, { hour: 9, percentage: 0, title: "", time: "9am" }, { hour: 10, percentage: 0, title: "", time: "9am" }, { hour: 11, percentage: 10, title: "Usually not busy", time: "9am" }, { hour: 12, percentage: 13, title: "Usually not busy", time: "12pm" }, { hour: 13, percentage: 14, title: "Usually not busy", time: "12pm" }, { hour: 14, percentage: 16, title: "Usually not busy", time: "12pm" }, { hour: 15, percentage: 19, title: "Usually not busy", time: "3pm" }, { hour: 16, percentage: 22, title: "Usually not too busy", time: "3pm" }, { hour: 17, percentage: 29, title: "Usually not too busy", time: "3pm" }, { hour: 18, percentage: 36, title: "Usually not too busy", time: "6pm" }, { hour: 19, percentage: 36, title: "Usually not too busy", time: "6pm" }, { hour: 20, percentage: 38, title: "Usually not too busy", time: "6pm" }, { hour: 21, percentage: 46, title: "Usually not too busy", time: "9pm" }, { hour: 22, percentage: 59, title: "Usually a little busy", time: "9pm" }, { hour: 23, percentage: 63, title: "Usually a little busy", time: "9pm" }, { hour: 0, percentage: 52, title: "Usually a little busy", time: "12am" }, { hour: 1, percentage: 33, title: "Usually not too busy", time: "12am" }] },
      { day: 4, day_text: "Thursday", popular_times: [{ hour: 6, percentage: 0, title: "", time: "6am" }, { hour: 7, percentage: 0, title: "", time: "6am" }, { hour: 8, percentage: 0, title: "", time: "6am" }, { hour: 9, percentage: 0, title: "", time: "9am" }, { hour: 10, percentage: 0, title: "", time: "9am" }, { hour: 11, percentage: 12, title: "Usually not busy", time: "9am" }, { hour: 12, percentage: 14, title: "Usually not busy", time: "12pm" }, { hour: 13, percentage: 12, title: "Usually not busy", time: "12pm" }, { hour: 14, percentage: 11, title: "Usually not busy", time: "12pm" }, { hour: 15, percentage: 12, title: "Usually not busy", time: "3pm" }, { hour: 16, percentage: 16, title: "Usually not busy", time: "3pm" }, { hour: 17, percentage: 27, title: "Usually not too busy", time: "3pm" }, { hour: 18, percentage: 36, title: "Usually not too busy", time: "6pm" }, { hour: 19, percentage: 40, title: "Usually not too busy", time: "6pm" }, { hour: 20, percentage: 36, title: "Usually not too busy", time: "6pm" }, { hour: 21, percentage: 35, title: "Usually not too busy", time: "9pm" }, { hour: 22, percentage: 36, title: "Usually not too busy", time: "9pm" }, { hour: 23, percentage: 33, title: "Usually not too busy", time: "9pm" }, { hour: 0, percentage: 26, title: "Usually not too busy", time: "12am" }, { hour: 1, percentage: 16, title: "Usually not busy", time: "12am" }] },
      { day: 5, day_text: "Friday", popular_times: [{ hour: 6, percentage: 0, title: "", time: "6am" }, { hour: 7, percentage: 0, title: "", time: "6am" }, { hour: 8, percentage: 0, title: "", time: "6am" }, { hour: 9, percentage: 0, title: "", time: "9am" }, { hour: 10, percentage: 0, title: "", time: "9am" }, { hour: 11, percentage: 13, title: "Usually not busy", time: "9am" }, { hour: 12, percentage: 18, title: "Usually not busy", time: "12pm" }, { hour: 13, percentage: 16, title: "Usually not busy", time: "12pm" }, { hour: 14, percentage: 16, title: "Usually not busy", time: "12pm" }, { hour: 15, percentage: 20, title: "Usually not busy", time: "3pm" }, { hour: 16, percentage: 31, title: "Usually not too busy", time: "3pm" }, { hour: 17, percentage: 41, title: "Usually not too busy", time: "3pm" }, { hour: 18, percentage: 49, title: "Usually not too busy", time: "6pm" }, { hour: 19, percentage: 60, title: "Usually a little busy", time: "6pm" }, { hour: 20, percentage: 70, title: "Usually not too busy", time: "6pm" }, { hour: 21, percentage: 89, title: "Usually as busy as it gets", time: "9pm" }, { hour: 22, percentage: 100, title: "Usually as busy as it gets", time: "9pm" }, { hour: 23, percentage: 95, title: "Usually as busy as it gets", time: "9pm" }, { hour: 0, percentage: 75, title: "Usually not too busy", time: "12am" }, { hour: 1, percentage: 50, title: "Usually a little busy", time: "12am" }] },
      { day: 6, day_text: "Saturday", popular_times: [{ hour: 6, percentage: 0, title: "", time: "6am" }, { hour: 7, percentage: 0, title: "", time: "6am" }, { hour: 8, percentage: 0, title: "", time: "6am" }, { hour: 9, percentage: 0, title: "", time: "9am" }, { hour: 10, percentage: 0, title: "", time: "9am" }, { hour: 11, percentage: 9, title: "Usually not busy", time: "9am" }, { hour: 12, percentage: 15, title: "Usually not busy", time: "12pm" }, { hour: 13, percentage: 21, title: "Usually not too busy", time: "12pm" }, { hour: 14, percentage: 27, title: "Usually not too busy", time: "12pm" }, { hour: 15, percentage: 32, title: "Usually not too busy", time: "3pm" }, { hour: 16, percentage: 34, title: "Usually not too busy", time: "3pm" }, { hour: 17, percentage: 44, title: "Usually not too busy", time: "3pm" }, { hour: 18, percentage: 54, title: "Usually a little busy", time: "6pm" }, { hour: 19, percentage: 66, title: "Usually not too busy", time: "6pm" }, { hour: 20, percentage: 70, title: "Usually not too busy", time: "6pm" }, { hour: 21, percentage: 76, title: "Usually not too busy", time: "9pm" }, { hour: 22, percentage: 81, title: "Usually as busy as it gets", time: "9pm" }, { hour: 23, percentage: 82, title: "Usually as busy as it gets", time: "9pm" }, { hour: 0, percentage: 64, title: "Usually not too busy", time: "12am" }, { hour: 1, percentage: 43, title: "Usually not too busy", time: "12am" }] },
      { day: "live", percentage: 16, title: "Not busy", time: 23 },
    ],
    typicalTimeSpent: "45 min to 2 hr",
  },
  "bar-lieutenant-pump-ottawa": {
    googleRating: 4.3,
    googleReviewCount: 2836,
    reviewsPerScore: { 1: 103, 2: 61, 3: 259, 4: 909, 5: 1504 },
    popularTimes: [
      { day: 7, day_text: "Sunday", popular_times: [{ hour: 6, percentage: 0, title: "", time: "6am" }, { hour: 7, percentage: 0, title: "", time: "6am" }, { hour: 8, percentage: 0, title: "", time: "6am" }, { hour: 9, percentage: 0, title: "", time: "9am" }, { hour: 10, percentage: 12, title: "Usually not busy", time: "9am" }, { hour: 11, percentage: 19, title: "Usually not busy", time: "9am" }, { hour: 12, percentage: 25, title: "Usually not too busy", time: "12pm" }, { hour: 13, percentage: 25, title: "Usually not too busy", time: "12pm" }, { hour: 14, percentage: 24, title: "Usually not too busy", time: "12pm" }, { hour: 15, percentage: 27, title: "Usually not too busy", time: "3pm" }, { hour: 16, percentage: 32, title: "Usually not too busy", time: "3pm" }, { hour: 17, percentage: 37, title: "Usually not too busy", time: "3pm" }, { hour: 18, percentage: 39, title: "Usually not too busy", time: "6pm" }, { hour: 19, percentage: 37, title: "Usually not too busy", time: "6pm" }, { hour: 20, percentage: 31, title: "Usually not too busy", time: "6pm" }, { hour: 21, percentage: 26, title: "Usually not too busy", time: "9pm" }, { hour: 22, percentage: 18, title: "Usually not busy", time: "9pm" }, { hour: 23, percentage: 12, title: "Usually not busy", time: "9pm" }] },
      { day: 1, day_text: "Monday", popular_times: [{ hour: 6, percentage: 0, title: "", time: "6am" }, { hour: 7, percentage: 0, title: "", time: "6am" }, { hour: 8, percentage: 0, title: "", time: "6am" }, { hour: 9, percentage: 0, title: "", time: "9am" }, { hour: 10, percentage: 0, title: "", time: "9am" }, { hour: 11, percentage: 7, title: "Usually not busy", time: "9am" }, { hour: 12, percentage: 11, title: "Usually not busy", time: "12pm" }, { hour: 13, percentage: 12, title: "Usually not busy", time: "12pm" }, { hour: 14, percentage: 11, title: "Usually not busy", time: "12pm" }, { hour: 15, percentage: 12, title: "Usually not busy", time: "3pm" }, { hour: 16, percentage: 19, title: "Usually not busy", time: "3pm" }, { hour: 17, percentage: 35, title: "Usually not too busy", time: "3pm" }, { hour: 18, percentage: 61, title: "Usually a little busy", time: "6pm" }, { hour: 19, percentage: 74, title: "Usually a little busy", time: "6pm" }, { hour: 20, percentage: 84, title: "Usually as busy as it gets", time: "6pm" }, { hour: 21, percentage: 73, title: "Usually a little busy", time: "9pm" }, { hour: 22, percentage: 57, title: "Usually a little busy", time: "9pm" }, { hour: 23, percentage: 31, title: "Usually not too busy", time: "9pm" }, { hour: 0, percentage: 13, title: "Usually not busy", time: "12am" }] },
      { day: 2, day_text: "Tuesday", popular_times: [{ hour: 6, percentage: 0, title: "", time: "6am" }, { hour: 7, percentage: 0, title: "", time: "6am" }, { hour: 8, percentage: 0, title: "", time: "6am" }, { hour: 9, percentage: 0, title: "", time: "9am" }, { hour: 10, percentage: 0, title: "", time: "9am" }, { hour: 11, percentage: 11, title: "Usually not busy", time: "9am" }, { hour: 12, percentage: 20, title: "Usually not too busy", time: "12pm" }, { hour: 13, percentage: 24, title: "Usually not too busy", time: "12pm" }, { hour: 14, percentage: 25, title: "Usually not too busy", time: "12pm" }, { hour: 15, percentage: 24, title: "Usually not too busy", time: "3pm" }, { hour: 16, percentage: 27, title: "Usually not too busy", time: "3pm" }, { hour: 17, percentage: 34, title: "Usually not too busy", time: "3pm" }, { hour: 18, percentage: 43, title: "Usually not too busy", time: "6pm" }, { hour: 19, percentage: 44, title: "Usually not too busy", time: "6pm" }, { hour: 20, percentage: 42, title: "Usually not too busy", time: "6pm" }, { hour: 21, percentage: 30, title: "Usually not too busy", time: "9pm" }, { hour: 22, percentage: 20, title: "Usually not too busy", time: "9pm" }, { hour: 23, percentage: 11, title: "Usually not busy", time: "9pm" }, { hour: 0, percentage: 6, title: "Usually not busy", time: "12am" }] },
      { day: 3, day_text: "Wednesday", popular_times: [{ hour: 6, percentage: 0, title: "", time: "6am" }, { hour: 7, percentage: 0, title: "", time: "6am" }, { hour: 8, percentage: 0, title: "", time: "6am" }, { hour: 9, percentage: 0, title: "", time: "9am" }, { hour: 10, percentage: 0, title: "", time: "9am" }, { hour: 11, percentage: 10, title: "Usually not busy", time: "9am" }, { hour: 12, percentage: 16, title: "Usually not busy", time: "12pm" }, { hour: 13, percentage: 18, title: "Usually not busy", time: "12pm" }, { hour: 14, percentage: 18, title: "Usually not busy", time: "12pm" }, { hour: 15, percentage: 18, title: "Usually not busy", time: "3pm" }, { hour: 16, percentage: 25, title: "Usually not too busy", time: "3pm" }, { hour: 17, percentage: 36, title: "Usually not too busy", time: "3pm" }, { hour: 18, percentage: 50, title: "Usually a little busy", time: "6pm" }, { hour: 19, percentage: 57, title: "Usually a little busy", time: "6pm" }, { hour: 20, percentage: 57, title: "Usually a little busy", time: "6pm" }, { hour: 21, percentage: 55, title: "Usually a little busy", time: "9pm" }, { hour: 22, percentage: 50, title: "Usually not too busy", time: "9pm" }, { hour: 23, percentage: 36, title: "Usually not too busy", time: "9pm" }, { hour: 0, percentage: 19, title: "Usually not busy", time: "12am" }] },
      { day: 4, day_text: "Thursday", popular_times: [{ hour: 6, percentage: 0, title: "", time: "6am" }, { hour: 7, percentage: 0, title: "", time: "6am" }, { hour: 8, percentage: 0, title: "", time: "6am" }, { hour: 9, percentage: 0, title: "", time: "9am" }, { hour: 10, percentage: 0, title: "", time: "9am" }, { hour: 11, percentage: 11, title: "Usually not busy", time: "9am" }, { hour: 12, percentage: 15, title: "Usually not busy", time: "12pm" }, { hour: 13, percentage: 18, title: "Usually not busy", time: "12pm" }, { hour: 14, percentage: 17, title: "Usually not busy", time: "12pm" }, { hour: 15, percentage: 17, title: "Usually not busy", time: "3pm" }, { hour: 16, percentage: 21, title: "Usually not too busy", time: "3pm" }, { hour: 17, percentage: 28, title: "Usually not too busy", time: "3pm" }, { hour: 18, percentage: 36, title: "Usually not too busy", time: "6pm" }, { hour: 19, percentage: 39, title: "Usually not too busy", time: "6pm" }, { hour: 20, percentage: 39, title: "Usually not too busy", time: "6pm" }, { hour: 21, percentage: 39, title: "Usually not too busy", time: "9pm" }, { hour: 22, percentage: 33, title: "Usually not too busy", time: "9pm" }, { hour: 23, percentage: 26, title: "Usually not too busy", time: "9pm" }, { hour: 0, percentage: 15, title: "Usually not busy", time: "12am" }] },
      { day: 5, day_text: "Friday", popular_times: [{ hour: 6, percentage: 0, title: "", time: "6am" }, { hour: 7, percentage: 0, title: "", time: "6am" }, { hour: 8, percentage: 0, title: "", time: "6am" }, { hour: 9, percentage: 0, title: "", time: "9am" }, { hour: 10, percentage: 0, title: "", time: "9am" }, { hour: 11, percentage: 13, title: "Usually not busy", time: "9am" }, { hour: 12, percentage: 19, title: "Usually not busy", time: "12pm" }, { hour: 13, percentage: 21, title: "Usually not too busy", time: "12pm" }, { hour: 14, percentage: 18, title: "Usually not busy", time: "12pm" }, { hour: 15, percentage: 20, title: "Usually not too busy", time: "3pm" }, { hour: 16, percentage: 25, title: "Usually not too busy", time: "3pm" }, { hour: 17, percentage: 36, title: "Usually not too busy", time: "3pm" }, { hour: 18, percentage: 47, title: "Usually not too busy", time: "6pm" }, { hour: 19, percentage: 57, title: "Usually a little busy", time: "6pm" }, { hour: 20, percentage: 62, title: "Usually a little busy", time: "6pm" }, { hour: 21, percentage: 73, title: "Usually a little busy", time: "9pm" }, { hour: 22, percentage: 87, title: "Usually as busy as it gets", time: "9pm" }, { hour: 23, percentage: 92, title: "Usually as busy as it gets", time: "9pm" }, { hour: 0, percentage: 72, title: "Usually a little busy", time: "12am" }, { hour: 1, percentage: 48, title: "Usually not too busy", time: "12am" }] },
      { day: 6, day_text: "Saturday", popular_times: [{ hour: 6, percentage: 0, title: "", time: "6am" }, { hour: 7, percentage: 0, title: "", time: "6am" }, { hour: 8, percentage: 0, title: "", time: "6am" }, { hour: 9, percentage: 0, title: "", time: "9am" }, { hour: 10, percentage: 18, title: "Usually not busy", time: "9am" }, { hour: 11, percentage: 21, title: "Usually not too busy", time: "9am" }, { hour: 12, percentage: 20, title: "Usually not too busy", time: "12pm" }, { hour: 13, percentage: 19, title: "Usually not busy", time: "12pm" }, { hour: 14, percentage: 20, title: "Usually not too busy", time: "12pm" }, { hour: 15, percentage: 22, title: "Usually not too busy", time: "3pm" }, { hour: 16, percentage: 30, title: "Usually not too busy", time: "3pm" }, { hour: 17, percentage: 39, title: "Usually not too busy", time: "3pm" }, { hour: 18, percentage: 49, title: "Usually not too busy", time: "6pm" }, { hour: 19, percentage: 55, title: "Usually a little busy", time: "6pm" }, { hour: 20, percentage: 62, title: "Usually a little busy", time: "6pm" }, { hour: 21, percentage: 78, title: "Usually a little busy", time: "9pm" }, { hour: 22, percentage: 93, title: "Usually as busy as it gets", time: "9pm" }, { hour: 23, percentage: 100, title: "Usually as busy as it gets", time: "9pm" }, { hour: 0, percentage: 78, title: "Usually a little busy", time: "12am" }, { hour: 1, percentage: 53, title: "Usually a little busy", time: "12am" }] },
      { day: "live", percentage: 29, title: "Not too busy", time: 23 },
    ],
    typicalTimeSpent: "1-2.5 hours",
  },
  "club-city-at-night-ottawa": {
    googleRating: 4.2,
    googleReviewCount: 440,
    reviewsPerScore: { 1: 47, 2: 13, 3: 25, 4: 58, 5: 297 },
    popularTimes: [
      { day: 7, day_text: "Sunday", popular_times: [] },
      { day: 1, day_text: "Monday", popular_times: [] },
      { day: 2, day_text: "Tuesday", popular_times: [] },
      { day: 3, day_text: "Wednesday", popular_times: [] },
      { day: 4, day_text: "Thursday", popular_times: [] },
      { day: 5, day_text: "Friday", popular_times: [{ hour: 6, percentage: 0, title: "", time: "6am" }, { hour: 7, percentage: 0, title: "", time: "6am" }, { hour: 8, percentage: 0, title: "", time: "6am" }, { hour: 9, percentage: 0, title: "", time: "9am" }, { hour: 10, percentage: 0, title: "", time: "9am" }, { hour: 11, percentage: 0, title: "", time: "9am" }, { hour: 12, percentage: 0, title: "", time: "12pm" }, { hour: 13, percentage: 0, title: "", time: "12pm" }, { hour: 14, percentage: 0, title: "", time: "12pm" }, { hour: 15, percentage: 0, title: "", time: "3pm" }, { hour: 16, percentage: 0, title: "", time: "3pm" }, { hour: 17, percentage: 0, title: "", time: "3pm" }, { hour: 18, percentage: 0, title: "", time: "6pm" }, { hour: 19, percentage: 0, title: "", time: "6pm" }, { hour: 20, percentage: 0, title: "", time: "6pm" }, { hour: 21, percentage: 0, title: "", time: "9pm" }, { hour: 22, percentage: 55, title: "Usually a little busy", time: "9pm" }, { hour: 23, percentage: 73, title: "Usually a little busy", time: "9pm" }, { hour: 0, percentage: 62, title: "Usually a little busy", time: "12am" }, { hour: 1, percentage: 45, title: "Usually not too busy", time: "12am" }, { hour: 2, percentage: 27, title: "Usually not too busy", time: "12am" }] },
      { day: 6, day_text: "Saturday", popular_times: [{ hour: 6, percentage: 0, title: "", time: "6am" }, { hour: 7, percentage: 0, title: "", time: "6am" }, { hour: 8, percentage: 0, title: "", time: "6am" }, { hour: 9, percentage: 0, title: "", time: "9am" }, { hour: 10, percentage: 0, title: "", time: "9am" }, { hour: 11, percentage: 0, title: "", time: "9am" }, { hour: 12, percentage: 0, title: "", time: "12pm" }, { hour: 13, percentage: 0, title: "", time: "12pm" }, { hour: 14, percentage: 0, title: "", time: "12pm" }, { hour: 15, percentage: 0, title: "", time: "3pm" }, { hour: 16, percentage: 0, title: "", time: "3pm" }, { hour: 17, percentage: 0, title: "", time: "3pm" }, { hour: 18, percentage: 0, title: "", time: "6pm" }, { hour: 19, percentage: 0, title: "", time: "6pm" }, { hour: 20, percentage: 0, title: "", time: "6pm" }, { hour: 21, percentage: 49, title: "Usually not too busy", time: "9pm" }, { hour: 22, percentage: 83, title: "Usually as busy as it gets", time: "9pm" }, { hour: 23, percentage: 100, title: "Usually as busy as it gets", time: "9pm" }, { hour: 0, percentage: 88, title: "Usually as busy as it gets", time: "12am" }, { hour: 1, percentage: 72, title: "Usually a little busy", time: "12am" }, { hour: 2, percentage: 47, title: "Usually not too busy", time: "12am" }] },
    ],
    typicalTimeSpent: "1-3.5 hours",
  },
  "bar-heart-and-crown-ottawa": {
    googleRating: 4.2,
    googleReviewCount: 3462,
    reviewsPerScore: { 1: 185, 2: 109, 3: 327, 4: 975, 5: 1866 },
    popularTimes: [
      { day: 7, day_text: "Sunday", popular_times: [{ hour: 6, percentage: 0, title: "", time: "6am" }, { hour: 7, percentage: 0, title: "", time: "6am" }, { hour: 8, percentage: 0, title: "", time: "6am" }, { hour: 9, percentage: 0, title: "", time: "9am" }, { hour: 10, percentage: 0, title: "", time: "9am" }, { hour: 11, percentage: 17, title: "Usually not busy", time: "9am" }, { hour: 12, percentage: 25, title: "Usually not too busy", time: "12pm" }, { hour: 13, percentage: 30, title: "Usually not too busy", time: "12pm" }, { hour: 14, percentage: 33, title: "Usually not too busy", time: "12pm" }, { hour: 15, percentage: 34, title: "Usually not too busy", time: "3pm" }, { hour: 16, percentage: 34, title: "Usually not too busy", time: "3pm" }, { hour: 17, percentage: 33, title: "Usually not too busy", time: "3pm" }, { hour: 18, percentage: 28, title: "Usually not too busy", time: "6pm" }, { hour: 19, percentage: 23, title: "Usually not too busy", time: "6pm" }, { hour: 20, percentage: 20, title: "Usually not too busy", time: "6pm" }, { hour: 21, percentage: 18, title: "Usually not busy", time: "9pm" }, { hour: 22, percentage: 18, title: "Usually not busy", time: "9pm" }, { hour: 23, percentage: 17, title: "Usually not busy", time: "9pm" }, { hour: 0, percentage: 14, title: "Usually not busy", time: "12am" }, { hour: 1, percentage: 10, title: "Usually not busy", time: "12am" }] },
      { day: 1, day_text: "Monday", popular_times: [{ hour: 6, percentage: 0, title: "", time: "6am" }, { hour: 7, percentage: 0, title: "", time: "6am" }, { hour: 8, percentage: 0, title: "", time: "6am" }, { hour: 9, percentage: 0, title: "", time: "9am" }, { hour: 10, percentage: 0, title: "", time: "9am" }, { hour: 11, percentage: 10, title: "Usually not busy", time: "9am" }, { hour: 12, percentage: 14, title: "Usually not busy", time: "12pm" }, { hour: 13, percentage: 16, title: "Usually not busy", time: "12pm" }, { hour: 14, percentage: 14, title: "Usually not busy", time: "12pm" }, { hour: 15, percentage: 15, title: "Usually not busy", time: "3pm" }, { hour: 16, percentage: 17, title: "Usually not busy", time: "3pm" }, { hour: 17, percentage: 20, title: "Usually not too busy", time: "3pm" }, { hour: 18, percentage: 24, title: "Usually not too busy", time: "6pm" }, { hour: 19, percentage: 26, title: "Usually not too busy", time: "6pm" }, { hour: 20, percentage: 27, title: "Usually not too busy", time: "6pm" }, { hour: 21, percentage: 28, title: "Usually not too busy", time: "9pm" }, { hour: 22, percentage: 24, title: "Usually not too busy", time: "9pm" }, { hour: 23, percentage: 22, title: "Usually not too busy", time: "9pm" }, { hour: 0, percentage: 16, title: "Usually not busy", time: "12am" }, { hour: 1, percentage: 11, title: "Usually not busy", time: "12am" }] },
      { day: 2, day_text: "Tuesday", popular_times: [{ hour: 6, percentage: 0, title: "", time: "6am" }, { hour: 7, percentage: 0, title: "", time: "6am" }, { hour: 8, percentage: 0, title: "", time: "6am" }, { hour: 9, percentage: 0, title: "", time: "9am" }, { hour: 10, percentage: 0, title: "", time: "9am" }, { hour: 11, percentage: 16, title: "Usually not busy", time: "9am" }, { hour: 12, percentage: 25, title: "Usually not too busy", time: "12pm" }, { hour: 13, percentage: 28, title: "Usually not too busy", time: "12pm" }, { hour: 14, percentage: 26, title: "Usually not too busy", time: "12pm" }, { hour: 15, percentage: 23, title: "Usually not too busy", time: "3pm" }, { hour: 16, percentage: 21, title: "Usually not too busy", time: "3pm" }, { hour: 17, percentage: 22, title: "Usually not too busy", time: "3pm" }, { hour: 18, percentage: 25, title: "Usually not too busy", time: "6pm" }, { hour: 19, percentage: 27, title: "Usually not too busy", time: "6pm" }, { hour: 20, percentage: 30, title: "Usually not too busy", time: "6pm" }, { hour: 21, percentage: 30, title: "Usually not too busy", time: "9pm" }, { hour: 22, percentage: 30, title: "Usually not too busy", time: "9pm" }, { hour: 23, percentage: 25, title: "Usually not too busy", time: "9pm" }, { hour: 0, percentage: 17, title: "Usually not busy", time: "12am" }, { hour: 1, percentage: 11, title: "Usually not busy", time: "12am" }] },
      { day: 3, day_text: "Wednesday", popular_times: [{ hour: 6, percentage: 0, title: "", time: "6am" }, { hour: 7, percentage: 0, title: "", time: "6am" }, { hour: 8, percentage: 0, title: "", time: "6am" }, { hour: 9, percentage: 0, title: "", time: "9am" }, { hour: 10, percentage: 0, title: "", time: "9am" }, { hour: 11, percentage: 13, title: "Usually not busy", time: "9am" }, { hour: 12, percentage: 21, title: "Usually not too busy", time: "12pm" }, { hour: 13, percentage: 24, title: "Usually not too busy", time: "12pm" }, { hour: 14, percentage: 23, title: "Usually not too busy", time: "12pm" }, { hour: 15, percentage: 22, title: "Usually not too busy", time: "3pm" }, { hour: 16, percentage: 21, title: "Usually not too busy", time: "3pm" }, { hour: 17, percentage: 24, title: "Usually not too busy", time: "3pm" }, { hour: 18, percentage: 27, title: "Usually not too busy", time: "6pm" }, { hour: 19, percentage: 33, title: "Usually not too busy", time: "6pm" }, { hour: 20, percentage: 39, title: "Usually not too busy", time: "6pm" }, { hour: 21, percentage: 51, title: "Usually a little busy", time: "9pm" }, { hour: 22, percentage: 59, title: "Usually a little busy", time: "9pm" }, { hour: 23, percentage: 60, title: "Usually a little busy", time: "9pm" }, { hour: 0, percentage: 45, title: "Usually not too busy", time: "12am" }, { hour: 1, percentage: 31, title: "Usually not too busy", time: "12am" }] },
      { day: 4, day_text: "Thursday", popular_times: [{ hour: 6, percentage: 0, title: "", time: "6am" }, { hour: 7, percentage: 0, title: "", time: "6am" }, { hour: 8, percentage: 0, title: "", time: "6am" }, { hour: 9, percentage: 0, title: "", time: "9am" }, { hour: 10, percentage: 0, title: "", time: "9am" }, { hour: 11, percentage: 13, title: "Usually not busy", time: "9am" }, { hour: 12, percentage: 21, title: "Usually not too busy", time: "12pm" }, { hour: 13, percentage: 24, title: "Usually not too busy", time: "12pm" }, { hour: 14, percentage: 22, title: "Usually not too busy", time: "12pm" }, { hour: 15, percentage: 19, title: "Usually not busy", time: "3pm" }, { hour: 16, percentage: 22, title: "Usually not too busy", time: "3pm" }, { hour: 17, percentage: 26, title: "Usually not too busy", time: "3pm" }, { hour: 18, percentage: 31, title: "Usually not too busy", time: "6pm" }, { hour: 19, percentage: 34, title: "Usually not too busy", time: "6pm" }, { hour: 20, percentage: 37, title: "Usually not too busy", time: "6pm" }, { hour: 21, percentage: 40, title: "Usually not too busy", time: "9pm" }, { hour: 22, percentage: 41, title: "Usually not too busy", time: "9pm" }, { hour: 23, percentage: 39, title: "Usually not too busy", time: "9pm" }, { hour: 0, percentage: 30, title: "Usually not too busy", time: "12am" }, { hour: 1, percentage: 21, title: "Usually not too busy", time: "12am" }] },
      { day: 5, day_text: "Friday", popular_times: [{ hour: 6, percentage: 0, title: "", time: "6am" }, { hour: 7, percentage: 0, title: "", time: "6am" }, { hour: 8, percentage: 0, title: "", time: "6am" }, { hour: 9, percentage: 0, title: "", time: "9am" }, { hour: 10, percentage: 0, title: "", time: "9am" }, { hour: 11, percentage: 14, title: "Usually not busy", time: "9am" }, { hour: 12, percentage: 22, title: "Usually not too busy", time: "12pm" }, { hour: 13, percentage: 26, title: "Usually not too busy", time: "12pm" }, { hour: 14, percentage: 28, title: "Usually not too busy", time: "12pm" }, { hour: 15, percentage: 27, title: "Usually not too busy", time: "3pm" }, { hour: 16, percentage: 27, title: "Usually not too busy", time: "3pm" }, { hour: 17, percentage: 36, title: "Usually not too busy", time: "3pm" }, { hour: 18, percentage: 48, title: "Usually not too busy", time: "6pm" }, { hour: 19, percentage: 60, title: "Usually not too busy", time: "6pm" }, { hour: 20, percentage: 71, title: "Usually busy", time: "6pm" }, { hour: 21, percentage: 82, title: "Usually busy", time: "9pm" }, { hour: 22, percentage: 90, title: "Usually busy", time: "9pm" }, { hour: 23, percentage: 92, title: "Usually busy", time: "9pm" }, { hour: 0, percentage: 71, title: "Usually busy", time: "12am" }, { hour: 1, percentage: 50, title: "Usually not too busy", time: "12am" }] },
      { day: 6, day_text: "Saturday", popular_times: [{ hour: 6, percentage: 0, title: "", time: "6am" }, { hour: 7, percentage: 0, title: "", time: "6am" }, { hour: 8, percentage: 0, title: "", time: "6am" }, { hour: 9, percentage: 0, title: "", time: "9am" }, { hour: 10, percentage: 0, title: "", time: "9am" }, { hour: 11, percentage: 16, title: "Usually not busy", time: "9am" }, { hour: 12, percentage: 25, title: "Usually not too busy", time: "12pm" }, { hour: 13, percentage: 30, title: "Usually not too busy", time: "12pm" }, { hour: 14, percentage: 33, title: "Usually not too busy", time: "12pm" }, { hour: 15, percentage: 36, title: "Usually not too busy", time: "3pm" }, { hour: 16, percentage: 42, title: "Usually not too busy", time: "3pm" }, { hour: 17, percentage: 54, title: "Usually not too busy", time: "3pm" }, { hour: 18, percentage: 65, title: "Usually not too busy", time: "6pm" }, { hour: 19, percentage: 71, title: "Usually busy", time: "6pm" }, { hour: 20, percentage: 76, title: "Usually busy", time: "6pm" }, { hour: 21, percentage: 89, title: "Usually busy", time: "9pm" }, { hour: 22, percentage: 97, title: "Usually busy", time: "9pm" }, { hour: 23, percentage: 100, title: "Usually busy", time: "9pm" }, { hour: 0, percentage: 76, title: "Usually busy", time: "12am" }, { hour: 1, percentage: 55, title: "Usually busy", time: "12am" }] },
      { day: "live", percentage: 11, title: "Not busy", time: 23 },
    ],
    typicalTimeSpent: "1-2.5 hours",
  },
  "club-berlin-nightclub-ottawa": {
    googleRating: 3.8,
    googleReviewCount: 122,
    reviewsPerScore: { 1: 20, 2: 11, 3: 9, 4: 14, 5: 68 },
    popularTimes: null,
    typicalTimeSpent: null,
  },
};

// --- Helper functions ---

/** Nightlife-relevant hours: 6pm (18) through 2am (next day, hour 2) */
const NIGHTLIFE_HOURS = [18, 19, 20, 21, 22, 23, 0, 1, 2];

/** Core nightlife hours for peak calculation: 9pm through 2am */
const CORE_NIGHTLIFE_HOURS = new Set([21, 22, 23, 0, 1, 2]);

/** Map JS getDay() (0=Sun) to Google's day numbering (7=Sun, 1=Mon..6=Sat) */
function jsToGoogleDay(jsDay: number): number {
  return jsDay === 0 ? 7 : jsDay;
}

/** Get busyness for a specific location at the current day/hour. */
export function getCurrentBusyness(
  locationId: string
): { percentage: number; title: string } | null {
  const data = GOOGLE_DATA[locationId];
  if (!data?.popularTimes) return null;

  const now = new Date();
  const googleDay = jsToGoogleDay(now.getDay());
  const hour = now.getHours();

  const dayData = data.popularTimes.find(
    (d) => typeof d.day === "number" && d.day === googleDay
  );
  if (!dayData?.popular_times?.length) return null;

  const hourData = dayData.popular_times.find((h) => h.hour === hour);
  if (!hourData) return null;

  return { percentage: hourData.percentage, title: hourData.title };
}

/** Get peak hours for a location on a given day (JS getDay format). Sorted by percentage descending. */
export function getPeakHours(
  locationId: string,
  jsDayOfWeek: number
): { hour: number; percentage: number }[] {
  const data = GOOGLE_DATA[locationId];
  if (!data?.popularTimes) return [];

  const googleDay = jsToGoogleDay(jsDayOfWeek);
  const dayData = data.popularTimes.find(
    (d) => typeof d.day === "number" && d.day === googleDay
  );
  if (!dayData?.popular_times?.length) return [];

  return dayData.popular_times
    .filter((h) => h.percentage > 0 && CORE_NIGHTLIFE_HOURS.has(h.hour))
    .sort((a, b) => b.percentage - a.percentage)
    .map(({ hour, percentage }) => ({ hour, percentage }));
}

const DAY_NAMES_SHORT = ["", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/** Get the absolute weekly peak for a location across all days, filtered to core nightlife hours. */
export function getWeeklyPeak(
  locationId: string
): { googleDay: number; dayName: string; hour: number; percentage: number } | null {
  const data = GOOGLE_DATA[locationId];
  if (!data?.popularTimes) return null;

  let best: { googleDay: number; hour: number; percentage: number } | null = null;
  for (const dayEntry of data.popularTimes) {
    if (typeof dayEntry.day !== "number") continue;
    for (const h of dayEntry.popular_times ?? []) {
      if (h.percentage > 0 && CORE_NIGHTLIFE_HOURS.has(h.hour)) {
        if (!best || h.percentage > best.percentage) {
          best = { googleDay: dayEntry.day, hour: h.hour, percentage: h.percentage };
        }
      }
    }
  }
  if (!best) return null;
  return { ...best, dayName: DAY_NAMES_SHORT[best.googleDay] ?? "" };
}

/** Get busyness data for nightlife hours (6pm-2am) for a specific day. */
export function getNightlifeHours(
  locationId: string,
  jsDayOfWeek: number
): { hour: number; percentage: number; title: string }[] {
  const data = GOOGLE_DATA[locationId];
  if (!data?.popularTimes) return [];

  const googleDay = jsToGoogleDay(jsDayOfWeek);
  const dayData = data.popularTimes.find(
    (d) => typeof d.day === "number" && d.day === googleDay
  );
  if (!dayData?.popular_times?.length) return [];

  const hourMap = new Map(
    dayData.popular_times.map((h) => [h.hour, h])
  );

  return NIGHTLIFE_HOURS.map((hour) => {
    const h = hourMap.get(hour);
    return {
      hour,
      percentage: h?.percentage ?? 0,
      title: h?.title ?? "",
    };
  });
}
