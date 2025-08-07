import React, { useState, useMemo, memo, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  useWindowDimensions,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useTheme, Text } from 'react-native-paper';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
import { useTranslation } from 'react-i18next';
import { ThemeColors } from '../../types/theme';
import { ActivityEntry, CreateActivityRequest } from '../../types/activity';
import ActivityCard from '../../components/Cards/ActivityCard';
import ActivityForm from '../../components/Forms/ActivityForm';
import AlertModal from '../../components/Modals/AlertModal';
import { useActivityViewModel } from '../../viewModels/ActivityViewModel';

// Icons for other UI elements
import AddIconSvg from '../../assets/icons/ic_add.svg';
import NoteIconSvg from '../../assets/icons/ic_note.svg';

const AddIcon = ({ color }: { color?: string }) => (
  <AddIconSvg
    width={moderateScale(30)}
    height={moderateScale(30)}
    stroke={color || 'black'}
  />
);

const NoteIcon = ({ color }: { color?: string }) => (
  <NoteIconSvg
    width={moderateScale(20)}
    height={moderateScale(20)}
    stroke={color || 'black'}
  />
);

// Local interface for form handling (matches existing ActivityForm expectations)
interface ActivityEntryLocal {
  id?: string;
  date: string;
  time: string;
  activityType: string;
  description: string;
}

// Alert state interface
interface AlertState {
  visible: boolean;
  title: string;
  message: string;
  icon: 'alert' | 'success' | 'error' | 'info';
  buttons: Array<{
    text: string;
    onPress?: () => void;
    style?: 'default' | 'cancel' | 'destructive';
  }>;
}

const PetActivityHistoryScreen: React.FC = memo(() => {
  const { width, height } = useWindowDimensions();
  const { colors }: { colors: ThemeColors } = useTheme();
  const { t } = useTranslation();
  const styles = useMemo(
    () => createStyles(width, height, colors),
    [width, height, colors],
  );

  // ViewModel - handles all business logic and API calls
  const {
    groupedActivities,
    loading,
    loadingMore,
    saving,
    deleting,
    error,
    hasActivities,
    totalActivities,
    loadMore,
    refresh,
    saveActivity,
    deleteActivity,
    clearError,
  } = useActivityViewModel();

  // Local state for form management
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState<ActivityEntry | null>(null);

  // Alert modal state
  const [alertState, setAlertState] = useState<AlertState>({
    visible: false,
    title: '',
    message: '',
    icon: 'alert',
    buttons: [],
  });

  // Helper function to show alert modal
  const showAlert = useCallback(
    (
      title: string,
      message: string,
      icon: 'alert' | 'success' | 'error' | 'info',
      buttons: AlertState['buttons'],
    ) => {
      setAlertState({
        visible: true,
        title,
        message,
        icon,
        buttons,
      });
    },
    [],
  );

  // Helper function to hide alert modal
  const hideAlert = useCallback(() => {
    setAlertState(prev => ({ ...prev, visible: false }));
  }, []);

  const handleEditEntry = useCallback((entry: ActivityEntry) => {
    setEditingEntry(entry);
    setShowAddForm(true);
  }, []);

  const handleDeleteEntry = useCallback(
    (entryId: string, description: string) => {
      showAlert(
        t('delete_activity'),
        t('delete_activity_confirmation', { activityName: description }),
        'alert',
        [
          {
            text: t('cancel'),
            style: 'cancel',
          },
          {
            text: t('delete'),
            style: 'destructive',
            onPress: async () => {
              try {
                await deleteActivity(entryId);
                showAlert(
                  t('success'),
                  t('activity_deleted_successfully'),
                  'success',
                  [{ text: t('ok'), style: 'default' }],
                );
              } catch (err: any) {
                showAlert(
                  t('error'),
                  err.message || t('failed_to_delete_activity'),
                  'error',
                  [{ text: t('ok'), style: 'default' }],
                );
              }
            },
          },
        ],
      );
    },
    [t, deleteActivity, showAlert],
  );

  const handleSaveEntry = useCallback(
    async (entry: ActivityEntryLocal) => {
      try {
        // Convert local format to API request format
        const activityData: CreateActivityRequest = {
          date: entry.date,
          time: entry.time,
          activityType: entry.activityType,
          description: entry.description,
        };

        await saveActivity(activityData, entry.id); // Use id for editing (converts from _id)

        // Close the form
        setShowAddForm(false);
        setEditingEntry(null);

        // Show success message
        const message = entry.id
          ? t('activity_updated_successfully')
          : t('activity_created_successfully');

        showAlert(t('success'), message, 'success', [
          { text: t('ok'), style: 'default' },
        ]);
      } catch (err: any) {
        showAlert(
          t('error'),
          err.message || t('failed_to_save_activity'),
          'error',
          [{ text: t('ok'), style: 'default' }],
        );
      }
    },
    [t, saveActivity, showAlert],
  );

  const handleCancelEntry = useCallback(() => {
    setShowAddForm(false);
    setEditingEntry(null);
  }, []);

  const handleAddActivity = useCallback(() => {
    setEditingEntry(null); // Ensure we're in add mode
    setShowAddForm(true);
  }, []);

  const handleRetry = useCallback(() => {
    clearError();
    refresh();
  }, [clearError, refresh]);

  const formatDate = useCallback(
    (dateString: string) => {
      const [day, month, year] = dateString.split('/');
      const date = new Date(Number(year), Number(month) - 1, Number(day));
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      if (date.toDateString() === today.toDateString()) {
        return t('today');
      } else if (date.toDateString() === yesterday.toDateString()) {
        return t('yesterday');
      } else {
        return dateString;
      }
    },
    [t],
  );

  const renderActivityEntry = useCallback(
    (entry: ActivityEntry) => (
      <ActivityCard
        key={entry._id}
        entry={entry}
        colors={colors}
        onEdit={handleEditEntry}
        onDelete={handleDeleteEntry}
        isDeleting={deleting === entry._id}
      />
    ),
    [colors, handleEditEntry, handleDeleteEntry, deleting],
  );

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
      {/* Error Banner */}
      {!!error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={handleRetry} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>
              {t('retry', { defaultValue: 'Retry' })}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={400}
        refreshControl={
          <RefreshControl
            refreshing={loading && hasActivities}
            onRefresh={refresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        <Image
          source={require('../../assets/icons/ic_playing_around.png')}
          style={styles.logo}
        />

        {/* Activity Form */}
        <ActivityForm
          visible={showAddForm}
          editingEntry={editingEntry}
          colors={colors}
          onSave={handleSaveEntry}
          onCancel={handleCancelEntry}
          saving={saving}
        />

        {/* Loading State */}
        {loading && !hasActivities ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>
              {t('loading_activities', {
                defaultValue: 'Loading activities...',
              })}
            </Text>
          </View>
        ) : !hasActivities && !loading ? (
          /* Empty State */
          <View style={styles.emptyContainer}>
            <NoteIcon color={colors.onSurfaceVariant} />
            <Text style={styles.emptyText}>{t('no_activities_recorded')}</Text>
            <Text style={styles.emptySubtext}>
              {t('start_tracking_activities')}
            </Text>
          </View>
        ) : (
          /* Activity History List */
          <>
            {Object.entries(groupedActivities).map(([date, entries]) => (
              <View key={date} style={styles.dateGroup}>
                <Text style={styles.dateHeader}>{formatDate(date)}</Text>
                {entries.map(renderActivityEntry)}
              </View>
            ))}

            {/* Load More Indicator */}
            {loadingMore && (
              <View style={styles.loadingMoreContainer}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={styles.loadingMoreText}>
                  {t('loading_more', { defaultValue: 'Loading more...' })}
                </Text>
              </View>
            )}

            {/* Total Count */}
            {totalActivities > 0 && (
              <View style={styles.totalContainer}>
                <Text style={styles.totalText}>
                  {t('total_activities', {
                    count: totalActivities,
                    defaultValue: `${totalActivities} activities total`,
                  })}
                </Text>
              </View>
            )}
          </>
        )}
      </ScrollView>

      {/* Add Activity FAB */}
      {!showAddForm && (
        <TouchableOpacity
          style={[styles.fab, saving && styles.fabDisabled]}
          onPress={handleAddActivity}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color={colors.buttonTextColor} />
          ) : (
            <AddIcon color={colors.buttonTextColor} />
          )}
        </TouchableOpacity>
      )}

      {/* Custom Alert Modal */}
      <AlertModal
        visible={alertState.visible}
        onClose={hideAlert}
        title={alertState.title}
        message={alertState.message}
        icon={alertState.icon}
        buttons={alertState.buttons}
      />
    </View>
  );
});

// Styles remain the same as your existing design
const createStyles = (width: number, height: number, colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      alignItems: 'center',
    },
    logo: {
      width: moderateScale(200),
      height: moderateScale(200),
      resizeMode: 'contain',
      marginTop: verticalScale(30),
      marginBottom: verticalScale(10),
      alignSelf: 'center',
    },
    scrollView: {
      flex: 1,
      width: '100%',
    },
    scrollViewContent: {
      paddingTop: verticalScale(16),
      paddingHorizontal: scale(8),
      paddingBottom: verticalScale(100),
    },
    dateGroup: {
      marginBottom: verticalScale(20),
    },
    dateHeader: {
      fontSize: moderateScale(18),
      fontWeight: '600',
      color: colors.primary,
      marginBottom: verticalScale(12),
      textAlign: 'left',
    },
    // Loading States
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
    // Error States
    errorContainer: {
      backgroundColor: colors.errorContainer,
      marginHorizontal: scale(16),
      marginVertical: verticalScale(8),
      padding: scale(12),
      borderRadius: moderateScale(8),
      alignItems: 'center',
      width: '100%',
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
    // Empty State
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingTop: verticalScale(100),
    },
    emptyText: {
      fontSize: moderateScale(18),
      fontWeight: '600',
      color: colors.onSurfaceVariant,
      textAlign: 'center',
      marginTop: verticalScale(16),
      marginBottom: verticalScale(8),
    },
    emptySubtext: {
      fontSize: moderateScale(14),
      color: colors.onSurfaceVariant,
      textAlign: 'center',
    },
    // Total Count
    totalContainer: {
      marginTop: verticalScale(20),
      alignItems: 'center',
    },
    totalText: {
      fontSize: moderateScale(12),
      color: colors.onSurfaceVariant,
      textAlign: 'center',
    },
    // FAB
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
    fabDisabled: {
      opacity: 0.6,
    },
  });

PetActivityHistoryScreen.displayName = 'PetActivityHistoryScreen';

export default PetActivityHistoryScreen;
