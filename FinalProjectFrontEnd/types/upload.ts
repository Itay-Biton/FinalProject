// types/upload.ts

// ─── UPLOAD TYPE ────────────────────────────────────────────────────────────
export type UploadType = 'pet' | 'business' | 'profile';

// ─── UPLOAD IMAGE REQUEST ───────────────────────────────────────────────────
export interface UploadImageRequest {
  file: any; // File or FormData depending on platform
  type: UploadType;
  petId?: string; // Required if type is 'pet'
}

// ─── UPLOAD IMAGE RESPONSE ──────────────────────────────────────────────────
export interface UploadImageResponse {
  success: boolean;
  fileId: string;
  imageUrl: string;
}

// ─── DELETE IMAGE REQUEST ───────────────────────────────────────────────────
export interface DeleteImageRequest {
  imageUrl: string;
  type: UploadType;
  petId?: string; // Required if type is 'pet'
}

// ─── DELETE IMAGE RESPONSE ──────────────────────────────────────────────────
export interface DeleteImageResponse {
  success: boolean;
  message: string;
}
