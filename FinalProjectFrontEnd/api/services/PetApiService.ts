// services/PetApiService.ts
import ApiClient, { ApiResponse } from '../ApiClient';
import {
  Pet,
  MyPetEntry,
  PetListResponse,
  MyPetsListResponse,
  PetResponse,
  CreatePetRequest,
  UpdatePetRequest,
  PetSearchParams,
} from '../../types/pet';

class PetApiService {
  private apiClient: ApiClient;
  private prefix = '/pets';

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
  }

  // ─── MY PETS ────────────────────────────────────────────────────────────────
  async getMyPets(params?: {
    limit?: number;
    offset?: number;
  }): Promise<ApiResponse<MyPetsListResponse>> {
    const queryParams = new URLSearchParams();
    if (params?.limit != null)
      queryParams.append('limit', String(params.limit));
    if (params?.offset != null)
      queryParams.append('offset', String(params.offset));

    const endpoint = queryParams.toString()
      ? `${this.prefix}/mine?${queryParams.toString()}`
      : `${this.prefix}/mine`;

    const res = await this.apiClient.get<MyPetsListResponse>(endpoint);
    if (!res.success || !res.data) return { success: false, error: res.error };
    return { success: true, data: res.data };
  }

  // ─── SEARCH PETS ────────────────────────────────────────────────────────────
  async searchPets(
    params?: PetSearchParams,
  ): Promise<ApiResponse<PetListResponse>> {
    const queryParams = new URLSearchParams();
    if (params?.species) queryParams.append('species', params.species);
    if (params?.location) queryParams.append('location', params.location);
    if (params?.radius != null)
      queryParams.append('radius', String(params.radius));
    if (params?.limit != null)
      queryParams.append('limit', String(params.limit));
    if (params?.offset != null)
      queryParams.append('offset', String(params.offset));
    if (params?.search) queryParams.append('search', params.search);

    const endpoint = queryParams.toString()
      ? `${this.prefix}?${queryParams.toString()}`
      : this.prefix;
    const res = await this.apiClient.get<PetListResponse>(endpoint);
    if (!res.success || !res.data) return { success: false, error: res.error };
    return { success: true, data: res.data };
  }

  // ─── CREATE PET ─────────────────────────────────────────────────────────────
  async createPet(petData: CreatePetRequest): Promise<ApiResponse<Pet>> {
    const res = await this.apiClient.post<PetResponse>(this.prefix, petData);
    if (!res.success || !res.data) return { success: false, error: res.error };
    return { success: true, data: res.data.pet };
  }

  // ─── GET SINGLE PET ─────────────────────────────────────────────────────────
  async getPetById(petId: string): Promise<ApiResponse<Pet>> {
    const res = await this.apiClient.get<PetResponse>(
      `${this.prefix}/${petId}`,
    );
    if (!res.success || !res.data) return { success: false, error: res.error };
    return { success: true, data: res.data.pet };
  }

  // ─── UPDATE PET ─────────────────────────────────────────────────────────────
  async updatePet(
    petId: string,
    updateData: UpdatePetRequest,
  ): Promise<ApiResponse<Pet>> {
    // server expects top-level address/lat/lng when updating location,
    // and `lostDetails` object (which may include phoneNumbers) for lost info.
    const res = await this.apiClient.put<PetResponse>(
      `${this.prefix}/${petId}`,
      updateData,
    );
    if (!res.success || !res.data) return { success: false, error: res.error };
    return { success: true, data: res.data.pet };
  }
  // ─── FOUND PET ─────────────────────────────────────────────────────────────
  async foundMyPet(
    // just update the isLost=false
    petId: string,
    updateData: UpdatePetRequest,
  ): Promise<ApiResponse<Pet>> {
    // server expects top-level address/lat/lng when updating location,
    // and `lostDetails` object (which may include phoneNumbers) for lost info.
    const res = await this.apiClient.put<PetResponse>(
      `${this.prefix}/${petId}`,
      updateData,
    );
    if (!res.success || !res.data) return { success: false, error: res.error };
    return { success: true, data: res.data.pet };
  }

  // ─── DELETE PET ─────────────────────────────────────────────────────────────
  async deletePet(petId: string): Promise<ApiResponse<{ message: string }>> {
    return this.apiClient.delete<{ success: boolean; message: string }>(
      `${this.prefix}/${petId}`,
    );
  }

  // ─── MATCHING PETS ──────────────────────────────────────────────────────────
  async findMatches(foundPetData: Partial<Pet>): Promise<ApiResponse<any>> {
    return this.apiClient.post('/pets/match', foundPetData);
  }

  async getMyMatches(): Promise<ApiResponse<any>> {
    return this.apiClient.get('/pets/matches');
  }

  async confirmMatch(
    petId: string,
    matchedPetId: string,
  ): Promise<ApiResponse<{ message: string }>> {
    return this.apiClient.post<{ message: string }>(
      `/pets/${petId}/confirm-match`,
      { matchedPetId },
    );
  }
}

export default PetApiService;
