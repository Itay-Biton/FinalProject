// viewModels/MyBusinessViewModel.ts
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Business } from '../types/business';
import BusinessApiService from '../api/services/BusinessApiService';
import { apiClient } from '../api';

/**
 * ViewModel for managing the user's business list.
 * - Fetches ONCE on mount (StrictMode-safe).
 * - Pull-to-refresh still works.
 * - "Load more" is a no-op because getMyBusinesses returns all.
 */
export function useMyBusinessViewModel() {
  // Service is stable
  const businessService = useMemo(() => new BusinessApiService(apiClient), []);

  // State
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Keep a simple pagination shape for API compatibility, but we don't actually paginate
  const [pagination, setPagination] = useState({
    offset: 0,
    limit: 20,
    hasMore: false, // single-shot fetch → no more pages
  });

  // StrictMode-safe guard to ensure single initial fetch
  const didInitRef = useRef(false);

  /**
   * Core fetcher. Stable identity (depends only on service).
   */
  const loadBusinesses = useCallback(
    async (isRefresh = false) => {
      // Treat all loads the same since this is a single-shot list
      if (isRefresh) {
        setError(null);
      }
      setLoading(true);
      setLoadingMore(false);

      try {
        const response = await businessService.getMyBusinesses();

        if (!response.success || !response.data) {
          throw new Error(response.error || 'Failed to load businesses');
        }

        const newBusinesses = response.data;
        setBusinesses(newBusinesses);

        // Since backend returns the full list, stop pagination
        setPagination(prev => ({
          ...prev,
          offset: newBusinesses.length,
          hasMore: false,
        }));
      } catch (err: any) {
        console.error('Error loading businesses:', err);
        setError(err.message || 'Failed to load businesses');
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [businessService],
  );

  /**
   * No-op: backend already returns all items.
   */
  const loadMore = useCallback(() => {
    // Intentionally empty – no further pages to load.
    // Keep the function to avoid changing the screen code.
  }, []);

  /**
   * Pull-to-refresh still works.
   */
  const refresh = useCallback(() => {
    loadBusinesses(true);
  }, [loadBusinesses]);

  /**
   * Delete a business and update local state.
   */
  const deleteBusiness = useCallback(
    async (businessId: string) => {
      setLoading(true);
      setError(null);

      try {
        const response = await businessService.deleteBusiness(businessId);

        if (!response.success) {
          throw new Error(response.error || 'Failed to delete business');
        }

        setBusinesses(prev => prev.filter(b => b._id !== businessId));
        // No pagination: nothing else to fetch here.
      } catch (err: any) {
        console.error('Error deleting business:', err);
        setError(err.message || 'Failed to delete business');
        throw err; // surface to UI for Alert
      } finally {
        setLoading(false);
      }
    },
    [businessService],
  );

  /**
   * One-time init (StrictMode-safe).
   */
  useEffect(() => {
    if (didInitRef.current) return;
    didInitRef.current = true; // lock
    loadBusinesses(true);
  }, [loadBusinesses]);

  return {
    businesses,
    loading,
    loadingMore,
    error,
    loadMore, // remains for API parity with the screen
    refresh, // pull-to-refresh
    deleteBusiness,
  };
}
