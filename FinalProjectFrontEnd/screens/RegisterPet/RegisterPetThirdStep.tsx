import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Pressable,
  useWindowDimensions,
  Alert,
  I18nManager,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import {
  TextInput,
  Text,
  ProgressBar,
  useTheme,
  Card,
} from 'react-native-paper';
import { moderateScale, verticalScale, scale } from 'react-native-size-matters';
import { useTranslation } from 'react-i18next';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { RegisterPetStackParamList } from '../../navigation/RegisterPetNavigation';
import CustomBackButton from '../../components/UI/CustomBackButton';
import RegisterIconSvg from '../../assets/icons/ic_register.svg';
import { useRegisterPetViewModel } from '../../viewModels/RegisterPetViewModel';
import { ThemeColors } from '../../types/theme';

// Custom inputs
import CustomInputText from '../../components/UI/CustomInputText';
import CustomTextInputDate from '../../components/UI/CustomTextInputDate';
import StyledLocationPicker from '../../components/UI/StyledLocationPicker';

import LocationIconSvg from '../../assets/icons/ic_location.svg';

// Location permissions (same hook as in Search)
import { useLocationPermission } from '../../utils/LocationPermissions';

type Props = NativeStackScreenProps<
  RegisterPetStackParamList,
  'RegisterPetThirdStep'
>;

const RegisterIcon = ({ color }: { color?: string }) => (
  <RegisterIconSvg
    width={moderateScale(40)}
    height={moderateScale(40)}
    fill={color || 'black'}
  />
);

const LocationIcon = ({ color }: { color?: string }) => (
  <LocationIconSvg
    width={moderateScale(20)}
    height={moderateScale(20)}
    stroke={color || 'black'}
  />
);

type PickedLocation = { id: string; title: string; lat: string; lon: string };

export default function RegisterPetThirdStep({ navigation, route }: Props) {
  const { petId, isFound: isFoundParam } = route.params;
  const { width } = useWindowDimensions();
  const { colors }: { colors: ThemeColors } = useTheme();
  const { t } = useTranslation();
  const styles = useMemo(() => createStyles(width, colors), [width, colors]);

  const {
    loading,
    updatePetDescription,
    updateFoundDetails,
    getPet,
    updateContactInfo,
  } = useRegisterPetViewModel();

  // Description
  const [description, setDescription] = useState('');

  // Phone (only used when petIsFound === true)
  const [phoneNumber, setPhoneNumber] = useState('');

  // Found details
  const [petIsFound, setPetIsFound] = useState<boolean>(!!isFoundParam);
  const [dateFound, setDateFound] = useState('');
  const [foundLocation, setFoundLocation] = useState<PickedLocation | null>(
    null,
  );
  const [foundNotes, setFoundNotes] = useState('');

  // Location method like Search screen
  const [locationMethod, setLocationMethod] = useState<'current' | 'manual'>(
    'current',
  );
  const { getCurrentLocation, loading: currentLocationLoading } =
    useLocationPermission();

  // Prefill if param missing or to hydrate existing foundDetails
  useEffect(() => {
    if (isFoundParam !== undefined) return;

    (async () => {
      try {
        const pet = await getPet(petId);
        const isFoundNow = !!pet.isFound;
        setPetIsFound(isFoundNow);

        // hydrate phone only if found
        if (
          isFoundNow &&
          Array.isArray(pet.phoneNumbers) &&
          pet.phoneNumbers.length > 0
        ) {
          setPhoneNumber(pet.phoneNumbers[0] ?? '');
        } else {
          setPhoneNumber('');
        }

        if (pet.foundDetails) {
          setDateFound(pet.foundDetails.dateFound || '');
          setFoundNotes(pet.foundDetails.notes || '');

          const loc: any = pet.foundDetails.location;
          if (loc) {
            // Accept either [lng,lat] or GeoJSON {coordinates:[lng,lat]}
            let lng: number | undefined;
            let lat: number | undefined;

            if (Array.isArray(loc?.coordinates)) {
              [lng, lat] = loc.coordinates as [number, number];
            } else if (
              loc?.coordinates?.coordinates &&
              Array.isArray(loc.coordinates.coordinates)
            ) {
              [lng, lat] = loc.coordinates.coordinates as [number, number];
            }

            if (typeof lat === 'number' && typeof lng === 'number') {
              setFoundLocation({
                id: 'existing',
                title: loc.address || '',
                lat: String(lat),
                lon: String(lng),
              });
            }
          }
        }
      } catch {
        // ignore – user can still complete description
      }
    })();
  }, [petId, isFoundParam, getPet]);

  const handleLocationMethodChange = (method: 'current' | 'manual') => {
    setLocationMethod(method);
    setFoundLocation(null);
  };

  const handleFetchCurrentLocation = async () => {
    const coords = await getCurrentLocation();
    if (coords) {
      setFoundLocation({
        id: 'current-location',
        title: t('current_location'),
        lat: String(coords.latitude),
        lon: String(coords.longitude),
      });
    }
  };

  const onSelectFoundLocation = (loc: PickedLocation) => setFoundLocation(loc);

  const handleFinish = async () => {
    try {
      // Update description first
      await updatePetDescription(petId, description);

      // Only if found: save phone + found details
      if (petIsFound) {
        // Save phone (sanitize: keep digits and leading '+')
        const sanitizedPhone = phoneNumber.replace(/[^\d+]/g, '');
        if (sanitizedPhone.length > 0) {
          await updateContactInfo(petId, { phoneNumbers: [sanitizedPhone] });
        }

        // Persist found details
        await updateFoundDetails(petId, {
          dateFound: dateFound || undefined,
          address: foundLocation?.title || undefined,
          lat: foundLocation ? Number(foundLocation.lat) : undefined,
          lng: foundLocation ? Number(foundLocation.lon) : undefined,
          notes: foundNotes || undefined,
          isFound: true,
        });
      }

      Alert.alert(
        t('success'),
        t('pet_registered_successfully'),
        [{ text: t('ok'), onPress: () => navigation.popToTop() }],
        { cancelable: false },
      );
    } catch (err: any) {
      Alert.alert(t('error'), err.message || t('something_went_wrong'));
    }
  };

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.scrollViewContent}
    >
      <View style={styles.container}>
        <ProgressBar
          progress={1.0}
          color={colors.buttonColor}
          style={[
            styles.progressBar,
            I18nManager.isRTL && styles.progressBarRTL,
          ]}
        />

        <View style={styles.backButton}>
          <CustomBackButton />
        </View>

        <Text style={styles.title}>{t('pet_description')}</Text>

        {/* Description — Paper TextInput (multiline) */}
        <View style={styles.card}>
          <Text style={styles.label}>{t('description')}</Text>
          <TextInput
            mode="outlined"
            placeholder={t('enter_pet_description_example')}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={6}
            maxLength={500}
            style={styles.descriptionInput}
            contentStyle={styles.descriptionContent}
            outlineStyle={styles.inputOutline}
            placeholderTextColor={colors.onSurfaceVariant}
          />
          <Text style={styles.characterCounter}>{description.length}/500</Text>
        </View>

        {/* Found details */}
        {petIsFound && (
          <>
            <Text style={styles.sectionTitle}>{t('found_details')}</Text>

            {/* Phone number — CustomInputText (ONLY when found) */}
            <View style={styles.card}>
              <Text style={styles.label}>{t('phone_number')}</Text>
              <CustomInputText
                placeholder={t('enter_phone_number')}
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
                textContentType="telephoneNumber"
                maxLength={20}
                containerStyle={styles.inputFieldContainer}
                leftIconContainerStyle={styles.inputIconContainer}
                placeholderTextColor={colors.onSurfaceVariant}
              />
              <Text style={styles.characterCounter}>
                {phoneNumber.length}/20
              </Text>
            </View>

            {/* Date found */}
            <View style={styles.card}>
              <Text style={styles.label}>{t('date_found')}</Text>
              <CustomTextInputDate
                placeholder={t('select_date_found')}
                value={dateFound}
                onChangeText={setDateFound}
                containerStyle={styles.inputDateFieldContainer}
                leftIconContainerStyle={styles.inputIconContainer}
                rightIconContainerStyle={styles.inputIconContainer}
                iconColor={colors.primary}
                colors={colors}
                maxDate={new Date()}
              />
            </View>

            {/* Location section (like Search) */}
            <View style={[styles.card, styles.locationSection]}>
              <Text style={styles.filterSectionTitle}>
                {t('found_location')}
              </Text>

              {/* Status */}
              <View style={styles.locationStatusCard}>
                <LocationIcon
                  color={foundLocation ? colors.primary : colors.error}
                />
                <Text
                  style={[
                    styles.locationStatusText,
                    !foundLocation && { color: colors.error },
                  ]}
                  numberOfLines={2}
                >
                  {foundLocation?.title || t('no_location_selected')}
                </Text>
                <Text style={styles.locationStatusSubtext}>
                  {foundLocation
                    ? t('location_selected')
                    : t('select_location_for_found')}
                </Text>
              </View>

              {/* Method selector */}
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

              {/* Actions */}
              {locationMethod === 'current' ? (
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
              ) : (
                <StyledLocationPicker
                  onSelect={onSelectFoundLocation}
                  placeholder={t('search_found_location')}
                  label={t('search_location')}
                />
              )}

              {/* Selected location card */}
              {foundLocation && (
                <Card style={styles.selectedLocationCard}>
                  <Card.Content style={styles.selectedLocationContent}>
                    <LocationIcon color={colors.buttonColor} />
                    <Text style={styles.selectedLocationText} numberOfLines={2}>
                      {foundLocation.title}
                    </Text>
                  </Card.Content>
                </Card>
              )}
            </View>

            {/* Notes — Paper TextInput (multiline) */}
            <View style={styles.card}>
              <Text style={styles.label}>{t('found_notes')}</Text>
              <TextInput
                mode="outlined"
                placeholder={t('enter_found_notes')}
                value={foundNotes}
                onChangeText={setFoundNotes}
                style={styles.descriptionInput}
                contentStyle={styles.descriptionContent}
                outlineStyle={styles.inputOutline}
                multiline
                numberOfLines={4}
                maxLength={500}
                placeholderTextColor={colors.onSurfaceVariant}
              />
              <Text style={styles.characterCounter}>
                {foundNotes.length}/500
              </Text>
            </View>
          </>
        )}

        <Pressable
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleFinish}
          disabled={loading}
        >
          <RegisterIcon color={colors.buttonTextColor} />
        </Pressable>
      </View>
    </ScrollView>
  );
}

const createStyles = (width: number, colors: any) =>
  StyleSheet.create({
    scrollView: { flex: 1, backgroundColor: colors.background },
    scrollViewContent: { flexGrow: 1, padding: moderateScale(16) },
    container: { flex: 1, alignItems: 'center' },
    progressBar: {
      width: width - moderateScale(32),
      marginBottom: verticalScale(12),
    },
    progressBarRTL: { transform: [{ scaleX: -1 }] },
    backButton: {
      alignSelf: I18nManager.isRTL ? 'flex-end' : 'flex-start',
      marginBottom: verticalScale(10),
    },
    title: {
      fontSize: moderateScale(22),
      color: colors.primary,
      marginBottom: verticalScale(20),
      fontWeight: '500',
      textAlign: 'center',
    },
    sectionTitle: {
      width: '100%',
      fontSize: moderateScale(18),
      color: colors.primary,
      marginBottom: verticalScale(8),
      fontWeight: '600',
      textAlign: 'left',
    },
    card: { width: '100%', marginBottom: verticalScale(16) },
    label: {
      fontSize: moderateScale(16),
      color: colors.primary,
      marginBottom: verticalScale(8),
    },

    // Paper input styles for big text boxes
    descriptionInput: {
      backgroundColor: colors.surface,
      minHeight: verticalScale(120),
      borderRadius: moderateScale(12),
    },
    descriptionContent: {
      padding: verticalScale(16),
      textAlignVertical: 'top',
      fontSize: moderateScale(16),
      lineHeight: verticalScale(24),
    },
    inputOutline: {
      borderColor: colors.outline,
      borderWidth: 1,
      borderRadius: moderateScale(12),
    },

    characterCounter: {
      alignSelf: 'flex-end',
      fontSize: moderateScale(12),
      color: colors.onSurfaceVariant,
      marginTop: verticalScale(4),
    },
    button: {
      backgroundColor: colors.buttonColor,
      padding: moderateScale(16),
      borderRadius: moderateScale(50),
      alignItems: 'center',
      marginBottom: verticalScale(20),
    },
    buttonDisabled: { opacity: 0.6 },

    // CustomInputText container for single-line inputs (phone)
    inputFieldContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: verticalScale(12),
      paddingHorizontal: moderateScale(12),
      backgroundColor: colors.surface,
      borderRadius: moderateScale(4),
      borderWidth: 1,
      borderColor: colors.outline,
      height: verticalScale(52),
      marginBottom: 0,
    },
    inputIconContainer: {
      width: moderateScale(20),
      height: moderateScale(20),
      marginLeft: moderateScale(12),
      marginRight: moderateScale(8),
      justifyContent: 'center',
      alignItems: 'center',
    },

    // Date field (mirrors Step 1)
    inputDateFieldContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: verticalScale(12),
      paddingHorizontal: moderateScale(12),
      backgroundColor: colors.surface,
      borderRadius: moderateScale(4),
      borderWidth: 1,
      borderColor: colors.outline,
      height: verticalScale(52),
      marginBottom: 0,
    },

    // Location UI (like Search)
    locationSection: {
      padding: scale(12),
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
    selectedLocationCard: {
      backgroundColor: colors.surface,
      marginTop: verticalScale(12),
      borderRadius: moderateScale(12),
      borderWidth: 1,
      borderColor: colors.buttonColor + '30',
    },
    selectedLocationContent: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: moderateScale(16),
    },
    selectedLocationText: {
      fontSize: moderateScale(14),
      color: colors.onSurface,
      marginLeft: moderateScale(12),
      flex: 1,
      fontWeight: '500',
    },
  });
