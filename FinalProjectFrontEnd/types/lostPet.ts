// types/lostPet.ts
import { Pet } from './pet';

// ─── LOST PET LOCATION ──────────────────────────────────────────────────────
export interface LostPetLocation {
  address: string;
  coordinates: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
}

// ─── LOST PET ENTRY ─────────────────────────────────────────────────────────
export interface LostPetEntry {
  _id: string;
  petId: string | Pet; // Can be populated with full Pet object
  reporterId: string;
  phoneNumbers: string[];
  location: LostPetLocation;
  additionalDetails?: string;
  status: 'lost' | 'found' | 'closed';
  createdAt: string;
  updatedAt: string;
}

// ─── LOST PET LIST RESPONSE ─────────────────────────────────────────────────
export interface LostPetListResponse {
  success: boolean;
  lostPets: LostPetEntry[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

// ─── SINGLE LOST PET RESPONSE ───────────────────────────────────────────────
export interface LostPetResponse {
  success: boolean;
  lostPet: LostPetEntry;
}

// ─── REPORT LOST PET REQUEST ────────────────────────────────────────────────
export interface ReportLostPetRequest {
  petId: string;
  phoneNumbers: string[];
  location: {
    address: string;
    coordinates: {
      type: 'Point';
      coordinates: [number, number];
    };
  };
  additionalDetails?: string;
  status?: 'lost' | 'found' | 'closed';
}

// ─── UPDATE LOST PET STATUS REQUEST ─────────────────────────────────────────
export interface UpdateLostPetStatusRequest {
  status: 'lost' | 'found' | 'closed';
}

// ─── LOST PET SEARCH PARAMS ─────────────────────────────────────────────────
export interface LostPetSearchParams {
  location?: string; // "lat,lng"
  radius?: number; // in km
  limit?: number;
  offset?: number;
  status?: 'lost' | 'found' | 'closed';
}

// ─── FOUND PET MATCH REQUEST ────────────────────────────────────────────────
export interface FoundPetMatchRequest {
  name?: string;
  species: string;
  breed?: string;
  age?: string;
  furColor?: string;
  eyeColor?: string;
  location: {
    coordinates: [number, number]; // [longitude, latitude]
  };
}

// ─── PET MATCH RESULT ───────────────────────────────────────────────────────
export interface PetMatchResult {
  score: number;
  lostPet: Pet;
  lostEntry: LostPetEntry;
}

// ─── PET MATCH RESPONSE ─────────────────────────────────────────────────────
export interface PetMatchResponse {
  success: boolean;
  matches: PetMatchResult[];
}
