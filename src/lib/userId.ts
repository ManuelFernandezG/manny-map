/**
 * Anonymous user ID management
 * Creates a persistent user ID for tracking ratings without requiring signup
 */

const USER_ID_KEY = 'mannymap_user_id';
const RATING_COUNT_KEY = 'mannymap_rating_count';

export function getUserId(): string {
  if (typeof window === 'undefined') return '';

  try {
    let userId = localStorage.getItem(USER_ID_KEY);

    if (!userId) {
      // Generate anonymous user ID
      userId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
      localStorage.setItem(USER_ID_KEY, userId);
    }

    return userId;
  } catch (error) {
    console.error('Error getting user ID:', error);
    // Fallback to session-only ID
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
