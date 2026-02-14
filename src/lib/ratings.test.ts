import { describe, it, expect, vi, beforeEach } from 'vitest';

/**
 * These tests validate the pure aggregation logic extracted from ratings.ts.
 * We mock Firestore so tests run without a backend.
 */

// Mock Firestore
vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  addDoc: vi.fn(),
  updateDoc: vi.fn(),
  doc: vi.fn(),
  getDocs: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  serverTimestamp: vi.fn(() => new Date()),
  writeBatch: vi.fn(),
}));

vi.mock('./firebase', () => ({
  db: {},
}));

vi.mock('./userId', () => ({
  getUserId: vi.fn(() => 'test_user_123'),
}));

import { getDocs, updateDoc, doc } from 'firebase/firestore';
import { aggregateRatings } from './ratings';
import type { Rating } from './ratings';

function makeRating(ageGroup: string, pairs: { emoji: string; word: string }[]): Rating {
  return { userId: `user_${Math.random()}`, ageGroup, pairs, timestamp: new Date() };
}

function mockRatingsSnapshot(ratings: Rating[]) {
  (getDocs as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
    empty: ratings.length === 0,
    docs: ratings.map(r => ({ data: () => r })),
  });
  (doc as ReturnType<typeof vi.fn>).mockReturnValue('locationRef');
  (updateDoc as ReturnType<typeof vi.fn>).mockResolvedValueOnce(undefined);
}

describe('aggregateRatings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns early when there are no ratings', async () => {
    mockRatingsSnapshot([]);
    await aggregateRatings('loc1');
    expect(updateDoc).not.toHaveBeenCalled();
  });

  it('calculates correct dominant emoji/word from a single rating', async () => {
    const ratings = [makeRating('18-22', [{ emoji: '🔥', word: 'Lit' }])];
    mockRatingsSnapshot(ratings);

    await aggregateRatings('loc1');

    expect(updateDoc).toHaveBeenCalledWith('locationRef', expect.objectContaining({
      totalRatings: 1,
      dominantEmoji: '🔥',
      dominantWord: 'Lit',
      divergenceScore: 0,
      divergenceFlagged: false,
    }));
  });

  it('picks the most frequent pair as dominant across multiple ratings', async () => {
    const ratings = [
      makeRating('23-28', [{ emoji: '🔥', word: 'Lit' }]),
      makeRating('23-28', [{ emoji: '💀', word: 'Dead' }]),
      makeRating('23-28', [{ emoji: '🔥', word: 'Lit' }]),
      makeRating('23-28', [{ emoji: '🔥', word: 'Lit' }]),
    ];
    mockRatingsSnapshot(ratings);

    await aggregateRatings('loc1');

    expect(updateDoc).toHaveBeenCalledWith('locationRef', expect.objectContaining({
      totalRatings: 4,
      dominantEmoji: '🔥',
      dominantWord: 'Lit',
    }));
  });

  it('aggregates ratings by age group correctly', async () => {
    const ratings = [
      makeRating('18-22', [{ emoji: '🔥', word: 'Lit' }]),
      makeRating('18-22', [{ emoji: '🔥', word: 'Lit' }]),
      makeRating('36+', [{ emoji: '💀', word: 'Dead' }]),
    ];
    mockRatingsSnapshot(ratings);

    await aggregateRatings('loc1');

    const call = (updateDoc as ReturnType<typeof vi.fn>).mock.calls[0][1];
    const byAge = call.ratingsByAgeGroup;

    // 18-22 group should have 2 pairs total
    expect(byAge['18-22'].totalRatings).toBe(2);
    expect(byAge['18-22'].dominant.emoji).toBe('🔥');

    // 36+ group should have 1 pair
    expect(byAge['36+'].totalRatings).toBe(1);
    expect(byAge['36+'].dominant.emoji).toBe('💀');

    // Empty groups should have 0 ratings
    expect(byAge['23-28'].totalRatings).toBe(0);
    expect(byAge['29-35'].totalRatings).toBe(0);
  });

  it('handles multi-pair ratings correctly', async () => {
    const ratings = [
      makeRating('23-28', [
        { emoji: '🔥', word: 'Lit' },
        { emoji: '💰', word: 'Expensive' },
        { emoji: '👥', word: 'Crowded' },
      ]),
    ];
    mockRatingsSnapshot(ratings);

    await aggregateRatings('loc1');

    const call = (updateDoc as ReturnType<typeof vi.fn>).mock.calls[0][1];
    const byAge = call.ratingsByAgeGroup;
    expect(byAge['23-28'].totalRatings).toBe(3);
    expect(byAge['23-28'].topPairs).toHaveLength(3);
  });

  it('limits topPairs to 10 items', async () => {
    // Create 12 distinct pairs all in one age group
    const pairs = Array.from({ length: 12 }, (_, i) => ({
      emoji: `emoji${i}`,
      word: `word${i}`,
    }));
    const ratings = pairs.map(p => makeRating('29-35', [p]));
    mockRatingsSnapshot(ratings);

    await aggregateRatings('loc1');

    const call = (updateDoc as ReturnType<typeof vi.fn>).mock.calls[0][1];
    expect(call.ratingsByAgeGroup['29-35'].topPairs.length).toBeLessThanOrEqual(10);
  });

  it('calculates zero divergence when only one age group has ratings', async () => {
    // All in one group, even with 5+ ratings
    const ratings = Array.from({ length: 6 }, () =>
      makeRating('18-22', [{ emoji: '🔥', word: 'Lit' }])
    );
    mockRatingsSnapshot(ratings);

    await aggregateRatings('loc1');

    expect(updateDoc).toHaveBeenCalledWith('locationRef', expect.objectContaining({
      divergenceScore: 0,
      divergenceFlagged: false,
    }));
  });

  it('calculates zero divergence when groups agree on the dominant', async () => {
    // Two groups with 5+ ratings each, same dominant
    const ratings = [
      ...Array.from({ length: 5 }, () => makeRating('18-22', [{ emoji: '🔥', word: 'Lit' }])),
      ...Array.from({ length: 5 }, () => makeRating('23-28', [{ emoji: '🔥', word: 'Lit' }])),
    ];
    mockRatingsSnapshot(ratings);

    await aggregateRatings('loc1');

    expect(updateDoc).toHaveBeenCalledWith('locationRef', expect.objectContaining({
      divergenceScore: 0,
      divergenceFlagged: false,
    }));
  });

  it('flags divergence when age groups disagree', async () => {
    // Two groups with 5+ ratings each, different dominants
    const ratings = [
      ...Array.from({ length: 5 }, () => makeRating('18-22', [{ emoji: '🔥', word: 'Lit' }])),
      ...Array.from({ length: 5 }, () => makeRating('36+', [{ emoji: '💀', word: 'Dead' }])),
    ];
    mockRatingsSnapshot(ratings);

    await aggregateRatings('loc1');

    expect(updateDoc).toHaveBeenCalledWith('locationRef', expect.objectContaining({
      divergenceScore: 1,
      divergenceFlagged: true,
    }));
  });

  it('calculates partial divergence with 3 groups (2 agree, 1 differs)', async () => {
    const ratings = [
      ...Array.from({ length: 5 }, () => makeRating('18-22', [{ emoji: '🔥', word: 'Lit' }])),
      ...Array.from({ length: 5 }, () => makeRating('23-28', [{ emoji: '🔥', word: 'Lit' }])),
      ...Array.from({ length: 5 }, () => makeRating('36+', [{ emoji: '💀', word: 'Dead' }])),
    ];
    mockRatingsSnapshot(ratings);

    await aggregateRatings('loc1');

    const call = (updateDoc as ReturnType<typeof vi.fn>).mock.calls[0][1];
    // 2 unique dominants, 3 active groups → (2-1)/(3-1) = 0.5
    expect(call.divergenceScore).toBe(0.5);
    expect(call.divergenceFlagged).toBe(true);
  });

  it('ignores age groups with fewer than 5 ratings for divergence', async () => {
    const ratings = [
      ...Array.from({ length: 5 }, () => makeRating('18-22', [{ emoji: '🔥', word: 'Lit' }])),
      ...Array.from({ length: 4 }, () => makeRating('36+', [{ emoji: '💀', word: 'Dead' }])),
    ];
    mockRatingsSnapshot(ratings);

    await aggregateRatings('loc1');

    // Only 1 active group (18-22), so divergence is 0
    expect(updateDoc).toHaveBeenCalledWith('locationRef', expect.objectContaining({
      divergenceScore: 0,
      divergenceFlagged: false,
    }));
  });
});
