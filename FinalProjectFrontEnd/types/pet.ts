// types/pet.ts

// ─── PAGINATION INFO ────────────────────────────────────────────────────────
export interface PaginationInfo {
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

// ─── PET WEIGHT ─────────────────────────────────────────────────────────────
export interface PetWeight {
  value: number;
  unit: string; // 'kg', 'lbs', etc.
}

// ─── PET LOCATION ───────────────────────────────────────────────────────────
export interface PetLocation {
  address: string;
  coordinates: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
}

// ─── HEALTH HISTORY ─────────────────────────────────────────────────────────
export interface HealthHistoryEntry {
  date: string;
  event: string;
  details: string;
}

// ─── PET MODEL ──────────────────────────────────────────────────────────────
export interface Pet {
  _id: string;
  ownerId: string;
  name: string;
  species: string;
  breed?: string;
  age?: string;
  birthday?: string;
  furColor?: string;
  eyeColor?: string;
  weight?: PetWeight;
  images: string[];
  description?: string;
  isLost: boolean;
  location?: PetLocation;
  distance?: string;
  registrationDate: string;
  vaccinated?: boolean;
  microchipped?: boolean;
  healthHistory?: HealthHistoryEntry[];
  createdAt: string;
  updatedAt: string;
}

// ─── MY PETS RESPONSE (simplified format) ───────────────────────────────────
export interface MyPetEntry {
  id: string;
  name: string;
  species: string;
  breed?: string;
  age: number;
  birthday?: string;
  furColor?: string;
  eyeColor?: string;
  weight: PetWeight;
  images: string[];
  description?: string;
  isLost: boolean;
  vaccinated?: boolean;
  microchipped?: boolean;
  registrationDate: string;
}

// ─── PET LIST RESPONSE ──────────────────────────────────────────────────────
export interface PetListResponse {
  success: boolean;
  pets: Pet[];
  pagination: PaginationInfo;
}

// ─── MY PETS LIST RESPONSE ──────────────────────────────────────────────────
export interface MyPetsListResponse {
  success: boolean;
  pets: MyPetEntry[];
  pagination: PaginationInfo;
}

// ─── SINGLE PET RESPONSE ────────────────────────────────────────────────────
export interface PetResponse {
  success: boolean;
  pet: Pet;
}

// ─── CREATE PET REQUEST ─────────────────────────────────────────────────────
export interface CreatePetRequest {
  name: string;
  species: string;
  breed?: string;
  age?: number;
  birthday?: string;
  furColor?: string;
  eyeColor?: string;
  weight?: PetWeight;
  images?: string[];
  description?: string;
  isLost?: boolean;
  address?: string;
  lat?: number;
  lng?: number;
  vaccinated?: boolean;
  microchipped?: boolean;
  healthHistory?: HealthHistoryEntry[];
}

// ─── UPDATE PET REQUEST ─────────────────────────────────────────────────────
export interface UpdatePetRequest extends Partial<CreatePetRequest> {
  lat?: number;
  lng?: number;
  address?: string;
}

// ─── PET SEARCH PARAMS ──────────────────────────────────────────────────────
export interface PetSearchParams {
  species?: string;
  location?: string; // "lat,lng"
  radius?: number; // in km
  limit?: number;
  offset?: number;
  search?: string;
}
