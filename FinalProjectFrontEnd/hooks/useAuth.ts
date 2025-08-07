// hooks/useAuth.ts - FIXED VERSION
import { useState, useCallback } from 'react';
import authService, { LoginCredentials } from '../services/AuthService';
import { useAuthStore } from '../stores/AuthStore';
import { apiServices } from '../api'; // Updated import

// Full registration credentials for the hook (includes profile data)
export interface RegisterCredentials {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber: string;
}

interface UseLoginReturn {
  login: (credentials: LoginCredentials) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
}

interface UseRegisterReturn {
  register: (credentials: RegisterCredentials) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
}

interface UseForgotPasswordReturn {
  sendResetEmail: (email: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  isSuccess: boolean;
  clearError: () => void;
  clearSuccess: () => void;
}

interface UseLogoutReturn {
  logout: () => Promise<void>;
  isLoading: boolean;
}

/**
 * Hook for login functionality
 */
export const useLogin = (): UseLoginReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Use stable references to prevent infinite loops
  const setFirebaseAuth = useAuthStore(state => state.setFirebaseAuth);
  const setServerUser = useAuthStore(state => state.setServerUser);

  const clearError = useCallback(() => setError(null), []);

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      try {
        setIsLoading(true);
        setError(null);

        // Step 1: Firebase authentication
        const result = await authService.login(credentials);

        if (!result.success) {
          setError(result.error || 'Login failed');
          return;
        }

        // Step 2: Set Firebase auth data (simplified - no displayName/photoURL)
        if (result.data) {
          const firebaseUserData = {
            uid: result.data.user.uid,
            email: result.data.user.email,
            emailVerified: result.data.user.emailVerified,
          };

          // Set Firebase auth data
          setFirebaseAuth(firebaseUserData, result.data.token);

          // Step 3: Fetch server user data
          try {
            const serverUserResult = await apiServices.user.getCurrentUser();
            console.log(serverUserResult);
            if (serverUserResult.success && serverUserResult.data) {
              setServerUser({
                id: serverUserResult.data._id,
                firebaseUid: serverUserResult.data.firebaseUid,
                firstName: serverUserResult.data.firstName,
                lastName: serverUserResult.data.lastName,
                email: serverUserResult.data.email,
                role: serverUserResult.data.role,
              });
            }
          } catch (serverError) {
            console.warn('Failed to fetch server user data:', serverError);
            // Don't fail the login if server user fetch fails
          }
        }

        console.log('Login successful:', result.data?.user?.email);
      } catch (err: any) {
        console.error('Login error:', err);
        setError(err.message || 'An unexpected error occurred');
      } finally {
        setIsLoading(false);
      }
    },
    [setFirebaseAuth, setServerUser],
  );

  return {
    login,
    isLoading,
    error,
    clearError,
  };
};

/**
 * Hook for registration functionality
 * Handles Firebase auth (email/password only) + server registration (full profile)
 */
export const useRegister = (): UseRegisterReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Use stable references to prevent infinite loops
  const setFirebaseAuth = useAuthStore(state => state.setFirebaseAuth);
  const setServerUser = useAuthStore(state => state.setServerUser);

  const clearError = useCallback(() => setError(null), []);

  const register = useCallback(
    async (credentials: RegisterCredentials) => {
      try {
        setIsLoading(true);
        setError(null);

        // Step 1: Register with Firebase (auth only - email & password)
        const firebaseResult = await authService.register({
          email: credentials.email,
          password: credentials.password,
        });

        if (!firebaseResult.success) {
          setError(firebaseResult.error || 'Firebase registration failed');
          return;
        }

        console.log(
          'Firebase registration successful:',
          firebaseResult.data?.user?.email,
        );

        // Step 2: Server registration with profile data
        const serverResult = await apiServices.user.verifyUser({
          idToken: firebaseResult.data!.token,
          firstName: credentials.firstName,
          lastName: credentials.lastName,
          phoneNumber: credentials.phoneNumber,
          email: credentials.email,
          profileImage: undefined,
        });

        if (!serverResult.success) {
          console.error('Server registration failed:', serverResult.error);
          setError(
            `Registration completed but profile setup failed: ${serverResult.error}`,
          );
          return;
        }

        console.log('Server registration successful:', serverResult.data);

        // Step 3: Set both Firebase and server data
        if (firebaseResult.data && serverResult.data) {
          // Firebase auth data (simplified)
          const firebaseUserData = {
            uid: firebaseResult.data.user.uid,
            email: firebaseResult.data.user.email,
            emailVerified: firebaseResult.data.user.emailVerified,
          };

          // FIXED: serverResult.data is directly the user object (no .user needed)
          const serverUser = {
            id: serverResult.data.id,
            firebaseUid: serverResult.data.firebaseUid,
            firstName: serverResult.data.firstName,
            lastName: serverResult.data.lastName,
            email: serverResult.data.email,
            role: serverResult.data.role,
          };

          // Set Firebase auth first
          setFirebaseAuth(firebaseUserData, firebaseResult.data.token);
          // Then set server user data
          setServerUser(serverUser);
        }

        console.log('Full registration successful for:', credentials.email);
      } catch (err: any) {
        console.error('Registration error:', err);
        setError(err.message || 'An unexpected error occurred');
      } finally {
        setIsLoading(false);
      }
    },
    [setFirebaseAuth, setServerUser],
  );

  return {
    register,
    isLoading,
    error,
    clearError,
  };
};

/**
 * Hook for forgot password functionality
 */
export const useForgotPassword = (): UseForgotPasswordReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const clearError = useCallback(() => setError(null), []);
  const clearSuccess = useCallback(() => setIsSuccess(false), []);

  const sendResetEmail = useCallback(async (email: string) => {
    try {
      setIsLoading(true);
      setError(null);
      setIsSuccess(false);

      // Use Firebase for password reset
      const result = await authService.forgotPassword(email);

      if (!result.success) {
        setError(result.error || 'Failed to send reset email');
        return;
      }

      setIsSuccess(true);
      console.log('Password reset email sent successfully');
    } catch (err: any) {
      console.error('Forgot password error:', err);
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    sendResetEmail,
    isLoading,
    error,
    isSuccess,
    clearError,
    clearSuccess,
  };
};

/**
 * Hook for logout functionality
 */
export const useLogout = (): UseLogoutReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const clearAuthData = useAuthStore(state => state.clearAuthData);

  const logout = useCallback(async () => {
    try {
      setIsLoading(true);

      // Logout from Firebase (primary auth)
      await authService.logout();

      // Clear all auth data (Firebase + server)
      clearAuthData();
      console.log('Logout successful');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [clearAuthData]);

  return {
    logout,
    isLoading,
  };
};

// Re-export the properly fixed useCurrentUser from AuthStore to avoid duplicates
export { useCurrentUser } from '../stores/AuthStore';

/**
 * Hook for user profile operations (server-side only)
 */
export const useUserProfile = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const setServerUser = useAuthStore(state => state.setServerUser);

  const clearError = useCallback(() => setError(null), []);

  const updateProfile = useCallback(
    async (profileData: any) => {
      try {
        setIsLoading(true);
        setError(null);

        const result = await apiServices.user.updateUserProfile(profileData);

        if (!result.success) {
          setError(result.error || 'Failed to update profile');
          return;
        }

        // Update store with new profile data
        if (result.data) {
          setServerUser({
            id: result.data._id,
            firebaseUid: result.data.firebaseUid,
            firstName: result.data.firstName,
            lastName: result.data.lastName,
            email: result.data.email,
            role: result.data.role,
          });
        }

        console.log('Profile updated successfully');
        return result.data;
      } catch (err: any) {
        console.error('Profile update error:', err);
        setError(err.message || 'An unexpected error occurred');
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [setServerUser],
  );

  return {
    updateProfile,
    isLoading,
    error,
    clearError,
  };
};
