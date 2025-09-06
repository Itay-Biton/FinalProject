// screens/Profile/ProfileScreen.tsx
import React, { useState, useMemo, memo, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  useWindowDimensions,
  TouchableOpacity,
  I18nManager,
  TouchableWithoutFeedback,
  ActivityIndicator,
} from 'react-native';
import { useTheme, Avatar, Text } from 'react-native-paper';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
import { useTranslation } from 'react-i18next';
import { ThemeColors } from '../../types/theme';
import { useNavigation } from '@react-navigation/native';
import CustomInputText from '../../components/UI/CustomInputText';
import Hamburger, {
  HamburgerHandle,
} from '../../components/Animations/Hamburger';
import { useProfileViewModel } from '../../viewModels/ProfileViewModel';

// Field icons
import UserIconSvg from '../../assets/icons/ic_userplus.svg';
import UsersIconSvg from '../../assets/icons/ic_users.svg';
import PhoneIconSvg from '../../assets/icons/ic_phone.svg';
// Action icons
import EditIconSvg from '../../assets/icons/ic_edit.svg';
import SaveIconSvg from '../../assets/icons/ic_save.svg';
import CancelIconSvg from '../../assets/icons/ic_cancel.svg';

const UserIcon = ({ color }: { color?: string }) => (
  <UserIconSvg
    width={moderateScale(20)}
    height={moderateScale(20)}
    stroke={color}
  />
);
const UsersIcon = ({ color }: { color?: string }) => (
  <UsersIconSvg
    width={moderateScale(20)}
    height={moderateScale(20)}
    stroke={color}
  />
);
const PhoneIcon = ({ color }: { color?: string }) => (
  <PhoneIconSvg
    width={moderateScale(20)}
    height={moderateScale(20)}
    stroke={color}
  />
);
const EditIcon = ({ color }: { color?: string }) => (
  <EditIconSvg
    width={moderateScale(24)}
    height={moderateScale(24)}
    stroke={color}
  />
);
const SaveIcon = ({ color }: { color?: string }) => (
  <SaveIconSvg
    width={moderateScale(24)}
    height={moderateScale(24)}
    stroke={color}
  />
);
const CancelIcon = ({ color }: { color?: string }) => (
  <CancelIconSvg
    width={moderateScale(24)}
    height={moderateScale(24)}
    stroke={color}
  />
);

const ProfileScreen: React.FC = () => {
  const { width } = useWindowDimensions();
  const { colors }: { colors: ThemeColors } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation();
  const styles = useMemo(() => createStyles(width, colors), [width, colors]);

  // Hamburger animation
  const hamburgerRef = useRef<HamburgerHandle>(null);
  const onMenuStartComplete = () => {
    // @ts-ignore
    navigation.openDrawer();
    hamburgerRef.current?.end();
  };
  const handleMenuPress = () => {
    hamburgerRef.current?.start();
  };

  // ViewModel
  const { user, loading, saving, error, updateProfile } = useProfileViewModel();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [isEditing, setEditing] = useState(false);

  // Populate form when user loads
  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
      setPhone(user.phoneNumber || '');
    }
  }, [user]);

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

      {/* Loading / Error */}
      {loading && (
        <ActivityIndicator
          style={styles.loadingIndicator}
          size="large"
          color={colors.primary}
        />
      )}
      {!!error && <Text style={styles.errorText}>{error}</Text>}

      <ScrollView
        contentContainerStyle={styles.form}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.avatarContainer}>
          <Avatar.Image
            size={moderateScale(120)}
            source={{
              uri:
                user?.profileImage ||
                'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face',
            }}
            style={styles.avatar}
          />
        </View>

        <CustomInputText
          placeholder={t('first_name')}
          value={firstName}
          onChangeText={setFirstName}
          enabled={isEditing}
          leftIcon={UserIcon}
          containerStyle={styles.input}
        />
        <CustomInputText
          placeholder={t('last_name')}
          value={lastName}
          onChangeText={setLastName}
          enabled={isEditing}
          leftIcon={UsersIcon}
          containerStyle={styles.input}
        />
        <CustomInputText
          placeholder={t('phone_number')}
          value={phone}
          onChangeText={setPhone}
          enabled={isEditing}
          leftIcon={PhoneIcon}
          containerStyle={styles.input}
          keyboardType="name-phone-pad"
        />

        {!isEditing ? (
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => setEditing(true)}
          >
            <EditIcon color={colors.buttonTextColor} />
          </TouchableOpacity>
        ) : (
          <View style={styles.actionRow}>
            <TouchableOpacity
              onPress={() => setEditing(false)}
              style={styles.cancelButton}
              disabled={saving}
            >
              <CancelIcon color={colors.buttonTextColor} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={async () => {
                const success = await updateProfile({
                  firstName,
                  lastName,
                  phoneNumber: phone,
                });
                if (success) setEditing(false);
              }}
              style={styles.saveButton}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator
                  size="small"
                  color={colors.buttonTextColor}
                />
              ) : (
                <SaveIcon color={colors.buttonTextColor} />
              )}
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const createStyles = (width: number, colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: scale(16),
      backgroundColor: colors.surface,
    },
    spacer: { flex: 1 },
    menuButton: { padding: moderateScale(8) },
    loadingIndicator: {
      marginVertical: verticalScale(16),
    },
    errorText: {
      color: colors.error,
      textAlign: 'center',
      marginVertical: verticalScale(8),
    },
    form: {
      padding: scale(16),
      paddingTop: verticalScale(24),
      alignItems: 'center',
    },
    avatarContainer: {
      alignItems: 'center',
      marginBottom: verticalScale(24),
    },
    avatar: {
      backgroundColor: colors.background,
    },
    input: {
      width: '100%',
      marginBottom: verticalScale(16),
    },
    editButton: {
      backgroundColor: colors.buttonColor,
      width: moderateScale(48),
      height: moderateScale(48),
      borderRadius: moderateScale(24),
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: verticalScale(24),
    },
    actionRow: {
      flexDirection: 'row',
      justifyContent: 'space-evenly',
      width: '60%',
      marginTop: verticalScale(24),
    },
    cancelButton: {
      backgroundColor: colors.buttonColor,
      width: moderateScale(48),
      height: moderateScale(48),
      borderRadius: moderateScale(24),
      justifyContent: 'center',
      alignItems: 'center',
    },
    saveButton: {
      backgroundColor: colors.buttonColor,
      width: moderateScale(48),
      height: moderateScale(48),
      borderRadius: moderateScale(24),
      justifyContent: 'center',
      alignItems: 'center',
    },
  });

export default memo(ProfileScreen);
