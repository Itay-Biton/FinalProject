// viewModels/BusinessSearchViewModel.ts
import React, { useState, useCallback, useRef } from 'react';
import { apiServices } from '../api';
import {
  Business,
  BusinessSearchParams,
  PaginationInfo,
} from '../types/business';

interface BusinessSearchState {
  businesses: Business[];
  loading: boolean;
  refreshing: boolean;
  loadingMore: boolean;
  error: string | null;
  pagination: PaginationInfo | null;
  hasMore: boolean;
}

interface SearchFilters {
  searchQuery: string;
  serviceType: string;
  location?: { lat: number; lng: number };
  radius?: number;
}

export class BusinessSearchViewModel {
  private state: BusinessSearchState = {
    businesses: [],
    loading: false,
    refreshing: false,
    loadingMore: false,
    error: null,
    pagination: null,
    hasMore: true,
  };

  private filters: SearchFilters = {
    searchQuery: '',
    serviceType: 'all',
  };

  private listeners: Array<(state: BusinessSearchState) => void> = [];

  // Subscribe to state changes
  subscribe(listener: (state: BusinessSearchState) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.state));
  }

  private setState(updates: Partial<BusinessSearchState>) {
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

  // Search businesses with pagination
  searchBusinesses = async (reset = true) => {
    if (reset) {
      this.setState({
        loading: true,
        error: null,
        businesses: [],
        pagination: null,
        hasMore: true,
      });
    } else {
      if (!this.state.hasMore || this.state.loadingMore) return;
      this.setState({ loadingMore: true, error: null });
    }

    try {
      const params: BusinessSearchParams = {
        search: this.filters.searchQuery || undefined,
        serviceType:
          this.filters.serviceType !== 'all'
            ? this.filters.serviceType
            : undefined,
        limit: 20,
        offset: reset ? 0 : this.state.businesses.length,
      };

      // Add location params if available
      if (this.filters.location && this.filters.radius) {
        params.location = `${this.filters.location.lat},${this.filters.location.lng}`;
        params.radius = this.filters.radius;
      }

      const response = await apiServices.business.searchBusinesses(params);

      if (response.success && response.data) {
        const newBusinesses = reset
          ? response.data.businesses
          : [...this.state.businesses, ...response.data.businesses];

        this.setState({
          businesses: newBusinesses,
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
          error: response.error || 'Failed to search businesses',
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

  // Refresh businesses
  refreshBusinesses = async () => {
    this.setState({ refreshing: true, error: null });

    try {
      await this.searchBusinesses(true);
    } finally {
      this.setState({ refreshing: false });
    }
  };

  // Load more businesses
  loadMoreBusinesses = async () => {
    if (this.state.hasMore && !this.state.loading && !this.state.loadingMore) {
      await this.searchBusinesses(false);
    }
  };

  // Clear search
  clearSearch = () => {
    this.filters = {
      searchQuery: '',
      serviceType: 'all',
    };
    this.setState({
      businesses: [],
      error: null,
      pagination: null,
      hasMore: true,
    });
  };
}

// Hook to use BusinessSearchViewModel
export const useBusinessSearchViewModel = () => {
  const viewModelRef = useRef<BusinessSearchViewModel | null>(null);

  // Initialize view model only once
  if (!viewModelRef.current) {
    viewModelRef.current = new BusinessSearchViewModel();
  }

  const viewModel = viewModelRef.current;
  const [state, setState] = useState<BusinessSearchState>(viewModel.getState());

  // Subscribe to state changes
  React.useEffect(() => {
    const unsubscribe = viewModel.subscribe(setState);
    return unsubscribe;
  }, [viewModel]);

  // Create stable function references
  const searchBusinesses = useCallback(
    (reset?: boolean) => {
      return viewModel.searchBusinesses(reset);
    },
    [viewModel],
  );

  const refreshBusinesses = useCallback(() => {
    return viewModel.refreshBusinesses();
  }, [viewModel]);

  const loadMoreBusinesses = useCallback(() => {
    return viewModel.loadMoreBusinesses();
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
    businesses: state.businesses,
    loading: state.loading,
    refreshing: state.refreshing,
    loadingMore: state.loadingMore,
    error: state.error,
    pagination: state.pagination,
    hasMore: state.hasMore,
    // Methods
    searchBusinesses,
    refreshBusinesses,
    loadMoreBusinesses,
    setFilters,
    getFilters,
    clearSearch,
  };
};
