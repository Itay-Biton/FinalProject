// services/BusinessApiService.ts
import ApiClient, { ApiResponse } from '../ApiClient';
import {
  Business,
  BusinessListResponse,
  BusinessResponse,
  MyBusinessesResponse,
  CreateBusinessRequest,
  UpdateBusinessRequest,
  BusinessSearchParams,
  Review,
  ReviewListResponse,
  ReviewResponse,
  CreateReviewRequest,
  UpdateReviewRequest,
} from '../../types/business';

class BusinessApiService {
  private apiClient: ApiClient;
  private prefix = '/businesses';

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
  }

  // ─── BUSINESS MANAGEMENT ────────────────────────────────────────────────────

  async searchBusinesses(
    params?: BusinessSearchParams,
  ): Promise<ApiResponse<BusinessListResponse>> {
    const queryParams = new URLSearchParams();
    if (params?.serviceType)
      queryParams.append('serviceType', params.serviceType);
    if (params?.location) queryParams.append('location', params.location);
    if (params?.radius) queryParams.append('radius', params.radius.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.isOpen !== undefined)
      queryParams.append('isOpen', params.isOpen.toString());

    const endpoint = queryParams.toString()
      ? `${this.prefix}?${queryParams.toString()}`
      : this.prefix;

    const res = await this.apiClient.get<BusinessListResponse>(endpoint);

    if (!res.success || !res.data) {
      return { success: false, error: res.error };
    }

    // Return the full response with pagination info
    return { success: true, data: res.data };
  }

  async getMyBusinesses(): Promise<ApiResponse<Business[]>> {
    const res = await this.apiClient.get<MyBusinessesResponse>(
      `${this.prefix}/me`,
    );

    if (!res.success || !res.data) {
      return { success: false, error: res.error };
    }

    return { success: true, data: res.data.businesses };
  }

  async createBusiness(
    businessData: CreateBusinessRequest,
  ): Promise<ApiResponse<Business>> {
    const res = await this.apiClient.post<BusinessResponse>(
      this.prefix,
      businessData,
    );

    if (!res.success || !res.data) {
      return { success: false, error: res.error };
    }

    return { success: true, data: res.data.business };
  }

  async getBusinessById(businessId: string): Promise<ApiResponse<Business>> {
    const res = await this.apiClient.get<BusinessResponse>(
      `${this.prefix}/${businessId}`,
    );

    if (!res.success || !res.data) {
      return { success: false, error: res.error };
    }

    return { success: true, data: res.data.business };
  }

  async updateBusiness(
    businessId: string,
    updateData: UpdateBusinessRequest,
  ): Promise<ApiResponse<Business>> {
    const res = await this.apiClient.put<BusinessResponse>(
      `${this.prefix}/${businessId}`,
      updateData,
    );

    if (!res.success || !res.data) {
      return { success: false, error: res.error };
    }

    return { success: true, data: res.data.business };
  }

  async deleteBusiness(
    businessId: string,
  ): Promise<ApiResponse<{ message: string }>> {
    return this.apiClient.delete<{ success: boolean; message: string }>(
      `${this.prefix}/${businessId}`,
    );
  }

  // ─── REVIEWS MANAGEMENT ─────────────────────────────────────────────────────

  async getBusinessReviews(
    businessId: string,
    params?: { limit?: number; offset?: number },
  ): Promise<ApiResponse<Review[]>> {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());

    const endpoint = queryParams.toString()
      ? `${this.prefix}/${businessId}/reviews?${queryParams.toString()}`
      : `${this.prefix}/${businessId}/reviews`;

    const res = await this.apiClient.get<ReviewListResponse>(endpoint);

    if (!res.success || !res.data) {
      return { success: false, error: res.error };
    }

    return { success: true, data: res.data.reviews };
  }

  async createReview(
    businessId: string,
    reviewData: CreateReviewRequest,
  ): Promise<ApiResponse<Review>> {
    const res = await this.apiClient.post<ReviewResponse>(
      `${this.prefix}/${businessId}/reviews`,
      reviewData,
    );

    if (!res.success || !res.data) {
      return { success: false, error: res.error };
    }

    return { success: true, data: res.data.review };
  }

  async updateReview(
    businessId: string,
    reviewId: string,
    updateData: UpdateReviewRequest,
  ): Promise<ApiResponse<Review>> {
    const res = await this.apiClient.put<ReviewResponse>(
      `${this.prefix}/${businessId}/reviews/${reviewId}`,
      updateData,
    );

    if (!res.success || !res.data) {
      return { success: false, error: res.error };
    }

    return { success: true, data: res.data.review };
  }

  async deleteReview(
    businessId: string,
    reviewId: string,
  ): Promise<ApiResponse<{ message: string }>> {
    return this.apiClient.delete<{ success: boolean; message: string }>(
      `${this.prefix}/${businessId}/reviews/${reviewId}`,
    );
  }
}

export default BusinessApiService;
