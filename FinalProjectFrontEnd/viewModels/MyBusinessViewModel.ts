// viewModels/MyBusinessViewModel.ts
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Business, BusinessListResponse } from '../types/business';
import BusinessApiService from '../api/services/BusinessApiService';
import { apiClient } from '../api';

/**
 * ViewModel for managing the user's business list
 * Works with the Business types for "My Businesses" screen
 */
export function useMyBusinessViewModel() {
  // Memoize the service to prevent unnecessary re-creation
  const businessService = useMemo(() => new BusinessApiService(apiClient), []);

  // State - using Business[] since this is for "My Businesses" screen
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    offset: 0,
    limit: 20,
    hasMore: true,
  });

  /**
   * Load businesses for the first time or refresh
   */
  const loadBusinesses = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) {
        setLoading(true);
        setPagination(prev => ({ ...prev, offset: 0, hasMore: true }));
      } else if (!isRefresh && pagination.offset === 0) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      setError(null);

      try {
        // Call your API service to get my businesses
        const response = await businessService.getMyBusinesses();

        if (!response.success || !response.data) {
          throw new Error(response.error || 'Failed to load businesses');
        }

        const newBusinesses = response.data;

        if (isRefresh || pagination.offset === 0) {
          setBusinesses(newBusinesses);
        } else {
          setBusinesses(prev => [...prev, ...newBusinesses]);
        }

        // For getMyBusinesses, we don't have pagination info from the API
        // So we'll assume no more data if we get less than the limit
        setPagination({
          offset: pagination.offset + newBusinesses.length,
          limit: pagination.limit,
          hasMore: newBusinesses.length >= pagination.limit,
        });
      } catch (err: any) {
        console.error('Error loading businesses:', err);
        setError(err.message || 'Failed to load businesses');
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [pagination.offset, pagination.limit, businessService],
  );

  /**
   * Load more businesses (pagination) - not used for getMyBusinesses but kept for consistency
   */
  const loadMore = useCallback(() => {
    if (!loadingMore && !loading && pagination.hasMore) {
      loadBusinesses(false);
    }
  }, [loadBusinesses, loadingMore, loading, pagination.hasMore]);

  /**
   * Refresh the businesses list
   */
  const refresh = useCallback(() => {
    loadBusinesses(true);
  }, [loadBusinesses]);

  /**
   * Delete a business
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

        // Remove the business from local state
        setBusinesses(prev =>
          prev.filter(business => business._id !== businessId),
        );

        // If we removed the last business on current page, try loading more
        if (businesses.length <= 1 && pagination.hasMore) {
          await loadBusinesses(false);
        }
      } catch (err: any) {
        console.error('Error deleting business:', err);
        setError(err.message || 'Failed to delete business');
        throw err; // Re-throw so the component can handle it
      } finally {
        setLoading(false);
      }
    },
    [businessService, businesses.length, pagination.hasMore, loadBusinesses],
  );

  /**
   * Initialize - load businesses on mount
   */
  useEffect(() => {
    loadBusinesses(true);
  }, [loadBusinesses]); // Only run once on mount

  return {
    businesses,
    loading,
    loadingMore,
    error,
    loadMore,
    refresh,
    deleteBusiness,
  };
}
