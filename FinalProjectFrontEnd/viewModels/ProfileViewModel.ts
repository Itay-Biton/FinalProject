// viewModels/ProfileViewModel.ts
import { useState, useEffect, useCallback } from 'react';
import { userApi } from '../api';
import { ApiResponse } from '../api/ApiClient';
import { ServerUser } from '../types/user';

export function useProfileViewModel() {
  const [user, setUser] = useState<ServerUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch current user on mount
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    userApi
      .getCurrentUser()
      .then(res => {
        if (cancelled) return;
        if (res.success && res.data) {
          setUser(res.data);
        } else {
          setError(res.error || 'Failed to load profile');
        }
      })
      .catch(() => {
        if (!cancelled) setError('Network error');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Update profile
  const updateProfile = useCallback(
    async (update: Partial<ServerUser>): Promise<boolean> => {
      if (!user) return false;
      setSaving(true);
      setError(null);
      try {
        const res: ApiResponse<ServerUser> = await userApi.updateUserProfile(
          update,
        );
        if (res.success && res.data) {
          setUser(res.data);
          return true;
        } else {
          setError(res.error || 'Update failed');
          return false;
        }
      } catch {
        setError('Network error');
        return false;
      } finally {
        setSaving(false);
      }
    },
    [user],
  );

  return {
    user,
    loading,
    saving,
    error,
    updateProfile,
  };
}
