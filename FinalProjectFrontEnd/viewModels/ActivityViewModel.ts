// viewModels/ActivityViewModel.ts
import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  ActivityEntry,
  ActivityListResponse,
  CreateActivityRequest,
  UpdateActivityRequest,
  ActivitySearchParams,
} from '../types/activity';
import ActivityApiService from '../api/services/ActivityApiService';
import { apiClient } from '../api';

/**
 * ViewModel for managing pet activities
 * Handles all business logic for the Activity screen
 */
export function useActivityViewModel() {
  // Memoize the service to prevent unnecessary re-creation
  const activityService = useMemo(() => new ActivityApiService(apiClient), []);

  // State management
  const [activities, setActivities] = useState<ActivityEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null); // ID of activity being deleted
  const [pagination, setPagination] = useState({
    offset: 0,
    limit: 20,
    hasMore: true,
    total: 0,
  });

  /**
   * Load activities for the first time or refresh
   */
  const loadActivities = useCallback(
    async (isRefresh = false, params?: ActivitySearchParams) => {
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
        const currentOffset = isRefresh ? 0 : pagination.offset;

        const searchParams: ActivitySearchParams = {
          limit: pagination.limit,
          offset: currentOffset,
          ...params,
        };

        // Call API service to get activities with pagination info
        const response = await activityService.getActivitiesWithPagination(
          searchParams,
        );

        if (!response.success || !response.data) {
          throw new Error(response.error || 'Failed to load activities');
        }

        const { activities: newActivities, pagination: newPagination } =
          response.data;

        if (isRefresh || currentOffset === 0) {
          setActivities(newActivities);
        } else {
          setActivities(prev => [...prev, ...newActivities]);
        }

        setPagination({
          offset: newPagination.offset + newPagination.limit,
          limit: pagination.limit,
          hasMore: newPagination.hasMore,
          total: newPagination.total,
        });
      } catch (err: any) {
        console.error('Error loading activities:', err);
        setError(err.message || 'Failed to load activities');
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [pagination.offset, pagination.limit, activityService],
  );

  /**
   * Load more activities (pagination)
   */
  const loadMore = useCallback(() => {
    if (!loadingMore && !loading && pagination.hasMore) {
      loadActivities(false);
    }
  }, [loadActivities, loadingMore, loading, pagination.hasMore]);

  /**
   * Refresh the activities list
   */
  const refresh = useCallback(() => {
    loadActivities(true);
  }, [loadActivities]);

  /**
   * Create a new activity
   */
  const createActivity = useCallback(
    async (activityData: CreateActivityRequest): Promise<ActivityEntry> => {
      setSaving(true);
      setError(null);

      try {
        const response = await activityService.createActivity(activityData);

        if (!response.success || !response.data) {
          throw new Error(response.error || 'Failed to create activity');
        }

        // Add the new activity to the beginning of the list
        setActivities(prev => [response.data!, ...prev]);

        // Update total count
        setPagination(prev => ({ ...prev, total: prev.total + 1 }));

        return response.data;
      } catch (err: any) {
        console.error('Error creating activity:', err);
        setError(err.message || 'Failed to create activity');
        throw err; // Re-throw so the component can handle it
      } finally {
        setSaving(false);
      }
    },
    [activityService],
  );

  /**
   * Update an existing activity
   */
  const updateActivity = useCallback(
    async (
      activityId: string,
      updateData: UpdateActivityRequest,
    ): Promise<ActivityEntry> => {
      setSaving(true);
      setError(null);

      try {
        const response = await activityService.updateActivity(
          activityId,
          updateData,
        );

        if (!response.success || !response.data) {
          throw new Error(response.error || 'Failed to update activity');
        }

        // Update the activity in the local state
        setActivities(prev =>
          prev.map(activity =>
            activity._id === activityId ? response.data! : activity,
          ),
        );

        return response.data;
      } catch (err: any) {
        console.error('Error updating activity:', err);
        setError(err.message || 'Failed to update activity');
        throw err; // Re-throw so the component can handle it
      } finally {
        setSaving(false);
      }
    },
    [activityService],
  );

  /**
   * Delete an activity
   */
  const deleteActivity = useCallback(
    async (activityId: string): Promise<void> => {
      setDeleting(activityId);
      setError(null);

      try {
        const response = await activityService.deleteActivity(activityId);

        if (!response.success) {
          throw new Error(response.error || 'Failed to delete activity');
        }

        // Remove the activity from local state
        setActivities(prev =>
          prev.filter(activity => activity._id !== activityId),
        );

        // Update total count
        setPagination(prev => ({
          ...prev,
          total: Math.max(0, prev.total - 1),
        }));

        // If we removed the last activity on current page and there are more, try loading more
        if (activities.length <= 1 && pagination.hasMore) {
          await loadActivities(false);
        }
      } catch (err: any) {
        console.error('Error deleting activity:', err);
        setError(err.message || 'Failed to delete activity');
        throw err; // Re-throw so the component can handle it
      } finally {
        setDeleting(null);
      }
    },
    [activityService, activities.length, pagination.hasMore, loadActivities],
  );

  /**
   * Get activities by type
   */
  const loadActivitiesByType = useCallback(
    async (activityType: string) => {
      loadActivities(true, { activityType });
    },
    [loadActivities],
  );

  /**
   * Get activities for date range
   */
  const loadActivitiesInDateRange = useCallback(
    async (dateFrom: string, dateTo: string) => {
      loadActivities(true, { dateFrom, dateTo });
    },
    [loadActivities],
  );

  /**
   * Get today's activities
   */
  const loadTodaysActivities = useCallback(async () => {
    const today = new Date();
    const todayString = `${today.getDate().toString().padStart(2, '0')}/${(
      today.getMonth() + 1
    )
      .toString()
      .padStart(2, '0')}/${today.getFullYear()}`;

    loadActivitiesInDateRange(todayString, todayString);
  }, [loadActivitiesInDateRange]);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Save activity (create or update based on whether it has an ID)
   */
  const saveActivity = useCallback(
    async (
      activityData: CreateActivityRequest,
      editingId?: string,
    ): Promise<ActivityEntry> => {
      if (editingId) {
        return updateActivity(editingId, activityData);
      } else {
        return createActivity(activityData);
      }
    },
    [createActivity, updateActivity],
  );

  /**
   * Group activities by date for UI display
   */
  const groupedActivities = useMemo(() => {
    const grouped: { [date: string]: ActivityEntry[] } = {};

    activities.forEach(activity => {
      if (!grouped[activity.date]) {
        grouped[activity.date] = [];
      }
      grouped[activity.date].push(activity);
    });

    // Sort activities within each date by time (newest first)
    Object.keys(grouped).forEach(date => {
      grouped[date].sort((a, b) => {
        const timeA = a.time.split(':').map(Number);
        const timeB = b.time.split(':').map(Number);
        return timeB[0] * 60 + timeB[1] - (timeA[0] * 60 + timeA[1]);
      });
    });

    // Sort dates (newest first)
    const sortedDates = Object.keys(grouped).sort(
      (a, b) =>
        new Date(b.split('/').reverse().join('-')).getTime() -
        new Date(a.split('/').reverse().join('-')).getTime(),
    );

    const sortedGrouped: { [date: string]: ActivityEntry[] } = {};
    sortedDates.forEach(date => {
      sortedGrouped[date] = grouped[date];
    });

    return sortedGrouped;
  }, [activities]);

  /**
   * Initialize - load activities on mount
   */
  useEffect(() => {
    loadActivities(true);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    // State
    activities,
    groupedActivities,
    loading,
    loadingMore,
    saving,
    deleting,
    error,
    pagination,

    // Actions
    loadActivities,
    loadMore,
    refresh,
    createActivity,
    updateActivity,
    deleteActivity,
    saveActivity,
    loadActivitiesByType,
    loadActivitiesInDateRange,
    loadTodaysActivities,
    clearError,

    // Computed values
    hasActivities: activities.length > 0,
    totalActivities: pagination.total,
  };
}
