import React, { memo, useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useTheme, Text, Card, Chip, Divider } from 'react-native-paper';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
import { useTranslation } from 'react-i18next';
import { ThemeColors } from '../../types/theme';
import BusinessImageSlider from '../UI/BusinessImageSlider';

// Icons
import PhoneIconSvg from '../../assets/icons/ic_phone.svg';
import LocationIconSvg from '../../assets/icons/ic_location.svg';
import TimeIconSvg from '../../assets/icons/ic_time.svg';
import StarIconSvg from '../../assets/icons/ic_star.svg';
import EmailIconSvg from '../../assets/icons/ic_email2.svg';
import RateIconSvg from '../../assets/icons/ic_star.svg';
import NavigateIconSvg from '../../assets/icons/ic_navigate.svg';

// Icon components
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

const TimeIcon = ({ color }: { color?: string }) => (
  <TimeIconSvg
    width={moderateScale(16)}
    height={moderateScale(16)}
    stroke={color || 'black'}
  />
);

const StarIcon = ({
  color,
  filled = false,
}: {
  color?: string;
  filled?: boolean;
}) => (
  <StarIconSvg
    width={moderateScale(16)}
    height={moderateScale(16)}
    fill={filled ? color || '#FFD700' : 'none'}
    stroke={color || '#FFD700'}
    strokeWidth={filled ? 0 : 2}
  />
);

const EmailIcon = ({ color }: { color?: string }) => (
  <EmailIconSvg
    width={moderateScale(16)}
    height={moderateScale(16)}
    stroke={color || 'black'}
  />
);

const RateIcon = ({ color }: { color?: string }) => (
  <RateIconSvg
    width={moderateScale(16)}
    height={moderateScale(16)}
    fill={color || '#FFD700'}
    stroke={color || '#FFD700'}
  />
);

const NavigateIcon = ({ color }: { color?: string }) => (
  <NavigateIconSvg
    width={moderateScale(16)}
    height={moderateScale(16)}
    stroke={color || 'black'}
  />
);

// Business data interface
interface Business {
  id: string;
  name: string;
  serviceType: string;
  rating: number;
  reviewCount: number;
  email: string;
  phoneNumbers: string[];
  location: string;
  distance: string;
  workingHours: string;
  images: string[];
  description: string;
  services: string[];
  isOpen: boolean;
  isVerified: boolean;
}

// Props interface
interface BusinessCardProps {
  business: Business;
  currentImageIndex: number;
  onImageIndexChange: (businessId: string, index: number) => void;
  onImageScroll: (event: any, businessId: string, imageCount: number) => void;
  onCall: (phoneNumbers: string[], businessName: string) => void;
  onEmail: (email: string) => void;
  onRate: (businessId: string, businessName: string) => void;
  onNavigate?: (businessId: string, businessName: string) => void;
}

const BusinessCard: React.FC<BusinessCardProps> = memo(
  ({
    business,
    currentImageIndex,
    onImageIndexChange,
    onImageScroll,
    onCall,
    onEmail,
    onRate,
    onNavigate,
  }) => {
    const { colors }: { colors: ThemeColors } = useTheme();
    const { t } = useTranslation();

    const renderStars = useCallback((rating: number) => {
      const stars = [];
      const fullStars = Math.floor(rating);
      const hasHalfStar = rating % 1 !== 0;

      for (let i = 0; i < fullStars; i++) {
        stars.push(<StarIcon key={`full-${i}`} color="#FFD700" filled />);
      }

      if (hasHalfStar) {
        stars.push(<StarIcon key="half" color="#FFD700" filled />);
      }

      const emptyStars = 5 - Math.ceil(rating);
      for (let i = 0; i < emptyStars; i++) {
        stars.push(<StarIcon key={`empty-${i}`} color="#FFD700" />);
      }

      return stars;
    }, []);

    const handleNavigate = useCallback(() => {
      if (onNavigate) {
        onNavigate(business.id, business.name);
      } else {
        // Default behavior - you can implement navigation logic here
        onRate(business.id, business.name);
      }
    }, [business.id, business.name, onNavigate, onRate]);

    const styles = createStyles(colors);

    return (
      <Card key={business.id} style={styles.businessCard} mode="outlined">
        {/* Full-width Image Slider */}
        <View style={styles.imageSliderContainer}>
          <BusinessImageSlider
            images={business.images}
            businessId={business.id}
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
                      <Text style={styles.verifiedText}>✓ {t('verified')}</Text>
                    </View>
                  )}
                </View>

                <View style={styles.statusContainer}>
                  <Chip
                    style={[
                      styles.statusChip,
                      business.isOpen
                        ? styles.openStatusChip
                        : styles.closedStatusChip,
                    ]}
                    textStyle={[
                      styles.statusChipText,
                      business.isOpen
                        ? styles.openStatusText
                        : styles.closedStatusText,
                    ]}
                    compact
                  >
                    {business.isOpen ? t('open') : t('closed')}
                  </Chip>
                  <Text style={styles.distanceText}>{business.distance}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Rating */}
          <View style={styles.ratingRow}>
            <View style={styles.starsContainer}>
              {renderStars(business.rating)}
            </View>
            <Text style={styles.ratingText}>
              {business.rating} ({business.reviewCount} {t('reviews')})
            </Text>
          </View>

          {/* Business Info Grid */}
          <View style={styles.businessInfoGrid}>
            <View style={styles.infoItem}>
              <LocationIcon color={colors.primary} />
              <Text style={styles.infoText} numberOfLines={2}>
                {business.location}
              </Text>
            </View>

            <View style={styles.infoItem}>
              <TimeIcon color={colors.primary} />
              <Text style={styles.infoText} numberOfLines={1}>
                {business.workingHours}
              </Text>
            </View>

            <View style={styles.infoItem}>
              <EmailIcon color={colors.primary} />
              <Text style={styles.infoText} numberOfLines={1}>
                {business.email}
              </Text>
            </View>
          </View>

          {/* Description */}
          <View style={styles.descriptionContainer}>
            <Text style={styles.businessDescription} numberOfLines={3}>
              {business.description}
            </Text>
          </View>

          <Divider style={styles.divider} />

          {/* Contact Buttons */}
          <View style={styles.contactSection}>
            <View style={styles.contactButtons}>
              <TouchableOpacity
                style={styles.contactButton}
                onPress={() => onCall(business.phoneNumbers, business.name)}
              >
                <View style={styles.contactButtonContent}>
                  <PhoneIcon color={colors.buttonTextColor} />
                  <Text style={styles.contactButtonText}>{t('call')}</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.contactButton}
                onPress={() => onEmail(business.email)}
              >
                <View style={styles.contactButtonContent}>
                  <EmailIcon color={colors.buttonTextColor} />
                  <Text style={styles.contactButtonText}>{t('email')}</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.contactButton}
                onPress={() => onRate(business.id, business.name)}
              >
                <View style={styles.contactButtonContent}>
                  <RateIcon color={colors.buttonTextColor} />
                  <Text style={styles.contactButtonText}>{t('rate')}</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.contactButton}
                onPress={handleNavigate}
              >
                <View style={styles.contactButtonContent}>
                  <NavigateIcon color={colors.buttonTextColor} />
                  <Text style={styles.contactButtonText}>{t('navigate')}</Text>
                </View>
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
      alignItems: 'flex-end',
    },
    statusChip: {
      alignSelf: 'flex-end',
      marginBottom: verticalScale(4),
    },
    openStatusChip: {
      backgroundColor: '#4CAF50' + '15',
    },
    closedStatusChip: {
      backgroundColor: '#FF5722' + '15',
    },
    statusChipText: {
      fontSize: moderateScale(12),
      fontWeight: '600',
    },
    openStatusText: {
      color: '#4CAF50',
    },
    closedStatusText: {
      color: '#FF5722',
    },
    distanceText: {
      fontSize: moderateScale(12),
      color: colors.rangeTextColor,
      fontWeight: '500',
      textAlign: 'right',
    },
    ratingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: verticalScale(16),
    },
    starsContainer: {
      flexDirection: 'row',
      marginRight: scale(8),
    },
    ratingText: {
      fontSize: moderateScale(14),
      color: colors.onSurfaceVariant,
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
      backgroundColor: colors.background,
      borderRadius: moderateScale(12),
      padding: scale(12),
      marginBottom: verticalScale(16),
    },
    businessDescription: {
      fontSize: moderateScale(14),
      color: colors.onSurface,
      lineHeight: verticalScale(20),
      fontStyle: 'italic',
    },
    divider: {
      marginVertical: verticalScale(12),
      backgroundColor: colors.outline,
    },
    contactSection: {
      marginTop: verticalScale(8),
    },
    contactButtons: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
    },
    contactButton: {
      flex: 1,
      marginRight: scale(4),
      marginBottom: verticalScale(8),
      minWidth: scale(90),
      borderRadius: moderateScale(8),
      paddingVertical: verticalScale(10),
      paddingHorizontal: scale(12),
      backgroundColor: colors.buttonColor,
    },
    contactButtonContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    contactButtonText: {
      fontSize: moderateScale(14),
      fontWeight: '600',
      color: colors.buttonTextColor,
      marginLeft: scale(6),
    },
  });

BusinessCard.displayName = 'BusinessCard';

export default BusinessCard;
