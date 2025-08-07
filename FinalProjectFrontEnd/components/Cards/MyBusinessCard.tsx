import React, { memo, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme, Text, Card, IconButton } from 'react-native-paper';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
import { useTranslation } from 'react-i18next';
import { ThemeColors } from '../../types/theme';
import { Business, WorkingHours } from '../../types/business';
import BusinessImageSlider from '../UI/BusinessImageSlider';

// Icons
import EditIconSvg from '../../assets/icons/ic_edit.svg';
import DeleteIconSvg from '../../assets/icons/ic_delete.svg';
import EmailIconSvg from '../../assets/icons/ic_email2.svg';
import PhoneIconSvg from '../../assets/icons/ic_phone.svg';
import LocationIconSvg from '../../assets/icons/ic_location.svg';
import ClockIconSvg from '../../assets/icons/ic_time.svg';
import ServiceIconSvg from '../../assets/icons/ic_service.svg';

// Icon components
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

const EmailIcon = ({ color }: { color?: string }) => (
  <EmailIconSvg
    width={moderateScale(16)}
    height={moderateScale(16)}
    stroke={color || 'black'}
  />
);

const PhoneIcon = ({ color }: { color?: string }) => (
  <PhoneIconSvg
    width={moderateScale(16)}
    height={moderateScale(16)}
    stroke={color || 'black'}
  />
);

const LocationIcon = ({ color }: { color?: string }) => (
  <LocationIconSvg
    width={moderateScale(16)}
    height={moderateScale(16)}
    stroke={color || 'black'}
  />
);

const ClockIcon = ({ color }: { color?: string }) => (
  <ClockIconSvg
    width={moderateScale(16)}
    height={moderateScale(16)}
    stroke={color || 'black'}
  />
);

const ServiceIcon = ({ color }: { color?: string }) => (
  <ServiceIconSvg
    width={moderateScale(16)}
    height={moderateScale(16)}
    stroke={color || 'black'}
  />
);

// Icon render functions
const renderEditIcon = (color: string) => () => <EditIcon color={color} />;
const renderDeleteIcon = (color: string) => () => <DeleteIcon color={color} />;

interface MyBusinessCardProps {
  business: Business;
  currentImageIndex: number;
  onEditBusiness: (businessId: string) => void;
  onDeleteBusiness: (businessId: string, businessName: string) => void;
  onImageIndexChange: (businessId: string, index: number) => void;
  onImageScroll: (event: any, businessId: string, imageCount: number) => void;
}

const MyBusinessCard: React.FC<MyBusinessCardProps> = memo(
  ({
    business,
    currentImageIndex,
    onEditBusiness,
    onDeleteBusiness,
    onImageIndexChange,
    onImageScroll,
  }) => {
    const { colors }: { colors: ThemeColors } = useTheme();
    const { t } = useTranslation();

    // Helper to format working hours
    const formatWorkingHours = useCallback(
      (workingHours: WorkingHours[]): string => {
        if (!workingHours || workingHours.length === 0) {
          return t('hours_not_specified', {
            defaultValue: 'Hours not specified',
          });
        }

        // Find today's hours or show general format
        const today = new Date().toLocaleDateString('en', { weekday: 'long' });
        const todayHours = workingHours.find(wh => wh.day === today);

        if (todayHours) {
          if (!todayHours.isOpen) {
            return t('closed_today', { defaultValue: 'Closed today' });
          }
          return `${t('today', { defaultValue: 'Today' })}: ${
            todayHours.openTime
          } - ${todayHours.closeTime}`;
        }

        // Show first available working day
        const firstOpenDay = workingHours.find(wh => wh.isOpen);
        if (firstOpenDay) {
          return `${firstOpenDay.day}: ${firstOpenDay.openTime} - ${firstOpenDay.closeTime}`;
        }

        return t('hours_available', { defaultValue: 'See hours' });
      },
      [t],
    );

    // Helper to format phone numbers
    const formatPhoneNumbers = useCallback(
      (phoneNumbers: string[]): string => {
        if (!phoneNumbers || phoneNumbers.length === 0) {
          return t('no_phone_available', {
            defaultValue: 'No phone available',
          });
        }
        return phoneNumbers[0]; // Show first phone number
      },
      [t],
    );

    // Helper to format location
    const formatLocation = useCallback(
      (location: any): string => {
        if (!location?.address) {
          return t('no_location_available', {
            defaultValue: 'No location available',
          });
        }
        return location.address.length > 50
          ? `${location.address.substring(0, 50)}...`
          : location.address;
      },
      [t],
    );

    const handleEditPress = useCallback(() => {
      onEditBusiness(business._id);
    }, [onEditBusiness, business._id]);

    const handleDeletePress = useCallback(() => {
      onDeleteBusiness(business._id, business.name);
    }, [onDeleteBusiness, business._id, business.name]);

    const styles = getStyles(colors);

    const formattedWorkingHours = formatWorkingHours(business.workingHours);
    const formattedPhone = formatPhoneNumbers(business.phoneNumbers);
    const formattedLocation = formatLocation(business.location);

    return (
      <Card style={styles.businessCard} mode="outlined">
        {/* Full-width Image Slider */}
        <View style={styles.imageSliderContainer}>
          <BusinessImageSlider
            images={business.images}
            businessId={business._id}
            currentIndex={currentImageIndex}
            onIndexChange={onImageIndexChange}
            onScroll={onImageScroll}
          />
        </View>

        <Card.Content style={styles.cardContent}>
          {/* Business Header */}
          <View style={styles.businessHeader}>
            <View style={styles.businessTitleContainer}>
              <Text style={styles.businessName} numberOfLines={2}>
                {business.name}
              </Text>
              <View style={styles.businessMeta}>
                <View style={styles.leftSection}>
                  {business.isVerified && (
                    <View style={styles.verifiedBadge}>
                      <Text style={styles.verifiedText}>
                        ✓ {t('verified', { defaultValue: 'Verified' })}
                      </Text>
                    </View>
                  )}
                  <View style={styles.serviceTypeContainer}>
                    <ServiceIcon color={colors.buttonTextColor} />
                    <Text style={styles.serviceType}>
                      {t(
                        business.serviceType.toLowerCase().replace(/\s+/g, '_'),
                        {
                          defaultValue: business.serviceType,
                        },
                      )}
                    </Text>
                  </View>
                  {/* Open/Closed Status */}
                  <View
                    style={[
                      styles.statusContainer,
                      business.isOpen ? styles.openStatus : styles.closedStatus,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        business.isOpen ? styles.openText : styles.closedText,
                      ]}
                    >
                      {business.isOpen
                        ? t('open', { defaultValue: 'Open' })
                        : t('closed', { defaultValue: 'Closed' })}
                    </Text>
                  </View>
                </View>

                <View style={styles.businessActions}>
                  <IconButton
                    icon={renderEditIcon(colors.primary)}
                    size={moderateScale(22)}
                    onPress={handleEditPress}
                    style={styles.actionButton}
                  />
                  <IconButton
                    icon={renderDeleteIcon('#FF5722')}
                    size={moderateScale(22)}
                    onPress={handleDeletePress}
                    style={styles.actionButton}
                  />
                </View>
              </View>
            </View>
          </View>

          {/* Business Info Grid */}
          <View style={styles.businessInfoGrid}>
            {business.email && (
              <View style={styles.infoItem}>
                <EmailIcon color={colors.primary} />
                <Text style={styles.infoText} numberOfLines={1}>
                  {business.email}
                </Text>
              </View>
            )}

            <View style={styles.infoItem}>
              <PhoneIcon color={colors.primary} />
              <Text style={styles.infoText} numberOfLines={1}>
                {`\u202D${formattedPhone}\u202C`}
              </Text>
            </View>

            <View style={styles.infoItem}>
              <LocationIcon color={colors.primary} />
              <Text style={styles.infoText} numberOfLines={2}>
                {formattedLocation}
              </Text>
            </View>

            <View style={styles.infoItem}>
              <ClockIcon color={colors.primary} />
              <Text style={styles.infoText} numberOfLines={1}>
                {formattedWorkingHours}
              </Text>
            </View>
          </View>

          {/* Description */}
          {business.description && (
            <View style={styles.descriptionContainer}>
              <Text style={styles.businessDescription} numberOfLines={3}>
                {business.description}
              </Text>
            </View>
          )}

          {/* Services */}
          {business.services && business.services.length > 0 && (
            <View style={styles.servicesContainer}>
              <Text style={styles.servicesTitle}>
                {t('services', { defaultValue: 'Services' })}:
              </Text>
              <Text style={styles.servicesText} numberOfLines={2}>
                {business.services.join(', ')}
              </Text>
            </View>
          )}
        </Card.Content>
      </Card>
    );
  },
);

const getStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    businessCard: {
      backgroundColor: colors.surface,
      marginBottom: verticalScale(24),
      borderRadius: moderateScale(16),
      overflow: 'hidden',
      borderWidth: 1,
      width: '100%',
      borderColor: colors.outline + '30',
    },
    imageSliderContainer: {
      width: '100%',
      borderTopLeftRadius: moderateScale(16),
      borderTopRightRadius: moderateScale(16),
      overflow: 'hidden',
    },
    cardContent: {
      padding: scale(20),
    },
    businessHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: verticalScale(16),
    },
    businessTitleContainer: {
      flex: 1,
    },
    businessName: {
      fontSize: moderateScale(20),
      fontWeight: '700',
      color: colors.primary,
      textAlign: 'left',
      marginBottom: verticalScale(8),
    },
    businessMeta: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
    },
    leftSection: {
      flexDirection: 'column',
      alignItems: 'flex-start',
    },
    serviceTypeContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.buttonColor + '15',
      paddingHorizontal: scale(10),
      paddingVertical: verticalScale(4),
      borderRadius: moderateScale(12),
      marginBottom: verticalScale(4),
    },
    serviceType: {
      fontSize: moderateScale(12),
      color: colors.buttonTextColor,
      fontWeight: '600',
      marginLeft: scale(4),
    },
    verifiedBadge: {
      backgroundColor: '#4CAF50' + '15',
      paddingHorizontal: scale(8),
      paddingVertical: verticalScale(2),
      borderRadius: moderateScale(8),
      marginBottom: verticalScale(4),
    },
    verifiedText: {
      fontSize: moderateScale(11),
      color: '#4CAF50',
      fontWeight: '600',
    },
    statusContainer: {
      paddingHorizontal: scale(8),
      paddingVertical: verticalScale(2),
      borderRadius: moderateScale(8),
    },
    openStatus: {
      backgroundColor: '#4CAF50' + '15',
    },
    closedStatus: {
      backgroundColor: '#FF5722' + '15',
    },
    statusText: {
      fontSize: moderateScale(10),
      fontWeight: '600',
    },
    openText: {
      color: '#4CAF50',
    },
    closedText: {
      color: '#FF5722',
    },
    businessActions: {
      flexDirection: 'row',
    },
    actionButton: {
      margin: 0,
      marginLeft: scale(4),
    },
    businessInfoGrid: {
      marginBottom: verticalScale(16),
    },
    infoItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: verticalScale(8),
    },
    infoText: {
      fontSize: moderateScale(14),
      color: colors.onSurface,
      marginLeft: scale(8),
      flex: 1,
    },
    descriptionContainer: {
      backgroundColor: colors.onSurface + '08',
      borderRadius: moderateScale(12),
      paddingHorizontal: scale(16),
      paddingVertical: verticalScale(12),
      marginBottom: verticalScale(12),
      borderWidth: 1,
      borderColor: colors.outline + '20',
    },
    businessDescription: {
      fontSize: moderateScale(14),
      color: colors.onSurface + 'AA',
      lineHeight: verticalScale(20),
      fontStyle: 'italic',
    },
    servicesContainer: {
      backgroundColor: colors.buttonColor + '08',
      borderRadius: moderateScale(8),
      padding: scale(12),
    },
    servicesTitle: {
      fontSize: moderateScale(12),
      color: colors.primary,
      fontWeight: '600',
      marginBottom: verticalScale(4),
    },
    servicesText: {
      fontSize: moderateScale(12),
      color: colors.onSurface,
      lineHeight: verticalScale(18),
    },
  });

MyBusinessCard.displayName = 'MyBusinessCard';

export default MyBusinessCard;
