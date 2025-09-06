import React, { useMemo, memo, useCallback, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  useWindowDimensions,
  I18nManager,
  Alert,
  TouchableWithoutFeedback,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useTheme, Text } from 'react-native-paper';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
import { useTranslation } from 'react-i18next';
import { ThemeColors } from '../../types/theme';
import { Business } from '../../types/business';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import Hamburger, {
  HamburgerHandle,
} from '../../components/Animations/Hamburger';
import MyBusinessCard from '../../components/Cards/MyBusinessCard';
import { useMyBusinessViewModel } from '../../viewModels/MyBusinessViewModel';

// Navigation type for MyBusinessScreen
type MyBusinessScreenNavigationProp =
  NativeStackNavigationProp<RootStackParamList>;

// Icons
import AddIconSvg from '../../assets/icons/ic_add.svg';

// Icon component
const AddIcon = ({ color }: { color?: string }) => (
  <AddIconSvg
    width={moderateScale(30)}
    height={moderateScale(30)}
    stroke={color || 'black'}
  />
);

const MyBusinessScreen: React.FC = memo(() => {
  const { width, height } = useWindowDimensions();
  const { colors }: { colors: ThemeColors } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation<MyBusinessScreenNavigationProp>();
  const styles = useMemo(
    () => createStyles(width, height, colors),
    [width, height, colors],
  );

  // ViewModel
  const {
    businesses,
    loading,
    loadingMore,
    error,
    loadMore,
    refresh,
    deleteBusiness,
  } = useMyBusinessViewModel();

  // State to track current image index for each business
  const [currentImageIndices, setCurrentImageIndices] = useState<
    Record<string, number>
  >({});

  // Hamburger animation handlers
  const hamburgerRef = useRef<HamburgerHandle>(null);
  const onMenuStartComplete = () => {
    // @ts-ignore
    navigation.openDrawer();
    hamburgerRef.current?.end();
  };
  const handleMenuPress = () => {
    hamburgerRef.current?.start();
  };

  const handleEditBusiness = useCallback(
    (businessId: string) => {
      // Navigate to edit business screen - you can implement this later
      Alert.alert(
        t('edit_business', { defaultValue: 'Edit Business' }),
        t('edit_business_coming_soon', {
          defaultValue: 'Edit business functionality coming soon!',
        }),
        [
          {
            text: t('ok', { defaultValue: 'OK' }),
            style: 'default',
          },
        ],
      );

      console.log('Edit business:', businessId);
      // TODO: Implement navigation to edit screen
      // navigation.navigate('EditBusinessNavigation', { businessId });
    },
    [t],
  );

  const handleDeleteBusiness = useCallback(
    async (businessId: string, businessName: string) => {
      Alert.alert(
        t('delete_business', { defaultValue: 'Delete Business' }),
        t('delete_business_confirmation', {
          businessName,
          defaultValue: `Are you sure you want to delete ${businessName}? This action cannot be undone.`,
        }),
        [
          { text: t('cancel', { defaultValue: 'Cancel' }), style: 'cancel' },
          {
            text: t('delete', { defaultValue: 'Delete' }),
            style: 'destructive',
            onPress: async () => {
              try {
                await deleteBusiness(businessId);
                // The ViewModel should handle refreshing the list
              } catch (deleteError: any) {
                Alert.alert(
                  t('error', { defaultValue: 'Error' }),
                  deleteError.message ||
                    t('failed_to_delete_business', {
                      defaultValue:
                        'Failed to delete business. Please try again.',
                    }),
                );
              }
            },
          },
        ],
      );
    },
    [t, deleteBusiness],
  );

  const handleAddBusiness = useCallback(() => {
    // Navigate to RegisterBusinessNavigation
    navigation.navigate('RegisterBusinessNavigation');
  }, [navigation]);

  // Image slider handlers
  const handleImageScroll = useCallback(
    (event: any, businessId: string, imageCount: number) => {
      const scrollX = event.nativeEvent.contentOffset.x;
      const imageWidth = moderateScale(90); // Adjust based on your slider implementation
      const currentIndex = Math.round(scrollX / imageWidth);
      const clampedIndex = Math.max(0, Math.min(currentIndex, imageCount - 1));

      setCurrentImageIndices(prev => ({
        ...prev,
        [businessId]: clampedIndex,
      }));
    },
    [],
  );

  const handleImageIndexChange = useCallback(
    (businessId: string, index: number) => {
      setCurrentImageIndices(prev => ({
        ...prev,
        [businessId]: index,
      }));
    },
    [],
  );

  const handleScroll = useCallback(
    ({ nativeEvent }: any) => {
      if (loadingMore || loading) return;

      const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
      const paddingToBottom = 20;

      if (
        layoutMeasurement.height + contentOffset.y >=
        contentSize.height - paddingToBottom
      ) {
        loadMore();
      }
    },
    [loadMore, loading, loadingMore],
  );

  return (
    <View style={styles.container}>
      {/* Header with animated hamburger */}
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

      {/* Error */}
      {!!error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={refresh} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>
              {t('retry', { defaultValue: 'Retry' })}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        refreshControl={
          <RefreshControl
            refreshing={loading && businesses.length > 0}
            onRefresh={refresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        onScroll={handleScroll}
        scrollEventThrottle={400}
        showsVerticalScrollIndicator={false}
      >
        {loading && businesses.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>
              {t('loading_businesses', {
                defaultValue: 'Loading your businesses...',
              })}
            </Text>
          </View>
        ) : businesses.length === 0 && !loading ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {t('no_business_registered', {
                defaultValue: 'No businesses registered',
              })}
            </Text>
            <Text style={styles.emptySubtext}>
              {t('add_your_first_business', {
                defaultValue:
                  'Tap the + button to register your first business',
              })}
            </Text>
          </View>
        ) : (
          <View style={styles.businessContainer}>
            {businesses.map(business => (
              <MyBusinessCard
                key={business._id}
                business={business}
                currentImageIndex={currentImageIndices[business._id] || 0}
                onEditBusiness={handleEditBusiness}
                onDeleteBusiness={handleDeleteBusiness}
                onImageIndexChange={handleImageIndexChange}
                onImageScroll={handleImageScroll}
              />
            ))}
          </View>
        )}

        {loadingMore && (
          <View style={styles.loadingMoreContainer}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={styles.loadingMoreText}>
              {t('loading_more', { defaultValue: 'Loading more...' })}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={handleAddBusiness}>
        <AddIcon color={colors.buttonTextColor} />
      </TouchableOpacity>
    </View>
  );
});

const createStyles = (width: number, height: number, colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: scale(16),
      paddingTop: verticalScale(50),
      backgroundColor: colors.surface,
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 2,
    },
    spacer: {
      flex: 1,
    },
    menuButton: {
      padding: moderateScale(8),
    },
    scrollView: {
      flex: 1,
    },
    scrollViewContent: {
      paddingHorizontal: scale(16),
      paddingTop: verticalScale(16),
      paddingBottom: verticalScale(100), // Space for FAB
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingTop: verticalScale(100),
    },
    loadingText: {
      marginTop: verticalScale(16),
      fontSize: moderateScale(16),
      color: colors.onSurfaceVariant,
      textAlign: 'center',
    },
    loadingMoreContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: verticalScale(20),
    },
    loadingMoreText: {
      marginLeft: scale(8),
      fontSize: moderateScale(14),
      color: colors.onSurfaceVariant,
    },
    errorContainer: {
      backgroundColor: colors.errorContainer,
      marginHorizontal: scale(16),
      marginVertical: verticalScale(8),
      padding: scale(12),
      borderRadius: moderateScale(8),
      alignItems: 'center',
    },
    errorText: {
      color: colors.error,
      textAlign: 'center',
      fontSize: moderateScale(14),
      marginBottom: verticalScale(8),
    },
    retryButton: {
      backgroundColor: colors.error,
      paddingHorizontal: scale(16),
      paddingVertical: verticalScale(6),
      borderRadius: moderateScale(6),
    },
    retryButtonText: {
      color: colors.onError,
      fontSize: moderateScale(12),
      fontWeight: '600',
    },
    businessContainer: {
      flex: 1,
      alignItems: 'center',
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingTop: verticalScale(100),
      paddingHorizontal: scale(32),
    },
    emptyText: {
      fontSize: moderateScale(20),
      fontWeight: '600',
      color: colors.onSurfaceVariant,
      textAlign: 'center',
      marginBottom: verticalScale(12),
    },
    emptySubtext: {
      fontSize: moderateScale(16),
      color: colors.onSurfaceVariant,
      textAlign: 'center',
      lineHeight: verticalScale(24),
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
      shadowOffset: {
        width: 0,
        height: 3,
      },
      shadowOpacity: 0.27,
      shadowRadius: 4.65,
    },
  });

// Set display name for debugging
MyBusinessScreen.displayName = 'MyBusinessScreen';

export default MyBusinessScreen;
