// services/LostPetApiService.ts
import ApiClient, { ApiResponse } from '../ApiClient';
import {
  LostPetEntry,
  LostPetListResponse,
  LostPetResponse,
  ReportLostPetRequest,
  UpdateLostPetStatusRequest,
  LostPetSearchParams,
  FoundPetMatchRequest,
  PetMatchResult,
  PetMatchResponse,
} from '../../types/lostPet';

class LostPetApiService {
  private apiClient: ApiClient;
  private prefix = '/lost';

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
  }

  // ─── REPORT LOST PET ────────────────────────────────────────────────────────

  async reportLostPet(
    reportData: ReportLostPetRequest,
  ): Promise<ApiResponse<LostPetEntry>> {
    const res = await this.apiClient.post<LostPetResponse>(
      this.prefix,
      reportData,
    );

    if (!res.success || !res.data) {
      return { success: false, error: res.error };
    }

    return { success: true, data: res.data.lostPet };
  }

  // ─── SEARCH LOST PETS ───────────────────────────────────────────────────────

  async searchLostPets(
    params?: LostPetSearchParams,
  ): Promise<ApiResponse<LostPetEntry[]>> {
    const queryParams = new URLSearchParams();
    if (params?.location) queryParams.append('location', params.location);
    if (params?.radius) queryParams.append('radius', params.radius.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());
    if (params?.status) queryParams.append('status', params.status);

    const endpoint = queryParams.toString()
      ? `${this.prefix}?${queryParams.toString()}`
      : this.prefix;

    const res = await this.apiClient.get<LostPetListResponse>(endpoint);

    if (!res.success || !res.data) {
      return { success: false, error: res.error };
    }

    return { success: true, data: res.data.lostPets };
  }

  // ─── UPDATE LOST PET STATUS ─────────────────────────────────────────────────

  async updateLostPetStatus(
    lostPetId: string,
    statusData: UpdateLostPetStatusRequest,
  ): Promise<ApiResponse<LostPetEntry>> {
    const res = await this.apiClient.put<LostPetResponse>(
      `${this.prefix}/${lostPetId}/status`,
      statusData,
    );

    if (!res.success || !res.data) {
      return { success: false, error: res.error };
    }

    return { success: true, data: res.data.lostPet };
  }

  // ─── FIND POTENTIAL MATCHES FOR FOUND PET ──────────────────────────────────

  async findPetMatches(
    foundPetData: FoundPetMatchRequest,
  ): Promise<ApiResponse<PetMatchResult[]>> {
    const res = await this.apiClient.post<PetMatchResponse>(
      '/lost-pets/match', // Note: backend uses this endpoint
      foundPetData,
    );

    if (!res.success || !res.data) {
      return { success: false, error: res.error };
    }

    return { success: true, data: res.data.matches };
  }
}

export default LostPetApiService;
