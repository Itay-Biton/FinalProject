// services/ActivityApiService.ts
import ApiClient, { ApiResponse } from '../ApiClient';
import {
  ActivityEntry,
  ActivityListResponse,
  ActivityResponse,
  CreateActivityRequest,
  UpdateActivityRequest,
  ActivitySearchParams,
  DeleteActivityResponse,
} from '../../types/activity';

class ActivityApiService {
  private apiClient: ApiClient;
  private prefix = '/activities';

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
  }

  // ─── ACTIVITY MANAGEMENT ───────────────────────────────────────────────────

  /**
   * Get all activities for the current user with optional filters
   */
  async getActivities(
    params?: ActivitySearchParams,
  ): Promise<ApiResponse<ActivityEntry[]>> {
    const queryParams = new URLSearchParams();

    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());
    if (params?.activityType)
      queryParams.append('activityType', params.activityType);
    if (params?.dateFrom) queryParams.append('dateFrom', params.dateFrom);
    if (params?.dateTo) queryParams.append('dateTo', params.dateTo);

    const endpoint = queryParams.toString()
      ? `${this.prefix}?${queryParams.toString()}`
      : this.prefix;

    const res = await this.apiClient.get<ActivityListResponse>(endpoint);

    if (!res.success || !res.data) {
      return { success: false, error: res.error };
    }

    // Return the activities array along with pagination info in the response
    return {
      success: true,
      data: res.data.activities,
      // Include pagination info for the caller to access if needed
      ...(res.data.pagination && { pagination: res.data.pagination }),
    };
  }

  /**
   * Get activities with full response including pagination
   */
  async getActivitiesWithPagination(
    params?: ActivitySearchParams,
  ): Promise<ApiResponse<ActivityListResponse>> {
    const queryParams = new URLSearchParams();

    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());
    if (params?.activityType)
      queryParams.append('activityType', params.activityType);
    if (params?.dateFrom) queryParams.append('dateFrom', params.dateFrom);
    if (params?.dateTo) queryParams.append('dateTo', params.dateTo);

    const endpoint = queryParams.toString()
      ? `${this.prefix}?${queryParams.toString()}`
      : this.prefix;

    const res = await this.apiClient.get<ActivityListResponse>(endpoint);

    if (!res.success || !res.data) {
      return { success: false, error: res.error };
    }

    return { success: true, data: res.data };
  }

  /**
   * Create a new activity
   */
  async createActivity(
    activityData: CreateActivityRequest,
  ): Promise<ApiResponse<ActivityEntry>> {
    const res = await this.apiClient.post<ActivityResponse>(
      this.prefix,
      activityData,
    );

    if (!res.success || !res.data) {
      return { success: false, error: res.error };
    }

    return { success: true, data: res.data.activity };
  }

  /**
   * Get a single activity by ID
   */
  async getActivityById(
    activityId: string,
  ): Promise<ApiResponse<ActivityEntry>> {
    const res = await this.apiClient.get<ActivityResponse>(
      `${this.prefix}/${activityId}`,
    );

    if (!res.success || !res.data) {
      return { success: false, error: res.error };
    }

    return { success: true, data: res.data.activity };
  }

  /**
   * Update an existing activity
   */
  async updateActivity(
    activityId: string,
    updateData: UpdateActivityRequest,
  ): Promise<ApiResponse<ActivityEntry>> {
    const res = await this.apiClient.put<ActivityResponse>(
      `${this.prefix}/${activityId}`,
      updateData,
    );

    if (!res.success || !res.data) {
      return { success: false, error: res.error };
    }

    return { success: true, data: res.data.activity };
  }

  /**
   * Delete an activity
   */
  async deleteActivity(
    activityId: string,
  ): Promise<ApiResponse<{ message: string }>> {
    return this.apiClient.delete<DeleteActivityResponse>(
      `${this.prefix}/${activityId}`,
    );
  }

  // ─── CONVENIENCE METHODS ───────────────────────────────────────────────────

  /**
   * Get recent activities (last 50 by default)
   */
  async getRecentActivities(
    limit: number = 50,
  ): Promise<ApiResponse<ActivityEntry[]>> {
    return this.getActivities({ limit, offset: 0 });
  }

  /**
   * Get activities by type
   */
  async getActivitiesByType(
    activityType: string,
    params?: Omit<ActivitySearchParams, 'activityType'>,
  ): Promise<ApiResponse<ActivityEntry[]>> {
    return this.getActivities({ ...params, activityType });
  }

  /**
   * Get activities for a date range
   */
  async getActivitiesInDateRange(
    dateFrom: string,
    dateTo: string,
    params?: Omit<ActivitySearchParams, 'dateFrom' | 'dateTo'>,
  ): Promise<ApiResponse<ActivityEntry[]>> {
    return this.getActivities({ ...params, dateFrom, dateTo });
  }

  /**
   * Get activities for today (based on DD/MM/YYYY format)
   */
  async getTodaysActivities(): Promise<ApiResponse<ActivityEntry[]>> {
    const today = new Date();
    const todayString = `${today.getDate().toString().padStart(2, '0')}/${(
      today.getMonth() + 1
    )
      .toString()
      .padStart(2, '0')}/${today.getFullYear()}`;

    return this.getActivitiesInDateRange(todayString, todayString);
  }
}

export default ActivityApiService;
