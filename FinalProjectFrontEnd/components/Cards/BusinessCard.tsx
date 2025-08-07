// components/Cards/BusinessCard.tsx

import React, { memo, useCallback } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  I18nManager,
  Platform,
} from 'react-native';
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
  onViewReviews: (businessId: string, businessName: string) => void;
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
    onViewReviews,
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

    const handleViewReviews = useCallback(() => {
      onViewReviews(business.id, business.name);
    }, [business.id, business.name, onViewReviews]);

    const handleNavigate = useCallback(() => {
      if (onNavigate) {
        onNavigate(business.id, business.name);
      } else {
        onRate(business.id, business.name);
      }
    }, [business.id, business.name, onNavigate, onRate]);

    const styles = createStyles(colors);

    return (
      <Card style={styles.businessCard} mode="outlined">
        {/* Image Slider */}
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
          {/* Header */}
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

          {/* Rating / Reviews Row */}
          <TouchableOpacity
            style={styles.ratingRow}
            onPress={handleViewReviews}
            activeOpacity={0.7}
          >
            <View style={styles.starsContainer}>
              {business.rating > 0 ? (
                renderStars(business.rating)
              ) : (
                <Text style={styles.noRatingText}>{t('no_rating')}</Text>
              )}
            </View>
            <View style={styles.ratingTextContainer}>
              {business.rating > 0 ? (
                <Text style={styles.ratingText}>
                  {Math.ceil(business.rating)} ({business.reviewCount}{' '}
                  {t('reviews')})
                </Text>
              ) : (
                <Text style={styles.ratingText}>{t('no_reviews_yet')}</Text>
              )}
              <Text style={styles.viewReviewsHint}>
                {business.reviewCount > 0
                  ? t('tap_to_view_reviews')
                  : t('be_the_first_to_review')}
              </Text>
            </View>
          </TouchableOpacity>

          {/* Info Grid */}
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
      textAlign: I18nManager.isRTL ? 'right' : 'left',
      marginBottom: verticalScale(8),
    },
    businessMeta: {
      flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
    },
    leftSection: {
      flexDirection: 'column',
      alignItems: I18nManager.isRTL ? 'flex-end' : 'flex-start',
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
      textAlign: I18nManager.isRTL ? 'right' : 'left',
    },
    statusContainer: {
      alignItems: I18nManager.isRTL ? 'flex-start' : 'flex-end',
    },
    statusChip: {
      alignSelf: I18nManager.isRTL ? 'flex-start' : 'flex-end',
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
      textAlign: I18nManager.isRTL ? 'left' : 'right',
    },
    ratingRow: {
      flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
      alignItems: 'center',
      marginBottom: verticalScale(16),
      backgroundColor: colors.background,
      padding: scale(12),
      borderRadius: moderateScale(8),
      borderWidth: 1,
      borderColor: colors.outline + '30',
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 1,
    },
    starsContainer: {
      flexDirection: 'row',
      marginRight: I18nManager.isRTL ? 0 : scale(8),
      marginLeft: I18nManager.isRTL ? scale(8) : 0,
    },
    ratingTextContainer: {
      flex: 1,
    },
    ratingText: {
      fontSize: moderateScale(14),
      color: colors.onSurfaceVariant,
      fontWeight: '500',
      textAlign: I18nManager.isRTL ? 'right' : 'left',
    },
    noRatingText: {
      fontSize: moderateScale(14),
      color: colors.onSurfaceVariant,
      textAlign: I18nManager.isRTL ? 'right' : 'left',
      fontStyle: 'italic',
    },
    viewReviewsHint: {
      fontSize: moderateScale(12),
      color: colors.primary,
      marginTop: verticalScale(2),
      textAlign: I18nManager.isRTL ? 'right' : 'left',
      fontWeight: '500',
      opacity: 0.8,
    },
    businessInfoGrid: {
      marginBottom: verticalScale(16),
    },
    infoItem: {
      flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
      alignItems: 'center',
      marginBottom: verticalScale(8),
    },
    infoText: {
      fontSize: moderateScale(14),
      color: colors.onSurface,
      marginLeft: I18nManager.isRTL ? 0 : scale(8),
      marginRight: I18nManager.isRTL ? scale(8) : 0,
      flex: 1,
      textAlign: I18nManager.isRTL ? 'right' : 'left',
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
      textAlign: I18nManager.isRTL ? 'right' : 'left',
    },
    divider: {
      marginVertical: verticalScale(12),
      backgroundColor: colors.outline,
    },
    contactSection: {
      marginTop: verticalScale(8),
    },
    contactButtons: {
      flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
    },
    contactButton: {
      flex: 1,
      marginRight: I18nManager.isRTL ? 0 : scale(4),
      marginLeft: I18nManager.isRTL ? scale(4) : 0,
      marginBottom: verticalScale(8),
      minWidth: scale(90),
      borderRadius: moderateScale(8),
      paddingVertical: verticalScale(10),
      paddingHorizontal: scale(12),
      backgroundColor: colors.buttonColor,
    },
    contactButtonContent: {
      flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    contactButtonText: {
      fontSize: moderateScale(14),
      fontWeight: '600',
      color: colors.buttonTextColor,
      marginLeft: I18nManager.isRTL ? 0 : scale(6),
      marginRight: I18nManager.isRTL ? scale(6) : 0,
    },
  });

BusinessCard.displayName = 'BusinessCard';

export default BusinessCard;
