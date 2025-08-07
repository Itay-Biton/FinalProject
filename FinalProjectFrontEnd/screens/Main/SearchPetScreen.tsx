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
} from 'react-native';
import { useTheme, Text, IconButton } from 'react-native-paper';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
import { useTranslation } from 'react-i18next';
import { ThemeColors } from '../../types/theme';
import StyledLocationPicker from '../../components/UI/StyledLocationPicker';
import IconDropdown from '../../components/UI/IconDropdown';
import PetCard from '../../components/Cards/PetCard';
import CustomInputText from '../../components/UI/CustomInputText';
import PhoneNumberPickerModal from '../../components/Modals/PhoneNumberPickerModal';
import AlertModal from '../../components/Modals/AlertModal';
import SnakeSlider from '../../components/UI/SnakeSlider';
import { RouteMapModal } from '../../components/Modals/RouteMapModal';

// Location permissions
import { useLocationPermission } from '../../utils/LocationPermissions';

// Constants
import { getSpeciesList } from '../../constants/speciesList';

// ViewModel
import { usePetSearchViewModel } from '../../viewModels/PetSearchViewModel';

// Types
import { Pet } from '../../types/pet';

// Icons - MOVED OUTSIDE OF COMPONENT
import SearchIconSvg from '../../assets/icons/ic_search.svg';
import LocationIconSvg from '../../assets/icons/ic_location.svg';
import FilterIconSvg from '../../assets/icons/ic_filter.svg';
import SpeciesIconSvg from '../../assets/icons/ic_species.svg';
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

const SpeciesIcon = ({ color }: { color?: string }) => (
  <SpeciesIconSvg
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

interface SearchPetsScreenProps {
  // Remove navigation prop since we don't need back button
}

const SearchPetsScreen: React.FC<SearchPetsScreenProps> = memo(() => {
  const { width, height } = useWindowDimensions();
  const { colors }: { colors: ThemeColors } = useTheme();
  const { t } = useTranslation();
  const styles = useMemo(
    () => createStyles(width, height, colors),
    [width, height, colors],
  );

  // ViewModel
  const {
    pets,
    loading,
    refreshing,
    loadingMore,
    error,
    hasMore,
    searchPets,
    refreshPets,
    loadMorePets,
    setFilters,
    getFilters,
    clearSearch,
  } = usePetSearchViewModel();

  // Helper functions for formatting with translations
  const formatAge = useCallback(
    (age: string | number) => {
      const numAge = typeof age === 'string' ? parseFloat(age) || 0 : age;
      const formattedAge =
        numAge % 1 === 0 ? numAge.toString() : numAge.toFixed(1);
      return `${formattedAge} ${t('years')}`;
    },
    [t],
  );

  const formatWeight = useCallback(
    (weight: { value: number; unit: string }) => {
      const formattedWeight =
        weight.value % 1 === 0
          ? weight.value.toString()
          : weight.value.toFixed(1);
      return `${formattedWeight} ${t(weight.unit)}`;
    },
    [t],
  );

  // State management
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecies, setSelectedSpecies] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [currentImageIndices, setCurrentImageIndices] = useState<
    Record<string, number>
  >({});

  // Phone number picker modal state
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [selectedOwner, setSelectedOwner] = useState<null | {
    phones: string[];
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

  // Species list with "All" option
  const speciesList = useMemo(() => {
    const allOption = {
      label: t('all'),
      value: 'all',
      icon: require('../../assets/icons/ic_petname.svg'),
    };
    return [allOption, ...getSpeciesList(t)];
  }, [t]);

  // Load initial data
  useEffect(() => {
    searchPets(true);
  }, [searchPets]);

  // Handle search filters change
  useEffect(() => {
    const filters = {
      searchQuery,
      species: selectedSpecies,
      location: userLocation
        ? { lat: userLocation.latitude, lng: userLocation.longitude }
        : undefined,
      radius: userLocation ? searchRadius : undefined,
    };

    setFilters(filters);

    // Debounce search
    const timeoutId = setTimeout(() => {
      searchPets(true);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [
    searchQuery,
    selectedSpecies,
    userLocation,
    searchRadius,
    setFilters,
    searchPets,
  ]);

  // FlatList ref for scroll control
  const flatListRef = useRef<FlatList>(null);

  const onRefresh = useCallback(() => {
    // Scroll to top when refreshing for better UX
    flatListRef.current?.scrollToOffset({ animated: true, offset: 0 });
    refreshPets();
  }, [refreshPets]);

  const handleCall = useCallback((phones: string[]) => {
    if (phones.length === 1) {
      // If only one phone number, call directly
      Linking.openURL(`tel:${phones[0]}`);
    } else {
      // If multiple phone numbers, show picker modal
      setSelectedOwner({ phones });
      setShowPhoneModal(true);
    }
  }, []);

  const handlePhoneSelect = useCallback((phoneNumber: string) => {
    Linking.openURL(`tel:${phoneNumber}`);
  }, []);

  // const handleEmail = useCallback((email: string) => {
  //   Linking.openURL(`mailto:${email}`);
  // }, []);

  const handleViewDetails = useCallback((petId: string, petName: string) => {
    console.log('View pet details:', petId, petName);
    // Navigate to pet details screen
    // navigation.navigate('PetDetails', { petId, petName });
  }, []);

  // Updated handleNavigate function to use stored user location
  const handleNavigate = useCallback(
    (petId: string, petName: string) => {
      console.log('Navigate to pet location:', petId, petName);

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

      // Find the pet to get its coordinates
      const pet = pets.find(p => p._id === petId);
      if (!pet) {
        setAlertModal({
          visible: true,
          title: t('error'),
          message: t('pet_location_not_found'),
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

      if (!pet.location?.coordinates?.coordinates) {
        setAlertModal({
          visible: true,
          title: t('error'),
          message: t('pet_location_not_available'),
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
        latitude: pet.location.coordinates.coordinates[1], // GeoJSON format: [lng, lat]
        longitude: pet.location.coordinates.coordinates[0],
      };

      setNavigationDestination(destination);
      setShowNavigationModal(true);
    },
    [userLocation, pets, t],
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

  const renderSpeciesItem = useCallback(
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
    (event: any, petId: string, imageCount: number) => {
      const scrollX = event.nativeEvent.contentOffset.x;
      const imageWidth = scale(350);
      const currentIndex = Math.round(scrollX / imageWidth);
      const clampedIndex = Math.max(0, Math.min(currentIndex, imageCount - 1));

      setCurrentImageIndices(prev => ({
        ...prev,
        [petId]: clampedIndex,
      }));
    },
    [],
  );

  const handleImageIndexChange = useCallback((petId: string, index: number) => {
    setCurrentImageIndices(prev => ({
      ...prev,
      [petId]: index,
    }));
  }, []);

  // Convert Pet to PetCard format
  const convertPetForCard = useCallback(
    (pet: Pet) => {
      return {
        id: pet._id,
        name: pet.name,
        species: pet.species,
        breed: pet.breed || '',
        age: formatAge(pet.age || 0), // Convert to formatted string for PetCard
        furColor: pet.furColor || '',
        eyeColor: pet.eyeColor || '',
        weight: formatWeight(pet.weight || { value: 0, unit: 'kg' }), // Convert to formatted string
        phones: pet.phoneNumbers,
        location: pet.location?.address || '',
        latitude: pet.location?.coordinates?.coordinates?.[1] || 0, // GeoJSON: [lng, lat]
        longitude: pet.location?.coordinates?.coordinates?.[0] || 0,
        distance: pet.distance || '-- km',
        registrationDate: pet.registrationDate,
        images: pet.images || [],
        description: pet.description || '',
        isLost: pet.isLost,
        isFound: pet.isFound,
        vaccinated: pet.vaccinated || false,
        microchipped: pet.microchipped || false,
      };
    },
    [formatAge, formatWeight],
  );

  // Enhanced pet card render with proper formatting
  const renderPetItem = useCallback(
    ({ item }: { item: Pet }) => {
      const petForCard = convertPetForCard(item);

      return (
        <PetCard
          pet={petForCard}
          currentImageIndex={currentImageIndices[item._id] || 0}
          onImageIndexChange={handleImageIndexChange}
          onImageScroll={handleImageScroll}
          onCall={handleCall}
          onViewDetails={handleViewDetails}
          onNavigate={handleNavigate}
        />
      );
    },
    [
      convertPetForCard,
      currentImageIndices,
      handleImageIndexChange,
      handleImageScroll,
      handleCall,
      handleViewDetails,
      handleNavigate,
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
      loadMorePets();
    }
  }, [hasMore, loading, loadingMore, loadMorePets]);

  const renderListHeader = useCallback(
    () => (
      <Text style={styles.resultsCount}>
        {t('found_pets_count', {
          count: pets.length,
        })}
      </Text>
    ),
    [pets.length, styles.resultsCount, t],
  );
  const renderEmptyState = useCallback(
    () => (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>{t('no_pets_found')}</Text>
        <Text style={styles.emptySubtext}>
          {t('try_different_search_criteria')}
        </Text>
      </View>
    ),
    [styles, t],
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
          placeholder={t('search_pets_owners')}
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
            {/* Species Dropdown */}
            <IconDropdown
              label={t('species')}
              icon={SpeciesIcon}
              data={speciesList}
              value={selectedSpecies}
              onChange={item => setSelectedSpecies(item.value)}
              labelField="label"
              valueField="value"
              placeholder={t('select_species')}
              renderItem={renderSpeciesItem}
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
      {loading && pets.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>{t('searching_pets')}...</Text>
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollViewContent,
            pets.length === 0 && styles.scrollViewContentEmpty,
          ]}
          data={pets}
          renderItem={renderPetItem}
          keyExtractor={item => item._id}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
          ListHeaderComponent={pets.length > 0 ? renderListHeader : null}
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
        phoneNumbers={selectedOwner?.phones || []}
        businessName={selectedOwner?.name || ''}
        onSelectPhone={handlePhoneSelect}
      />

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
      marginLeft: scale(12),
      marginRight: scale(8),
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
      marginRight: scale(12),
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
      marginLeft: scale(8),
      flex: 1,
      fontWeight: '500',
    },
    locationStatusSubtext: {
      fontSize: moderateScale(12),
      color: colors.onSurfaceVariant,
      marginLeft: scale(8),
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
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    locationButtonText: {
      fontSize: moderateScale(16),
      fontWeight: '600',
      color: colors.primary,
      marginLeft: scale(8),
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
    },
  });

// Set display name for debugging
SearchPetsScreen.displayName = 'SearchPetsScreen';

export default SearchPetsScreen;
