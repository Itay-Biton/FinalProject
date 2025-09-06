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

// ─── LOST DETAILS ───────────────────────────────────────────────────────────
export interface LostDetails {
  dateLost?: string; // ISO
  lastSeen?: {
    address?: string;
    coordinates?: [number, number]; // [lng, lat]
  };
  notes?: string;
}

// ─── FOUND DETAILS ──────────────────────────────────────────────────────────
export interface FoundDetails {
  dateFound?: string; // ISO
  location?: {
    address?: string;
    coordinates?: [number, number]; // [lng, lat]
  };
  notes?: string;
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

  // Contact (root)
  phoneNumbers: string[]; // ← back on root
  email?: string; // ← new optional

  // Flags
  isLost: boolean;
  isFound: boolean;

  // Locations/details
  location?: PetLocation;
  lostDetails?: LostDetails;
  foundDetails?: FoundDetails;

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

  // Contact
  phoneNumbers: string[]; // ← back
  email?: string; // ← new

  // Flags
  isLost: boolean;
  isFound: boolean;

  // Details
  vaccinated?: boolean;
  microchipped?: boolean;
  registrationDate: string;
  lostDetails?: LostDetails;
  foundDetails?: FoundDetails;
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

  // Contact
  phoneNumbers?: string[]; // ← back
  email?: string; // ← new

  // Flags
  isLost?: boolean;
  isFound?: boolean;

  // Current location
  address?: string;
  lat?: number;
  lng?: number;

  // Health
  vaccinated?: boolean;
  microchipped?: boolean;
  healthHistory?: HealthHistoryEntry[];

  // Details
  lostDetails?: LostDetails;
  foundDetails?: FoundDetails;
}

// ─── UPDATE PET REQUEST ─────────────────────────────────────────────────────
export interface UpdatePetRequest extends Partial<CreatePetRequest> {
  // (legacy) not used by server, preserved for callers
  location?: {
    address: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  isFound?: boolean;
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
