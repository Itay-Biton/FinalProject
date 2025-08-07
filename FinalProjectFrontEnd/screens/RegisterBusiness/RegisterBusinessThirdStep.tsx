import React, { useState, useMemo } from 'react';
import {
  View,
  Image,
  useWindowDimensions,
  StyleSheet,
  Pressable,
  ScrollView,
  Alert,
  I18nManager,
  ActivityIndicator,
} from 'react-native';
import { useTheme, Text, ProgressBar } from 'react-native-paper';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
import { useTranslation } from 'react-i18next';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RegisterBusinessStackParamList } from '../../navigation/RegisterBusinessNavigation';
import { ThemeColors } from '../../types/theme';
import CustomBackButton from '../../components/UI/CustomBackButton';
import StyledLocationPicker from '../../components/UI/StyledLocationPicker';
import { useRegisterBusinessViewModel } from '../../viewModels/RegisterBusinessViewModel';

// Icon imports
import RegisterIconSvg from '../../assets/icons/ic_register.svg';

const RegisterIcon = ({ color }: { color?: string }) => (
  <RegisterIconSvg
    width={moderateScale(40)}
    height={moderateScale(40)}
    fill={color || 'black'}
  />
);

type Props = NativeStackScreenProps<
  RegisterBusinessStackParamList,
  'RegisterBusinessThirdStep'
>;

const RegisterBusinessThirdStep: React.FC<Props> = ({ navigation, route }) => {
  const { businessId } = route.params;
  const { width, height } = useWindowDimensions();
  const { colors }: { colors: ThemeColors } = useTheme();
  const { t } = useTranslation();
  const styles = useMemo(
    () => createStyles(width, height, colors),
    [width, height, colors],
  );

  // ViewModel
  const { loading, error, completeBusiness, resetRegistration } =
    useRegisterBusinessViewModel();

  const [selectedLocation, setSelectedLocation] = useState<{
    id: string;
    title: string;
    lat: string;
    lon: string;
  } | null>(null);

  const handleLocationSelect = (location: {
    id: string;
    title: string;
    lat: string;
    lon: string;
  }) => {
    setSelectedLocation(location);
    console.log('Selected business location:', location);
  };

  const handleRegister = async () => {
    if (!selectedLocation) {
      Alert.alert(
        t('location_required', { defaultValue: 'Location Required' }),
        t('please_select_business_location', {
          defaultValue:
            'Please select your business location to complete registration.',
        }),
        [{ text: t('ok', { defaultValue: 'OK' }) }],
      );
      return;
    }

    try {
      console.log(
        'Completing business registration with location:',
        selectedLocation,
      );

      // Complete business registration with location
      const completedBusiness = await completeBusiness(
        businessId,
        selectedLocation,
      );

      console.log(
        'Business registration completed successfully:',
        completedBusiness._id,
      );

      // Show success alert and navigate
      Alert.alert(
        t('registration_successful', {
          defaultValue: 'Registration Successful!',
        }),
        t('business_registered_successfully', {
          defaultValue:
            'Your business has been registered successfully. Welcome to the platform!',
        }),
        [
          {
            text: t('get_started', { defaultValue: 'Get Started' }),
            onPress: () => {
              // Reset the registration state
              resetRegistration();

              // Navigate back to main screen or business management
              // You can navigate to main tab navigation or a specific screen
              navigation.reset({
                index: 0,
                routes: [{ name: 'MainTabNavigation' as never }],
              });
            },
          },
        ],
      );
    } catch (err: any) {
      console.error('Business registration completion failed:', err);

      Alert.alert(
        t('registration_failed', { defaultValue: 'Registration Failed' }),
        err.message ||
          t('failed_to_complete_registration', {
            defaultValue:
              'Failed to complete business registration. Please try again.',
          }),
        [
          {
            text: t('try_again', { defaultValue: 'Try Again' }),
            onPress: handleRegister,
          },
          {
            text: t('go_back', { defaultValue: 'Go Back' }),
            style: 'cancel',
            onPress: () => navigation.goBack(),
          },
        ],
      );
    }
  };

  return (
    <>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
      >
        <View style={styles.container}>
          {/* Progress Bar at 100% */}
          <ProgressBar
            progress={1.0}
            color={colors.buttonColor}
            style={[
              styles.progressBar,
              I18nManager.isRTL && styles.progressBarRTL,
            ]}
          />

          <View style={styles.backButton}>
            <CustomBackButton onPress={() => navigation.goBack()} />
          </View>

          {/* Logo Image */}
          <Image
            source={require('../../assets/icons/ic_business_location.png')}
            style={styles.logo}
          />

          <Text style={styles.title}>
            {t('business_location', { defaultValue: 'Business Location' })}
          </Text>

          {/* Error Display */}
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <View style={styles.card}>
            {/* Location Picker */}
            <StyledLocationPicker
              label={t('business_address', {
                defaultValue: 'Business Address',
              })}
              placeholder={t('search_business_location', {
                defaultValue: 'Search for your business location...',
              })}
              onSelect={handleLocationSelect}
              disabled={loading}
            />

            {/* Selected Location Display */}
            {selectedLocation && (
              <View style={styles.selectedLocationContainer}>
                <Text style={styles.selectedLocationLabel}>
                  {t('selected_location', {
                    defaultValue: 'Selected Location',
                  })}
                  :
                </Text>
                <Text style={styles.selectedLocationText}>
                  {selectedLocation.title}
                </Text>
                <Text style={styles.selectedLocationCoords}>
                  {t('coordinates', { defaultValue: 'Coordinates' })}:{' '}
                  {selectedLocation.lat}, {selectedLocation.lon}
                </Text>
              </View>
            )}

            {/* Helper text */}
            <Text style={styles.helperText}>
              {t('location_helper_text', {
                defaultValue:
                  'Choose your business location carefully. This will help customers find you and affects your visibility in search results.',
              })}
            </Text>

            {/* Loading indicator */}
            {loading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.buttonColor} />
                <Text style={styles.loadingText}>
                  {t('completing_registration', {
                    defaultValue: 'Completing registration...',
                  })}
                </Text>
              </View>
            )}

            {/* Register Button */}
            <View style={styles.buttonContainer}>
              <Pressable
                style={[
                  styles.customButton,
                  (!selectedLocation || loading) && styles.disabledButton,
                ]}
                onPress={handleRegister}
                disabled={!selectedLocation || loading}
              >
                {loading ? (
                  <ActivityIndicator color={colors.buttonTextColor} />
                ) : (
                  <RegisterIcon
                    color={
                      selectedLocation
                        ? colors.buttonTextColor
                        : colors.onSurfaceVariant
                    }
                  />
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>
    </>
  );
};

const createStyles = (width: number, height: number, colors: ThemeColors) =>
  StyleSheet.create({
    scrollView: {
      flexGrow: 1,
      padding: 0,
      backgroundColor: colors.background,
    },
    scrollViewContent: {
      flexGrow: 1,
    },
    container: {
      flex: 1,
      paddingTop: verticalScale(50),
      justifyContent: 'flex-start',
      alignItems: 'center',
      backgroundColor: colors.background,
      paddingHorizontal: moderateScale(16),
    },
    progressBar: {
      width: width - moderateScale(32),
      marginBottom: moderateScale(8),
    },
    progressBarRTL: {
      transform: [{ scaleX: -1 }],
    },
    backButton: {
      alignSelf: I18nManager.isRTL ? 'flex-end' : 'flex-start',
      marginBottom: verticalScale(10),
    },
    logo: {
      width: moderateScale(150),
      height: moderateScale(150),
      resizeMode: 'contain',
      marginVertical: verticalScale(20),
    },
    title: {
      fontSize: moderateScale(22),
      color: colors.primary,
      marginBottom: verticalScale(20),
      textAlign: 'center',
      fontWeight: '500',
    },
    errorContainer: {
      backgroundColor: colors.errorContainer,
      marginHorizontal: moderateScale(16),
      marginVertical: verticalScale(8),
      padding: moderateScale(12),
      borderRadius: moderateScale(8),
      alignItems: 'center',
      width: width - moderateScale(64),
    },
    errorText: {
      color: colors.error,
      textAlign: 'center',
      fontSize: moderateScale(14),
    },
    card: {
      width: '90%',
      paddingHorizontal: scale(8),
    },
    selectedLocationContainer: {
      backgroundColor: colors.surface,
      borderRadius: moderateScale(8),
      padding: moderateScale(12),
      marginVertical: verticalScale(16),
      borderWidth: 1,
      borderColor: colors.buttonColor,
    },
    selectedLocationLabel: {
      fontSize: moderateScale(14),
      color: colors.primary,
      fontWeight: '500',
      marginBottom: verticalScale(4),
    },
    selectedLocationText: {
      fontSize: moderateScale(16),
      color: colors.onSurface,
      marginBottom: verticalScale(4),
      fontWeight: '600',
    },
    selectedLocationCoords: {
      fontSize: moderateScale(12),
      color: colors.onSurfaceVariant,
      fontStyle: 'italic',
    },
    helperText: {
      fontSize: moderateScale(14),
      color: colors.onSurfaceVariant,
      marginBottom: verticalScale(20),
      fontStyle: 'italic',
      lineHeight: verticalScale(20),
      opacity: 0.8,
      textAlign: 'center',
    },
    loadingContainer: {
      alignItems: 'center',
      marginVertical: verticalScale(20),
    },
    loadingText: {
      marginTop: verticalScale(10),
      fontSize: moderateScale(14),
      color: colors.primary,
      opacity: 0.7,
    },
    buttonContainer: {
      alignItems: 'center',
      marginTop: verticalScale(20),
      marginBottom: verticalScale(30),
    },
    customButton: {
      backgroundColor: colors.buttonColor,
      borderRadius: moderateScale(50),
      padding: moderateScale(20),
      elevation: 3,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
    },
    disabledButton: {
      backgroundColor: colors.onSurfaceVariant,
      opacity: 0.5,
      elevation: 0,
      shadowOpacity: 0,
    },
  });

export default RegisterBusinessThirdStep;
