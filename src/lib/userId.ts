/**
 * User ID management
 * Uses Firebase Auth UID when signed in, falls back to anonymous localStorage ID
 */

import { auth } from './firebase';

const USER_ID_KEY = 'mannymap_user_id';
const RATING_COUNT_KEY = 'mannymap_rating_count';
const RATED_LOCATIONS_KEY = 'mannymap_rated_locations';

export function getUserId(): string {
  // Prefer Firebase Auth UID (0 Firestore cost)
  const firebaseUser = auth.currentUser;
  if (firebaseUser) return firebaseUser.uid;

  if (typeof window === 'undefined') return '';

  try {
    let userId = localStorage.getItem(USER_ID_KEY);

    if (!userId) {
      // Generate anonymous user ID as fallback
      userId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
      localStorage.setItem(USER_ID_KEY, userId);
    }

    return userId;
  } catch (error) {
    console.error('Error getting user ID:', error);
    return `session_${Date.now()}`;
  }
}

export function getRatingCount(): number {
  if (typeof window === 'undefined') return 0;

  try {
    const count = localStorage.getItem(RATING_COUNT_KEY);
    return count ? parseInt(count, 10) : 0;
  } catch {
    return 0;
  }
}

export function incrementRatingCount(): number {
  if (typeof window === 'undefined') return 0;

  try {
    const currentCount = getRatingCount();
    const newCount = currentCount + 1;
    localStorage.setItem(RATING_COUNT_KEY, newCount.toString());
    return newCount;
  } catch {
    return 0;
  }
}

export function resetRatingCount(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(RATING_COUNT_KEY);
  } catch (error) {
    console.error('Error resetting rating count:', error);
  }
}

export interface RatedEntry {
  emoji: string;
  positive: boolean;
  ratedAt: number; // epoch ms
  phase: "checkin" | "reviewed";
}

export function getRatedLocationIds(): Map<string, RatedEntry> {
  if (typeof window === 'undefined') return new Map();

  try {
    const raw = localStorage.getItem(RATED_LOCATIONS_KEY);
    if (!raw) return new Map();
    const parsed = JSON.parse(raw);

    // Backward compat: old format was ["id1", "id2"]
    if (Array.isArray(parsed)) {
      const map = new Map<string, RatedEntry>();
      for (const id of parsed) map.set(id, { emoji: '', positive: true, ratedAt: 0, phase: "reviewed" });
      return map;
    }

    // Backward compat: v2 format was {"id1": "🍕"}, v3 had no phase
    const map = new Map<string, RatedEntry>();
    for (const [id, val] of Object.entries(parsed)) {
      if (typeof val === 'string') {
        map.set(id, { emoji: val, positive: true, ratedAt: 0, phase: "reviewed" });
      } else {
        const entry = val as RatedEntry;
        if (!entry.phase) entry.phase = "reviewed";
        map.set(id, entry);
      }
    }
    return map;
  } catch {
    return new Map();
  }
}

function saveRatedLocations(map: Map<string, RatedEntry>): void {
  const obj: Record<string, RatedEntry> = {};
  map.forEach((v, k) => { obj[k] = v; });
  localStorage.setItem(RATED_LOCATIONS_KEY, JSON.stringify(obj));
}

export function addCheckinLocationId(locationId: string): void {
  if (typeof window === 'undefined') return;
  try {
    const map = getRatedLocationIds();
    map.set(locationId, { emoji: '', positive: true, ratedAt: Date.now(), phase: "checkin" });
    saveRatedLocations(map);
  } catch {}
}

export function addRatedLocationId(locationId: string, emoji: string, positive: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    const map = getRatedLocationIds();
    map.set(locationId, { emoji, positive, ratedAt: Date.now(), phase: "reviewed" });
    saveRatedLocations(map);
  } catch {}
}
