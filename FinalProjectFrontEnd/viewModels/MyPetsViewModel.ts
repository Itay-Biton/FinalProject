// viewModels/MyPetsViewModel.ts
import { useState, useEffect, useCallback, useMemo } from 'react';
import { MyPetEntry, MyPetsListResponse } from '../types/pet';
import PetApiService from '../api/services/PetApiService';
import { apiClient } from '../api';

/**
 * ViewModel for managing the user's pets list
 * Works with the new Pet/MyPetEntry types
 */
export function useMyPetsViewModel() {
  // Memoize the service to prevent unnecessary re-creation
  const petService = useMemo(() => new PetApiService(apiClient), []);

  // State - using MyPetEntry[] since this is for "My Pets" screen
  const [pets, setPets] = useState<MyPetEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    offset: 0,
    limit: 20,
    hasMore: true,
  });

  /**
   * Load pets for the first time or refresh
   */
  const loadPets = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) {
        setLoading(true);
        setPagination(prev => ({ ...prev, offset: 0, hasMore: true }));
      } else if (!isRefresh && pagination.offset === 0) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      setError(null);

      try {
        const currentOffset = isRefresh ? 0 : pagination.offset;

        // Call your API service to get my pets
        const response = await petService.getMyPets({
          limit: pagination.limit,
          offset: currentOffset,
        });

        if (!response.success || !response.data) {
          throw new Error(response.error || 'Failed to load pets');
        }

        const { pets: newPets, pagination: newPagination } =
          response.data as MyPetsListResponse;

        if (isRefresh || currentOffset === 0) {
          setPets(newPets);
        } else {
          setPets(prev => [...prev, ...newPets]);
        }

        setPagination({
          offset: newPagination.offset + newPagination.limit,
          limit: pagination.limit,
          hasMore: newPagination.hasMore,
        });
      } catch (err: any) {
        console.error('Error loading pets:', err);
        setError(err.message || 'Failed to load pets');
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [pagination.offset, pagination.limit, petService],
  );

  /**
   * Load more pets (pagination)
   */
  const loadMore = useCallback(() => {
    if (!loadingMore && !loading && pagination.hasMore) {
      loadPets(false);
    }
  }, [loadPets, loadingMore, loading, pagination.hasMore]);

  /**
   * Refresh the pets list
   */
  const refresh = useCallback(() => {
    loadPets(true);
  }, [loadPets]);

  /**
   * Delete a pet
   */
  const deletePet = useCallback(
    async (petId: string) => {
      setLoading(true);
      setError(null);

      try {
        const response = await petService.deletePet(petId);

        if (!response.success) {
          throw new Error(response.error || 'Failed to delete pet');
        }

        // Remove the pet from local state
        setPets(prev => prev.filter(pet => pet.id !== petId));

        // If we removed the last pet on current page, try loading more
        if (pets.length <= 1 && pagination.hasMore) {
          await loadPets(false);
        }
      } catch (err: any) {
        console.error('Error deleting pet:', err);
        setError(err.message || 'Failed to delete pet');
        throw err; // Re-throw so the component can handle it
      } finally {
        setLoading(false);
      }
    },
    [petService, pets.length, pagination.hasMore, loadPets],
  );

  /**
   * Initialize - load pets on mount
   */
  useEffect(() => {
    loadPets(true);
  }, [loadPets]); // Only run once on mount

  return {
    pets,
    loading,
    loadingMore,
    error,
    loadMore,
    refresh,
    deletePet,
  };
}

// Example of what your PetApiService should look like for the new types:
/*
// In PetApiService.ts
export interface GetMyPetsParams {
  limit?: number;
  offset?: number;
}

class PetApiService {
  // ... other methods

  async getMyPets(params: GetMyPetsParams = {}): Promise<ApiResponse<MyPetsListResponse>> {
    const queryParams = new URLSearchParams({
      limit: (params.limit || 20).toString(),
      offset: (params.offset || 0).toString(),
    });

    return this.apiClient.get<MyPetsListResponse>(`${this.prefix}/my?${queryParams}`);
  }

  async deletePet(petId: string): Promise<ApiResponse<{ success: boolean }>> {
    return this.apiClient.delete<{ success: boolean }>(`${this.prefix}/${petId}`);
  }
}
*/
