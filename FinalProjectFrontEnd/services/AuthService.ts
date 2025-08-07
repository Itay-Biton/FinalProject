// services/AuthService.ts
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
  onIdTokenChanged,
  FirebaseAuthTypes,
} from '@react-native-firebase/auth';
import { getApp } from '@react-native-firebase/app';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
}

export interface AuthResult {
  success: boolean;
  data?: {
    user: FirebaseAuthTypes.User;
    token: string;
  };
  error?: string;
  errorCode?: string;
  errorDetails?: any;
}

// Initialize Firebase Auth instance with error handling
let auth: FirebaseAuthTypes.Module | null = null;
try {
  const app = getApp();
  auth = getAuth(app);
  console.log('🔥 Firebase Auth initialized successfully');
} catch (error) {
  console.error('🚨 Firebase Auth initialization failed:', error);
}

class AuthService {
  private checkFirebaseInit(): boolean {
    if (!auth) {
      console.error('🚨 Firebase Auth is not initialized');
      return false;
    }
    return true;
  }

  async register({
    email,
    password,
  }: RegisterCredentials): Promise<AuthResult> {
    if (!this.checkFirebaseInit()) {
      return {
        success: false,
        error: 'Firebase not initialized',
        errorCode: 'firebase/not-initialized',
      };
    }
    try {
      const { user } = await createUserWithEmailAndPassword(
        auth!,
        email,
        password,
      );
      const token = await user.getIdToken();
      await AsyncStorage.setItem('firebase_id_token', token);
      return { success: true, data: { user, token } };
    } catch (err: any) {
      return {
        success: false,
        error: this.getErrorMessage(err.code),
        errorCode: err.code,
        errorDetails: err,
      };
    }
  }

  async login({ email, password }: LoginCredentials): Promise<AuthResult> {
    if (!this.checkFirebaseInit()) {
      return {
        success: false,
        error: 'Firebase not initialized',
        errorCode: 'firebase/not-initialized',
      };
    }
    try {
      const { user } = await signInWithEmailAndPassword(auth!, email, password);
      const token = await user.getIdToken();
      await AsyncStorage.setItem('firebase_id_token', token);
      return { success: true, data: { user, token } };
    } catch (err: any) {
      return {
        success: false,
        error: this.getErrorMessage(err.code),
        errorCode: err.code,
        errorDetails: err,
      };
    }
  }

  async forgotPassword(email: string): Promise<AuthResult> {
    if (!this.checkFirebaseInit()) {
      return {
        success: false,
        error: 'Firebase not initialized',
        errorCode: 'firebase/not-initialized',
      };
    }
    try {
      await sendPasswordResetEmail(auth!, email);
      return { success: true };
    } catch (err: any) {
      return {
        success: false,
        error: this.getErrorMessage(err.code),
        errorCode: err.code,
        errorDetails: err,
      };
    }
  }

  async logout(): Promise<AuthResult> {
    if (!this.checkFirebaseInit()) {
      return {
        success: false,
        error: 'Firebase not initialized',
        errorCode: 'firebase/not-initialized',
      };
    }
    try {
      await signOut(auth!);
      await AsyncStorage.removeItem('firebase_id_token');
      return { success: true };
    } catch (err: any) {
      return {
        success: false,
        error: this.getErrorMessage(err.code),
        errorCode: err.code,
        errorDetails: err,
      };
    }
  }

  getCurrentUser(): FirebaseAuthTypes.User | null {
    return auth?.currentUser || null;
  }

  async getIdToken(forceRefresh = false): Promise<string | null> {
    if (!this.checkFirebaseInit()) return null;
    const user = auth!.currentUser;
    if (!user) {
      await AsyncStorage.removeItem('firebase_id_token');
      return null;
    }
    try {
      const token = await user.getIdToken(forceRefresh);
      await AsyncStorage.setItem('firebase_id_token', token);
      return token;
    } catch {
      return null;
    }
  }

  onAuthStateChanged(callback: (user: FirebaseAuthTypes.User | null) => void) {
    return auth ? onAuthStateChanged(auth, callback) : () => {};
  }

  onIdTokenChanged(callback: (user: FirebaseAuthTypes.User | null) => void) {
    return auth ? onIdTokenChanged(auth, callback) : () => {};
  }

  private getErrorMessage(code: string): string {
    const msgs: Record<string, string> = {
      'auth/email-already-in-use': 'Email already in use.',
      'auth/invalid-email': 'Invalid email address.',
      'auth/weak-password': 'Weak password.',
      'auth/user-not-found': 'No user found.',
      'auth/wrong-password': 'Wrong password.',
      'auth/network-request-failed': 'Network error.',
    };
    return msgs[code] || 'An unexpected error occurred.';
  }
}

export default new AuthService();
