import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  View,
  Image,
  useWindowDimensions,
  StyleSheet,
  Pressable,
  I18nManager,
} from 'react-native';
import { useTheme, Text, ActivityIndicator } from 'react-native-paper';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
import { useTranslation } from 'react-i18next';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/AuthNavigation';
import MailIconSvg from '../../assets/icons/ic_mailplus.svg';
import LockIconSvg from '../../assets/icons/ic_lock.svg';
import UserIconSvg from '../../assets/icons/ic_userplus.svg';
import UsersIconSvg from '../../assets/icons/ic_users.svg';
import PhoneIconSvg from '../../assets/icons/ic_phone.svg';
import RegisterIconSvg from '../../assets/icons/ic_register.svg';
import { ThemeColors } from '../../types/theme';

// Import custom components, modal and Zustand-based hooks
import CustomInputText from '../../components/UI/CustomInputText';
import CustomBackButton from '../../components/UI/CustomBackButton';
import AlertModal from '../../components/Modals/AlertModal';
import { useRegister } from '../../hooks/useAuth';
import { useIsAuthenticated } from '../../stores/AuthStore';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';

const MailIcon = ({ color }: { color?: string }) => (
  <MailIconSvg
    width={moderateScale(20)}
    height={moderateScale(20)}
    stroke={color || 'black'}
  />
);

const LockIcon = ({ color }: { color?: string }) => (
  <LockIconSvg
    width={moderateScale(20)}
    height={moderateScale(20)}
    stroke={color || 'black'}
  />
);

const UserIcon = ({ color }: { color?: string }) => (
  <UserIconSvg
    width={moderateScale(20)}
    height={moderateScale(20)}
    stroke={color || 'black'}
  />
);

const UsersIcon = ({ color }: { color?: string }) => (
  <UsersIconSvg
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

const RegisterIcon = ({ color }: { color?: string }) => (
  <RegisterIconSvg
    width={moderateScale(40)}
    height={moderateScale(40)}
    fill={color || 'black'}
  />
);

type RegisterScreenProps = NativeStackScreenProps<
  AuthStackParamList,
  'Register'
>;

const RegisterScreen: React.FC<RegisterScreenProps> = ({ navigation }) => {
  const { width, height } = useWindowDimensions();
  const { colors }: { colors: ThemeColors } = useTheme();
  const styles = useMemo(
    () => createStyles(width, height, colors),
    [width, height, colors],
  );
  const { t } = useTranslation();

  // Form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [registrationCompleted, setRegistrationCompleted] = useState(false);

  // Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [modalIcon, setModalIcon] = useState<
    'alert' | 'success' | 'error' | 'info'
  >('alert');
  const [modalButtons, setModalButtons] = useState<
    Array<{
      text: string;
      onPress?: () => void;
      style?: 'default' | 'cancel' | 'destructive';
    }>
  >([]);

  // Use Zustand-based hooks
  const { register, isLoading, error, clearError } = useRegister();
  const isAuthenticated = useIsAuthenticated();

  // Auto-navigate when authenticated (optional - AppNavigator handles this too)
  useEffect(() => {
    if (isAuthenticated) {
      console.log(
        'User registered and authenticated, will navigate to main app',
      );
    }
  }, [isAuthenticated]);

  // Clear error when user starts typing
  useEffect(() => {
    if (error && (firstName || lastName || email || password || phoneNumber)) {
      clearError();
    }
  }, [firstName, lastName, email, password, phoneNumber, error, clearError]);

  const showErrorModal = useCallback(
    (title: string, message: string) => {
      setModalTitle(title);
      setModalMessage(message);
      setModalIcon('error');
      setModalButtons([
        {
          text: t('ok'),
          style: 'default',
          onPress: () => {
            setModalVisible(false);
            clearError();
          },
        },
      ]);
      setModalVisible(true);
    },
    [t, clearError],
  );

  const showSuccessModal = useCallback(
    (title: string, message: string, onSuccess?: () => void) => {
      setModalTitle(title);
      setModalMessage(message);
      setModalIcon('success');
      setModalButtons([
        {
          text: t('ok'),
          style: 'default',
          onPress: () => {
            setModalVisible(false);
            if (onSuccess) onSuccess();
          },
        },
      ]);
      setModalVisible(true);
    },
    [t],
  );

  const showValidationError = useCallback(
    (message: string) => {
      setModalTitle(t('error'));
      setModalMessage(message);
      setModalIcon('alert');
      setModalButtons([
        {
          text: t('ok'),
          style: 'default',
          onPress: () => setModalVisible(false),
        },
      ]);
      setModalVisible(true);
    },
    [t],
  );

  // Show error modal when there's an error from the hook
  useEffect(() => {
    if (error) {
      setRegistrationCompleted(false); // Reset flag on error
      showErrorModal(t('error'), error);
    }
  }, [error, t, showErrorModal]);

  // Show success modal when user successfully registers and gets authenticated
  useEffect(() => {
    if (isAuthenticated && !error && registrationCompleted) {
      showSuccessModal(t('success'), t('registration_successful'), () => {
        setRegistrationCompleted(false);
        navigation.goBack(); // <-- send them back to login
      });
    }
  }, [
    isAuthenticated,
    error,
    registrationCompleted,
    t,
    showSuccessModal,
    navigation, // make sure navigation is in the deps
  ]);

  const validateForm = (): boolean => {
    if (!firstName.trim()) {
      showValidationError(t('first_name_required'));
      return false;
    }
    if (!lastName.trim()) {
      showValidationError(t('last_name_required'));
      return false;
    }
    if (!email.trim()) {
      showValidationError(t('email_required'));
      return false;
    }
    if (!password.trim()) {
      showValidationError(t('password_required'));
      return false;
    }
    if (password.length < 6) {
      showValidationError(t('password_min_length'));
      return false;
    }
    if (!phoneNumber.trim()) {
      showValidationError(t('phone_required'));
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showValidationError(t('invalid_email'));
      return false;
    }

    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setRegistrationCompleted(false);

    await register({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim().toLowerCase(),
      password: password.trim(),
      phoneNumber: phoneNumber.trim(),
    });

    setRegistrationCompleted(true);

    // Success case will be handled by the useEffect that watches isAuthenticated
    // Error case is handled by the useEffect that watches error state
  };

  const handleLogin = () => {
    navigation.goBack();
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  return (
    <KeyboardAwareScrollView
      enabled={true} // turn it on/off
      bottomOffset={20} // distance from input to keyboard
      extraKeyboardSpace={10} // extra padding under inputs
      disableScrollOnKeyboardHide={false} // keep scroll position on keyboard hide
      style={styles.scrollView}
      contentContainerStyle={styles.scrollViewContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.container}>
        {/* Back button positioned at the top */}
        <View style={styles.backButton}>
          <CustomBackButton />
        </View>

        <View style={styles.content}>
          <Image
            source={require('../../assets/icons/ic_register.png')}
            style={styles.logo}
          />
          <View style={styles.card}>
            <Text style={styles.title}>{t('create_account')}</Text>
            <Text style={styles.subtitle}>{t('join_our_pet_community')}</Text>

            <Text style={styles.label}>{t('first_name')}</Text>
            <CustomInputText
              placeholder={t('enter_your_first_name')}
              value={firstName}
              onChangeText={setFirstName}
              autoCapitalize="words"
              autoComplete="given-name"
              autoCorrect={false}
              leftIcon={UserIcon}
              containerStyle={styles.inputFieldContainer}
              leftIconContainerStyle={styles.inputIconContainer}
              iconColor={colors.primary}
              enabled={!isLoading}
            />

            <Text style={styles.label}>{t('last_name')}</Text>
            <CustomInputText
              placeholder={t('enter_your_last_name')}
              value={lastName}
              onChangeText={setLastName}
              autoCapitalize="words"
              autoComplete="family-name"
              autoCorrect={false}
              leftIcon={UsersIcon}
              containerStyle={styles.inputFieldContainer}
              leftIconContainerStyle={styles.inputIconContainer}
              iconColor={colors.primary}
              enabled={!isLoading}
            />

            <Text style={styles.label}>{t('email')}</Text>
            <CustomInputText
              placeholder={t('enter_your_email')}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect={false}
              leftIcon={MailIcon}
              containerStyle={styles.inputFieldContainer}
              leftIconContainerStyle={styles.inputIconContainer}
              iconColor={colors.primary}
              enabled={!isLoading}
            />

            <Text style={styles.label}>{t('password')}</Text>
            <CustomInputText
              placeholder={t('enter_your_password')}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="new-password"
              autoCorrect={false}
              leftIcon={LockIcon}
              containerStyle={styles.inputFieldContainer}
              leftIconContainerStyle={styles.inputIconContainer}
              iconColor={colors.primary}
              enabled={!isLoading}
            />

            <Text style={styles.label}>{t('phone_number')}</Text>
            <CustomInputText
              placeholder={t('enter_your_phone_number')}
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
              autoComplete="tel"
              autoCorrect={false}
              leftIcon={PhoneIcon}
              containerStyle={styles.inputFieldContainer}
              leftIconContainerStyle={styles.inputIconContainer}
              iconColor={colors.primary}
              enabled={!isLoading}
            />

            <View style={styles.buttonContainer}>
              <Pressable
                style={[
                  styles.customButton,
                  isLoading && styles.disabledButton,
                ]}
                onPress={handleRegister}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator
                    size="small"
                    color={colors.buttonTextColor}
                  />
                ) : (
                  <RegisterIcon color={colors.buttonTextColor} />
                )}
              </Pressable>
            </View>

            <View style={styles.footerContainer}>
              <Pressable onPress={handleLogin} disabled={isLoading}>
                <Text style={styles.footerText}>
                  {t('already_have_account')}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>

        {/* Alert Modal */}
        <AlertModal
          visible={modalVisible}
          onClose={closeModal}
          title={modalTitle}
          message={modalMessage}
          buttons={modalButtons}
          icon={modalIcon}
        />
      </View>
    </KeyboardAwareScrollView>
  );
};

const createStyles = (width: number, height: number, colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    backButton: {
      position: 'absolute',
      top: verticalScale(15),
      left: I18nManager.isRTL ? undefined : scale(8),
      right: I18nManager.isRTL ? scale(8) : undefined,
      zIndex: 1,
    },
    content: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingTop: verticalScale(60),
      paddingBottom: verticalScale(20),
    },
    logo: {
      width: moderateScale(100),
      height: moderateScale(100),
      resizeMode: 'contain',
    },
    card: {
      width: '90%',
      paddingHorizontal: scale(16),
      paddingVertical: verticalScale(20),
      backgroundColor: colors.surface,
      borderRadius: moderateScale(12),
      marginTop: verticalScale(16),
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
    },
    title: {
      fontSize: moderateScale(28),
      fontWeight: 'bold',
      color: colors.primary,
      textAlign: 'center',
      marginBottom: verticalScale(8),
    },
    subtitle: {
      fontSize: moderateScale(16),
      color: colors.onSurfaceVariant,
      textAlign: 'center',
      marginBottom: verticalScale(24),
    },
    label: {
      fontSize: moderateScale(16),
      marginBottom: verticalScale(8),
      color: colors.primary,
      fontWeight: '500',
    },
    inputFieldContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: verticalScale(12),
      paddingHorizontal: scale(12),
      backgroundColor: colors.surface,
      borderRadius: moderateScale(8),
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
    buttonContainer: {
      alignItems: 'center',
      marginTop: verticalScale(8),
    },
    customButton: {
      backgroundColor: colors.buttonColor,
      borderRadius: moderateScale(50),
      padding: moderateScale(20),
      elevation: 2,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    disabledButton: {
      opacity: 0.6,
      elevation: 0,
      shadowOpacity: 0,
    },
    footerContainer: {
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: verticalScale(24),
    },
    footerText: {
      color: colors.primary,
      fontSize: moderateScale(16),
      marginBottom: verticalScale(10),
    },
    scrollView: {
      backgroundColor: colors.background,
    },
    scrollViewContent: {
      flexGrow: 1,
      minHeight: '100%',
    },
  });

export default RegisterScreen;
