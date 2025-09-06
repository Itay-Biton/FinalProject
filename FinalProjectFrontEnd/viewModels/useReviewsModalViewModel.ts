// viewModels/useReviewsModalViewModel.ts
import { useCallback, useEffect, useMemo, useState } from 'react';
import { apiServices } from '../api';
import { Review } from '../types/business';

type FetchResult = {
  success: boolean;
  data?: Review[];
  error?: string;
  pagination?: {
    total: number;
    hasMore: boolean;
    limit: number;
    offset: number;
  };
};

export function useReviewsModalViewModel(businessId: string) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const [posting, setPosting] = useState(false);

  const offset = reviews.length;
  const limit = 10;

  const averageRating = useMemo(() => {
    if (reviews.length === 0) return 0;
    const total = reviews.reduce((s, r) => s + (r.rating || 0), 0);
    return Math.round((total / reviews.length) * 10) / 10;
  }, [reviews]);

  const totalCount = useMemo(() => reviews.length, [reviews]);

  const fetchPage = useCallback(
    async (reset = false) => {
      if (!businessId) return;
      try {
        if (reset) {
          setLoading(true);
          setError(null);
        } else {
          if (loadingMore || !hasMore) return;
          setLoadingMore(true);
        }

        const params = { limit, offset: reset ? 0 : offset };
        const res: FetchResult = (await apiServices.business.getBusinessReviews(
          businessId,
          params,
        )) as any;

        if (res.success && Array.isArray(res.data)) {
          const next = reset ? res.data : [...reviews, ...res.data];
          setReviews(next);
          setHasMore(Boolean(res.pagination?.hasMore));
        } else {
          setError(res.error || 'Failed to load reviews');
        }
      } catch (e: any) {
        setError(e?.message || 'Failed to load reviews');
      } finally {
        setLoading(false);
        setLoadingMore(false);
        setRefreshing(false);
      }
    },
    [businessId, hasMore, limit, loadingMore, offset, reviews],
  );

  useEffect(() => {
    if (businessId) {
      setReviews([]);
      setError(null);
      setHasMore(true);
      fetchPage(true);
    }
  }, [businessId]); // eslint-disable-line react-hooks/exhaustive-deps

  const refresh = useCallback(() => {
    setRefreshing(true);
    fetchPage(true);
  }, [fetchPage]);

  const loadMore = useCallback(() => {
    if (!loading && !loadingMore && hasMore) fetchPage(false);
  }, [fetchPage, hasMore, loading, loadingMore]);

  const submitReview = useCallback(
    async (rating: number, comment?: string) => {
      if (!businessId || !rating || posting)
        return { success: false, error: 'invalid' };
      try {
        setPosting(true);
        const res = await apiServices.business.createReview(businessId, {
          rating,
          comment: comment || undefined,
        });
        if (!res.success || !res.data) {
          throw new Error(res.error || 'Failed to submit review');
        }

        // Optimistic prepend
        const newReview: Review = res.data;
        setReviews(prev => [newReview, ...prev]);
        return { success: true };
      } catch (e: any) {
        return {
          success: false,
          error: e?.message || 'Failed to submit review',
        };
      } finally {
        setPosting(false);
      }
    },
    [businessId, posting],
  );

  return {
    // data
    reviews,
    averageRating,
    totalCount,
    hasMore,

    // states
    loading,
    loadingMore,
    refreshing,
    posting,
    error,

    // actions
    refresh,
    loadMore,
    submitReview,
    reload: () => fetchPage(true),
  };
}
