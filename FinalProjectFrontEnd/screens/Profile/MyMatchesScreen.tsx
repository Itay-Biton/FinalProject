// screens/Profile/MyPetsScreen.tsx
import React, {
  useMemo,
  memo,
  useRef,
  useCallback,
  useState,
  useEffect,
} from 'react';
import {
  View,
  StyleSheet,
  useWindowDimensions,
  I18nManager,
  TouchableWithoutFeedback,
  ActivityIndicator,
  FlatList,
  Linking,
} from 'react-native';
import { useTheme, Text } from 'react-native-paper';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
import { useTranslation } from 'react-i18next';
import { ThemeColors } from '../../types/theme';
import { Pet } from '../../types/pet';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator'; // Import the root stack types
import Hamburger, {
  HamburgerHandle,
} from '../../components/Animations/Hamburger';
import PetCard from '../../components/Cards/PetCard';
import { useMyMatchesViewModel } from '../../viewModels/MyMatchesViewModel';

// Navigation type for MyPetsScreen
type MyPetsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

// Icons
import { petApi } from '../../api';
import PhoneNumberPickerModal from '../../components/Modals/PhoneNumberPickerModal';
import PetDetailsModal from '../../components/Modals/PetDetailsModal';
import AlertModal from '../../components/Modals/AlertModal';
import { RouteMapModal } from '../../components/Modals/RouteMapModal';
import { useLocationPermission } from '../../utils/LocationPermissions';
// Local coordinate type for navigation
interface Coordinate {
  latitude: number;
  longitude: number;
}
const extractLngLat = (raw: any): [number, number] | undefined => {
  const norm = (lng?: number, lat?: number) => {
    if (
      typeof lng === 'number' &&
      typeof lat === 'number' &&
      !Number.isNaN(lng) &&
      !Number.isNaN(lat) &&
      Math.abs(lat) <= 90 &&
      Math.abs(lng) <= 180
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
    return { kind: 'found', address: bAddr, coords: bCoords };
  }

  return { kind: null };
};

const MyMatchesScreen: React.FC = memo(() => {
  const { width, height } = useWindowDimensions();
  const { colors }: { colors: ThemeColors } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation<MyPetsScreenNavigationProp>();
  const styles = useMemo(
    () => createStyles(width, height, colors),
    [width, height, colors],
  );

  // Hamburger
  const hamburgerRef = useRef<HamburgerHandle>(null);
  const onMenuStartComplete = () => {
    // @ts-ignore
    navigation.openDrawer();
    hamburgerRef.current?.end();
  };
  const handleMenuPress = () => {
    hamburgerRef.current?.start();
  };

  // Local state for matches
  const [matches, setMatches] = useState<any[]>([]);
  const [matchesLoading, setMatchesLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentImageIndices, setCurrentImageIndices] = useState<
    Record<string, number>
  >({});

  // Navigation state (like Search screen)
  const [userLocation, setUserLocation] = useState<Coordinate | null>(null);
  const [showNavigationModal, setShowNavigationModal] = useState(false);
  const [navigationDestination, setNavigationDestination] =
    useState<Coordinate | null>(null);
  // Location permission helper
  const { getCurrentLocation } = useLocationPermission();

  const fetchMatches = useCallback(async () => {
    try {
      setMatchesLoading(true);
      const res = await petApi.getMyMatches();
      if (res.success && Array.isArray(res.data?.matches)) {
        setMatches(
          res.data.matches.map((match: any) => match.foundPet).filter(Boolean),
        );
      }
    } catch (err) {
      console.error('Failed to fetch matches', err);
    } finally {
      setMatchesLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMatches();
  }, [fetchMatches]);

  const handleRefresh = useCallback(async () => {
    try {
      setRefreshing(true);
      await fetchMatches();
    } finally {
      setRefreshing(false);
    }
  }, [fetchMatches]);

  // Handlers for PetCard image slider
  const handleImageScroll = useCallback((e: any, id: string, count: number) => {
    const scrollX = e.nativeEvent.contentOffset.x;
    const idx = Math.round(scrollX / 350);
    setCurrentImageIndices(prev => ({
      ...prev,
      [id]: Math.min(Math.max(idx, 0), count - 1),
    }));
  }, []);

  const handleImageIndexChange = useCallback((id: string, idx: number) => {
    setCurrentImageIndices(prev => ({ ...prev, [id]: idx }));
  }, []);

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

  // Formatting logic for PetCard
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

  // --- Modal and handler state for PetCard actions ---
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [selectedOwner, setSelectedOwner] = useState<null | {
    phones: string[];
  }>(null);
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

  // Handler: Call
  const handleCall = useCallback((phones: string[]) => {
    const sanitized = (phones || []).map(p => `${p}`.trim()).filter(Boolean);
    if (sanitized.length === 1) Linking.openURL(`tel:${sanitized[0]}`);
    else {
      setSelectedOwner({ phones: sanitized });
      setShowPhoneModal(true);
    }
  }, []);

  // Handler: Phone select in modal
  const handlePhoneSelect = useCallback((phoneNumber: string) => {
    if (!phoneNumber) return;
    Linking.openURL(`tel:${phoneNumber}`);
  }, []);

  // Handler: Email
  const handleEmail = useCallback((email: string) => {
    if (!email) return;
    Linking.openURL(`mailto:${email}`);
  }, []);

  // Handler: View details
  const handleViewDetails = useCallback(
    (petId: string) => {
      const pet = matches.find(p => p._id === petId);
      if (!pet) return;
      const picked = pickBestLocation(pet);
      console.log(pet);
      if (!picked.kind || picked.kind === 'base') return;

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
    [matches, t],
  );

  // Handler: Navigate (same UX as Search; auto-gets current location if missing)
  const handleNavigate = useCallback(
    async (petId: string) => {
      let origin = userLocation;

      // Try to get current location if not yet set
      if (!origin) {
        const coords = await getCurrentLocation();
        if (coords) {
          origin = { latitude: coords.latitude, longitude: coords.longitude };
          setUserLocation(origin);
        } else {
          setAlertModal({
            visible: true,
            title: t('location_required'),
            message: t('please_set_location_in_filters_for_navigation'),
            icon: 'info',
            buttons: [{ text: t('ok'), style: 'default' }],
          });
          return;
        }
      }

      const pet = matches.find(p => p._id === petId);
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
    [userLocation, matches, t, getCurrentLocation],
  );

  // Handler: Close navigation modal
  const handleCloseNavigation = useCallback(() => {
    setShowNavigationModal(false);
    setNavigationDestination(null);
  }, []);

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

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        {!I18nManager.isRTL && <View style={styles.spacer} />}
        <TouchableWithoutFeedback onPress={handleMenuPress}>
          <View style={styles.menuButton}>
            <Hamburger
              ref={hamburgerRef}
              size={moderateScale(24)}
              color={colors.primary}
              onStartComplete={onMenuStartComplete}
            />
          </View>
        </TouchableWithoutFeedback>
        {I18nManager.isRTL && <View style={styles.spacer} />}
      </View>

      {/* List */}
      <FlatList
        data={matches.filter(p => p && p._id)}
        keyExtractor={item =>
          item._id?.toString?.() ?? Math.random().toString()
        }
        contentContainerStyle={styles.scrollViewContent}
        renderItem={renderPetItem}
        ListEmptyComponent={
          matchesLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.loadingText}>
                {t('loading_matches', {
                  defaultValue: 'Loading your matches...',
                })}
              </Text>
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {t('no_matches_found', { defaultValue: 'No matches found' })}
              </Text>
            </View>
          )
        }
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        onRefresh={handleRefresh}
      />

      {/* Phone Picker Modal */}
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
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: scale(16),
      paddingTop: verticalScale(50),
      backgroundColor: colors.surface,
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 2,
    },
    spacer: {
      flex: 1,
    },
    menuButton: {
      padding: moderateScale(8),
    },
    scrollView: {
      flex: 1,
    },
    scrollViewContent: {
      paddingHorizontal: scale(16),
      paddingTop: verticalScale(16),
      paddingBottom: verticalScale(100),
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingTop: verticalScale(100),
    },
    loadingText: {
      marginTop: verticalScale(16),
      fontSize: moderateScale(16),
      color: colors.onSurfaceVariant,
      textAlign: 'center',
    },
    loadingMoreContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: verticalScale(20),
    },
    loadingMoreText: {
      marginLeft: scale(8),
      fontSize: moderateScale(14),
      color: colors.onSurfaceVariant,
    },
    errorContainer: {
      backgroundColor: colors.errorContainer,
      marginHorizontal: scale(16),
      marginVertical: verticalScale(8),
      padding: scale(12),
      borderRadius: moderateScale(8),
      alignItems: 'center',
    },
    errorText: {
      color: colors.error,
      textAlign: 'center',
      fontSize: moderateScale(14),
      marginBottom: verticalScale(8),
    },
    retryButton: {
      backgroundColor: colors.error,
      paddingHorizontal: scale(16),
      paddingVertical: verticalScale(6),
      borderRadius: moderateScale(6),
    },
    retryButtonText: {
      color: colors.onError,
      fontSize: moderateScale(12),
      fontWeight: '600',
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingTop: verticalScale(100),
      paddingHorizontal: scale(32),
    },
    emptyText: {
      fontSize: moderateScale(20),
      fontWeight: '600',
      color: colors.onSurfaceVariant,
      textAlign: 'center',
      marginBottom: verticalScale(12),
    },
    emptySubtext: {
      fontSize: moderateScale(16),
      color: colors.onSurfaceVariant,
      textAlign: 'center',
      lineHeight: verticalScale(24),
    },
    fab: {
      position: 'absolute',
      bottom: verticalScale(16),
      right: scale(16),
      backgroundColor: colors.buttonColor,
      borderRadius: moderateScale(30),
      width: moderateScale(60),
      height: moderateScale(60),
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 6,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 3,
      },
      shadowOpacity: 0.27,
      shadowRadius: 4.65,
    },
  });

MyMatchesScreen.displayName = 'MyMatchesScreen';
export default MyMatchesScreen;
