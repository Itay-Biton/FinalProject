// api/index.ts
import ApiClient from './ApiClient';
import { ApiServices } from './services';

console.log('🏗️ Initializing API services...');

// Create the main API client instance
export const apiClient = new ApiClient({
  // You can override default config here if needed
  // baseURL: 'https://your-production-api.com',
  // timeout: 15000,
  // defaultHeaders: { 'X-App-Version': '1.0.0' }
});

// Test server connectivity on initialization (dev mode only)
if (__DEV__) {
  apiClient.testConnection().then(result => {
    if (result.success) {
      console.log('✅ Server is reachable');
    } else {
      console.error('❌ Server connectivity test failed:', result.error);
      console.log(
        '💡 Make sure your server is running on:',
        apiClient.getBaseURL(),
      );
    }
  });
}

console.log('🔧 Creating API services...');

// Create all API services using the factory pattern
export const apiServices = new ApiServices(apiClient);

// Individual service exports for backward compatibility and convenience
export const userApi = apiServices.user;
export const petApi = apiServices.pet;
export const businessApi = apiServices.business;
export const lostPetApi = apiServices.lostPet;
export const uploadApi = apiServices.upload;
export const activityApi = apiServices.activity; // New service export

console.log('✅ API services initialized successfully');

// ─── TYPE EXPORTS ───────────────────────────────────────────────────────────

// Core API types
export type { ApiResponse } from './ApiClient';

// User types
export type {
  CreateServerUserRequest,
  CreateServerUserResponse,
  ServerUser,
  UserPreferences,
  GetUserResponse,
  LoginResponse,
  VerifyUserRequest,
} from '../types/user';

// Pet types
export type {
  Pet,
  MyPetEntry,
  PetWeight,
  PetLocation,
  HealthHistoryEntry,
  PetListResponse,
  MyPetsListResponse,
  PetResponse,
  CreatePetRequest,
  UpdatePetRequest,
  PetSearchParams,
} from '../types/pet';

// Business types
export type {
  Business,
  BusinessLocation,
  WorkingHours,
  Review,
  BusinessListResponse,
  BusinessResponse,
  MyBusinessesResponse,
  CreateBusinessRequest,
  UpdateBusinessRequest,
  BusinessSearchParams,
  ReviewListResponse,
  ReviewResponse,
  CreateReviewRequest,
  UpdateReviewRequest,
} from '../types/business';

// Lost Pet types
export type {
  LostPetEntry,
  LostPetLocation,
  LostPetListResponse,
  LostPetResponse,
  ReportLostPetRequest,
  UpdateLostPetStatusRequest,
  LostPetSearchParams,
  FoundPetMatchRequest,
  PetMatchResult,
  PetMatchResponse,
} from '../types/lostPet';

// Upload types
export type {
  UploadType,
  UploadImageRequest,
  UploadImageResponse,
  DeleteImageRequest,
  DeleteImageResponse,
} from '../types/upload';

// Activity types (NEW)
export type {
  ActivityEntry,
  ActivityListResponse,
  ActivityResponse,
  CreateActivityRequest,
  UpdateActivityRequest,
  ActivitySearchParams,
  DeleteActivityResponse,
  PaginationInfo,
} from '../types/activity';

// ─── EXPORTS ────────────────────────────────────────────────────────────────

// Export the generic client for direct use if needed
export { ApiClient };

// Export the services factory for custom instances
export { ApiServices };

// Default export
export default apiClient;

// ─── USAGE EXAMPLES ─────────────────────────────────────────────────────────

/* 
// Method 1: Use pre-configured individual services (recommended for most cases)
import { userApi, petApi, activityApi } from '../api';

const user = await userApi.getCurrentUser();
const pets = await petApi.getMyPets();
const activities = await activityApi.getActivities();

// Method 2: Use the services factory (good for cleaner imports)
import { apiServices } from '../api';

const user = await apiServices.user.getCurrentUser();
const pets = await apiServices.pet.getMyPets();
const activities = await apiServices.activity.getRecentActivities();

// Method 3: Activity-specific usage examples
import { activityApi } from '../api';

// Get all activities with pagination
const allActivities = await activityApi.getActivitiesWithPagination({
  limit: 20,
  offset: 0
});

// Get recent activities
const recentActivities = await activityApi.getRecentActivities(10);

// Get activities by type
const feedingActivities = await activityApi.getActivitiesByType('feeding');

// Get today's activities
const todaysActivities = await activityApi.getTodaysActivities();

// Create a new activity
const newActivity = await activityApi.createActivity({
  date: '15/01/2024',
  time: '08:30',
  activityType: 'feeding',
  description: 'Gave 1 cup of dry food with chicken flavor'
});

// Update an activity
const updatedActivity = await activityApi.updateActivity('activity_id', {
  time: '09:00',
  description: 'Updated feeding time and amount'
});

// Delete an activity
const deleteResult = await activityApi.deleteActivity('activity_id');

// Method 4: Create custom instance (for different configurations)
import { ApiClient, ApiServices } from '../api';

const customClient = new ApiClient({
  baseURL: 'https://staging-api.com',
  timeout: 20000
});
const customServices = new ApiServices(customClient);
const customActivityApi = customServices.activity;

// Method 5: Direct client usage (for custom requests)
import { apiClient } from '../api';

const customResponse = await apiClient.get('/custom-endpoint');
*/
