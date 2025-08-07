import React, { useState, useMemo } from 'react';
import {
  View,
  Image,
  useWindowDimensions,
  StyleSheet,
  Pressable,
  I18nManager,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useTheme, Text, ProgressBar } from 'react-native-paper';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
import { useTranslation } from 'react-i18next';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RegisterBusinessStackParamList } from '../../navigation/RegisterBusinessNavigation';

// Custom inputs and dropdown
import CustomInputText from '../../components/UI/CustomInputText';
import IconDropdown from '../../components/UI/IconDropdown';
import WorkingHoursSelector from '../../components/UI/WorkingHoursSelector';

// Icon imports
import MailIconSvg from '../../assets/icons/ic_mail.svg';
import BusinessIconSvg from '../../assets/icons/ic_business.svg';
import ServiceIconSvg from '../../assets/icons/ic_service.svg';
import PhoneIconSvg from '../../assets/icons/ic_phone.svg';
import NextIconSvg from '../../assets/icons/ic_next.svg';

// Constants
import { getServiceTypesList } from '../../constants/serviceTypesList';
import { ThemeColors } from '../../types/theme';
import { WorkingHours } from '../../types/business';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { useRegisterBusinessViewModel } from '../../viewModels/RegisterBusinessViewModel';

type Props = NativeStackScreenProps<
  RegisterBusinessStackParamList,
  'RegisterBusinessFirstStep'
>;

const MailIcon = ({ color }: { color?: string }) => (
  <MailIconSvg
    width={moderateScale(20)}
    height={moderateScale(20)}
    stroke={color || 'black'}
  />
);
const BusinessIcon = ({ color }: { color?: string }) => (
  <BusinessIconSvg
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
const PhoneIcon = ({ color }: { color?: string }) => (
  <PhoneIconSvg
    width={moderateScale(20)}
    height={moderateScale(20)}
    stroke={color || 'black'}
  />
);
const NextIcon = ({ color }: { color?: string }) => (
  <NextIconSvg
    width={moderateScale(40)}
    height={moderateScale(40)}
    fill={color || 'black'}
  />
);

const RegisterBusinessFirstStep: React.FC<Props> = ({ navigation }) => {
  const { width } = useWindowDimensions();
  const { colors } = useTheme() as { colors: ThemeColors };
  const { t } = useTranslation();
  const styles = useMemo(() => createStyles(width, colors), [width, colors]);

  // ViewModel
  const { loading, error, createBusiness, formData, updateFormData } =
    useRegisterBusinessViewModel();

  // Local form state
  const [businessName, setBusinessName] = useState(formData.name || '');
  const [email, setEmail] = useState(formData.email || '');
  const [phoneNumber, setPhoneNumber] = useState(formData.phoneNumber || '');
  const [serviceType, setServiceType] = useState(formData.serviceType || '');
  const [workingHours, setWorkingHours] = useState<WorkingHours[]>(
    formData.workingHours || [],
  );

  const serviceTypesList = useMemo(() => getServiceTypesList(t), [t]);

  const renderServiceTypeItem = (item: any) => (
    <View style={styles.itemContainer}>
      <Image source={item.icon} style={styles.itemIcon} resizeMode="contain" />
      <Text style={styles.itemText}>{item.label}</Text>
    </View>
  );

  // Validation
  const isFormValid = () => {
    return (
      businessName.trim().length > 0 &&
      serviceType.trim().length > 0 &&
      (email === '' || /\S+@\S+\.\S+/.test(email)) // Email is optional but must be valid if provided
    );
  };

  const handleNext = async () => {
    if (!isFormValid()) {
      Alert.alert(
        t('validation_error', { defaultValue: 'Validation Error' }),
        t('please_fill_required_fields', {
          defaultValue: 'Please fill in all required fields correctly.',
        }),
      );
      return;
    }

    try {
      console.log('Creating business with data:', {
        name: businessName,
        email: email || undefined,
        phoneNumber: phoneNumber || undefined,
        serviceType,
        workingHours,
      });

      const business = await createBusiness({
        name: businessName,
        email: email || undefined,
        phoneNumber: phoneNumber || undefined,
        serviceType,
        workingHours,
      });

      console.log(
        'Business created, navigating to step 2 with ID:',
        business._id,
      );

      // Navigate to next step with business ID
      navigation.navigate('RegisterBusinessSecondStep', {
        businessId: business._id,
      });
    } catch (err: any) {
      console.error('Business creation failed:', err);
      Alert.alert(
        t('registration_failed', { defaultValue: 'Registration Failed' }),
        err.message ||
          t('failed_to_create_business', {
            defaultValue: 'Failed to create business. Please try again.',
          }),
        [
          {
            text: t('try_again', { defaultValue: 'Try Again' }),
            onPress: handleNext,
          },
          {
            text: t('cancel', { defaultValue: 'Cancel' }),
            style: 'cancel',
          },
        ],
      );
    }
  };

  return (
    <KeyboardAwareScrollView
      enabled={true}
      bottomOffset={20}
      extraKeyboardSpace={10}
      disableScrollOnKeyboardHide={false}
      style={styles.scrollView}
      contentContainerStyle={styles.scrollViewContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.container}>
        <ProgressBar
          progress={0.33}
          color={colors.buttonColor}
          style={[
            styles.progressBar,
            I18nManager.isRTL && styles.progressBarRTL,
          ]}
        />

        <Image
          source={require('../../assets/icons/ic_business_pet.png')}
          style={styles.logo}
        />

        {/* Error Display */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <View style={styles.card}>
          <Text style={styles.label}>
            {t('business_name')} <Text style={styles.required}>*</Text>
          </Text>
          <CustomInputText
            placeholder={t('enter_business_name')}
            value={businessName}
            onChangeText={setBusinessName}
            leftIcon={BusinessIcon}
            containerStyle={styles.inputFieldContainer}
            leftIconContainerStyle={styles.inputIconContainer}
            iconColor={colors.primary}
            editable={!loading}
          />

          <Text style={styles.label}>{t('email')}</Text>
          <CustomInputText
            placeholder={t('enter_business_email')}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            leftIcon={MailIcon}
            containerStyle={styles.inputFieldContainer}
            leftIconContainerStyle={styles.inputIconContainer}
            iconColor={colors.primary}
            editable={!loading}
          />

          <Text style={styles.label}>{t('phone_number')}</Text>
          <CustomInputText
            placeholder={t('enter_your_phone_number')}
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            keyboardType="phone-pad"
            leftIcon={PhoneIcon}
            containerStyle={styles.inputFieldContainer}
            leftIconContainerStyle={styles.inputIconContainer}
            iconColor={colors.primary}
            editable={!loading}
          />

          <Text style={styles.label}>
            {t('service_type')} <Text style={styles.required}>*</Text>
          </Text>
          <IconDropdown
            label=""
            icon={ServiceIcon}
            data={serviceTypesList}
            value={serviceType}
            onChange={item => setServiceType(item.value)}
            labelField="label"
            valueField="value"
            placeholder={t('select_service_type')}
            renderItem={renderServiceTypeItem}
          />

          <WorkingHoursSelector onWorkingHoursChange={setWorkingHours} />

          <View style={styles.buttonContainer}>
            <Pressable
              style={[
                styles.customButton,
                (!isFormValid() || loading) && styles.disabledButton,
              ]}
              onPress={handleNext}
              disabled={!isFormValid() || loading}
            >
              {loading ? (
                <ActivityIndicator color={colors.buttonTextColor} />
              ) : (
                <NextIcon color={colors.buttonTextColor} />
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </KeyboardAwareScrollView>
  );
};

const createStyles = (width: number, colors: ThemeColors) =>
  StyleSheet.create({
    scrollView: {
      backgroundColor: colors.background,
    },
    scrollViewContent: {
      flexGrow: 1,
    },
    progressBarRTL: { transform: [{ scaleX: -1 }] },
    container: {
      flex: 1,
      alignItems: 'center',
      backgroundColor: colors.background,
      paddingTop: verticalScale(50),
    },
    progressBar: {
      width: width - moderateScale(32),
      marginBottom: moderateScale(24),
    },
    logo: {
      width: moderateScale(150),
      height: moderateScale(150),
      resizeMode: 'contain',
    },
    errorContainer: {
      backgroundColor: colors.errorContainer,
      marginHorizontal: scale(16),
      marginVertical: verticalScale(8),
      padding: scale(12),
      borderRadius: moderateScale(8),
      alignItems: 'center',
      width: width - moderateScale(32),
    },
    errorText: {
      color: colors.error,
      textAlign: 'center',
      fontSize: moderateScale(14),
    },
    card: {
      width: '90%',
      paddingHorizontal: scale(8),
      paddingVertical: verticalScale(16),
    },
    label: {
      fontSize: moderateScale(16),
      marginBottom: verticalScale(8),
      color: colors.primary,
      fontWeight: '500',
    },
    required: {
      color: colors.error,
    },
    inputFieldContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: verticalScale(12),
      paddingHorizontal: scale(12),
      backgroundColor: colors.surface,
      borderRadius: moderateScale(4),
      borderWidth: 1,
      borderColor: colors.outline,
      height: verticalScale(52),
      marginBottom: verticalScale(16),
    },
    inputIconContainer: {
      width: moderateScale(20),
      height: moderateScale(20),
      marginLeft: scale(12),
      marginRight: scale(8),
      justifyContent: 'center',
      alignItems: 'center',
    },
    dropdownInline: {
      flex: 1,
      height: verticalScale(52),
      paddingLeft: 0,
      backgroundColor: 'transparent',
    },
    dropdownContainer: {
      backgroundColor: colors.surface,
      borderColor: colors.outline,
      borderWidth: 1,
      borderRadius: moderateScale(4),
      marginTop: verticalScale(4),
    },
    selectedTextStyle: {
      marginLeft: scale(6),
      fontSize: moderateScale(16),
      color: colors.onSurface,
      lineHeight: verticalScale(52),
    },
    placeholderStyle: {
      marginLeft: scale(6),
      fontSize: moderateScale(16),
      color: colors.onSurfaceVariant,
      lineHeight: verticalScale(52),
    },
    inputSearchStyle: {
      height: verticalScale(40),
      fontSize: moderateScale(16),
      color: colors.onSurface,
      backgroundColor: colors.surface,
    },
    itemContainerStyle: {
      backgroundColor: colors.surface,
      borderBottomWidth: 0.5,
      borderBottomColor: colors.outline,
    },
    itemTextStyle: {
      fontSize: moderateScale(16),
      color: colors.onSurface,
    },
    itemContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: verticalScale(12),
      paddingHorizontal: scale(16),
    },
    itemIcon: {
      width: moderateScale(20),
      height: moderateScale(20),
      marginRight: scale(12),
    },
    itemText: {
      fontSize: moderateScale(16),
      color: colors.onSurface,
    },
    buttonContainer: {
      marginTop: verticalScale(24),
      alignItems: 'center',
    },
    customButton: {
      backgroundColor: colors.buttonColor,
      borderRadius: moderateScale(50),
      padding: moderateScale(20),
    },
    disabledButton: {
      opacity: 0.6,
    },
  });

export default RegisterBusinessFirstStep;
