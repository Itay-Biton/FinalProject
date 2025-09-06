// services/UploadApiService.ts
import { Platform } from 'react-native';
import ApiClient, { ApiResponse } from '../ApiClient';
import {
  UploadImageRequest,
  UploadImageResponse,
  DeleteImageRequest,
  DeleteImageResponse,
} from '../../types/upload';
import { ensureFileReady } from '../../utils/ensureFileReady';

class UploadApiService {
  private apiClient: ApiClient;
  private prefix = '/upload';

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
  }

  // ─── UPLOAD IMAGE ───────────────────────────────────────────────────────────

  async uploadImage(
    uploadData: UploadImageRequest,
  ): Promise<ApiResponse<UploadImageResponse>> {
    // Create FormData
    const formData = new FormData();

    // Normalize the URI per platform
    const normalizedUri =
      Platform.OS === 'android'
        ? uploadData.file.uri.startsWith('file://')
          ? uploadData.file.uri
          : `file://${uploadData.file.uri}`
        : uploadData.file.uri.replace(/^file:\/\//, '');

    await ensureFileReady(normalizedUri);

    // Append the file
    formData.append('file', {
      uri: normalizedUri,
      name: uploadData.file.name,
      type: uploadData.file.type,
    } as any);

    // Append the type (required)
    formData.append('type', uploadData.type);

    // Append petId if provided
    if (uploadData.petId) {
      formData.append('petId', uploadData.petId);
    }

    return this.apiClient.uploadImage<UploadImageResponse>(
      `${this.prefix}/image`,
      formData,
    );
  }

  // ─── DELETE IMAGE ───────────────────────────────────────────────────────────

  async deleteImage(
    deleteData: DeleteImageRequest,
  ): Promise<ApiResponse<DeleteImageResponse>> {
    return this.apiClient.delete<DeleteImageResponse>(`${this.prefix}/image`, {
      body: JSON.stringify(deleteData),
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}

export default UploadApiService;
