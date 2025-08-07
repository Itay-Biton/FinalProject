// services/UserApiService.ts
import ApiClient, { ApiResponse } from '../ApiClient';
import {
  CreateServerUserRequest,
  CreateServerUserResponse,
  ServerUser,
  VerifyUserRequest,
  LoginResponse,
  GetUserResponse,
} from '../../types/user';

class UserApiService {
  private apiClient: ApiClient;
  private prefix = '/users';

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
  }

  // ─── AUTHENTICATION ────────────────────────────────────────────────────────

  async registerUser(
    userData: CreateServerUserRequest,
  ): Promise<ApiResponse<CreateServerUserResponse['user']>> {
    const res = await this.apiClient.post<CreateServerUserResponse>(
      `${this.prefix}/auth/register`,
      userData,
    );

    if (!res.success || !res.data) {
      return { success: false, error: res.error };
    }

    return { success: true, data: res.data.user };
  }

  async loginUser(credentials: {
    email: string;
    password: string;
  }): Promise<ApiResponse<LoginResponse>> {
    return this.apiClient.post<LoginResponse>(
      `${this.prefix}/auth/login`,
      credentials,
    );
  }

  async verifyUser(
    params: VerifyUserRequest,
  ): Promise<ApiResponse<CreateServerUserResponse['user']>> {
    const res = await this.apiClient.post<CreateServerUserResponse>(
      `${this.prefix}/auth/verify`,
      params,
    );

    if (!res.success || !res.data) {
      return { success: false, error: res.error };
    }

    return { success: true, data: res.data.user };
  }

  // ─── CURRENT USER ("me") ───────────────────────────────────────────────────

  async getCurrentUser(): Promise<ApiResponse<ServerUser>> {
    const res = await this.apiClient.get<GetUserResponse>(`${this.prefix}/me`);

    if (!res.success || !res.data) {
      return { success: false, error: res.error };
    }

    return { success: true, data: res.data.user };
  }

  async updateUserProfile(
    update: Partial<ServerUser>,
  ): Promise<ApiResponse<ServerUser>> {
    const res = await this.apiClient.put<GetUserResponse>(
      `${this.prefix}/me`,
      update,
    );

    if (!res.success || !res.data) {
      return { success: false, error: res.error };
    }

    return { success: true, data: res.data.user };
  }

  // ─── USER BY ID (ADMIN) ─────────────────────────────────────────────────────

  async getUserById(userId: string): Promise<ApiResponse<ServerUser>> {
    const res = await this.apiClient.get<GetUserResponse>(
      `${this.prefix}/${userId}`,
    );

    if (!res.success || !res.data) {
      return { success: false, error: res.error };
    }

    return { success: true, data: res.data.user };
  }
}

export default UserApiService;
