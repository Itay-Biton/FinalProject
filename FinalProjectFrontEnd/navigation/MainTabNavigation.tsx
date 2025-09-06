// navigation/MainTabNavigation.tsx
import React, { memo } from 'react';
import {
  createBottomTabNavigator,
  BottomTabBarProps,
} from '@react-navigation/bottom-tabs';
import { useTheme } from 'react-native-paper';
import { moderateScale } from 'react-native-size-matters';
import { useTranslation } from 'react-i18next';
import { View, SafeAreaView, StyleSheet } from 'react-native';
import { ThemeColors } from '../types/theme';
import TabIconAnimation from '../components/Animations/TabIconAnimation';

// Navigators / screens
import ProfileDrawerNavigation from './ProfileDrawerNavigation';
import PostScreen from '../screens/Main/PostScreen';
import SearchPetScreen from '../screens/Main/SearchPetScreen';
import SearchBusinessScreen from '../screens/Main/SearchBusinessScreen';
import PetActivityHistoryScreen from '../screens/Main/PetActivityHistoryScreen';

// 👇 add the Edit stack as a hidden tab target
import EditPetNavigation, { EditPetStackParamList } from './EditPetNavigation';
import { NavigatorScreenParams } from '@react-navigation/native';

// Icons
import ProfileIconSvg from '../assets/icons/ic_profile.svg';
import PostIconSvg from '../assets/icons/ic_help_lost.svg';
import SearchPetIconSvg from '../assets/icons/ic_pet.svg';
import SearchBusinessIconSvg from '../assets/icons/ic_business.svg';
import HistoryIconSvg from '../assets/icons/ic_history.svg';

export type MainTabParamList = {
  Profile: undefined;
  Post: undefined;
  SearchPet: undefined;
  SearchBusiness: undefined;
  History: undefined;

  // Hidden route used for programmatic navigation to the edit flow
  EditPetNavigation: NavigatorScreenParams<EditPetStackParamList>;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

const CustomTabBar: React.FC<BottomTabBarProps> = ({ state, navigation }) => {
  const { colors }: { colors: ThemeColors } = useTheme();

  // 🔒 Hide the entire bar when the hidden Edit flow is focused
  const active = state.routes[state.index]?.name;
  if (active === 'EditPetNavigation') return null;

  const tabData = [
    { key: 'Profile', icon: ProfileIconSvg, name: 'Profile' },
    { key: 'Post', icon: PostIconSvg, name: 'Post' },
    { key: 'SearchPet', icon: SearchPetIconSvg, name: 'SearchPet' },
    {
      key: 'SearchBusiness',
      icon: SearchBusinessIconSvg,
      name: 'SearchBusiness',
    },
    { key: 'History', icon: HistoryIconSvg, name: 'History' },
  ];

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.surface }]}
    >
      <View
        style={[
          styles.tabBarContainer,
          { backgroundColor: colors.surface, borderTopColor: colors.outline },
        ]}
      >
        {tabData.map((tab, index) => {
          // Important: we only render visible tabs; hidden tab is defined last so indices align
          const route = state.routes[index];
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name as any);
            }
          };

          return (
            <View key={tab.key} style={styles.tabItem}>
              <TabIconAnimation
                focused={isFocused}
                activeColor={colors.buttonColor ?? '#FFD700'}
                inactiveColor={colors.onSurfaceVariant ?? '#666666'}
                IconComponent={tab.icon}
                onPress={onPress}
              />
            </View>
          );
        })}
      </View>
    </SafeAreaView>
  );
};

// Define once so the reference is stable between renders
const renderCustomTabBar = (props: BottomTabBarProps) => (
  <CustomTabBar {...props} />
);

const EnhancedMainTabNavigation: React.FC = memo(() => {
  const { t } = useTranslation();

  return (
    <Tab.Navigator
      tabBar={renderCustomTabBar}
      screenOptions={{ headerShown: false }}
    >
      {/* Visible tabs */}
      <Tab.Screen
        name="Profile"
        component={ProfileDrawerNavigation}
        options={{ tabBarAccessibilityLabel: t('profile_accessibility') }}
      />
      <Tab.Screen
        name="Post"
        component={PostScreen}
        options={{ tabBarAccessibilityLabel: t('post_accessibility') }}
      />
      <Tab.Screen
        name="SearchPet"
        component={SearchPetScreen}
        options={{ tabBarAccessibilityLabel: t('search_pet_accessibility') }}
      />
      <Tab.Screen
        name="SearchBusiness"
        component={SearchBusinessScreen}
        options={{
          tabBarAccessibilityLabel: t('search_business_accessibility'),
        }}
      />
      <Tab.Screen
        name="History"
        component={PetActivityHistoryScreen}
        options={{ tabBarAccessibilityLabel: t('history_accessibility') }}
      />

      {/* Hidden tab: lets you navigate with `navigation.navigate('EditPetNavigation', { screen: 'EditPetFirstStep', params: { petId } })` */}
      <Tab.Screen
        name="EditPetNavigation"
        component={EditPetNavigation}
        options={{
          // Hidden from custom tab bar since we don't include it in tabData
          // If you ever switch back to the default bar, this keeps it hidden there too:
          tabBarButton: () => null,
        }}
      />
    </Tab.Navigator>
  );
});

const styles = StyleSheet.create({
  safeArea: {},
  tabBarContainer: {
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingBottom: moderateScale(8),
    paddingTop: moderateScale(12),
    height: moderateScale(65),
    elevation: 8,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: moderateScale(4),
  },
});

EnhancedMainTabNavigation.displayName = 'EnhancedMainTabNavigation';
export default EnhancedMainTabNavigation;
