// stores/AuthStore.ts
import { create } from 'zustand';
import { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { useShallow } from 'zustand/react/shallow';
import authService from '../services/AuthService';

// Simplified Firebase user interface - auth only
interface FirebaseUser {
  uid: string;
  email: string | null;
  emailVerified: boolean;
}

// Server user interface (from your server response)
interface ServerUser {
  id: string;
  firebaseUid: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'user' | 'business_owner' | 'admin';
}

interface AuthState {
  // Firebase data (auth only)
  firebaseUser: FirebaseUser | null;
  token: string | null;

  // Server data (profile)
  serverUser: ServerUser | null;

  // State flags
  isLoading: boolean;
  isInitialized: boolean;

  // Actions
  setFirebaseAuth: (user: FirebaseUser, token: string) => void;
  setServerUser: (serverUser: ServerUser | null) => void;
  clearAuthData: () => void;
  setLoading: (loading: boolean) => void;
  setInitialized: (initialized: boolean) => void;
  refreshToken: () => Promise<string | null>;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  // initial state
  firebaseUser: null,
  token: null,
  serverUser: null,
  isLoading: true,
  isInitialized: false,

  // actions
  setFirebaseAuth: (firebaseUser, token) => set({ firebaseUser, token }),

  setServerUser: serverUser => set({ serverUser }),

  clearAuthData: () =>
    set({
      firebaseUser: null,
      token: null,
      serverUser: null,
    }),

  setLoading: isLoading => set({ isLoading }),
  setInitialized: isInitialized => set({ isInitialized }),

  // token refresh with better error handling
  refreshToken: async () => {
    try {
      const newToken = await authService.getIdToken(true);
      if (newToken) {
        set({ token: newToken });
        return newToken;
      }
      return null;
    } catch (err: any) {
      console.error('Error refreshing token:', err);
      if (err.code === 'auth/network-request-failed') {
        console.warn(
          'Network error during token refresh, keeping current auth state',
        );
        return null;
      }
      set({ firebaseUser: null, token: null, serverUser: null });
      return null;
    }
  },

  // bootstrap listener with Firebase onIdTokenChanged
  initialize: async () => {
    const { setFirebaseAuth, clearAuthData, setLoading, setInitialized } =
      get();
    setLoading(true);

    try {
      const unsubscribe = authService.onIdTokenChanged(
        async (firebaseUser: FirebaseAuthTypes.User | null) => {
          if (firebaseUser) {
            try {
              const idToken = await firebaseUser.getIdToken();
              const userData: FirebaseUser = {
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                emailVerified: firebaseUser.emailVerified,
              };
              setFirebaseAuth(userData, idToken);
            } catch (err: any) {
              console.error('Error in onIdTokenChanged listener:', err);
              clearAuthData();
            }
          } else {
            clearAuthData();
          }
          setLoading(false);
          setInitialized(true);
        },
      );

      // For cleanup if needed
      (global as any).authUnsubscribe = unsubscribe;
    } catch (err) {
      console.error('Error initializing auth store:', err);
      setLoading(false);
      setInitialized(true);
    }
  },
}));

// Selectors
export const useFirebaseUser = () => useAuthStore(s => s.firebaseUser);
export const useToken = () => useAuthStore(s => s.token);
export const useServerUser = () => useAuthStore(s => s.serverUser);
export const useAuthLoading = () => useAuthStore(s => s.isLoading);
export const useIsInitialized = () => useAuthStore(s => s.isInitialized);

// Convenience selector for combined state
export const useCurrentUser = () =>
  useAuthStore(
    useShallow(state => ({
      firebaseUser: state.firebaseUser,
      token: state.token,
      serverUser: state.serverUser,
      isLoading: state.isLoading,
    })),
  );

// Backwards-compatibility
export const useUser = () => useAuthStore(s => s.firebaseUser);
export const useIsAuthenticated = () =>
  useAuthStore(s => Boolean(s.firebaseUser && s.token));
