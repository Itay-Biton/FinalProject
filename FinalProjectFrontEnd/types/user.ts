// ─── USER PREFERENCES ───────────────────────────────────────────────────────
export interface UserPreferences {
  language: string;
  notifications: boolean;
  locationSharing: boolean;
}
export interface GetUserResponse {
  success: boolean;
  user: ServerUser;
}

// ─── SERVER USER MODEL ─────────────────────────────────────────────────────
export interface ServerUser {
  _id: string;
  firebaseUid: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  profileImage?: string;
  role: 'user' | 'business_owner' | 'admin';
  preferences: UserPreferences;
  isActive: boolean;
  fcmToken?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── CREATE / REGISTER REQUEST & RESPONSE ───────────────────────────────────
export interface CreateServerUserRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
}

export interface CreateServerUserResponse {
  success: boolean;
  user: {
    id: string;
    firebaseUid: string;
    firstName: string;
    lastName: string;
    email: string;
    role: 'user' | 'business_owner' | 'admin';
    phoneNumber?: string;
  };
}

// ─── LOGIN RESPONSE ─────────────────────────────────────────────────────────
export interface LoginResponse {
  success: boolean;
  idToken: string;
  refreshToken: string;
  firebaseUid: string;
}

// ─── VERIFY USER REQUEST ────────────────────────────────────────────────────
export interface VerifyUserRequest {
  idToken: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  profileImage?: string;
  firebaseUid?: string;
}
