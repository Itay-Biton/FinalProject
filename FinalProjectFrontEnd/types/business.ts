// types/business.ts

// ─── PAGINATION INFO ────────────────────────────────────────────────────────
export interface PaginationInfo {
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

// ─── BUSINESS LOCATION ──────────────────────────────────────────────────────
export interface BusinessLocation {
  address: string;
  coordinates: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
}

// ─── WORKING HOURS ──────────────────────────────────────────────────────────
export interface WorkingHours {
  day: string; // "Monday", "Tuesday", etc.
  isOpen: boolean;
  openTime?: string; // "09:00"
  closeTime?: string; // "17:00"
}

// ─── BUSINESS MODEL ─────────────────────────────────────────────────────────
export interface Business {
  _id: string;
  ownerId: string;
  name: string;
  serviceType: string; // "veterinary", "grooming", etc.
  email?: string;
  phoneNumbers: string[];
  location: BusinessLocation;
  workingHours: WorkingHours[];
  images: string[];
  description?: string;
  distance?: string;
  services: string[];
  isOpen: boolean;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── REVIEW MODEL ───────────────────────────────────────────────────────────
export interface Review {
  _id: string;
  businessId: string;
  userId: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  rating: number; // 1-5
  comment?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── BUSINESS LIST RESPONSE ─────────────────────────────────────────────────
export interface BusinessListResponse {
  success: boolean;
  businesses: Business[];
  pagination: PaginationInfo;
}

// ─── SINGLE BUSINESS RESPONSE ───────────────────────────────────────────────
export interface BusinessResponse {
  success: boolean;
  business: Business;
}

// ─── MY BUSINESSES RESPONSE ─────────────────────────────────────────────────
export interface MyBusinessesResponse {
  success: boolean;
  businesses: Business[];
}

// ─── CREATE BUSINESS REQUEST ────────────────────────────────────────────────
export interface CreateBusinessRequest {
  name: string;
  serviceType: string;
  email?: string;
  phoneNumbers?: string[];
  location?: {
    address: string;
    coordinates?: {
      type: 'Point';
      coordinates: [number, number];
    };
  };
  workingHours?: WorkingHours[];
  images?: string[];
  description?: string;
  services?: string[];
  isOpen?: boolean;
  isVerified?: boolean;
}

// ─── UPDATE BUSINESS REQUEST ────────────────────────────────────────────────
export interface UpdateBusinessRequest extends Partial<CreateBusinessRequest> {}

// ─── BUSINESS SEARCH PARAMS ─────────────────────────────────────────────────
export interface BusinessSearchParams {
  serviceType?: string;
  location?: string; // "lat,lng"
  radius?: number; // in km
  limit?: number;
  offset?: number;
  search?: string;
  isOpen?: boolean;
}

// ─── REVIEW LIST RESPONSE ───────────────────────────────────────────────────
export interface ReviewListResponse {
  success: boolean;
  reviews: Review[];
  pagination: PaginationInfo;
}

// ─── SINGLE REVIEW RESPONSE ─────────────────────────────────────────────────
export interface ReviewResponse {
  success: boolean;
  review: Review;
}

// ─── CREATE REVIEW REQUEST ──────────────────────────────────────────────────
export interface CreateReviewRequest {
  rating: number; // 1-5
  comment?: string;
}

// ─── UPDATE REVIEW REQUEST ──────────────────────────────────────────────────
export interface UpdateReviewRequest extends Partial<CreateReviewRequest> {}
