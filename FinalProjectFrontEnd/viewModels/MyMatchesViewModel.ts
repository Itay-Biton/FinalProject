import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { MyPetEntry, MyPetsListResponse } from '../types/pet';
import PetApiService from '../api/services/PetApiService';
import { apiClient } from '../api';

type PaginationState = { offset: number; limit: number; hasMore: boolean };

export function useMyMatchesViewModel() {
  const petService = useMemo(() => new PetApiService(apiClient), []);

  const [pets, setPets] = useState<MyPetEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, _setPagination] = useState<PaginationState>({
    offset: 0,
    limit: 20,
    hasMore: true,
  });

  // Keep pagination in a ref so loadPets doesn't depend on state
  const paginationRef = useRef<PaginationState>(pagination);
  const setPagination = useCallback(
    (updater: (prev: PaginationState) => PaginationState) => {
      _setPagination(prev => {
        const next = updater(prev);
        paginationRef.current = next;
        return next;
      });
    },
    [],
  );

  // Prevent overlapping calls / loops
  const fetchingRef = useRef(false);

  const loadPets = useCallback(
    async (opts: { refresh?: boolean } = {}) => {
      if (fetchingRef.current) return;
      fetchingRef.current = true;

      const refresh = !!opts.refresh;
      setError(null);

      if (refresh) {
        setLoading(true);
        // Reset pagination synchronously (via ref-aware setter)
        setPagination(prev => ({ ...prev, offset: 0, hasMore: true }));
      } else {
        setLoadingMore(true);
      }

      try {
        const { limit } = paginationRef.current;
        const offset = refresh ? 0 : paginationRef.current.offset;

        const response = await petService.getMyMatches();
        if (!response.success || !response.data) {
          throw new Error(response.error || 'Failed to load pets');
        }

        const { pets: newPets = [], pagination: apiPg } =
          response.data as MyPetsListResponse;

        setPets(prev => (refresh ? newPets : [...prev, ...newPets]));

        // Prefer API's hasMore if provided; otherwise infer from batch size
        const derivedHasMore =
          typeof apiPg?.hasMore === 'boolean'
            ? apiPg.hasMore
            : newPets.length === limit;

        // Move offset forward only if we actually got results
        setPagination(prev => ({
          offset: offset + (newPets.length > 0 ? limit : 0),
          limit: prev.limit,
          hasMore: derivedHasMore,
        }));
      } catch (err: any) {
        console.error('Error loading pets:', err);
        setError(err.message || 'Failed to load pets');
      } finally {
        setLoading(false);
        setLoadingMore(false);
        fetchingRef.current = false;
      }
    },
    [petService, setPagination],
  );

  const loadMore = useCallback(() => {
    if (loading || loadingMore) return;
    if (!paginationRef.current.hasMore) return;
    loadPets();
  }, [loadPets, loading, loadingMore]);

  const refresh = useCallback(() => {
    loadPets({ refresh: true });
  }, [loadPets]);

  const deletePet = useCallback(
    async (petId: string) => {
      setLoading(true);
      setError(null);
      try {
        const res = await petService.deletePet(petId);
        if (!res.success) throw new Error(res.error || 'Failed to delete pet');

        setPets(prev =>
          prev.filter(p => (p as any).id !== petId && (p as any)._id !== petId),
        );

        // If list is empty and more pages exist, try to fetch the next page once
        if (pets.length <= 1 && paginationRef.current.hasMore) {
          await loadPets();
        }
      } catch (err: any) {
        console.error('Error deleting pet:', err);
        setError(err.message || 'Failed to delete pet');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [petService, pets.length, loadPets],
  );

  // Run ONCE on mount (do not depend on loadPets to avoid loops)
  useEffect(() => {
    loadPets({ refresh: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
