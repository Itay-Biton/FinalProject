// viewModels/RegisterBusinessViewModel.ts
import { useState, useMemo } from 'react';
import BusinessApiService from '../api/services/BusinessApiService';
import UploadApiService from '../api/services/UploadApiService';
import { apiClient } from '../api';
import {
  CreateBusinessRequest,
  Business,
  WorkingHours,
  BusinessLocation,
} from '../types/business';
import { UploadImageRequest } from '../types/upload';

// Business registration form data interface
export interface BusinessFormData {
  // Step 1 data
  name: string;
  email?: string;
  phoneNumber?: string;
  serviceType: string;
  workingHours: WorkingHours[];

  // Step 2 data
  images: (string | null)[];

  // Step 3 data
  location?: {
    id: string;
    title: string;
    lat: string;
    lon: string;
  };
}

/**
 * Hook to orchestrate business registration:
 *  1) Creating a business record
 *  2) Uploading business images
 *  3) Updating business with location data
 */
export function useRegisterBusinessViewModel() {
  // Memoize services to prevent unnecessary re-creation
  const businessService = useMemo(() => new BusinessApiService(apiClient), []);
  const uploadService = useMemo(() => new UploadApiService(apiClient), []);

  // State management
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentBusinessId, setCurrentBusinessId] = useState<string | null>(
    null,
  );

  // Form data state
  const [formData, setFormData] = useState<BusinessFormData>({
    name: '',
    email: '',
    phoneNumber: '',
    serviceType: '',
    workingHours: [],
    images: Array(6).fill(null),
    location: undefined,
  });

  /**
   * Update form data for any step
   */
  const updateFormData = (updates: Partial<BusinessFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  /**
   * Step 1: Create business with basic information
   */
  const createBusiness = async (stepData: {
    name: string;
    email?: string;
    phoneNumber?: string;
    serviceType: string;
    workingHours: WorkingHours[];
  }): Promise<Business> => {
    setLoading(true);
    setError(null);

    try {
      // Update form data
      updateFormData(stepData);

      // Prepare create request
      const createRequest: CreateBusinessRequest = {
        name: stepData.name,
        serviceType: stepData.serviceType,
        email: stepData.email,
        phoneNumbers: stepData.phoneNumber ? [stepData.phoneNumber] : [],
        workingHours: stepData.workingHours,
        images: [], // Will be added in step 2
        isOpen: true,
        isVerified: false,
      };

      const response = await businessService.createBusiness(createRequest);

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to create business');
      }

      const business = response.data;
      setCurrentBusinessId(business._id);

      console.log('Business created successfully:', business._id);
      return business;
    } catch (err: any) {
      console.error('Error creating business:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Step 2: Upload business images
   */
  const uploadBusinessImages = async (
    businessId: string,
    imageUris: (string | null)[],
  ): Promise<void> => {
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

      console.log(
        `Uploading ${validImageUris.length} business images for business ${businessId}`,
      );

      // Upload each image sequentially
      for (let i = 0; i < validImageUris.length; i++) {
        const uri = validImageUris[i];

        // Extract filename from URI or create a default one
        const fileName = uri.split('/').pop() || `business_image_${i + 1}.jpg`;

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
          type: 'business', // Use business type for upload
          // No businessId needed for business uploads, but we could add it if the backend requires it
        };

        console.log(
          `Uploading business image ${i + 1}/${validImageUris.length}:`,
          fileName,
        );

        const uploadRes = await uploadService.uploadImage(uploadRequest);

        if (!uploadRes.success) {
          throw new Error(
            uploadRes.error || `Failed to upload business image ${fileName}`,
          );
        }

        console.log(
          `Successfully uploaded business image ${i + 1}:`,
          uploadRes.data?.imageUrl,
        );
      }

      // Update form data with uploaded images
      updateFormData({ images: imageUris });

      console.log(
        `Successfully uploaded all ${validImageUris.length} business images`,
      );
    } catch (err: any) {
      console.error('Error uploading business images:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Step 3: Complete business registration with location
   */
  const completeBusiness = async (
    businessId: string,
    locationData: {
      id: string;
      title: string;
      lat: string;
      lon: string;
    },
  ): Promise<Business> => {
    setLoading(true);
    setError(null);

    try {
      // Update form data
      updateFormData({ location: locationData });

      // Prepare location update
      const businessLocation: BusinessLocation = {
        address: locationData.title,
        coordinates: {
          type: 'Point',
          coordinates: [
            parseFloat(locationData.lon),
            parseFloat(locationData.lat),
          ],
        },
      };

      const updateRequest = {
        location: businessLocation,
        // Add any other final data if needed
      };

      const response = await businessService.updateBusiness(
        businessId,
        updateRequest,
      );

      if (!response.success || !response.data) {
        throw new Error(
          response.error || 'Failed to complete business registration',
        );
      }

      console.log('Business registration completed successfully');
      return response.data;
    } catch (err: any) {
      console.error('Error completing business registration:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Get current business if available
   */
  const getCurrentBusiness = async (): Promise<Business | null> => {
    if (!currentBusinessId) return null;

    try {
      const response = await businessService.getBusinessById(currentBusinessId);
      if (response.success && response.data) {
        return response.data;
      }
    } catch (err: any) {
      console.error('Error fetching current business:', err);
    }
    return null;
  };

  /**
   * Reset registration state
   */
  const resetRegistration = () => {
    setFormData({
      name: '',
      email: '',
      phoneNumber: '',
      serviceType: '',
      workingHours: [],
      images: Array(6).fill(null),
      location: undefined,
    });
    setCurrentBusinessId(null);
    setError(null);
    setLoading(false);
  };

  return {
    // State
    loading,
    error,
    formData,
    currentBusinessId,

    // Actions
    updateFormData,
    createBusiness,
    uploadBusinessImages,
    completeBusiness,
    getCurrentBusiness,
    resetRegistration,
  };
}
