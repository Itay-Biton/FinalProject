import React, { memo, useMemo, useCallback } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Text, Card } from 'react-native-paper';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
import { useTranslation } from 'react-i18next';
import { ThemeColors } from '../../types/theme';
import { ActivityEntry } from '../../types/activity';
import {
  getActivityTypeByValue,
  NoteIcon,
} from '../../constants/activityTypesList';

// Icons
import TimeIconSvg from '../../assets/icons/ic_time.svg';
import EditIconSvg from '../../assets/icons/ic_edit.svg';
import DeleteIconSvg from '../../assets/icons/ic_delete.svg';

// Icon Components
const TimeIcon = ({ color }: { color?: string }) => (
  <TimeIconSvg
    width={moderateScale(16)}
    height={moderateScale(16)}
    stroke={color || 'black'}
  />
);

const EditIcon = ({ color }: { color?: string }) => (
  <EditIconSvg
    width={moderateScale(20)}
    height={moderateScale(20)}
    stroke={color || 'black'}
  />
);

const DeleteIcon = ({ color }: { color?: string }) => (
  <DeleteIconSvg
    width={moderateScale(20)}
    height={moderateScale(20)}
    stroke={color || 'black'}
  />
);

interface ActivityCardProps {
  entry: ActivityEntry;
  colors: ThemeColors;
  onEdit: (entry: ActivityEntry) => void;
  onDelete: (entryId: string, description: string) => void;
  isDeleting?: boolean;
}

const ActivityCard: React.FC<ActivityCardProps> = memo(
  ({ entry, colors, onEdit, onDelete, isDeleting = false }) => {
    const { t } = useTranslation();

    const styles = useMemo(() => createStyles(colors), [colors]);

    const formatTime = useCallback((timeString: string) => {
      const [hours, minutes] = timeString.split(':');
      const hour24 = parseInt(hours, 10);
      const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
      const period = hour24 >= 12 ? 'PM' : 'AM';
      return `${hour12}:${minutes} ${period}`;
    }, []);

    const handleEdit = useCallback(() => {
      if (!isDeleting) {
        onEdit(entry);
      }
    }, [entry, onEdit, isDeleting]);

    const handleDelete = useCallback(() => {
      if (!isDeleting && entry._id) {
        onDelete(entry._id, entry.description);
      }
    }, [entry._id, entry.description, onDelete, isDeleting]);

    const activityType = useMemo(
      () => getActivityTypeByValue(entry.activityType, t),
      [entry.activityType, t],
    );

    const IconComponent = activityType?.icon || NoteIcon;

    return (
      <Card
        style={[styles.activityCard, isDeleting && styles.activityCardDeleting]}
        mode="outlined"
      >
        <Card.Content style={styles.activityCardContent}>
          <View style={styles.activityHeader}>
            <View style={styles.activityInfo}>
              <View style={styles.iconContainer}>
                <IconComponent color={colors.primary} />
              </View>
              <View style={styles.activityDetails}>
                <View style={styles.activityTitleRow}>
                  <Text style={styles.activityTitle}>
                    {t(activityType?.label || 'other')}
                  </Text>
                  <View style={styles.timeContainer}>
                    <TimeIcon color={colors.onSurfaceVariant} />
                    <Text style={styles.activityTime}>
                      {formatTime(entry.time)}
                    </Text>
                  </View>
                </View>
                <Text
                  style={styles.activityDescription}
                  numberOfLines={2}
                  ellipsizeMode="tail"
                >
                  {entry.description}
                </Text>
                {/* Timestamp Info */}
                {entry.createdAt && (
                  <View style={styles.timestampContainer}>
                    <Text style={styles.timestamp}>
                      {t('added')}{' '}
                      {new Date(entry.createdAt).toLocaleDateString()}
                    </Text>
                    {entry.updatedAt && entry.updatedAt !== entry.createdAt && (
                      <Text style={styles.timestamp}>
                        {t('updated')}{' '}
                        {new Date(entry.updatedAt).toLocaleDateString()}
                      </Text>
                    )}
                  </View>
                )}
              </View>
            </View>
            <View style={styles.activityActions}>
              <TouchableOpacity
                onPress={handleEdit}
                style={[
                  styles.actionButton,
                  isDeleting && styles.actionButtonDisabled,
                ]}
                activeOpacity={0.7}
                disabled={isDeleting}
              >
                <EditIcon
                  color={isDeleting ? colors.onSurfaceVariant : colors.primary}
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleDelete}
                style={[
                  styles.actionButton,
                  isDeleting && styles.actionButtonDisabled,
                ]}
                activeOpacity={0.7}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <ActivityIndicator size="small" color="#FF5722" />
                ) : (
                  <DeleteIcon color="#FF5722" />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </Card.Content>
      </Card>
    );
  },
);

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    activityCard: {
      marginBottom: verticalScale(12),
      borderRadius: moderateScale(12),
      borderWidth: 1,
      backgroundColor: colors.surface,
      borderColor: colors.outline + '30',
    },
    activityCardDeleting: {
      opacity: 0.6,
    },
    activityCardContent: {
      padding: scale(16),
    },
    activityHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    activityInfo: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      flex: 1,
    },
    iconContainer: {
      width: moderateScale(24),
      height: moderateScale(24),
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: verticalScale(2), // Align with title
    },
    activityDetails: {
      marginLeft: scale(12),
      flex: 1,
    },
    activityTitleRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: verticalScale(4),
    },
    activityTitle: {
      fontSize: moderateScale(16),
      fontWeight: '600',
      flex: 1,
      color: colors.primary,
    },
    timeContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: scale(8),
      paddingVertical: verticalScale(2),
      backgroundColor: colors.background,
      borderRadius: moderateScale(8),
      marginLeft: scale(8),
    },
    activityTime: {
      fontSize: moderateScale(12),
      marginLeft: scale(4),
      fontWeight: '500',
      color: colors.onSurfaceVariant,
    },
    activityDescription: {
      fontSize: moderateScale(14),
      color: colors.onSurface,
      lineHeight: moderateScale(20),
    },
    timestamp: {
      fontSize: moderateScale(10),
      color: colors.onSurfaceVariant + '80',
      lineHeight: moderateScale(14),
    },
    timestampContainer: {
      marginTop: verticalScale(4),
    },
    activityActions: {
      flexDirection: 'row',
      alignItems: 'flex-start',
    },
    actionButton: {
      padding: scale(8),
      marginLeft: scale(4),
      borderRadius: moderateScale(8),
      justifyContent: 'center',
      alignItems: 'center',
      minWidth: moderateScale(40),
      minHeight: moderateScale(40),
    },
    actionButtonDisabled: {
      opacity: 0.5,
    },
  });

ActivityCard.displayName = 'ActivityCard';

export default ActivityCard;
