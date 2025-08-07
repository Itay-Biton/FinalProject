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
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());

    const endpoint = queryParams.toString()
      ? `${this.prefix}/mine?${queryParams.toString()}`
      : `${this.prefix}/mine`;

    const res = await this.apiClient.get<MyPetsListResponse>(endpoint);

    if (!res.success || !res.data) {
      return { success: false, error: res.error };
    }

    // Return the full response with pagination info
    return { success: true, data: res.data };
  }

  // ─── SEARCH PETS ────────────────────────────────────────────────────────────

  async searchPets(
    params?: PetSearchParams,
  ): Promise<ApiResponse<PetListResponse>> {
    const queryParams = new URLSearchParams();
    if (params?.species) queryParams.append('species', params.species);
    if (params?.location) queryParams.append('location', params.location);
    if (params?.radius) queryParams.append('radius', params.radius.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());
    if (params?.search) queryParams.append('search', params.search);

    const endpoint = queryParams.toString()
      ? `${this.prefix}?${queryParams.toString()}`
      : this.prefix;

    const res = await this.apiClient.get<PetListResponse>(endpoint);
    console.log(res);

    if (!res.success || !res.data) {
      return { success: false, error: res.error };
    }

    // Return the full response with pagination info
    return { success: true, data: res.data };
  }

  // ─── CREATE PET ─────────────────────────────────────────────────────────────

  async createPet(petData: CreatePetRequest): Promise<ApiResponse<Pet>> {
    const res = await this.apiClient.post<PetResponse>(this.prefix, petData);

    if (!res.success || !res.data) {
      return { success: false, error: res.error };
    }

    return { success: true, data: res.data.pet };
  }

  // ─── GET SINGLE PET ─────────────────────────────────────────────────────────

  async getPetById(petId: string): Promise<ApiResponse<Pet>> {
    const res = await this.apiClient.get<PetResponse>(
      `${this.prefix}/${petId}`,
    );

    if (!res.success || !res.data) {
      return { success: false, error: res.error };
    }

    return { success: true, data: res.data.pet };
  }

  // ─── UPDATE PET ─────────────────────────────────────────────────────────────

  async updatePet(
    petId: string,
    updateData: UpdatePetRequest,
  ): Promise<ApiResponse<Pet>> {
    const res = await this.apiClient.put<PetResponse>(
      `${this.prefix}/${petId}`,
      updateData,
    );

    if (!res.success || !res.data) {
      return { success: false, error: res.error };
    }

    return { success: true, data: res.data.pet };
  }

  // ─── DELETE PET ─────────────────────────────────────────────────────────────

  async deletePet(petId: string): Promise<ApiResponse<{ message: string }>> {
    return this.apiClient.delete<{ success: boolean; message: string }>(
      `${this.prefix}/${petId}`,
    );
  }
}

export default PetApiService;
