import React, { useState, useMemo, memo, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  useWindowDimensions,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Image,
  RefreshControl,
} from 'react-native';
import {
  useTheme,
  Text,
  Card,
  IconButton,
  Chip,
  TextInput,
} from 'react-native-paper';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
import { useTranslation } from 'react-i18next';
import { ThemeColors } from '../../types/theme';
import { openSettings } from 'react-native-permissions';
import StyledLocationPicker from '../../components/UI/StyledLocationPicker';
import CustomInputText from '../../components/UI/CustomInputText';
import ContactPicker from '../../components/UI/ContactPicker';
import PetSelectionCard from '../../components/Cards/PetSelectionCard';
import {
  useContactPermission,
  ContactInfo,
} from '../../utils/ContactPermissions';
import { useLocationPermission } from '../../utils/LocationPermissions';
import { CustomRadioGroup, Option } from '../../components/UI/CustomRadioGroup';
import { useMyPetsViewModel } from '../../viewModels/MyPetsViewModel';
import { apiClient } from '../../api';
import PetApiService from '../../api/services/PetApiService';
import { UpdatePetRequest } from '../../types/pet';

// Icons
import LocationIconSvg from '../../assets/icons/ic_location.svg';
import AddIconSvg from '../../assets/icons/ic_add.svg';
import DeleteIconSvg from '../../assets/icons/ic_delete.svg';
import PostIconSvg from '../../assets/icons/ic_post.svg';
import PhoneIconSvg from '../../assets/icons/ic_phone.svg';
import ContactsIconSvg from '../../assets/icons/ic_users.svg';

// Icon components
const LocationIcon = ({ color }: { color?: string }) => (
  <LocationIconSvg
    width={moderateScale(20)}
    height={moderateScale(20)}
    stroke={color || 'black'}
  />
);

const AddIcon = ({ color }: { color?: string }) => (
  <AddIconSvg
    width={moderateScale(20)}
    height={moderateScale(20)}
    stroke={color || 'black'}
  />
);

const DeleteIcon = ({ color }: { color?: string }) => (
  <DeleteIconSvg
    width={moderateScale(20)}
    height={moderateScale(20)}
    stroke={color || 'black'}
  />
);

const PhoneIcon = ({ color }: { color?: string }) => (
  <PhoneIconSvg
    width={moderateScale(20)}
    height={moderateScale(20)}
    stroke={color || 'black'}
  />
);

const ContactsIcon = ({ color }: { color?: string }) => (
  <ContactsIconSvg
    width={moderateScale(20)}
    height={moderateScale(20)}
    stroke={color || 'black'}
  />
);

const PostIcon = ({ color }: { color?: string }) => (
  <PostIconSvg
    width={moderateScale(30)}
    height={moderateScale(30)}
    stroke={color || 'black'}
    fill="none"
  />
);

// Icon render functions
const renderAddIcon = (color: string) => () => <AddIcon color={color} />;
const renderDeleteIconForChip = (color: string) => () =>
  <DeleteIcon color={color} />;
const renderContactsIcon = (color: string) => () =>
  <ContactsIcon color={color} />;

type LocationMethod = 'current' | 'manual';

interface LocationData {
  id: string;
  title: string;
  lat: string;
  lon: string;
}

const PostScreen: React.FC = memo(() => {
  const { width, height } = useWindowDimensions();
  const { colors }: { colors: ThemeColors } = useTheme();
  const { t } = useTranslation();
  const styles = useMemo(
    () => createStyles(width, height, colors),
    [width, height, colors],
  );

  // Fetch pets using the view model
  const {
    pets,
    loading: petsLoading,
    error: petsError,
    refresh,
  } = useMyPetsViewModel();
  const availablePets = useMemo(
    () => pets.filter(p => !p.isLost && !p.isFound),
    [pets],
  );

  const BUDService = useMemo(() => new PetApiService(apiClient), []);

  // Contact hook and state
  const { checkPermission } = useContactPermission();
  const [contactPickerVisible, setContactPickerVisible] = useState(false);

  // State management
  const [selectedPet, setSelectedPet] = useState<string | null>(null);
  const [phoneNumbers, setPhoneNumbers] = useState<string[]>(['']);
  const [currentPhoneInput, setCurrentPhoneInput] = useState('');
  const [lostLocation, setLostLocation] = useState<LocationData | null>(null);
  const [locationMethod, setLocationMethod] = useState<'current' | 'manual'>(
    'current',
  );
  const [additionalDetails, setAdditionalDetails] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const {
    getCurrentLocation,
    loading: currentLocationLoading,
    waitingForSettings,
  } = useLocationPermission();
  const handleRefresh = useCallback(async () => {
    try {
      setRefreshing(true);
      await refresh();
    } catch (e) {
      console.warn('Refresh failed', e);
    } finally {
      setRefreshing(false);
    }
  }, [refresh]);

  const handleFetchLocation = useCallback(async () => {
    const coords = await getCurrentLocation();
    if (coords) {
      setLostLocation({
        id: 'current-location',
        title: t('current_location'),
        lat: coords.latitude.toString(),
        lon: coords.longitude.toString(),
      });
    }
  }, [getCurrentLocation, t]);

  const locationOptions: Option<LocationMethod>[] = [
    { value: 'current', label: t('use_current_location') },
    { value: 'manual', label: t('enter_location_manually') },
  ];

  const handlePetSelection = useCallback(
    (petId: string) => {
      setSelectedPet(petId === selectedPet ? null : petId);
    },
    [selectedPet],
  );

  const addPhoneNumber = useCallback(() => {
    if (
      currentPhoneInput.trim() &&
      !phoneNumbers.includes(currentPhoneInput.trim())
    ) {
      setPhoneNumbers(prev => [
        ...prev.filter(p => p !== ''),
        currentPhoneInput.trim(),
      ]);
      setCurrentPhoneInput('');
    }
  }, [currentPhoneInput, phoneNumbers]);

  const removePhoneNumber = useCallback((index: number) => {
    setPhoneNumbers(prev => prev.filter((_, i) => i !== index));
  }, []);

  const importFromContacts = useCallback(async () => {
    try {
      const hasPermission = await checkPermission();
      if (hasPermission) {
        setContactPickerVisible(true);
      } else {
        const { request, PERMISSIONS } = require('react-native-permissions');
        const permission =
          Platform.OS === 'ios'
            ? PERMISSIONS.IOS.CONTACTS
            : PERMISSIONS.ANDROID.READ_CONTACTS;
        const result = await request(permission);
        if (result === 'granted') {
          setContactPickerVisible(true);
        } else {
          Alert.alert(
            t('permission_required'),
            t('contacts_permission_denied'),
            [
              { text: t('cancel'), style: 'cancel' },
              { text: t('open_settings'), onPress: () => openSettings() },
            ],
          );
        }
      }
    } catch (error) {
      Alert.alert(t('error'), t('failed_to_access_contacts'));
    }
  }, [checkPermission, t]);

  const handleContactSelect = useCallback(
    (contact: ContactInfo) => {
      if (contact.phoneNumbers.length > 0) {
        const phoneNumber = contact.phoneNumbers[0].number.replace(
          /[\s\-()]/g,
          '',
        );
        if (!phoneNumbers.includes(phoneNumber)) {
          setPhoneNumbers(prev => [...prev.filter(p => p !== ''), phoneNumber]);
          Alert.alert(
            t('contact_imported'),
            `${contact.displayName}: ${phoneNumber}`,
            [{ text: t('ok') }],
          );
        }
      }
    },
    [phoneNumbers, t],
  );

  const handleLocationSelect = useCallback((location: LocationData) => {
    setLostLocation(location);
  }, []);

  const handleLocationMethodChange = useCallback(
    (method: 'current' | 'manual') => {
      setLocationMethod(method);
      if (method === 'manual') setLostLocation(null);
    },
    [],
  );

  const handlePost = useCallback(async () => {
    if (!selectedPet) {
      Alert.alert(t('validation_error'), t('please_select_pet'));
      return;
    }

    if (phoneNumbers.filter(p => p.trim()).length === 0) {
      Alert.alert(t('validation_error'), t('please_add_phone_number'));
      return;
    }

    if (!lostLocation) {
      Alert.alert(t('validation_error'), t('please_select_location'));
      return;
    }

    setIsPosting(true);

    try {
      const updateData: UpdatePetRequest = {
        isLost: true,
        phoneNumbers: phoneNumbers.filter(p => p.trim()),
      };

      const response = await BUDService.updatePet(selectedPet, updateData);

      if (response.success) {
        Alert.alert(t('post_successful'), t('lost_pet_posted_successfully'), [
          {
            text: t('ok'),
            onPress: () => {
              setSelectedPet(null);
              setPhoneNumbers(['']);
              setCurrentPhoneInput('');
              setLostLocation(null);
              setLocationMethod('current');
              setAdditionalDetails('');
            },
          },
        ]);
      } else {
        Alert.alert(t('error'), response.error || t('failed_to_post_lost_pet'));
      }
    } catch (error) {
      console.error('Error posting lost pet:', error);
      Alert.alert(t('error'), t('failed_to_post_lost_pet'));
    } finally {
      setIsPosting(false);
    }
  }, [selectedPet, phoneNumbers, lostLocation, t, BUDService]);

  const renderPetCard = useCallback(
    (pet: any) => (
      <PetSelectionCard
        key={pet.id}
        pet={pet}
        isSelected={selectedPet === pet.id}
        onPress={handlePetSelection}
        colors={colors}
      />
    ),
    [selectedPet, handlePetSelection, colors],
  );

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {/* Pet Selection */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionHeaderContent}>
              <Text style={styles.sectionTitleBold}>
                {t('select_your_pet')}
              </Text>
              <Text style={styles.sectionSubtitle}>
                {t('choose_lost_pet_description')}
              </Text>
            </View>
            <View style={styles.sectionHeaderIcon}>
              <Image
                source={require('../../assets/icons/ic_lost_pets.png')}
                style={styles.logo}
              />
            </View>
          </View>
          {petsLoading && availablePets.length === 0 ? (
            <ActivityIndicator size="large" color={colors.primary} />
          ) : petsError ? (
            <Text style={styles.errorText}>{petsError}</Text>
          ) : availablePets.length === 0 ? (
            <Text style={styles.noPetsText}>{t('no_pets_available')}</Text>
          ) : (
            availablePets.map(renderPetCard)
          )}
        </View>

        {/* Phone Numbers */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('contact_phone_numbers')}</Text>
          <Text style={styles.sectionSubtitle}>
            {t('add_contact_numbers_description')}
          </Text>
          <View style={styles.phoneInputContainer}>
            <CustomInputText
              placeholder={t('enter_phone_number')}
              value={currentPhoneInput}
              onChangeText={setCurrentPhoneInput}
              leftIcon={PhoneIcon}
              containerStyle={styles.phoneInputField}
              leftIconContainerStyle={styles.phoneInputIconContainer}
              keyboardType="name-phone-pad"
            />
            <View style={styles.phoneButtonsContainer}>
              <IconButton
                icon={renderAddIcon(colors.buttonTextColor!)}
                size={moderateScale(24)}
                onPress={addPhoneNumber}
                style={styles.phoneActionButton}
                disabled={!currentPhoneInput.trim()}
              />
              <IconButton
                icon={renderContactsIcon(colors.buttonTextColor!)}
                size={moderateScale(24)}
                onPress={importFromContacts}
                style={styles.phoneActionButton}
              />
            </View>
          </View>
          <View style={styles.phoneChipsContainer}>
            {phoneNumbers
              .filter(p => p.trim())
              .map((phone, index) => (
                <Chip
                  key={index}
                  style={styles.phoneChip}
                  textStyle={styles.phoneChipText}
                  onClose={() => removePhoneNumber(index)}
                  closeIcon={renderDeleteIconForChip(colors.buttonTextColor!)}
                >
                  {`\u202D${phone}\u202C  `}
                </Chip>
              ))}
          </View>
        </View>

        {/* Location Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('lost_location')}</Text>
          <Text style={styles.sectionSubtitle}>{t('where_pet_was_lost')}</Text>
          <View style={styles.locationMethodContainer}>
            <CustomRadioGroup<LocationMethod>
              options={locationOptions}
              selectedValue={locationMethod}
              onValueChange={handleLocationMethodChange}
              selectedColor={colors.rangeTextColor}
              unselectedColor={colors.primary}
            />
            {locationMethod === 'current' && (
              <>
                <TouchableOpacity
                  style={[
                    styles.locationButton,
                    (currentLocationLoading || waitingForSettings) &&
                      styles.locationButtonDisabled,
                  ]}
                  onPress={handleFetchLocation}
                  disabled={currentLocationLoading || waitingForSettings}
                >
                  <View style={styles.locationButtonContent}>
                    {currentLocationLoading ? (
                      <ActivityIndicator size="small" color={colors.primary} />
                    ) : (
                      <LocationIcon color={colors.primary} />
                    )}
                    <Text style={styles.locationButtonText}>
                      {waitingForSettings
                        ? t('waiting_for_settings')
                        : t('get_current_location')}
                    </Text>
                  </View>
                </TouchableOpacity>
                {waitingForSettings && (
                  <Text style={styles.settingsHelpText}>
                    {t('location_settings_help')}
                  </Text>
                )}
              </>
            )}
            {locationMethod === 'manual' && (
              <StyledLocationPicker
                onSelect={handleLocationSelect}
                placeholder={t('search_lost_location')}
                label={t('search_location')}
              />
            )}
          </View>
          {lostLocation && (
            <Card style={styles.selectedLocationCard}>
              <Card.Content style={styles.selectedLocationContent}>
                <LocationIcon color={colors.buttonColor} />
                <Text style={styles.selectedLocationText} numberOfLines={2}>
                  {lostLocation.title}
                </Text>
              </Card.Content>
            </Card>
          )}
        </View>

        {/* Additional Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('additional_details')}</Text>
          <Text style={styles.sectionSubtitle}>
            {t('additional_details_description')}
          </Text>
          <TextInput
            mode="outlined"
            placeholder={t('enter_additional_details')}
            value={additionalDetails}
            onChangeText={setAdditionalDetails}
            style={styles.detailsInput}
            contentStyle={styles.detailsInputContent}
            outlineStyle={styles.detailsInputOutline}
            multiline
            numberOfLines={3}
            maxLength={500}
          />
          <Text style={styles.characterCounter}>
            {additionalDetails.length}/500
          </Text>
        </View>
      </ScrollView>

      <TouchableOpacity
        style={styles.fab}
        onPress={handlePost}
        disabled={isPosting}
      >
        {isPosting ? (
          <ActivityIndicator size="small" color={colors.buttonTextColor} />
        ) : (
          <PostIcon color={colors.buttonTextColor} />
        )}
      </TouchableOpacity>

      <ContactPicker
        visible={contactPickerVisible}
        onClose={() => setContactPickerVisible(false)}
        onSelectContact={handleContactSelect}
        colors={colors}
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
    scrollView: {
      flex: 1,
    },
    scrollViewContent: {
      paddingBottom: verticalScale(100),
    },
    logo: {
      width: moderateScale(150),
      height: moderateScale(150),
      resizeMode: 'contain',
      marginTop: verticalScale(30),
      marginBottom: verticalScale(10),
      alignSelf: 'center',
    },
    section: {
      marginBottom: verticalScale(32),
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      marginBottom: verticalScale(16),
    },
    sectionHeaderContent: {
      flex: 1,
      paddingRight: scale(16),
    },
    sectionHeaderIcon: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingTop: verticalScale(4),
    },
    sectionTitle: {
      fontSize: moderateScale(18),
      fontWeight: '600',
      color: colors.primary,
      marginBottom: verticalScale(6),
      textAlign: 'left',
    },
    sectionTitleBold: {
      fontSize: moderateScale(20),
      fontWeight: '700',
      color: colors.primary,
      marginBottom: verticalScale(6),
      textAlign: 'left',
    },
    sectionSubtitle: {
      fontSize: moderateScale(14),
      color: colors.onSurfaceVariant,
      marginBottom: 0,
      textAlign: 'left',
      opacity: 0.8,
      lineHeight: verticalScale(20),
    },
    phoneInputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: verticalScale(16),
    },
    phoneInputField: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: verticalScale(12),
      paddingHorizontal: scale(12),
      backgroundColor: colors.surface,
      borderRadius: moderateScale(4),
      borderWidth: 1,
      borderColor: colors.outline,
      height: verticalScale(52),
      marginRight: scale(12),
    },
    phoneInputIconContainer: {
      width: moderateScale(20),
      height: moderateScale(20),
      marginLeft: scale(12),
      marginRight: scale(8),
      justifyContent: 'center',
      alignItems: 'center',
    },
    phoneButtonsContainer: {
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
    },
    phoneActionButton: {
      margin: 0,
      backgroundColor: colors.buttonColor,
      marginBottom: verticalScale(8),
      width: moderateScale(40),
      height: moderateScale(40),
    },
    phoneChipsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
    phoneChip: {
      marginBottom: verticalScale(8),
      marginRight: scale(8),
      backgroundColor: colors.buttonColor,
      writingDirection: 'ltr',
    },
    phoneChipText: {
      color: colors.buttonTextColor,
      fontWeight: '500',
      fontSize: moderateScale(16),
    },
    locationMethodContainer: {
      marginBottom: verticalScale(16),
    },
    locationButton: {
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
    settingsHelpText: {
      fontSize: moderateScale(12),
      color: colors.onSurfaceVariant,
      textAlign: 'center',
      fontStyle: 'italic',
      marginTop: verticalScale(8),
      opacity: 0.8,
    },
    selectedLocationCard: {
      backgroundColor: colors.surface,
      marginTop: verticalScale(16),
      borderRadius: moderateScale(12),
      borderWidth: 1,
      borderColor: colors.buttonColor + '30',
    },
    selectedLocationContent: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: scale(16),
    },
    selectedLocationText: {
      fontSize: moderateScale(14),
      color: colors.onSurface,
      marginLeft: scale(12),
      flex: 1,
      fontWeight: '500',
    },
    detailsInput: {
      backgroundColor: colors.surface,
      minHeight: verticalScale(120),
      fontSize: moderateScale(14),
    },
    detailsInputContent: {
      paddingVertical: verticalScale(12),
      textAlignVertical: 'top',
      fontSize: moderateScale(16),
    },
    detailsInputOutline: {
      borderColor: colors.outline,
      borderWidth: 1,
      borderRadius: moderateScale(16),
    },
    characterCounter: {
      fontSize: moderateScale(12),
      color: colors.onSurfaceVariant,
      textAlign: 'right',
      marginTop: verticalScale(6),
      opacity: 0.7,
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
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.27,
      shadowRadius: 4.65,
    },
    errorText: {
      color: colors.error,
      textAlign: 'center',
      marginVertical: verticalScale(10),
    },
    noPetsText: {
      textAlign: 'center',
      marginVertical: verticalScale(10),
      color: colors.onSurfaceVariant,
    },
  });

PostScreen.displayName = 'PostScreen';

export default PostScreen;
