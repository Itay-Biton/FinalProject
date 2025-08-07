// api/services/index.ts
import ApiClient from '../ApiClient';
import UserApiService from './UserApiService';
import PetApiService from './PetApiService';
import BusinessApiService from './BusinessApiService';
import LostPetApiService from './LostPetApiService';
import UploadApiService from './UploadApiService';
import ActivityApiService from './ActivityApiService'; // New import

/**
 * API Services Factory
 * Creates and manages all API service instances
 */
export class ApiServices {
  // Service instances
  public readonly user: UserApiService;
  public readonly pet: PetApiService;
  public readonly business: BusinessApiService;
  public readonly lostPet: LostPetApiService;
  public readonly upload: UploadApiService;
  public readonly activity: ActivityApiService; // New service

  constructor(apiClient: ApiClient) {
    console.log('🔧 Initializing API services...');

    // Initialize all services with the shared API client
    this.user = new UserApiService(apiClient);
    this.pet = new PetApiService(apiClient);
    this.business = new BusinessApiService(apiClient);
    this.lostPet = new LostPetApiService(apiClient);
    this.upload = new UploadApiService(apiClient);
    this.activity = new ActivityApiService(apiClient); // New service initialization

    console.log('✅ All API services initialized');
  }

  /**
   * Get a summary of all available services
   */
  getAvailableServices(): string[] {
    return [
      'user',
      'pet',
      'business',
      'lostPet',
      'upload',
      'activity', // Add to list
    ];
  }

  /**
   * Test connectivity for all services (development helper)
   */
  async testAllServices(): Promise<Record<string, boolean>> {
    console.log('🧪 Testing all API services...');

    const results: Record<string, boolean> = {};

    // You can add specific health check endpoints for each service
    // For now, we'll just check if services are initialized
    results.user = !!this.user;
    results.pet = !!this.pet;
    results.business = !!this.business;
    results.lostPet = !!this.lostPet;
    results.upload = !!this.upload;
    results.activity = !!this.activity; // Add to test results

    console.log('🧪 Service test results:', results);
    return results;
  }
}
