import { useState } from 'react';
import PetApiService from '../api/services/PetApiService';
import UploadApiService from '../api/services/UploadApiService';
import { apiClient } from '../api';
import { CreatePetRequest, Pet } from '../types/pet';
import { UploadImageRequest } from '../types/upload';

/**
 * Hook to orchestrate:
 *  1) creating a pet,
 *  2) uploading its images,
 *  3) and updating its description.
 */
export function useRegisterPetViewModel() {
  const petService = new PetApiService(apiClient);
  const uploadService = new UploadApiService(apiClient);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Creates a new pet record.
   */
  async function registerPet(
    data: Omit<CreatePetRequest, 'images'> & {
      images: string[];
      type?: 'pet' | 'business' | 'profile';
    },
  ): Promise<Pet> {
    setLoading(true);
    setError(null);

    try {
      const createRes = await petService.createPet(data as CreatePetRequest);

      if (!createRes.success || !createRes.data) {
        throw new Error(createRes.error || 'Failed to create pet');
      }

      return createRes.data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  /**
   * Uploads an array of image URIs for an existing pet.
   * Filters out null/undefined values and uploads only valid image URIs.
   */
  async function uploadPetImages(
    petId: string,
    imageUris: (string | null)[],
    type: 'pet' | 'business' | 'profile' = 'pet',
  ): Promise<void> {
    setLoading(true);
    setError(null);

    try {
      // Filter out null/undefined values and get only valid image URIs
      const validImageUris = imageUris.filter(
        (uri): uri is string =>
          uri !== null && uri !== undefined && uri.trim() !== '',
      );

      if (validImageUris.length === 0) {
        console.log('No valid images to upload');
        return;
      }

      console.log(`Uploading ${validImageUris.length} images for pet ${petId}`);

      // Upload each image sequentially
      for (let i = 0; i < validImageUris.length; i++) {
        const uri = validImageUris[i];

        // Extract filename from URI or create a default one
        const fileName = uri.split('/').pop() || `pet_image_${i + 1}.jpg`;

        // Determine mime type from file extension or default to jpeg
        let mimeType = 'image/jpeg';
        if (fileName.toLowerCase().endsWith('.png')) {
          mimeType = 'image/png';
        } else if (fileName.toLowerCase().endsWith('.webp')) {
          mimeType = 'image/webp';
        }

        const uploadRequest: UploadImageRequest = {
          file: {
            uri,
            name: fileName,
            type: mimeType,
          },
          type,
          petId,
        };

        console.log(
          `Uploading image ${i + 1}/${validImageUris.length}:`,
          fileName,
        );

        const uploadRes = await uploadService.uploadImage(uploadRequest);

        if (!uploadRes.success) {
          throw new Error(
            uploadRes.error || `Failed to upload image ${fileName}`,
          );
        }

        console.log(
          `Successfully uploaded image ${i + 1}:`,
          uploadRes.data?.imageUrl,
        );
      }

      console.log(`Successfully uploaded all ${validImageUris.length} images`);
    } catch (err: any) {
      console.error('Error uploading pet images:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  /**
   * Updates only the description of an existing pet.
   */
  async function updatePetDescription(
    petId: string,
    description: string,
  ): Promise<Pet> {
    setLoading(true);
    setError(null);

    try {
      const updateRes = await petService.updatePet(petId, { description });
      if (!updateRes.success || !updateRes.data) {
        throw new Error(updateRes.error || 'Failed to update pet');
      }
      return updateRes.data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  return {
    loading,
    error,
    registerPet,
    uploadPetImages,
    updatePetDescription,
  };
}
