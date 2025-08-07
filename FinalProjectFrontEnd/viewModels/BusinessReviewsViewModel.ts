// viewModels/BusinessReviewsViewModel.ts
import React, { useState, useCallback, useRef } from 'react';
import { apiServices } from '../api';

// Review interface
interface Review {
  _id: string;
  rating: number;
  comment?: string;
  user: {
    _id: string;
    name: string;
    email?: string;
  };
  createdAt: string;
  updatedAt: string;
}

// Business reviews data structure
interface BusinessReviews {
  businessId: string;
  reviews: Review[];
  averageRating: number;
  totalReviews: number;
  pagination: {
    total: number;
    hasMore: boolean;
    limit: number;
    offset: number;
  } | null;
}

// State interface
interface BusinessReviewsState {
  reviewsCache: Record<string, BusinessReviews>;
  loading: boolean;
  error: string | null;
  currentBusinessId: string | null;
}

// Fetch params interface
interface FetchReviewsParams {
  limit?: number;
  offset?: number;
}

// Response interface
interface FetchReviewsResponse {
  success: boolean;
  data?: Review[];
  error?: string;
  pagination?: {
    total: number;
    hasMore: boolean;
    limit: number;
    offset: number;
  };
}

export class BusinessReviewsViewModel {
  private state: BusinessReviewsState = {
    reviewsCache: {},
    loading: false,
    error: null,
    currentBusinessId: null,
  };

  private listeners: Array<(state: BusinessReviewsState) => void> = [];

  // Subscribe to state changes
  subscribe(listener: (state: BusinessReviewsState) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.state));
  }

  private setState(updates: Partial<BusinessReviewsState>) {
    this.state = { ...this.state, ...updates };
    this.notifyListeners();
  }

  // Get current state
  getState() {
    return this.state;
  }

  // Calculate average rating for reviews
  private calculateAverageRating(reviews: Review[]): number {
    if (reviews.length === 0) return 0;
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    return totalRating / reviews.length;
  }

  // Fetch business reviews
  fetchBusinessReviews = async (
    businessId: string,
    params: FetchReviewsParams = {},
  ): Promise<FetchReviewsResponse> => {
    const isInitialLoad = params.offset === 0 || !params.offset;

    this.setState({
      loading: true,
      error: null,
      currentBusinessId: businessId,
    });

    try {
      const response = await apiServices.business.getBusinessReviews(
        businessId,
        params,
      );

      if (response.success && response.data) {
        const newReviews = response.data;
        const existingBusinessReviews = this.state.reviewsCache[businessId];

        // Combine existing reviews with new ones for pagination
        const allReviews = isInitialLoad
          ? newReviews
          : [...(existingBusinessReviews?.reviews || []), ...newReviews];

        const averageRating = this.calculateAverageRating(allReviews);

        const pagination = {
          total: allReviews.length,
          hasMore: newReviews.length >= (params.limit || 10),
          limit: params.limit || 10,
          offset: params.offset || 0,
        };

        const businessReviewsData: BusinessReviews = {
          businessId,
          reviews: allReviews,
          averageRating,
          totalReviews: allReviews.length,
          pagination,
        };

        this.setState({
          reviewsCache: {
            ...this.state.reviewsCache,
            [businessId]: businessReviewsData,
          },
          loading: false,
          error: null,
        });

        return {
          success: true,
          data: newReviews,
          pagination,
        };
      } else {
        const errorMessage = response.error || 'Failed to fetch reviews';
        this.setState({
          loading: false,
          error: errorMessage,
        });

        return {
          success: false,
          error: errorMessage,
        };
      }
    } catch (err: any) {
      const errorMessage = err.message || 'An unexpected error occurred';
      this.setState({
        loading: false,
        error: errorMessage,
      });

      return {
        success: false,
        error: errorMessage,
      };
    }
  };

  // Get business rating and count
  getBusinessRating = (
    businessId: string,
  ): { rating: number; count: number } => {
    const cached = this.state.reviewsCache[businessId];
    if (cached) {
      return {
        rating: cached.averageRating,
        count: cached.totalReviews,
      };
    }
    return { rating: 0, count: 0 };
  };

  // Clear cache for specific business or all businesses
  clearCache = (businessId?: string) => {
    if (businessId) {
      const newCache = { ...this.state.reviewsCache };
      delete newCache[businessId];
      this.setState({
        reviewsCache: newCache,
      });
    } else {
      this.setState({
        reviewsCache: {},
        error: null,
      });
    }
  };

  // Refresh business reviews (clear cache and fetch fresh data)
  refreshBusinessReviews = async (businessId: string): Promise<void> => {
    this.clearCache(businessId);
    await this.fetchBusinessReviews(businessId, { limit: 10, offset: 0 });
  };

  // Load more reviews for a business
  loadMoreReviews = async (
    businessId: string,
  ): Promise<FetchReviewsResponse> => {
    const existingData = this.state.reviewsCache[businessId];
    if (!existingData || !existingData.pagination?.hasMore) {
      return { success: false, error: 'No more reviews to load' };
    }

    const nextOffset = existingData.reviews.length;
    return await this.fetchBusinessReviews(businessId, {
      limit: existingData.pagination.limit,
      offset: nextOffset,
    });
  };

  // Get reviews for a specific business
  getBusinessReviews = (businessId: string): BusinessReviews | null => {
    return this.state.reviewsCache[businessId] || null;
  };

  // Check if business has cached reviews
  hasReviewsCache = (businessId: string): boolean => {
    return !!this.state.reviewsCache[businessId];
  };

  // Update a review in cache (after editing)
  updateReviewInCache = (businessId: string, updatedReview: Review) => {
    const businessReviews = this.state.reviewsCache[businessId];
    if (!businessReviews) return;

    const updatedReviews = businessReviews.reviews.map(review =>
      review._id === updatedReview._id ? updatedReview : review,
    );

    const averageRating = this.calculateAverageRating(updatedReviews);

    this.setState({
      reviewsCache: {
        ...this.state.reviewsCache,
        [businessId]: {
          ...businessReviews,
          reviews: updatedReviews,
          averageRating,
        },
      },
    });
  };

  // Add new review to cache (after creating)
  addReviewToCache = (businessId: string, newReview: Review) => {
    const businessReviews = this.state.reviewsCache[businessId];

    if (businessReviews) {
      // Add to existing cache
      const updatedReviews = [newReview, ...businessReviews.reviews];
      const averageRating = this.calculateAverageRating(updatedReviews);

      this.setState({
        reviewsCache: {
          ...this.state.reviewsCache,
          [businessId]: {
            ...businessReviews,
            reviews: updatedReviews,
            averageRating,
            totalReviews: updatedReviews.length,
          },
        },
      });
    } else {
      // Create new cache entry
      this.setState({
        reviewsCache: {
          ...this.state.reviewsCache,
          [businessId]: {
            businessId,
            reviews: [newReview],
            averageRating: newReview.rating,
            totalReviews: 1,
            pagination: {
              total: 1,
              hasMore: false,
              limit: 10,
              offset: 0,
            },
          },
        },
      });
    }
  };

  // Remove review from cache (after deleting)
  removeReviewFromCache = (businessId: string, reviewId: string) => {
    const businessReviews = this.state.reviewsCache[businessId];
    if (!businessReviews) return;

    const updatedReviews = businessReviews.reviews.filter(
      review => review._id !== reviewId,
    );
    const averageRating = this.calculateAverageRating(updatedReviews);

    this.setState({
      reviewsCache: {
        ...this.state.reviewsCache,
        [businessId]: {
          ...businessReviews,
          reviews: updatedReviews,
          averageRating,
          totalReviews: updatedReviews.length,
        },
      },
    });
  };
}

// Hook to use BusinessReviewsViewModel
export const useBusinessReviewsViewModel = () => {
  const viewModelRef = useRef<BusinessReviewsViewModel | null>(null);

  // Initialize view model only once
  if (!viewModelRef.current) {
    viewModelRef.current = new BusinessReviewsViewModel();
  }

  const viewModel = viewModelRef.current;
  const [state, setState] = useState<BusinessReviewsState>(
    viewModel.getState(),
  );

  // Subscribe to state changes
  React.useEffect(() => {
    const unsubscribe = viewModel.subscribe(setState);
    return unsubscribe;
  }, [viewModel]);

  // Create stable function references
  const fetchBusinessReviews = useCallback(
    (businessId: string, params?: FetchReviewsParams) => {
      return viewModel.fetchBusinessReviews(businessId, params);
    },
    [viewModel],
  );

  const getBusinessRating = useCallback(
    (businessId: string) => {
      return viewModel.getBusinessRating(businessId);
    },
    [viewModel],
  );

  const clearCache = useCallback(
    (businessId?: string) => {
      return viewModel.clearCache(businessId);
    },
    [viewModel],
  );

  const refreshBusinessReviews = useCallback(
    (businessId: string) => {
      return viewModel.refreshBusinessReviews(businessId);
    },
    [viewModel],
  );

  const loadMoreReviews = useCallback(
    (businessId: string) => {
      return viewModel.loadMoreReviews(businessId);
    },
    [viewModel],
  );

  const getBusinessReviews = useCallback(
    (businessId: string) => {
      return viewModel.getBusinessReviews(businessId);
    },
    [viewModel],
  );

  const hasReviewsCache = useCallback(
    (businessId: string) => {
      return viewModel.hasReviewsCache(businessId);
    },
    [viewModel],
  );

  const updateReviewInCache = useCallback(
    (businessId: string, updatedReview: Review) => {
      return viewModel.updateReviewInCache(businessId, updatedReview);
    },
    [viewModel],
  );

  const addReviewToCache = useCallback(
    (businessId: string, newReview: Review) => {
      return viewModel.addReviewToCache(businessId, newReview);
    },
    [viewModel],
  );

  const removeReviewFromCache = useCallback(
    (businessId: string, reviewId: string) => {
      return viewModel.removeReviewFromCache(businessId, reviewId);
    },
    [viewModel],
  );

  return {
    // State
    reviewsCache: state.reviewsCache,
    loading: state.loading,
    error: state.error,
    currentBusinessId: state.currentBusinessId,
    // Methods
    fetchBusinessReviews,
    getBusinessRating,
    clearCache,
    refreshBusinessReviews,
    loadMoreReviews,
    getBusinessReviews,
    hasReviewsCache,
    updateReviewInCache,
    addReviewToCache,
    removeReviewFromCache,
  };
};
