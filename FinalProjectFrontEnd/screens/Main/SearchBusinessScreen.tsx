// SearchBusinessScreen.tsx - Complete Fixed Version

import React, {
  useState,
  useMemo,
  memo,
  useCallback,
  useEffect,
  useRef,
} from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  useWindowDimensions,
  Linking,
  RefreshControl,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  I18nManager,
} from 'react-native';
import { useTheme, Text, IconButton } from 'react-native-paper';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
import { useTranslation } from 'react-i18next';
import { ThemeColors } from '../../types/theme';
import StyledLocationPicker from '../../components/UI/StyledLocationPicker';
import IconDropdown from '../../components/UI/IconDropdown';
import BusinessCard from '../../components/Cards/BusinessCard';
import CustomInputText from '../../components/UI/CustomInputText';
import PhoneNumberPickerModal from '../../components/Modals/PhoneNumberPickerModal';
import AlertModal from '../../components/Modals/AlertModal';
import RatingModal from '../../components/Modals/RatingModal';
import ReviewsModal from '../../components/Modals/ReviewsModal'; // Fixed import
import SnakeSlider from '../../components/UI/SnakeSlider';
import { RouteMapModal } from '../../components/Modals/RouteMapModal';

// Location permissions
import { useLocationPermission } from '../../utils/LocationPermissions';

// Constants
import { getServiceTypesList } from '../../constants/serviceTypesList';

// ViewModels
import { useBusinessSearchViewModel } from '../../viewModels/BusinessSearchViewModel';
import { useBusinessReviewsViewModel } from '../../viewModels/BusinessReviewsViewModel'; // Fixed import

// API Services
import { apiServices } from '../../api';

// Types
import { Business } from '../../types/business';

// Icons - MOVED OUTSIDE OF COMPONENT
import SearchIconSvg from '../../assets/icons/ic_search.svg';
import LocationIconSvg from '../../assets/icons/ic_location.svg';
import FilterIconSvg from '../../assets/icons/ic_filter.svg';
import ServiceIconSvg from '../../assets/icons/ic_service.svg';
import CheckIconSvg from '../../assets/icons/ic_save.svg';

// Icon components - MOVED OUTSIDE OF COMPONENT
const SearchIcon = ({ color }: { color?: string }) => (
  <SearchIconSvg
    width={moderateScale(20)}
    height={moderateScale(20)}
    stroke={color || 'black'}
  />
);

const LocationIcon = ({ color }: { color?: string }) => (
  <LocationIconSvg
    width={moderateScale(24)}
    height={moderateScale(24)}
    stroke={color || 'black'}
  />
);

const FilterIcon = ({ color }: { color?: string }) => (
  <FilterIconSvg
    width={moderateScale(20)}
    height={moderateScale(20)}
    stroke={color || 'black'}
  />
);

const ServiceIcon = ({ color }: { color?: string }) => (
  <ServiceIconSvg
    width={moderateScale(20)}
    height={moderateScale(20)}
    stroke={color || 'black'}
  />
);

const CheckIcon = ({ color }: { color?: string }) => (
  <CheckIconSvg
    width={moderateScale(16)}
    height={moderateScale(16)}
    stroke={color || 'black'}
  />
);

// Icon render functions - MOVED OUTSIDE OF COMPONENT
const renderFilterIcon = (color: string) => () => <FilterIcon color={color} />;

// Coordinate interface for navigation
interface Coordinate {
  latitude: number;
  longitude: number;
}

interface LocationData {
  id: string;
  title: string;
  lat: string;
  lon: string;
}

const SearchBusinessScreen: React.FC = memo(() => {
  const { width, height } = useWindowDimensions();
  const { colors }: { colors: ThemeColors } = useTheme();
  const { t } = useTranslation();
  const styles = useMemo(
    () => createStyles(width, height, colors),
    [width, height, colors],
  );

  // ViewModels
  const {
    businesses,
    loading,
    refreshing,
    loadingMore,
    error,
    hasMore,
    searchBusinesses,
    refreshBusinesses,
    loadMoreBusinesses,
    setFilters,
    getFilters,
    clearSearch,
  } = useBusinessSearchViewModel();

  // Reviews ViewModel - FIXED
  const {
    reviewsCache,
    fetchBusinessReviews,
    getBusinessRating,
    refreshBusinessReviews,
  } = useBusinessReviewsViewModel();

  // State management
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedServiceType, setSelectedServiceType] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [currentImageIndices, setCurrentImageIndices] = useState<
    Record<string, number>
  >({});

  // Phone number picker modal state
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState<null | {
    name: string;
    phoneNumbers: string[];
  }>(null);

  // Rating modal state
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedBusinessForRating, setSelectedBusinessForRating] =
    useState<null | {
      id: string;
      name: string;
    }>(null);

  // Reviews modal state - FIXED
  const [showReviewsModal, setShowReviewsModal] = useState(false);
  const [selectedBusinessForReviews, setSelectedBusinessForReviews] =
    useState<null | {
      id: string;
      name: string;
    }>(null);

  // Navigation modal state
  const [showNavigationModal, setShowNavigationModal] = useState(false);
  const [navigationDestination, setNavigationDestination] =
    useState<Coordinate | null>(null);

  // Alert modal state
  const [alertModal, setAlertModal] = useState<{
    visible: boolean;
    title: string;
    message: string;
    buttons: Array<{
      text: string;
      onPress?: () => void;
      style?: 'default' | 'cancel' | 'destructive';
    }>;
    icon?: 'alert' | 'success' | 'error' | 'info';
  }>({
    visible: false,
    title: '',
    message: '',
    buttons: [],
  });

  // Centralized user location state for both filtering and navigation
  const [userLocation, setUserLocation] = useState<Coordinate | null>(null);
  const [filterLocation, setFilterLocation] = useState<LocationData | null>(
    null,
  );
  const [locationMethod, setLocationMethod] = useState<'current' | 'manual'>(
    'current',
  );
  const [searchRadius, setSearchRadius] = useState<number>(5); // Default 5km radius
  const [showRadiusSelector, setShowRadiusSelector] = useState(false);

  // Location permissions hook
  const { getCurrentLocation, loading: currentLocationLoading } =
    useLocationPermission();

  // Service types list with "All" option
  const serviceTypesList = useMemo(() => {
    const allOption = {
      label: t('all'),
      value: 'all',
      icon: require('../../assets/icons/ic_business.svg'),
    };
    return [allOption, ...getServiceTypesList(t)];
  }, [t]);

  // FlatList ref for scroll control
  const flatListRef = useRef<FlatList>(null);

  // Load initial data and fetch reviews for each business
  useEffect(() => {
    searchBusinesses(true);
  }, [searchBusinesses]);

  // Handle search filters change
  useEffect(() => {
    const filters = {
      searchQuery,
      serviceType: selectedServiceType,
      location: userLocation
        ? { lat: userLocation.latitude, lng: userLocation.longitude }
        : undefined,
      radius: userLocation ? searchRadius : undefined,
    };

    setFilters(filters);

    // Debounce search
    const timeoutId = setTimeout(() => {
      searchBusinesses(true);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [
    searchQuery,
    selectedServiceType,
    userLocation,
    searchRadius,
    setFilters,
    searchBusinesses,
  ]);

  const onRefresh = useCallback(() => {
    // Scroll to top when refreshing for better UX
    flatListRef.current?.scrollToOffset({ animated: true, offset: 0 });
    refreshBusinesses();
  }, [refreshBusinesses]);

  const handleCall = useCallback(
    (phoneNumbers: string[], businessName: string) => {
      if (phoneNumbers.length === 1) {
        // If only one phone number, call directly
        Linking.openURL(`tel:${phoneNumbers[0]}`);
      } else {
        // If multiple phone numbers, show picker modal
        setSelectedBusiness({ name: businessName, phoneNumbers });
        setShowPhoneModal(true);
      }
    },
    [],
  );

  const handlePhoneSelect = useCallback((phoneNumber: string) => {
    Linking.openURL(`tel:${phoneNumber}`);
  }, []);

  const handleEmail = useCallback((email: string) => {
    Linking.openURL(`mailto:${email}`);
  }, []);

  // Updated handleRate function to show rating modal
  const handleRate = useCallback((businessId: string, businessName: string) => {
    console.log('Rate business:', businessId, businessName);
    setSelectedBusinessForRating({ id: businessId, name: businessName });
    setShowRatingModal(true);
  }, []);

  const handleViewReviews = useCallback(
    async (businessId: string, businessName: string) => {
      // fetch only if we don't already have page 1 cached
      if (!reviewsCache[businessId]) {
        await fetchBusinessReviews(businessId, { limit: 10, offset: 0 });
      }
      setSelectedBusinessForReviews({ id: businessId, name: businessName });
      setShowReviewsModal(true);
    },
    [fetchBusinessReviews, reviewsCache],
  );

  // Handle rating submission
  const handleRatingSubmit = useCallback(
    async (businessId: string, rating: number, comment?: string) => {
      try {
        const reviewData = {
          rating,
          comment: comment || undefined,
        };

        const response = await apiServices.business.createReview(
          businessId,
          reviewData,
        );

        if (response.success) {
          setAlertModal({
            visible: true,
            title: t('success'),
            message: t('rating_submitted_successfully'),
            icon: 'success',
            buttons: [{ text: t('ok'), style: 'default' }],
          });

          // Refresh reviews for this business
          refreshBusinessReviews(businessId);
        } else {
          throw new Error(response.error || 'Failed to submit rating');
        }
      } catch (error: any) {
        console.error('Error submitting rating:', error);
        setAlertModal({
          visible: true,
          title: t('error'),
          message: error.message || t('failed_to_submit_rating'),
          icon: 'error',
          buttons: [{ text: t('ok'), style: 'default' }],
        });
      }
    },
    [t, refreshBusinessReviews],
  );

  // Close rating modal
  const handleCloseRatingModal = useCallback(() => {
    setShowRatingModal(false);
    setSelectedBusinessForRating(null);
  }, []);

  // FIXED Close reviews modal
  const handleCloseReviewsModal = useCallback(() => {
    console.log('Closing reviews modal');
    setShowReviewsModal(false);
    setSelectedBusinessForReviews(null);
  }, []);

  // Updated handleNavigate function to use stored user location
  const handleNavigate = useCallback(
    (businessId: string, businessName: string) => {
      console.log('Navigate to business:', businessId, businessName);

      // Check if user has set a location in filters
      if (!userLocation) {
        setAlertModal({
          visible: true,
          title: t('location_required'),
          message: t('please_set_location_in_filters_for_navigation'),
          icon: 'info',
          buttons: [
            {
              text: t('cancel'),
              style: 'cancel',
            },
            {
              text: t('open_filters'),
              onPress: () => setShowFilters(true),
            },
          ],
        });
        return;
      }

      // Find the business to get its coordinates
      const business = businesses.find(b => b._id === businessId);
      if (!business) {
        setAlertModal({
          visible: true,
          title: t('error'),
          message: t('business_location_not_found'),
          icon: 'error',
          buttons: [
            {
              text: t('ok'),
              style: 'default',
            },
          ],
        });
        return;
      }

      if (!business.location?.coordinates?.coordinates) {
        setAlertModal({
          visible: true,
          title: t('error'),
          message: t('business_location_not_available'),
          icon: 'error',
          buttons: [
            {
              text: t('ok'),
              style: 'default',
            },
          ],
        });
        return;
      }

      const destination: Coordinate = {
        latitude: business.location.coordinates.coordinates[1], // GeoJSON format: [lng, lat]
        longitude: business.location.coordinates.coordinates[0],
      };

      setNavigationDestination(destination);
      setShowNavigationModal(true);
    },
    [userLocation, businesses, t],
  );

  // Close navigation modal
  const handleCloseNavigation = useCallback(() => {
    setShowNavigationModal(false);
    setNavigationDestination(null);
  }, []);

  // Location filtering functions that also set user location for navigation
  const handleFetchCurrentLocation = useCallback(async () => {
    console.log('🔍 Fetching current location for filtering and navigation...');
    const coords = await getCurrentLocation();
    if (coords) {
      const currentLocation: LocationData = {
        id: 'current-location',
        title: t('current_location'),
        lat: coords.latitude.toString(),
        lon: coords.longitude.toString(),
      };

      // Set both filter location and user location for navigation
      setFilterLocation(currentLocation);
      setUserLocation({
        latitude: coords.latitude,
        longitude: coords.longitude,
      });

      console.log(
        '📍 Current location set for filtering and navigation:',
        currentLocation,
      );
      setShowRadiusSelector(true);
    }
  }, [getCurrentLocation, t]);

  const handleManualLocationSelect = useCallback((location: LocationData) => {
    // Set both filter location and user location for navigation
    setFilterLocation(location);
    setUserLocation({
      latitude: parseFloat(location.lat),
      longitude: parseFloat(location.lon),
    });

    console.log(
      '📍 Manual location set for filtering and navigation:',
      location,
    );
    setShowRadiusSelector(true);
  }, []);

  const handleLocationMethodChange = useCallback(
    (method: 'current' | 'manual') => {
      setLocationMethod(method);
      setFilterLocation(null);
      setUserLocation(null); // Clear user location when method changes
      setShowRadiusSelector(false);
      console.log('📍 Location method changed to:', method);
    },
    [],
  );

  const handleRadiusChange = useCallback((radius: number) => {
    setSearchRadius(radius);
    console.log('📏 Search radius changed to:', radius, 'km');
  }, []);

  const renderServiceTypeItem = useCallback(
    (item: any) => (
      <View style={styles.dropdownItemContainer}>
        <Image
          source={item.icon}
          style={styles.dropdownItemIcon}
          resizeMode="contain"
        />
        <Text style={styles.dropdownItemText}>{item.label}</Text>
      </View>
    ),
    [styles],
  );

  // Image slider handlers
  const handleImageScroll = useCallback(
    (event: any, businessId: string, imageCount: number) => {
      const scrollX = event.nativeEvent.contentOffset.x;
      const imageWidth = scale(350);
      const currentIndex = Math.round(scrollX / imageWidth);
      const clampedIndex = Math.max(0, Math.min(currentIndex, imageCount - 1));

      setCurrentImageIndices(prev => ({
        ...prev,
        [businessId]: clampedIndex,
      }));
    },
    [],
  );

  const handleImageIndexChange = useCallback(
    (businessId: string, index: number) => {
      setCurrentImageIndices(prev => ({
        ...prev,
        [businessId]: index,
      }));
    },
    [],
  );
  const convertBusinessForCard = useCallback(
    (business: Business) => {
      const raw = business as any;

      // 1) Use backend-provided fields FIRST
      let avg =
        typeof raw.rating === 'number' && Number.isFinite(raw.rating)
          ? raw.rating
          : undefined;

      let count =
        typeof raw.reviewCount === 'number' && Number.isFinite(raw.reviewCount)
          ? raw.reviewCount
          : undefined;

      // 2) Fallbacks (ONLY if needed)
      if (avg === undefined && typeof raw.reviewsSummary?.avg === 'number') {
        avg = raw.reviewsSummary.avg;
      }
      if (
        count === undefined &&
        typeof raw.reviewsSummary?.count === 'number'
      ) {
        count = raw.reviewsSummary.count;
      }

      if (avg === undefined || count === undefined) {
        const cached = getBusinessRating(business._id); // { rating, count }
        if (avg === undefined) avg = cached.rating;
        if (count === undefined) count = cached.count;
      }

      const rating = typeof avg === 'number' && Number.isFinite(avg) ? avg : 0;
      const reviewCount =
        typeof count === 'number' && Number.isFinite(count) ? count : 0;

      return {
        id: business._id,
        name: business.name,
        serviceType: business.serviceType,
        rating,
        reviewCount,
        email: business.email || '',
        phoneNumbers: business.phoneNumbers,
        location: business.location.address,
        latitude: business.location.coordinates.coordinates[1],
        longitude: business.location.coordinates.coordinates[0],
        distance: business.distance || t('distance_not_available'),
        workingHours: business.workingHours,
        images: business.images,
        description: business.description || t('no_description_available'),
        services: business.services,
        isOpen: business.isOpen,
        isVerified: business.isVerified,
      };
    },
    [t, getBusinessRating],
  );

  const renderBusinessItem = useCallback(
    ({ item }: { item: Business }) => {
      console.log(item);
      const businessForCard = convertBusinessForCard(item);
      return (
        <BusinessCard
          business={businessForCard}
          currentImageIndex={currentImageIndices[item._id] || 0}
          onImageIndexChange={handleImageIndexChange}
          onImageScroll={handleImageScroll}
          onCall={handleCall}
          onEmail={handleEmail}
          onRate={handleRate}
          onNavigate={handleNavigate}
          onViewReviews={handleViewReviews} // Fixed prop
        />
      );
    },
    [
      convertBusinessForCard,
      currentImageIndices,
      handleImageIndexChange,
      handleImageScroll,
      handleCall,
      handleEmail,
      handleRate,
      handleNavigate,
      handleViewReviews, // Fixed dependency
    ],
  );

  const renderFooter = useCallback(() => {
    if (!loadingMore) return null;

    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator size="small" color={colors.primary} />
        <Text style={styles.loadingText}>{t('loading_more')}...</Text>
      </View>
    );
  }, [loadingMore, colors.primary, t, styles]);

  const handleLoadMore = useCallback(() => {
    if (hasMore && !loading && !loadingMore) {
      loadMoreBusinesses();
    }
  }, [hasMore, loading, loadingMore, loadMoreBusinesses]);

  const renderListHeader = useCallback(
    () => (
      <Text style={styles.resultsCount}>
        {t('found_businesses_count', {
          count: businesses.length,
        })}
      </Text>
    ),
    [businesses.length, styles.resultsCount, t],
  );

  // Empty state component
  const renderEmptyState = useCallback(
    () => (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>{t('no_businesses_found')}</Text>
        <Text style={styles.emptySubtext}>
          {t('try_different_search_criteria')}
        </Text>
      </View>
    ),
    [styles.emptyContainer, styles.emptyText, styles.emptySubtext, t],
  );

  return (
    <View style={styles.container}>
      {/* Header with Back Navigation and Filter */}
      <View style={styles.header}>
        <IconButton
          icon={renderFilterIcon(colors.primary)}
          size={moderateScale(24)}
          onPress={() => setShowFilters(!showFilters)}
          style={styles.filterButton}
        />
      </View>

      {/* Search Section */}
      <View
        style={[
          styles.searchSection,
          showFilters && styles.expandedSearchSection,
        ]}
      >
        {/* Search Input */}
        <CustomInputText
          placeholder={t('search_business_services')}
          value={searchQuery}
          onChangeText={setSearchQuery}
          leftIcon={SearchIcon}
          containerStyle={styles.searchInputContainer}
          leftIconContainerStyle={styles.searchInputIconContainer}
          iconColor={colors.onSurfaceVariant}
        />

        {showFilters && (
          <ScrollView
            style={styles.filtersScroll}
            contentContainerStyle={styles.filtersContent}
          >
            {/* Service Type Dropdown */}
            <IconDropdown
              label={t('service_type')}
              icon={ServiceIcon}
              data={serviceTypesList}
              value={selectedServiceType}
              onChange={item => setSelectedServiceType(item.value)}
              labelField="label"
              valueField="value"
              placeholder={t('select_service_type')}
              renderItem={renderServiceTypeItem}
            />

            {/* Location Setting for Navigation and Filtering */}
            <View style={styles.locationSection}>
              <Text style={styles.filterSectionTitle}>
                {t('set_your_location')}
              </Text>

              {/* Location Status Display */}
              {userLocation ? (
                <View style={styles.locationStatusCard}>
                  <LocationIcon color={colors.success || colors.primary} />
                  <Text style={styles.locationStatusText}>
                    {filterLocation?.title || t('location_set')}
                  </Text>
                  <Text style={styles.locationStatusSubtext}>
                    {t('navigation_ready')}
                  </Text>
                </View>
              ) : (
                <View style={styles.locationStatusCard}>
                  <LocationIcon color={colors.error} />
                  <Text
                    style={[styles.locationStatusText, { color: colors.error }]}
                  >
                    {t('no_location_set')}
                  </Text>
                  <Text style={styles.locationStatusSubtext}>
                    {t('set_location_for_navigation')}
                  </Text>
                </View>
              )}

              {/* Location Method Buttons */}
              <View style={styles.locationMethodContainer}>
                <TouchableOpacity
                  style={[
                    styles.locationMethodButton,
                    locationMethod === 'current' &&
                      styles.selectedLocationMethod,
                  ]}
                  onPress={() => handleLocationMethodChange('current')}
                >
                  <Text
                    style={[
                      styles.locationMethodText,
                      locationMethod === 'current' &&
                        styles.selectedLocationMethodText,
                    ]}
                  >
                    {t('use_current_location')}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.locationMethodButton,
                    locationMethod === 'manual' &&
                      styles.selectedLocationMethod,
                  ]}
                  onPress={() => handleLocationMethodChange('manual')}
                >
                  <Text
                    style={[
                      styles.locationMethodText,
                      locationMethod === 'manual' &&
                        styles.selectedLocationMethodText,
                    ]}
                  >
                    {t('enter_location_manually')}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Current Location Button */}
              {locationMethod === 'current' && (
                <TouchableOpacity
                  style={[
                    styles.getCurrentLocationButton,
                    currentLocationLoading && styles.locationButtonDisabled,
                  ]}
                  onPress={handleFetchCurrentLocation}
                  disabled={currentLocationLoading}
                >
                  <View style={styles.locationButtonContent}>
                    {currentLocationLoading ? (
                      <ActivityIndicator size="small" color={colors.primary} />
                    ) : (
                      <LocationIcon color={colors.primary} />
                    )}
                    <Text style={styles.locationButtonText}>
                      {t('get_current_location')}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}

              {/* Manual Location Picker */}
              {locationMethod === 'manual' && (
                <StyledLocationPicker
                  onSelect={handleManualLocationSelect}
                  placeholder={t('search_your_location')}
                />
              )}

              {/* Radius Selector */}
              {showRadiusSelector && (
                <View style={styles.radiusContainer}>
                  <Text style={styles.radiusTitle}>{t('search_radius')}</Text>
                  <SnakeSlider
                    min={1}
                    max={50}
                    step={1}
                    value={searchRadius}
                    onValueChange={handleRadiusChange}
                    minimumTrackTintColor={colors.outline + '30'}
                    maximumTrackTintColor={colors.outline + '30'}
                    labelTextSize={moderateScale(12)}
                    labelStyle={{ color: colors.primary }}
                    labelContainerStyle={{ marginBottom: verticalScale(12) }}
                    sliderHeight={verticalScale(2)}
                    thumbSize={verticalScale(30)}
                    thumbTextSize={moderateScale(12)}
                    thumbTintColor={colors.buttonColor}
                    thumbTextColor={colors.buttonTextColor}
                    chipOptions={[
                      {
                        label: '1km',
                        value: 1,
                        icon: <CheckIcon color={colors.buttonTextColor} />,
                      },
                      {
                        label: '5km',
                        value: 5,
                        icon: <CheckIcon color={colors.buttonTextColor} />,
                      },
                      {
                        label: '10km',
                        value: 10,
                        icon: <CheckIcon color={colors.buttonTextColor} />,
                      },
                      {
                        label: '25km',
                        value: 25,
                        icon: <CheckIcon color={colors.buttonTextColor} />,
                      },
                      {
                        label: '50km',
                        value: 50,
                        icon: <CheckIcon color={colors.buttonTextColor} />,
                      },
                    ]}
                    chipBackgroundColor={colors.buttonColor}
                    chipTextColor={colors.buttonTextColor}
                    chipStyle={{
                      paddingVertical: verticalScale(4),
                      paddingHorizontal: scale(6),
                    }}
                    chipTextStyle={{ fontSize: moderateScale(10) }}
                    chipContainerStyle={{ marginTop: verticalScale(12) }}
                  />
                </View>
              )}
            </View>
          </ScrollView>
        )}
      </View>

      {/* Results */}
      {loading && businesses.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>{t('searching_businesses')}...</Text>
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollViewContent,
            businesses.length === 0 && styles.scrollViewContentEmpty,
          ]}
          data={businesses}
          renderItem={renderBusinessItem}
          keyExtractor={item => item._id}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
          ListHeaderComponent={businesses.length > 0 ? renderListHeader : null}
          ListEmptyComponent={renderEmptyState}
          ListFooterComponent={renderFooter}
        />
      )}

      {/* Error Display */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Phone Number Picker Modal */}
      <PhoneNumberPickerModal
        visible={showPhoneModal}
        onClose={() => setShowPhoneModal(false)}
        phoneNumbers={selectedBusiness?.phoneNumbers || []}
        businessName={selectedBusiness?.name || ''}
        onSelectPhone={handlePhoneSelect}
      />

      {/* Rating Modal */}
      <RatingModal
        visible={showRatingModal}
        onClose={handleCloseRatingModal}
        businessId={selectedBusinessForRating?.id || ''}
        businessName={selectedBusinessForRating?.name || ''}
        onSubmit={handleRatingSubmit}
      />

      {/* Reviews Modal - FIXED */}
      {showReviewsModal && selectedBusinessForReviews && (
        <ReviewsModal
          visible={showReviewsModal}
          onClose={handleCloseReviewsModal}
          businessId={selectedBusinessForReviews.id}
          businessName={selectedBusinessForReviews.name}
        />
      )}

      {/* Route Map Modal for Navigation */}
      {userLocation && navigationDestination && (
        <RouteMapModal
          visible={showNavigationModal}
          onClose={handleCloseNavigation}
          origin={userLocation}
          destination={navigationDestination}
          polylineOptions={{
            strokeColor: colors.primary,
            strokeWidth: 4,
          }}
        />
      )}

      {/* Alert Modal */}
      <AlertModal
        visible={alertModal.visible}
        onClose={() => setAlertModal(prev => ({ ...prev, visible: false }))}
        title={alertModal.title}
        message={alertModal.message}
        buttons={alertModal.buttons}
        icon={alertModal.icon}
      />
    </View>
  );
});

// Styles remain the same as before with RTL support added
const createStyles = (width: number, height: number, colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      paddingTop: verticalScale(20),
      paddingHorizontal: scale(10),
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      paddingBottom: verticalScale(16),
      backgroundColor: colors.surface,
    },
    filterButton: {
      margin: 0,
    },
    filtersScroll: {
      maxHeight: verticalScale(400),
    },
    filtersContent: {
      paddingBottom: verticalScale(16),
    },
    searchSection: {
      backgroundColor: colors.surface,
      paddingBottom: verticalScale(16),
    },
    expandedSearchSection: {
      paddingBottom: verticalScale(20),
    },
    searchInputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: verticalScale(12),
      paddingHorizontal: scale(12),
      backgroundColor: colors.background,
      borderRadius: moderateScale(4),
      borderWidth: 1,
      borderColor: colors.outline,
      height: verticalScale(52),
      marginBottom: verticalScale(16),
    },
    searchInputIconContainer: {
      width: moderateScale(20),
      height: moderateScale(20),
      marginLeft: I18nManager.isRTL ? scale(8) : scale(12),
      marginRight: I18nManager.isRTL ? scale(12) : scale(8),
      justifyContent: 'center',
      alignItems: 'center',
    },
    dropdownItemContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: verticalScale(12),
      paddingHorizontal: scale(16),
    },
    dropdownItemIcon: {
      width: moderateScale(20),
      height: moderateScale(20),
      marginRight: I18nManager.isRTL ? 0 : scale(12),
      marginLeft: I18nManager.isRTL ? scale(12) : 0,
    },
    dropdownItemText: {
      fontSize: moderateScale(16),
      color: colors.onSurface,
    },
    scrollView: {
      flex: 1,
    },
    scrollViewContent: {
      paddingBottom: verticalScale(20),
    },
    scrollViewContentEmpty: {
      flexGrow: 1,
      justifyContent: 'center',
    },
    resultsCount: {
      fontSize: moderateScale(16),
      fontWeight: '500',
      color: colors.primary,
      marginBottom: verticalScale(16),
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingTop: verticalScale(100),
    },
    loadingText: {
      fontSize: moderateScale(16),
      color: colors.onSurfaceVariant,
      marginTop: verticalScale(12),
      textAlign: 'center',
    },
    loadingFooter: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: verticalScale(20),
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: verticalScale(100),
      minHeight: verticalScale(400),
    },
    emptyText: {
      fontSize: moderateScale(18),
      fontWeight: '600',
      color: colors.onSurfaceVariant,
      textAlign: 'center',
      marginBottom: verticalScale(8),
    },
    emptySubtext: {
      fontSize: moderateScale(14),
      color: colors.onSurfaceVariant,
      textAlign: 'center',
    },
    errorContainer: {
      padding: scale(16),
      backgroundColor: colors.error + '10',
      borderRadius: moderateScale(8),
      margin: scale(16),
    },
    errorText: {
      color: colors.error,
      fontSize: moderateScale(14),
      textAlign: 'center',
    },

    // Location Setting Styles
    locationSection: {
      marginTop: verticalScale(16),
      padding: scale(16),
      backgroundColor: colors.surface + '80',
      borderRadius: moderateScale(8),
      borderWidth: 1,
      borderColor: colors.outline + '30',
    },
    filterSectionTitle: {
      fontSize: moderateScale(16),
      fontWeight: '600',
      color: colors.primary,
      marginBottom: verticalScale(12),
    },
    locationStatusCard: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: scale(12),
      backgroundColor: colors.background,
      borderRadius: moderateScale(8),
      borderWidth: 1,
      borderColor: colors.outline + '30',
      marginBottom: verticalScale(16),
    },
    locationStatusText: {
      fontSize: moderateScale(14),
      color: colors.onSurface,
      marginLeft: I18nManager.isRTL ? 0 : scale(8),
      marginRight: I18nManager.isRTL ? scale(8) : 0,
      flex: 1,
      fontWeight: '500',
    },
    locationStatusSubtext: {
      fontSize: moderateScale(12),
      color: colors.onSurfaceVariant,
      marginLeft: I18nManager.isRTL ? 0 : scale(8),
      marginRight: I18nManager.isRTL ? scale(8) : 0,
      flex: 1,
    },
    locationMethodContainer: {
      flexDirection: 'row',
      marginBottom: verticalScale(16),
      gap: scale(8),
    },
    locationMethodButton: {
      flex: 1,
      paddingVertical: verticalScale(10),
      paddingHorizontal: scale(12),
      borderRadius: moderateScale(8),
      borderWidth: 1,
      borderColor: colors.outline,
      alignItems: 'center',
      backgroundColor: colors.surface,
    },
    locationMethodText: {
      fontSize: moderateScale(14),
      fontWeight: '500',
      color: colors.onSurface,
      textAlign: 'center',
    },
    selectedLocationMethod: {
      borderColor: colors.buttonColor,
      backgroundColor: colors.buttonColor + '15',
    },
    selectedLocationMethodText: {
      color: colors.buttonTextColor,
      fontWeight: '600',
    },
    getCurrentLocationButton: {
      backgroundColor: colors.background,
      borderColor: colors.buttonColor,
      borderWidth: 2,
      borderRadius: moderateScale(8),
      marginBottom: verticalScale(16),
      paddingVertical: verticalScale(12),
      paddingHorizontal: scale(16),
    },
    locationButtonDisabled: {
      opacity: 0.6,
    },
    locationButtonContent: {
      flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    locationButtonText: {
      fontSize: moderateScale(16),
      fontWeight: '600',
      color: colors.primary,
      marginLeft: I18nManager.isRTL ? 0 : scale(8),
      marginRight: I18nManager.isRTL ? scale(8) : 0,
    },
    radiusContainer: {
      marginTop: verticalScale(16),
      padding: scale(12),
      backgroundColor: colors.background,
      borderRadius: moderateScale(8),
      borderWidth: 1,
      borderColor: colors.outline + '30',
    },
    radiusTitle: {
      fontSize: moderateScale(14),
      fontWeight: '600',
      color: colors.primary,
      marginBottom: verticalScale(8),
      textAlign: I18nManager.isRTL ? 'right' : 'left',
    },
  });

SearchBusinessScreen.displayName = 'SearchBusinessScreen';

export default SearchBusinessScreen;
