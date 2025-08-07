// viewModels/PetSearchViewModel.ts
import React, { useState, useCallback, useRef } from 'react';
import { apiServices } from '../api';
import { Pet, PetSearchParams, PaginationInfo } from '../types/pet';

interface PetSearchState {
  pets: Pet[];
  loading: boolean;
  refreshing: boolean;
  loadingMore: boolean;
  error: string | null;
  pagination: PaginationInfo | null;
  hasMore: boolean;
}

interface SearchFilters {
  searchQuery: string;
  species: string;
  location?: { lat: number; lng: number };
  radius?: number;
}

export class PetSearchViewModel {
  private state: PetSearchState = {
    pets: [],
    loading: false,
    refreshing: false,
    loadingMore: false,
    error: null,
    pagination: null,
    hasMore: true,
  };

  private filters: SearchFilters = {
    searchQuery: '',
    species: 'all',
  };

  private listeners: Array<(state: PetSearchState) => void> = [];

  // Subscribe to state changes
  subscribe(listener: (state: PetSearchState) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.state));
  }

  private setState(updates: Partial<PetSearchState>) {
    this.state = { ...this.state, ...updates };
    this.notifyListeners();
  }

  // Get current state
  getState() {
    return this.state;
  }

  // Set filters
  setFilters = (newFilters: Partial<SearchFilters>) => {
    this.filters = { ...this.filters, ...newFilters };
  };

  getFilters = () => {
    return this.filters;
  };

  // Search pets with pagination
  searchPets = async (reset = true) => {
    if (reset) {
      this.setState({
        loading: true,
        error: null,
        pets: [],
        pagination: null,
        hasMore: true,
      });
    } else {
      if (!this.state.hasMore || this.state.loadingMore) return;
      this.setState({ loadingMore: true, error: null });
    }

    try {
      const params: PetSearchParams = {
        search: this.filters.searchQuery || undefined,
        species:
          this.filters.species !== 'all' ? this.filters.species : undefined,
        limit: 20,
        offset: reset ? 0 : this.state.pets.length,
      };

      // Add location params if available
      if (this.filters.location && this.filters.radius) {
        params.location = `${this.filters.location.lat},${this.filters.location.lng}`;
        params.radius = this.filters.radius;
      }

      const response = await apiServices.pet.searchPets(params);

      if (response.success && response.data) {
        const newPets = reset
          ? response.data.pets
          : [...this.state.pets, ...response.data.pets];

        this.setState({
          pets: newPets,
          loading: false,
          loadingMore: false,
          pagination: response.data.pagination,
          hasMore: response.data.pagination.hasMore,
          error: null,
        });
      } else {
        this.setState({
          loading: false,
          loadingMore: false,
          error: response.error || 'Failed to search pets',
        });
      }
    } catch (error: any) {
      this.setState({
        loading: false,
        loadingMore: false,
        error: error.message || 'An unexpected error occurred',
      });
    }
  };

  // Refresh pets
  refreshPets = async () => {
    this.setState({ refreshing: true, error: null });

    try {
      await this.searchPets(true);
    } finally {
      this.setState({ refreshing: false });
    }
  };

  // Load more pets
  loadMorePets = async () => {
    if (this.state.hasMore && !this.state.loading && !this.state.loadingMore) {
      await this.searchPets(false);
    }
  };

  // Clear search
  clearSearch = () => {
    this.filters = {
      searchQuery: '',
      species: 'all',
    };
    this.setState({
      pets: [],
      error: null,
      pagination: null,
      hasMore: true,
    });
  };
}

// Hook to use PetSearchViewModel
export const usePetSearchViewModel = () => {
  const viewModelRef = useRef<PetSearchViewModel | null>(null);

  // Initialize view model only once
  if (!viewModelRef.current) {
    viewModelRef.current = new PetSearchViewModel();
  }

  const viewModel = viewModelRef.current;
  const [state, setState] = useState<PetSearchState>(viewModel.getState());

  // Subscribe to state changes
  React.useEffect(() => {
    const unsubscribe = viewModel.subscribe(setState);
    return unsubscribe;
  }, [viewModel]);

  // Create stable function references
  const searchPets = useCallback(
    (reset?: boolean) => {
      return viewModel.searchPets(reset);
    },
    [viewModel],
  );

  const refreshPets = useCallback(() => {
    return viewModel.refreshPets();
  }, [viewModel]);

  const loadMorePets = useCallback(() => {
    return viewModel.loadMorePets();
  }, [viewModel]);

  const setFilters = useCallback(
    (filters: Partial<SearchFilters>) => {
      return viewModel.setFilters(filters);
    },
    [viewModel],
  );

  const getFilters = useCallback(() => {
    return viewModel.getFilters();
  }, [viewModel]);

  const clearSearch = useCallback(() => {
    return viewModel.clearSearch();
  }, [viewModel]);

  return {
    // State
    pets: state.pets,
    loading: state.loading,
    refreshing: state.refreshing,
    loadingMore: state.loadingMore,
    error: state.error,
    pagination: state.pagination,
    hasMore: state.hasMore,
    // Methods
    searchPets,
    refreshPets,
    loadMorePets,
    setFilters,
    getFilters,
    clearSearch,
  };
};
