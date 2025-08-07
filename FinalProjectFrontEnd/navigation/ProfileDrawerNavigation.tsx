// navigation/ProfileDrawerNavigation.tsx
import React from 'react';
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItem,
  DrawerContentComponentProps,
} from '@react-navigation/drawer';
import { View, StyleSheet, I18nManager, ActivityIndicator } from 'react-native';
import { useTheme, Avatar, Text, Divider } from 'react-native-paper';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
import { useTranslation } from 'react-i18next';
import { ThemeColors } from '../types/theme';

// screens
import ProfileScreen from '../screens/Profile/ProfileScreen';
import MyPetsScreen from '../screens/Profile/MyPetsScreen';
import MyBusinessScreen from '../screens/Profile/MyBusinessScreen';

// viewModel
import { useProfileViewModel } from '../viewModels/ProfileViewModel';

// icons
import ProfileIconSvg from '../assets/icons/ic_profile.svg';
import PetIconSvg from '../assets/icons/ic_pet.svg';
import BusinessIconSvg from '../assets/icons/ic_business.svg';

export type ProfileDrawerParamList = {
  MyProfile: undefined;
  MyPets: undefined;
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

  // pull user from VM
  const { user, loading } = useProfileViewModel();

  // avatar or loading spinner
  const avatar = loading ? (
    <ActivityIndicator size="small" color={colors.primary} />
  ) : (
    <Avatar.Image
      size={moderateScale(60)}
      source={{
        uri: user?.profileImage || undefined,
      }}
      style={styles.avatar}
    />
  );

  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={[
        styles.container,
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
      <Drawer.Screen name="MyBusiness" component={MyBusinessScreen} />
    </Drawer.Navigator>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  profileHeader: {
    padding: scale(20),
    paddingTop: verticalScale(50),
    alignItems: 'center',
  },
  avatar: { marginBottom: verticalScale(12) },
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
});

export default ProfileDrawerNavigation;
