import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  View,
  Image,
  useWindowDimensions,
  StyleSheet,
  Pressable,
  TouchableOpacity,
  I18nManager,
  KeyboardAvoidingView,
} from 'react-native';
import {
  Text,
  useTheme,
  ActivityIndicator,
  type MD3Theme,
} from 'react-native-paper';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
import { useTranslation } from 'react-i18next';
import { type NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/AuthNavigation';
import MailIconSvg from '../../assets/icons/ic_mail.svg';
import NextIconSvg from '../../assets/icons/ic_next.svg';
import { type ThemeColors } from '../../types/theme';

// Custom components & hooks
import CustomInputText from '../../components/UI/CustomInputText';
import CustomBackButton from '../../components/UI/CustomBackButton';
import AlertModal from '../../components/Modals/AlertModal';
import { useForgotPassword } from '../../hooks/useAuth';

/* -------------------------------------------------------------------------- */
/*                              helper components                             */
/* -------------------------------------------------------------------------- */

const MailIcon = ({ color }: { color?: string }) => (
  <MailIconSvg
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

/* -------------------------------------------------------------------------- */

export type ForgotPasswordScreenProps = NativeStackScreenProps<
  AuthStackParamList,
  'ForgotPassword'
>;

const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({
  navigation,
}) => {
  /* ------------------------------ hooks / utils ------------------------------ */
  const { width } = useWindowDimensions();
  const { t } = useTranslation();
  const {
    colors,
  }: {
    colors: ThemeColors & MD3Theme['colors'];
  } = useTheme();

  const styles = useMemo(() => createStyles(width, colors), [width, colors]);

  /* ------------------------------- local state ------------------------------- */
  const [email, setEmail] = useState('');
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

  /* --------------------------- zustand-based hook ---------------------------- */
  const {
    sendResetEmail,
    isLoading,
    error,
    isSuccess,
    clearError,
    clearSuccess,
  } = useForgotPassword();

  /* -------------------------- helpers: modal presets ------------------------- */
  const showModal = useCallback(
    (
      type: 'error' | 'success' | 'alert' | 'info',
      title: string,
      message: string,
      extraButtons: typeof modalButtons = [],
    ) => {
      setModalTitle(title);
      setModalMessage(message);
      setModalIcon(type);
      setModalButtons(extraButtons);
      setModalVisible(true);
    },
    [],
  );

  const showErrorModal = useCallback(
    (message: string) => {
      clearError();
      showModal('error', t('error'), message, [
        {
          text: t('ok'),
          onPress: () => {
            clearError();
            setModalVisible(false);
          },
        },
      ]);
    },
    [clearError, showModal, t],
  );

  const showSuccessModal = useCallback(
    (message: string) => {
      showModal('success', t('success'), message, [
        {
          text: t('ok'),
          onPress: () => {
            clearSuccess();
            setModalVisible(false);
            navigation.goBack();
          },
        },
      ]);
    },
    [clearSuccess, navigation, showModal, t],
  );

  const showValidationError = useCallback(
    (message: string) => {
      showModal('alert', t('error'), message, [
        {
          text: t('ok'),
          onPress: () => setModalVisible(false),
        },
      ]);
    },
    [showModal, t],
  );

  useEffect(() => {
    if (error) showErrorModal(error);
  }, [error, showErrorModal, clearError]);

  useEffect(() => {
    if (!isSuccess) return;
    showSuccessModal(t('password_reset_email_sent'));
    clearSuccess();
  }, [isSuccess, showSuccessModal, t, clearSuccess]);

  const validateEmail = (value: string): boolean => {
    if (!value.trim()) {
      showValidationError(t('email_required'));
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value.trim())) {
      showValidationError(t('invalid_email'));
      return false;
    }
    return true;
  };

  const handleSendResetEmail = async () => {
    if (!validateEmail(email)) return;
    await sendResetEmail(email.trim().toLowerCase());
  };
  return (
    <KeyboardAvoidingView
      style={styles.keyboardContainer}
      behavior={'padding'}
      keyboardVerticalOffset={verticalScale(80)} // adjust as needed
    >
      {/* back button */}
      <View style={styles.backButton}>
        <CustomBackButton />
      </View>

      <View style={styles.content}>
        <Image
          source={require('../../assets/icons/ic_forget_password.png')}
          style={styles.topIcon}
        />

        <View style={styles.card}>
          <Text style={styles.title}>{t('forgot_password')}</Text>
          <Text style={styles.subtitle}>
            {t('enter_email_to_reset_password')}
          </Text>

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

          {/* success hint */}
          {!error && email ? (
            <View style={styles.hintContainer}>
              <Text style={styles.hintText}>
                💡 {t('reset_email_will_be_sent_to')} {email}
              </Text>
            </View>
          ) : null}

          <View style={styles.buttonContainer}>
            <Pressable
              style={[styles.customButton, isLoading && styles.disabledButton]}
              onPress={handleSendResetEmail}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator
                  size="small"
                  color={colors.buttonTextColor}
                />
              ) : (
                <NextIcon color={colors.buttonTextColor} />
              )}
            </Pressable>
          </View>

          <TouchableOpacity
            onPress={navigation.goBack}
            style={styles.footerContainer}
            disabled={isLoading}
          >
            <Text style={styles.footerText}>{t('back_to_login')}</Text>
          </TouchableOpacity>
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
    </KeyboardAvoidingView>
  );
};

const createStyles = (width: number, colors: ThemeColors) =>
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
      paddingTop: verticalScale(40),
    },
    topIcon: {
      width: moderateScale(120),
      height: moderateScale(120),
      marginBottom: verticalScale(20),
      resizeMode: 'contain',
    },
    card: {
      width: '90%',
      paddingHorizontal: scale(20),
      paddingVertical: verticalScale(24),
      backgroundColor: colors.surface,
      borderRadius: moderateScale(12),
      alignItems: 'center',
    },
    title: {
      fontSize: moderateScale(28),
      fontWeight: 'bold',
      color: colors.primary,
      marginBottom: verticalScale(8),
      textAlign: 'center',
    },
    subtitle: {
      fontSize: moderateScale(16),
      color: colors.onSurfaceVariant,
      textAlign: 'center',
      marginBottom: verticalScale(32),
      paddingHorizontal: scale(16),
      lineHeight: moderateScale(22),
    },
    label: {
      alignSelf: 'flex-start',
      fontSize: moderateScale(18),
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
      width: '100%',
    },
    inputIconContainer: {
      width: moderateScale(20),
      height: moderateScale(20),
      marginLeft: scale(12),
      marginRight: scale(8),
      justifyContent: 'center',
      alignItems: 'center',
    },
    hintContainer: {
      backgroundColor: colors.primaryContainer,
      borderRadius: moderateScale(8),
      paddingHorizontal: scale(16),
      paddingVertical: verticalScale(12),
      marginBottom: verticalScale(16),
      width: '100%',
    },
    hintText: {
      color: colors.onPrimaryContainer,
      fontSize: moderateScale(13),
      textAlign: 'center',
      lineHeight: moderateScale(18),
    },
    buttonContainer: {
      alignItems: 'center',
      marginTop: verticalScale(16),
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
      marginTop: verticalScale(32),
    },
    footerText: {
      color: colors.primary,
      fontSize: moderateScale(16),
    },
  });

export default ForgotPasswordScreen;
