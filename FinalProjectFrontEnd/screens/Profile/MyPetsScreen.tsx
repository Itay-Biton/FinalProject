// screens/Profile/MyPetsScreen.tsx
import React, { useMemo, memo, useRef, useCallback } from 'react';
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
import { Pet, MyPetEntry } from '../../types/pet';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator'; // Import the root stack types
import Hamburger, {
  HamburgerHandle,
} from '../../components/Animations/Hamburger';
import MyPetCard from '../../components/Cards/MyPetCard';
import { useMyPetsViewModel } from '../../viewModels/MyPetsViewModel';

// Navigation type for MyPetsScreen
type MyPetsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

// Icons
import AddIconSvg from '../../assets/icons/ic_add.svg';
const AddIcon = ({ color }: { color?: string }) => (
  <AddIconSvg
    width={moderateScale(30)}
    height={moderateScale(30)}
    stroke={color}
  />
);

const MyPetsScreen: React.FC = memo(() => {
  const { width, height } = useWindowDimensions();
  const { colors }: { colors: ThemeColors } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation<MyPetsScreenNavigationProp>();
  const styles = useMemo(
    () => createStyles(width, height, colors),
    [width, height, colors],
  );

  // Hamburger
  const hamburgerRef = useRef<HamburgerHandle>(null);
  const onMenuStartComplete = () => {
    // @ts-ignore
    navigation.openDrawer();
    hamburgerRef.current?.end();
  };
  const handleMenuPress = () => {
    hamburgerRef.current?.start();
  };

  // ViewModel - expecting it to return pets with the new Pet/MyPetEntry types
  const { pets, loading, loadingMore, error, loadMore, refresh, deletePet } =
    useMyPetsViewModel();

  // Helper to get pet ID (handle both _id and id)
  const getPetId = (pet: Pet | MyPetEntry): string => {
    return (pet as Pet)._id || (pet as MyPetEntry).id;
  };

  const handleDeletePet = useCallback(
    async (petId: string, petName: string) => {
      Alert.alert(
        t('delete_pet', { defaultValue: 'Delete Pet' }),
        t('delete_pet_confirmation', {
          petName,
          defaultValue: `Are you sure you want to delete ${petName}? This action cannot be undone.`,
        }),
        [
          { text: t('cancel', { defaultValue: 'Cancel' }), style: 'cancel' },
          {
            text: t('delete', { defaultValue: 'Delete' }),
            style: 'destructive',
            onPress: async () => {
              try {
                await deletePet(petId);
                // The ViewModel should handle refreshing the list
              } catch (errorX: any) {
                Alert.alert(
                  t('error', { defaultValue: 'Error' }),
                  errorX.message ||
                    t('failed_to_delete_pet', {
                      defaultValue: 'Failed to delete pet. Please try again.',
                    }),
                );
              }
            },
          },
        ],
      );
    },
    [t, deletePet],
  );

  const handleEditPet = useCallback((petId: string) => {
    // Navigate to edit pet screen
    console.log('x');
  }, []);

  const handleAddPet = useCallback(() => {
    // Navigate to RegisterPetNavigation
    navigation.navigate('RegisterPetNavigation');
  }, [navigation]);

  // Image slider index state
  const [currentImageIndices, setCurrentImageIndices] = React.useState<
    Record<string, number>
  >({});

  const handleImageScroll = useCallback((e: any, id: string, count: number) => {
    const scrollX = e.nativeEvent.contentOffset.x;
    const idx = Math.round(scrollX / moderateScale(90));
    setCurrentImageIndices(prev => ({
      ...prev,
      [id]: Math.min(Math.max(idx, 0), count - 1),
    }));
  }, []);

  const handleImageIndexChange = useCallback((id: string, idx: number) => {
    setCurrentImageIndices(prev => ({ ...prev, [id]: idx }));
  }, []);

  const handleScroll = useCallback(
    ({ nativeEvent }: any) => {
      if (loadingMore) return;

      const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
      const paddingToBottom = 20;

      if (
        layoutMeasurement.height + contentOffset.y >=
        contentSize.height - paddingToBottom
      ) {
        loadMore();
      }
    },
    [loadMore, loadingMore],
  );

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

      {/* List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        refreshControl={
          <RefreshControl
            refreshing={loading && pets.length > 0}
            onRefresh={refresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        onScroll={handleScroll}
        scrollEventThrottle={400}
        showsVerticalScrollIndicator={false}
      >
        {loading && pets.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>
              {t('loading_pets', { defaultValue: 'Loading your pets...' })}
            </Text>
          </View>
        ) : pets.length === 0 && !loading ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {t('no_pets_registered', { defaultValue: 'No pets registered' })}
            </Text>
            <Text style={styles.emptySubtext}>
              {t('register_your_first_pet', {
                defaultValue: 'Tap the + button to register your first pet',
              })}
            </Text>
          </View>
        ) : (
          pets.map(pet => {
            const petId = getPetId(pet);
            return (
              <MyPetCard
                key={petId}
                pet={pet}
                currentImageIndex={currentImageIndices[petId] || 0}
                onImageScroll={handleImageScroll}
                onImageIndexChange={handleImageIndexChange}
                onEditPet={handleEditPet}
                onDeletePet={handleDeletePet}
              />
            );
          })
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
      <TouchableOpacity style={styles.fab} onPress={handleAddPet}>
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
      paddingBottom: verticalScale(100),
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

MyPetsScreen.displayName = 'MyPetsScreen';
export default MyPetsScreen;
