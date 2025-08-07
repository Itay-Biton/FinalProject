// screens/auth/LoginScreen.tsx

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  View,
  Image,
  useWindowDimensions,
  StyleSheet,
  Pressable,
} from 'react-native';
import { useTheme, Text, ActivityIndicator } from 'react-native-paper';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
import { useTranslation } from 'react-i18next';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/AuthNavigation';
import MailIconSvg from '../../assets/icons/ic_mail.svg';
import PawPrintIconSvg from '../../assets/icons/ic_pawprint.svg';
import LockIconSvg from '../../assets/icons/ic_lock.svg';
import { ThemeColors } from '../../types/theme';

// Custom components & hooks
import CustomInputText from '../../components/UI/CustomInputText';
import AlertModal from '../../components/Modals/AlertModal';
import { useLogin } from '../../hooks/useAuth';
import { useIsAuthenticated } from '../../stores/AuthStore';

// Import KeyboardAvoidingView from the keyboard-controller lib
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';

type LoginScreenProps = NativeStackScreenProps<AuthStackParamList, 'Login'>;

const MailIcon = ({ color }: { color?: string }) => (
  <MailIconSvg
    width={moderateScale(20)}
    height={moderateScale(20)}
    stroke={color}
  />
);
const LockIcon = ({ color }: { color?: string }) => (
  <LockIconSvg
    width={moderateScale(20)}
    height={moderateScale(20)}
    stroke={color}
  />
);
const PawPrintIcon = ({ color }: { color?: string }) => (
  <PawPrintIconSvg
    width={moderateScale(40)}
    height={moderateScale(40)}
    stroke={color}
  />
);

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const { width, height } = useWindowDimensions();
  const { colors } = useTheme<{ colors: ThemeColors }>();
  const { t } = useTranslation();
  const styles = useMemo(
    () => createStyles(width, height, colors),
    [width, height, colors],
  );

  // form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [modalIcon, setModalIcon] = useState<'alert' | 'error'>('alert');
  const [modalButtons, setModalButtons] = useState<
    Array<{ text: string; onPress?: () => void; style?: 'default' }>
  >([]);

  // auth hooks
  const { login, isLoading, error, clearError } = useLogin();
  const isAuthenticated = useIsAuthenticated();

  // handle navigation on success
  useEffect(() => {
    if (isAuthenticated) {
      // AppNavigator will take over
    }
  }, [isAuthenticated]);

  // clear error on input change
  useEffect(() => {
    if (error && (email || password)) clearError();
  }, [email, password, error, clearError]);

  const showErrorModal = useCallback(
    (title: string, message: string) => {
      setModalTitle(title);
      setModalMessage(message);
      setModalIcon('error');
      setModalButtons([
        {
          text: t('ok'),
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

  const validateForm = () => {
    if (!email.trim()) return showErrorModal(t('error'), t('email_required'));
    if (!password.trim())
      return showErrorModal(t('error'), t('password_required'));
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim()))
      return showErrorModal(t('error'), t('invalid_email'));
    return true;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;
    await login({
      email: email.trim().toLowerCase(),
      password: password.trim(),
    });
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardContainer}
      behavior={'padding'}
      keyboardVerticalOffset={verticalScale(80)} // adjust as needed
    >
      <View style={styles.container}>
        <Image
          source={require('../../assets/icons/ic_login.png')}
          style={styles.logo}
        />

        <View style={styles.card}>
          <Text style={styles.label}>{t('email')}</Text>
          <CustomInputText
            placeholder={t('enter_your_email')}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            leftIcon={MailIcon}
            containerStyle={styles.inputFieldContainer}
            enabled={!isLoading}
          />

          <Text style={styles.label}>{t('password')}</Text>
          <CustomInputText
            placeholder={t('enter_your_password')}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="current-password"
            leftIcon={LockIcon}
            containerStyle={styles.inputFieldContainer}
            enabled={!isLoading}
          />

          <View style={styles.buttonContainer}>
            <Pressable
              style={[styles.customButton, isLoading && styles.disabledButton]}
              onPress={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator
                  size="small"
                  color={colors.buttonTextColor}
                />
              ) : (
                <PawPrintIcon color={colors.buttonTextColor} />
              )}
            </Pressable>
          </View>

          <View style={styles.footerContainer}>
            <Pressable
              onPress={() => navigation.navigate('ForgotPassword')}
              disabled={isLoading}
            >
              <Text style={styles.footerText}>{t('forgot_password')}</Text>
            </Pressable>
            <Pressable
              onPress={() => navigation.navigate('Register')}
              disabled={isLoading}
            >
              <Text style={styles.footerText}>{t('register')}</Text>
            </Pressable>
          </View>
        </View>

        <AlertModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          title={modalTitle}
          message={modalMessage}
          buttons={modalButtons}
          icon={modalIcon}
        />
      </View>
    </KeyboardAvoidingView>
  );
};

const createStyles = (width: number, height: number, colors: ThemeColors) =>
  StyleSheet.create({
    keyboardContainer: {
      backgroundColor: colors.background,
      flex: 1,
    },
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.background,
      padding: moderateScale(16),
    },
    logo: {
      width: moderateScale(200),
      height: moderateScale(200),
      resizeMode: 'contain',
      marginBottom: verticalScale(16),
    },
    card: {
      width: '100%',
      backgroundColor: colors.surface,
      borderRadius: moderateScale(8),
      padding: scale(16),
    },
    label: {
      fontSize: moderateScale(16),
      fontWeight: '500',
      color: colors.primary,
      marginBottom: verticalScale(8),
    },
    inputFieldContainer: {
      marginBottom: verticalScale(16),
    },
    buttonContainer: {
      alignItems: 'center',
      marginTop: verticalScale(8),
    },
    customButton: {
      backgroundColor: colors.buttonColor,
      borderRadius: moderateScale(50),
      padding: moderateScale(16),
    },
    disabledButton: {
      opacity: 0.6,
    },
    footerContainer: {
      marginTop: verticalScale(16),
      alignItems: 'center',
    },
    footerText: {
      color: colors.primary,
      fontSize: moderateScale(14),
      marginVertical: verticalScale(4),
    },
  });

export default LoginScreen;
