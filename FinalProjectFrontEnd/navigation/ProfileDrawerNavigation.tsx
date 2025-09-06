// navigation/ProfileDrawerNavigation.tsx
import React, { useState } from 'react';
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItem,
  DrawerContentComponentProps,
} from '@react-navigation/drawer';
import {
  View,
  StyleSheet,
  I18nManager,
  ActivityIndicator,
  Pressable,
  TouchableOpacity,
} from 'react-native';
import { useTheme, Avatar, Text, Divider } from 'react-native-paper';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
import { useTranslation } from 'react-i18next';
import { ThemeColors } from '../types/theme';

// screens
import ProfileScreen from '../screens/Profile/ProfileScreen';
import MyPetsScreen from '../screens/Profile/MyPetsScreen';
import MyMatchesScreen from '../screens/Profile/MyMatchesScreen';
import MyBusinessScreen from '../screens/Profile/MyBusinessScreen';

// viewModel
import { useProfileViewModel } from '../viewModels/ProfileViewModel';

// icons
import ProfileIconSvg from '../assets/icons/ic_profile.svg';
import PetIconSvg from '../assets/icons/ic_pet.svg';
import BusinessIconSvg from '../assets/icons/ic_business.svg';

// ⬇️ logout icon(s) like your other SVGs
import LogoutIconSvg from '../assets/icons/ic_logout.svg';
import LogoutIconRtlSvg from '../assets/icons/ic_logout_rtl.svg';

// ⬇️ your animated Alert modal
import AlertModal from '../components/Modals/AlertModal';

// auth
import { useLogout } from '../hooks/useAuth';

export type ProfileDrawerParamList = {
  MyProfile: undefined;
  MyPets: undefined;
  MyMatches: undefined;
  MyBusiness: undefined;
};

const Drawer = createDrawerNavigator<ProfileDrawerParamList>();

// icon renderers
const renderProfileIcon = ({
  color,
  size,
}: {
  color: string;
  size: number;
}) => <ProfileIconSvg width={size} height={size} stroke={color} />;
const renderPetIcon = ({ color, size }: { color: string; size: number }) => (
  <PetIconSvg width={size} height={size} stroke={color} />
);
const renderBusinessIcon = ({
  color,
  size,
}: {
  color: string;
  size: number;
}) => <BusinessIconSvg width={size} height={size} stroke={color} />;

function CustomDrawerContent(props: DrawerContentComponentProps) {
  const { colors }: { colors: ThemeColors } = useTheme();
  const { t } = useTranslation();
  const { state, navigation } = props;
  const activeRoute = state.routes[state.index].name;

  const { user, loading } = useProfileViewModel();
  const { logout, isLoading: isLoggingOut } = useLogout();

  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const avatar = loading ? (
    <ActivityIndicator size="small" color={colors.primary} />
  ) : (
    <Avatar.Image
      size={moderateScale(60)}
      source={{ uri: user?.profileImage || undefined }}
      style={styles.avatar}
    />
  );

  // RTL-aware icon choice
  const LogoutIcon = I18nManager.isRTL ? LogoutIconSvg : LogoutIconRtlSvg;

  // Labels with i18n (fallbacks if keys missing)
  const lblLogout = t('logout', {
    defaultValue: I18nManager.isRTL ? 'התנתק' : 'Logout',
  });
  const ttlConfirm = t('confirm_logout_title', {
    defaultValue: I18nManager.isRTL ? 'התנתקות' : 'Logout',
  });
  const msgConfirm = t('confirm_logout_message', {
    defaultValue: I18nManager.isRTL
      ? 'האם להתנתק מהחשבון?'
      : 'Are you sure you want to logout?',
  });
  const btnCancel = t('cancel', {
    defaultValue: I18nManager.isRTL ? 'ביטול' : 'Cancel',
  });
  const btnOk = t('ok', { defaultValue: I18nManager.isRTL ? 'אישור' : 'OK' });

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <DrawerContentScrollView
        {...props}
        contentContainerStyle={[
          styles.scrollContent,
          { backgroundColor: colors.surface },
        ]}
      >
        <View
          style={[styles.profileHeader, { backgroundColor: colors.background }]}
        >
          {avatar}

          {loading ? (
            <ActivityIndicator
              size="small"
              color={colors.primary}
              style={{ marginTop: verticalScale(8) }}
            />
          ) : (
            <>
              <Text style={[styles.userName, { color: colors.primary }]}>
                {user
                  ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
                  : t('loading')}
              </Text>
              <Text style={[styles.userEmail, { color: colors.primary }]}>
                {user?.email || t('loading')}
              </Text>
            </>
          )}
        </View>

        <Divider style={{ backgroundColor: colors.outline }} />

        <View style={styles.itemsContainer}>
          <DrawerItem
            label={t('my_profile')}
            focused={activeRoute === 'MyProfile'}
            onPress={() => navigation.navigate('MyProfile')}
            icon={renderProfileIcon}
            labelStyle={[
              styles.drawerLabel,
              {
                color:
                  activeRoute === 'MyProfile'
                    ? colors.buttonTextColor
                    : colors.primary,
              },
            ]}
            style={[
              styles.drawerItem,
              activeRoute === 'MyProfile' && {
                backgroundColor: colors.buttonColor,
              },
            ]}
          />

          <DrawerItem
            label={t('my_pets')}
            focused={activeRoute === 'MyPets'}
            onPress={() => navigation.navigate('MyPets')}
            icon={renderPetIcon}
            labelStyle={[
              styles.drawerLabel,
              {
                color:
                  activeRoute === 'MyPets'
                    ? colors.buttonTextColor
                    : colors.primary,
              },
            ]}
            style={[
              styles.drawerItem,
              activeRoute === 'MyPets' && {
                backgroundColor: colors.buttonColor,
              },
            ]}
          />

          <DrawerItem
            label={t('my_matches')}
            focused={activeRoute === 'MyMatches'}
            onPress={() => navigation.navigate('MyMatches')}
            icon={renderPetIcon}
            labelStyle={[
              styles.drawerLabel,
              {
                color:
                  activeRoute === 'MyMatches'
                    ? colors.buttonTextColor
                    : colors.primary,
              },
            ]}
            style={[
              styles.drawerItem,
              activeRoute === 'MyMatches' && {
                backgroundColor: colors.buttonColor,
              },
            ]}
          />

          <DrawerItem
            label={t('my_business')}
            focused={activeRoute === 'MyBusiness'}
            onPress={() => navigation.navigate('MyBusiness')}
            icon={renderBusinessIcon}
            labelStyle={[
              styles.drawerLabel,
              {
                color:
                  activeRoute === 'MyBusiness'
                    ? colors.buttonTextColor
                    : colors.primary,
              },
            ]}
            style={[
              styles.drawerItem,
              activeRoute === 'MyBusiness' && {
                backgroundColor: colors.buttonColor,
              },
            ]}
          />
        </View>
      </DrawerContentScrollView>

      {/* Footer: Logout row pinned to bottom */}
      <View
        style={[
          styles.footer,
          {
            borderTopColor: colors.outline + '30',
            backgroundColor: colors.surface,
          },
        ]}
      >
        <TouchableOpacity
          style={styles.logoutRow}
          onPress={() => setShowLogoutModal(true)}
          disabled={isLoggingOut}
          accessibilityRole="button"
          accessibilityLabel={lblLogout}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <LogoutIcon
            width={moderateScale(22)}
            height={moderateScale(22)}
            stroke={colors.primary}
          />
          <Text style={[styles.logoutText, { color: colors.primary }]}>
            {lblLogout}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Confirm modal */}
      <AlertModal
        visible={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        title={ttlConfirm}
        message={msgConfirm}
        icon="alert"
        buttons={[
          { text: btnCancel, style: 'cancel' },
          {
            text: btnOk,
            style: 'destructive',
            onPress: () => logout(),
          },
        ]}
      />
    </View>
  );
}

const ProfileDrawerNavigation: React.FC = () => {
  const { colors }: { colors: ThemeColors } = useTheme();

  return (
    <Drawer.Navigator
      drawerContent={CustomDrawerContent}
      defaultStatus="closed"
      screenOptions={{
        swipeEnabled: false,
        swipeEdgeWidth: 0,
        headerShown: false,
        drawerPosition: I18nManager.isRTL ? 'right' : 'left',
        drawerType: 'slide',
        drawerStyle: {
          backgroundColor: colors.surface,
          width: moderateScale(280),
        },
        overlayColor: 'rgba(0,0,0,0.5)',
      }}
      initialRouteName="MyProfile"
    >
      <Drawer.Screen name="MyProfile" component={ProfileScreen} />
      <Drawer.Screen name="MyPets" component={MyPetsScreen} />
      <Drawer.Screen name="MyMatches" component={MyMatchesScreen} />
      <Drawer.Screen name="MyBusiness" component={MyBusinessScreen} />
    </Drawer.Navigator>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingBottom: verticalScale(8) },
  profileHeader: {
    padding: scale(20),
    paddingTop: verticalScale(50),
    alignItems: 'center',
  },
  avatar: {
    backgroundColor: 'none',
    marginBottom: verticalScale(12),
  },
  userName: {
    fontSize: moderateScale(18),
    fontWeight: '600',
    marginBottom: verticalScale(4),
    textAlign: 'center',
  },
  userEmail: {
    fontSize: moderateScale(14),
    marginBottom: verticalScale(8),
    textAlign: 'center',
  },
  itemsContainer: { marginTop: verticalScale(10) },
  drawerItem: {
    width: '90%',
    borderRadius: moderateScale(8),
    marginVertical: verticalScale(4),
    alignSelf: 'center',
  },
  drawerLabel: {
    fontSize: moderateScale(14),
    textAlign: 'center',
  },
  footer: {
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(14),
  },
  logoutRow: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: scale(6),
  },
  logoutText: {
    fontSize: moderateScale(15),
    fontWeight: '600',
  },
});

export default ProfileDrawerNavigation;
