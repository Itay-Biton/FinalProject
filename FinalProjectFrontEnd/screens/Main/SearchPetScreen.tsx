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
import PetDetailsModal from '../../components/Modals/PetDetailsModal';

import { useLocationPermission } from '../../utils/LocationPermissions';
import { getSpeciesList } from '../../constants/speciesList';
import { usePetSearchViewModel } from '../../viewModels/PetSearchViewModel';
import { Pet } from '../../types/pet';

// Icons
import SearchIconSvg from '../../assets/icons/ic_search.svg';
import LocationIconSvg from '../../assets/icons/ic_location.svg';
import FilterIconSvg from '../../assets/icons/ic_filter.svg';
import SpeciesIconSvg from '../../assets/icons/ic_species.svg';
import CheckIconSvg from '../../assets/icons/ic_save.svg';

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

const renderFilterIcon = (color: string) => () => <FilterIcon color={color} />;

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

/* -----------------------  HELPERS  ----------------------- */

/** Validate and normalize any location-like input to [lng,lat].
 *  Rejects:
 *   - non-numeric
 *   - out of range (lat ∉ [-90,90], lng ∉ [-180,180])
 *   - [0,0]
 */
const extractLngLat = (raw: any): [number, number] | undefined => {
  const norm = (lng?: number, lat?: number) => {
    if (
      typeof lng === 'number' &&
      typeof lat === 'number' &&
      !Number.isNaN(lng) &&
      !Number.isNaN(lat) &&
      Math.abs(lat) <= 90 &&
      Math.abs(lng) <= 180 &&
      !(lng === 0 && lat === 0)
    ) {
      return [lng, lat] as [number, number];
    }
    return undefined;
  };

  if (!raw) return undefined;

  // [lng, lat]
  if (Array.isArray(raw) && raw.length === 2) {
    return norm(Number(raw[0]), Number(raw[1]));
  }

  // GeoJSON { type:'Point', coordinates:[lng,lat] }
  if (
    raw?.type === 'Point' &&
    Array.isArray(raw.coordinates) &&
    raw.coordinates.length === 2
  ) {
    return norm(Number(raw.coordinates[0]), Number(raw.coordinates[1]));
  }

  // { coordinates:[lng,lat] } (or { coordinates: { coordinates:[lng,lat] } } handled by caller)
  if (Array.isArray(raw?.coordinates) && raw.coordinates.length === 2) {
    return norm(Number(raw.coordinates[0]), Number(raw.coordinates[1]));
  }

  // { lat, lng } or { coordinates: { lat, lng } }
  const lat = typeof raw?.lat === 'number' ? raw.lat : raw?.coordinates?.lat;
  const lng = typeof raw?.lng === 'number' ? raw.lng : raw?.coordinates?.lng;

  return norm(lng, lat);
};

/** Prefer foundDetails → lostDetails → base, but only if coords are valid (not 0,0).
 *  If a tier has no valid coords, fall back to the next tier.
 */
const pickBestLocation = (
  pet: any,
): {
  kind: 'found' | 'lost' | 'base' | null;
  address?: string;
  coords?: [number, number];
  date?: string;
  notes?: string;
} => {
  // FOUND
  const fAddr = pet?.foundDetails?.location?.address;
  const fCoords =
    extractLngLat(pet?.foundDetails?.location?.coordinates) ??
    extractLngLat(pet?.foundDetails?.location) ??
    extractLngLat(pet?.foundDetails);
  if (fCoords) {
    return {
      kind: 'found',
      address: fAddr,
      coords: fCoords,
      date: pet?.foundDetails?.dateFound,
      notes: pet?.foundDetails?.notes,
    };
  }

  // LOST
  const lAddr = pet?.lostDetails?.lastSeen?.address;
  const lCoords =
    extractLngLat(pet?.lostDetails?.lastSeen?.coordinates) ??
    extractLngLat(pet?.lostDetails?.lastSeen) ??
    extractLngLat(pet?.lostDetails);
  if (lCoords) {
    return {
      kind: 'lost',
      address: lAddr,
      coords: lCoords,
      date: pet?.lostDetails?.dateLost,
      notes: pet?.lostDetails?.notes,
    };
  }

  // BASE
  const bAddr = pet?.location?.address;
  const bCoords =
    extractLngLat(pet?.location?.coordinates?.coordinates) ??
    extractLngLat(pet?.location?.coordinates) ??
    extractLngLat(pet?.location);
  if (bCoords) {
    return { kind: 'base', address: bAddr, coords: bCoords };
  }

  return { kind: null };
};

/* --------------------------------------------------------- */

const SearchPetsScreen: React.FC = memo(() => {
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
  } = usePetSearchViewModel();

  // Formatters (keep original shapes for PetCard)
  const formatAge = useCallback(
    (age: string | number) => {
      const numAge = typeof age === 'string' ? parseFloat(age) || 0 : age ?? 0;
      const formatted =
        numAge % 1 === 0 ? numAge.toString() : numAge.toFixed(1);
      return `${formatted} ${t('years')}`;
    },
    [t],
  );

  const formatWeight = useCallback(
    (weight?: { value?: number; unit?: string }) => {
      const val = Number(weight?.value ?? 0);
      const u = weight?.unit || 'kg';
      const formatted = val % 1 === 0 ? val.toString() : val.toFixed(1);
      return `${formatted} ${t(u)}`;
    },
    [t],
  );

  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecies, setSelectedSpecies] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [currentImageIndices, setCurrentImageIndices] = useState<
    Record<string, number>
  >({});

  // Phone picker
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [selectedOwner, setSelectedOwner] = useState<null | {
    phones: string[];
  }>(null);

  // Navigation
  const [showNavigationModal, setShowNavigationModal] = useState(false);
  const [navigationDestination, setNavigationDestination] =
    useState<Coordinate | null>(null);

  // Alert
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
  }>({ visible: false, title: '', message: '', buttons: [] });

  // Details modal
  const [detailsModal, setDetailsModal] = useState<{
    visible: boolean;
    kind: 'lost' | 'found';
    date?: string;
    address?: string;
    coordinates?: [number, number];
    notes?: string;
    title?: string;
  }>({ visible: false, kind: 'lost' });

  // Filters: location
  const [userLocation, setUserLocation] = useState<Coordinate | null>(null);
  const [filterLocation, setFilterLocation] = useState<LocationData | null>(
    null,
  );
  const [locationMethod, setLocationMethod] = useState<'current' | 'manual'>(
    'current',
  );
  const [searchRadius, setSearchRadius] = useState<number>(5);
  const [showRadiusSelector, setShowRadiusSelector] = useState(false);

  const { getCurrentLocation, loading: currentLocationLoading } =
    useLocationPermission();

  const speciesList = useMemo(() => {
    const allOption = {
      label: t('all'),
      value: 'all',
      icon: require('../../assets/icons/ic_petname.svg'),
    };
    return [allOption, ...getSpeciesList(t)];
  }, [t]);

  // initial load
  useEffect(() => {
    searchPets(true);
  }, [searchPets]);

  // filters change (keep same behavior)
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
    const timeoutId = setTimeout(() => searchPets(true), 500);
    return () => clearTimeout(timeoutId);
  }, [
    searchQuery,
    selectedSpecies,
    userLocation,
    searchRadius,
    setFilters,
    searchPets,
  ]);

  const flatListRef = useRef<FlatList>(null);

  const onRefresh = useCallback(() => {
    flatListRef.current?.scrollToOffset({ animated: true, offset: 0 });
    refreshPets();
  }, [refreshPets]);

  const handleCall = useCallback((phones: string[]) => {
    const sanitized = (phones || []).map(p => `${p}`.trim()).filter(Boolean);
    if (sanitized.length === 1) Linking.openURL(`tel:${sanitized[0]}`);
    else {
      setSelectedOwner({ phones: sanitized });
      setShowPhoneModal(true);
    }
  }, []);

  const handlePhoneSelect = useCallback((phoneNumber: string) => {
    if (!phoneNumber) return;
    Linking.openURL(`tel:${phoneNumber}`);
  }, []);

  const handleEmail = useCallback((email: string) => {
    if (!email) return;
    Linking.openURL(`mailto:${email}`);
  }, []);

  // Details modal (prefer found → lost → base, but keep original UX: only show for found/lost)
  const handleViewDetails = useCallback(
    (petId: string) => {
      const pet = pets.find(p => p._id === petId);
      if (!pet) return;

      const picked = pickBestLocation(pet);
      if (!picked.kind || picked.kind === 'base') return; // regular pets: do nothing

      setDetailsModal({
        visible: true,
        kind: picked.kind,
        title: picked.kind === 'found' ? t('found_details') : t('lost_details'),
        date: picked.date ?? undefined,
        address: picked.address,
        coordinates: picked.coords, // [lng, lat]
        notes: picked.notes,
      });
    },
    [pets, t],
  );

  // Navigation uses best available location (found → lost → base)
  const handleNavigate = useCallback(
    (petId: string) => {
      if (!userLocation) {
        setAlertModal({
          visible: true,
          title: t('location_required'),
          message: t('please_set_location_in_filters_for_navigation'),
          icon: 'info',
          buttons: [
            { text: t('cancel'), style: 'cancel' },
            { text: t('open_filters'), onPress: () => setShowFilters(true) },
          ],
        });
        return;
      }

      const pet = pets.find(p => p._id === petId);
      if (!pet) {
        setAlertModal({
          visible: true,
          title: t('error'),
          message: t('pet_location_not_found'),
          icon: 'error',
          buttons: [{ text: t('ok'), style: 'default' }],
        });
        return;
      }

      const picked = pickBestLocation(pet);
      if (!picked.coords) {
        setAlertModal({
          visible: true,
          title: t('error'),
          message: t('pet_location_not_available'),
          icon: 'error',
          buttons: [{ text: t('ok'), style: 'default' }],
        });
        return;
      }

      const [lng, lat] = picked.coords;
      setNavigationDestination({
        latitude: Number(lat),
        longitude: Number(lng),
      });
      setShowNavigationModal(true);
    },
    [userLocation, pets, t],
  );

  const handleCloseNavigation = useCallback(() => {
    setShowNavigationModal(false);
    setNavigationDestination(null);
  }, []);

  const handleFetchCurrentLocation = useCallback(async () => {
    const coords = await getCurrentLocation();
    if (coords) {
      const currentLocation: LocationData = {
        id: 'current-location',
        title: t('current_location'),
        lat: coords.latitude.toString(),
        lon: coords.longitude.toString(),
      };
      setFilterLocation(currentLocation);
      setUserLocation({
        latitude: coords.latitude,
        longitude: coords.longitude,
      });
      setShowRadiusSelector(true);
    }
  }, [getCurrentLocation, t]);

  const handleManualLocationSelect = useCallback((location: LocationData) => {
    setFilterLocation(location);
    setUserLocation({
      latitude: parseFloat(location.lat),
      longitude: parseFloat(location.lon),
    });
    setShowRadiusSelector(true);
  }, []);

  const handleLocationMethodChange = useCallback(
    (method: 'current' | 'manual') => {
      setLocationMethod(method);
      setFilterLocation(null);
      setUserLocation(null);
      setShowRadiusSelector(false);
    },
    [],
  );

  const handleRadiusChange = useCallback(
    (radius: number) => setSearchRadius(radius),
    [],
  );

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

  // image slider handlers (unchanged)
  const handleImageScroll = useCallback(
    (event: any, petId: string, imageCount: number) => {
      const scrollX = event.nativeEvent.contentOffset.x;
      const imageWidth = scale(350);
      const currentIndex = Math.round(scrollX / imageWidth);
      const clampedIndex = Math.max(0, Math.min(currentIndex, imageCount - 1));
      setCurrentImageIndices(prev => ({ ...prev, [petId]: clampedIndex }));
    },
    [],
  );

  const handleImageIndexChange = useCallback((petId: string, index: number) => {
    setCurrentImageIndices(prev => ({ ...prev, [petId]: index }));
  }, []);

  // keep SAME outward shape your PetCard expects (age/weight as formatted strings)
  // keep SAME outward shape your PetCard expects (age/weight as formatted strings)
  // location is ONLY sent when the pet is lost or found
  const convertPetForCard = useCallback(
    (pet: Pet) => {
      const isLost = !!pet.isLost;
      const isFound = !!pet.isFound;

      // Base common fields
      const vaccinated = pet.vaccinated === true;
      const microchipped = pet.microchipped === true;

      // Build location props ONLY for lost/found
      let locProps: Partial<{
        location: string;
        latitude: number;
        longitude: number;
        distance: string | number;
      }> = {};

      if (isLost || isFound) {
        const picked = pickBestLocation(pet); // already rejects [0,0] etc
        if (picked.coords) {
          locProps = {
            location: picked.address || '',
            latitude: Number(picked.coords[1]),
            longitude: Number(picked.coords[0]),
            distance: pet.distance || '-- km',
          };
        }
      }

      return {
        id: pet._id,
        name: pet.name || '',
        species: pet.species || '',
        breed: pet.breed || '',
        age: formatAge(pet.age ?? 0),
        furColor: pet.furColor || '',
        eyeColor: pet.eyeColor || '',
        weight: formatWeight(pet.weight || { value: 0, unit: 'kg' }),

        // contact
        phones: Array.isArray(pet.phoneNumbers) ? pet.phoneNumbers : [],
        email: pet.email || '',

        // ✅ location props only when lost/found
        ...locProps,

        registrationDate: pet.registrationDate,
        images: Array.isArray(pet.images) ? pet.images : [],
        description: pet.description || '',

        // status flags
        isLost,
        isFound,

        // health flags + synonyms
        vaccinated,
        isVaccinated: vaccinated,
        microchipped,
        isChipped: microchipped,
        hasChip: microchipped,

        // originals for modals
        lostDetails: pet.lostDetails,
        foundDetails: pet.foundDetails,
      };
    },
    [formatAge, formatWeight],
  );

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
          onEmail={handleEmail}
          onViewDetails={_id => handleViewDetails(_id)}
          onNavigate={_id => handleNavigate(_id)}
        />
      );
    },
    [
      convertPetForCard,
      currentImageIndices,
      handleImageIndexChange,
      handleImageScroll,
      handleCall,
      handleEmail,
      handleViewDetails,
      handleNavigate,
    ],
  );

  const renderFooter = useCallback(() => {
    if (!loadingMore) return null;
    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );
  }, [loadingMore, colors.primary, styles]);

  const handleLoadMore = useCallback(() => {
    if (pets.length === 0) return;
    if (hasMore && !loading && !loadingMore) loadMorePets();
  }, [pets.length, hasMore, loading, loadingMore, loadMorePets]);

  const renderListHeader = useCallback(
    () => (
      <Text style={styles.resultsCount}>
        {t('found_pets_count', { count: pets.length })}
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
      {/* Header */}
      <View style={styles.header}>
        <IconButton
          icon={renderFilterIcon(colors.primary)}
          size={moderateScale(24)}
          onPress={() => setShowFilters(!showFilters)}
          style={styles.filterButton}
        />
      </View>

      {/* Search + Filters */}
      <View
        style={[
          styles.searchSection,
          showFilters && styles.expandedSearchSection,
        ]}
      >
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

            {/* Location filter + nav readiness */}
            <View style={styles.locationSection}>
              <Text style={styles.filterSectionTitle}>
                {t('set_your_location')}
              </Text>

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

              {locationMethod === 'manual' && (
                <StyledLocationPicker
                  onSelect={handleManualLocationSelect}
                  placeholder={t('search_your_location')}
                />
              )}

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
          <Text style={styles.loadingText}>{t('searching_pets')}...</Text>
          <ActivityIndicator size="large" color={colors.primary} />
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
          onEndReached={pets.length > 0 ? handleLoadMore : undefined}
          onEndReachedThreshold={0.3}
          ListHeaderComponent={pets.length > 0 ? renderListHeader : null}
          ListEmptyComponent={renderEmptyState}
          ListFooterComponent={renderFooter}
        />
      )}

      {/* Error */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Phone Picker */}
      <PhoneNumberPickerModal
        visible={showPhoneModal}
        onClose={() => setShowPhoneModal(false)}
        phoneNumbers={selectedOwner?.phones || []}
        businessName={''}
        onSelectPhone={handlePhoneSelect}
      />

      {/* Route Map Modal */}
      {userLocation && navigationDestination && (
        <RouteMapModal
          visible={showNavigationModal}
          onClose={handleCloseNavigation}
          origin={userLocation}
          destination={navigationDestination}
          polylineOptions={{ strokeColor: colors.primary, strokeWidth: 4 }}
        />
      )}

      {/* Alert */}
      <AlertModal
        visible={alertModal.visible}
        onClose={() => setAlertModal(prev => ({ ...prev, visible: false }))}
        title={alertModal.title}
        message={alertModal.message}
        buttons={alertModal.buttons}
        icon={alertModal.icon}
      />

      {/* Pet Details Modal */}
      <PetDetailsModal
        visible={detailsModal.visible}
        onClose={() => setDetailsModal(prev => ({ ...prev, visible: false }))}
        kind={detailsModal.kind}
        date={detailsModal.date}
        address={detailsModal.address}
        coordinates={detailsModal.coordinates}
        notes={detailsModal.notes}
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
    filterButton: { margin: 0 },
    filtersScroll: { maxHeight: verticalScale(400) },
    filtersContent: { paddingBottom: verticalScale(16) },
    searchSection: {
      backgroundColor: colors.surface,
      paddingBottom: verticalScale(16),
    },
    expandedSearchSection: { paddingBottom: verticalScale(20) },
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
    dropdownItemText: { fontSize: moderateScale(16), color: colors.onSurface },
    scrollView: { flex: 1 },
    scrollViewContent: { paddingBottom: verticalScale(20) },
    scrollViewContentEmpty: { flexGrow: 1, justifyContent: 'center' },
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
      marginBottom: verticalScale(6),
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
    locationButtonDisabled: { opacity: 0.6 },
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

SearchPetsScreen.displayName = 'SearchPetsScreen';
export default SearchPetsScreen;
