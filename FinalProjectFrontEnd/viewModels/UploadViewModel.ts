// viewmodels/useUploadViewModel.ts
import { useState } from 'react';
import UploadApiService from '../api/services/UploadApiService';
import { apiClient } from '../api';

export interface UploadedImage {
  id: string;
  url: string;
}

/**
 * Hook to manage image uploads for pets
 */
export function useUploadViewModel() {
  const uploadService = new UploadApiService(apiClient);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);

  /**
   * Upload a single image file for a given pet or profile
   * @param fileUri Local URI of the image to upload
   * @param petId   ID of the pet to associate the image with (if type === 'pet')
   * @param type    Resource type (defaults to 'pet')
   */
  async function uploadImage(
    fileUri: string,
    petId: string,
    type: 'pet' | 'business' | 'profile' = 'pet',
  ): Promise<UploadedImage> {
    setUploading(true);
    setError(null);

    try {
      // Prepare multipart form data
      const fileName = fileUri.split('/').pop() || 'photo.jpg';
      const formData = new FormData();
      formData.append('file', {
        uri: fileUri,
        name: fileName,
        type: 'image/jpeg',
      } as any);
      formData.append('type', type);
      if (type === 'pet') {
        formData.append('petId', petId);
      }

      // Call the upload API
      const res = await uploadService.uploadImage({
        file: formData,
        type,
        petId,
      });
      if (!res.success || !res.data) {
        throw new Error(res.error || 'Upload failed');
      }

      // Map API response to our UploadedImage shape
      const uploaded: UploadedImage = {
        id: res.data.fileId,
        url: res.data.imageUrl,
      };

      // Track the uploaded image
      setUploadedImages(prev => [...prev, uploaded]);
      return uploaded;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setUploading(false);
    }
  }

  return {
    uploading,
    error,
    uploadedImages,
    uploadImage,
  };
}
