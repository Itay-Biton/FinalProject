// components/Cards/BusinessCard.tsx
import React, { memo, useCallback, useMemo } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
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

type WorkingHours = {
  day: string;
  isOpen: boolean;
  openTime?: string;
  closeTime?: string;
};

interface BusinessCardVM {
  id: string;
  name: string;
  serviceType: string;
  rating: number;
  reviewCount: number;
  email: string;
  phoneNumbers: string[];
  location: string; // address text
  distance: string;
  workingHours: WorkingHours[] | string;
  images: string[];
  description: string;
  services: string[];
  isOpen: boolean;
  isVerified: boolean;
}

interface BusinessCardProps {
  business: BusinessCardVM;
  currentImageIndex: number;
  onImageIndexChange: (businessId: string, index: number) => void;
  onImageScroll: (event: any, businessId: string, imageCount: number) => void;
  onCall: (phoneNumbers: string[], businessName: string) => void;
  onEmail: (email: string) => void;
  onRate: (businessId: string, businessName: string) => void;
  onNavigate?: (businessId: string, businessName: string) => void;
  onViewReviews: (businessId: string, businessName: string) => void;
}

// --- Icon wrappers (outline for info rows) ---
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
const EmailIcon = ({ color }: { color?: string }) => (
  <EmailIconSvg
    width={moderateScale(16)}
    height={moderateScale(16)}
    stroke={color || 'black'}
  />
);

// Star icon (outline/filled used by rating)
const StarIcon = ({
  color,
  filled = false,
  size = 16,
}: {
  color?: string;
  filled?: boolean;
  size?: number;
}) => (
  <StarIconSvg
    width={moderateScale(size)}
    height={moderateScale(size)}
    fill={filled ? color || '#FFD700' : 'none'}
    stroke={color || '#FFD700'}
    strokeWidth={filled ? 0 : 2}
  />
);

// Solid icons for buttons (no stroke; seamless)
const SolidPhoneIcon = ({ color }: { color?: string }) => (
  <PhoneIconSvg
    width={moderateScale(16)}
    height={moderateScale(16)}
    fill={color || 'white'}
    stroke="none"
  />
);
const SolidEmailIcon = ({ color }: { color?: string }) => (
  <EmailIconSvg
    width={moderateScale(16)}
    height={moderateScale(16)}
    fill={color || 'white'}
    stroke="none"
  />
);
const SolidRateIcon = ({ color }: { color?: string }) => (
  <RateIconSvg
    width={moderateScale(16)}
    height={moderateScale(16)}
    fill={color || 'white'}
    stroke="none"
  />
);
const SolidNavigateIcon = ({ color }: { color?: string }) => (
  <NavigateIconSvg
    width={moderateScale(16)}
    height={moderateScale(16)}
    fill={color || 'white'}
    stroke="none"
  />
);

// StarRating with half-star overlay (clip)
const StarRating = ({
  rating,
  size = 16,
  color = '#FFD700',
  gap = 4,
}: {
  rating: number;
  size?: number;
  color?: string;
  gap?: number;
}) => {
  const rounded = Math.max(0, Math.min(5, Math.round(rating * 2) / 2));
  const percent = `${(rounded / 5) * 100}%`;
  const stars = Array.from({ length: 5 }, (_, i) => i);

  return (
    <View
      style={{
        position: 'relative',
        height: moderateScale(size),
        flexDirection: 'row',
      }}
    >
      {/* outline row */}
      <View style={{ flexDirection: 'row' }}>
        {stars.map(i => (
          <View key={`outline-${i}`} style={{ marginRight: i < 4 ? gap : 0 }}>
            <StarIcon size={size} color={color} filled={false} />
          </View>
        ))}
      </View>
      {/* clipped filled row */}
      <View
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: percent,
          overflow: 'hidden',
          flexDirection: 'row',
        }}
        pointerEvents="none"
      >
        {stars.map(i => (
          <View key={`filled-${i}`} style={{ marginRight: i < 4 ? gap : 0 }}>
            <StarIcon size={size} color={color} filled />
          </View>
        ))}
      </View>
    </View>
  );
};

// Normalize to full week for display
const useNormalizedHours = (workingHours: WorkingHours[] | string) => {
  const WEEK_DAYS = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];
  if (Array.isArray(workingHours)) {
    return WEEK_DAYS.map(day => {
      const found = workingHours.find(h => h?.day === day);
      return found
        ? {
            day,
            isOpen: !!found.isOpen,
            openTime: found.openTime,
            closeTime: found.closeTime,
          }
        : { day, isOpen: false as const };
    });
  }
  return WEEK_DAYS.map(day => ({ day, isOpen: false as const }));
};

// Day i18n (supports either "days.monday" or "monday" keys)
const useDayLabel = () => {
  const { t } = useTranslation();
  return useCallback(
    (dayEn: string) => {
      const key = dayEn.toLowerCase();
      const viaScoped = t(`days.${key}`, { defaultValue: '' });
      if (
        viaScoped &&
        viaScoped.trim().length > 0 &&
        viaScoped !== `days.${key}`
      )
        return viaScoped;
      const viaFlat = t(key, { defaultValue: '' });
      if (viaFlat && viaFlat.trim().length > 0 && viaFlat !== key)
        return viaFlat;
      return dayEn;
    },
    [t],
  );
};

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
    const styles = useMemo(() => createStyles(colors), [colors]);

    const displayRating = Number.isFinite(business.rating)
      ? business.rating
      : 0;
    const displayCount = Number.isFinite(business.reviewCount)
      ? business.reviewCount
      : 0;
    const hasRating = displayCount > 0 && displayRating > 0;

    const hours = useNormalizedHours(business.workingHours);
    const dayLabel = useDayLabel();

    const handleViewReviews = useCallback(() => {
      onViewReviews(business.id, business.name);
    }, [business.id, business.name, onViewReviews]);

    const handleNavigate = useCallback(() => {
      if (onNavigate) onNavigate(business.id, business.name);
      else onRate(business.id, business.name);
    }, [business.id, business.name, onNavigate, onRate]);

    return (
      <Card style={styles.businessCard} mode="outlined">
        {/* Images */}
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
          {/* Header row: LEFT -> name (+ verified underneath) | RIGHT -> distance + open/closed */}
          <View style={styles.headerRow}>
            {/* LEFT */}
            <View style={styles.headerLeft}>
              <Text style={styles.businessName} numberOfLines={2}>
                {business.name}
              </Text>

              {/* VERIFIED shown UNDER the name */}
              {business.isVerified ? (
                <View style={styles.verifiedRow}>
                  <View style={styles.verifiedBadge}>
                    <Text style={styles.verifiedText}>✓ {t('verified')}</Text>
                  </View>
                </View>
              ) : (
                <View style={styles.verifiedSpacer} />
              )}
            </View>

            {/* RIGHT */}
            <View style={styles.headerRight}>
              <Text style={styles.distanceText}>{business.distance}</Text>
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
            </View>
          </View>

          {/* Rating / Reviews — seamless button (no stroke/bg) */}
          <TouchableOpacity
            style={styles.ratingRow}
            onPress={handleViewReviews}
            activeOpacity={0.7}
          >
            <View style={styles.starsContainer}>
              {hasRating ? (
                <StarRating
                  rating={displayRating}
                  size={16}
                  color="#FFD700"
                  gap={4}
                />
              ) : (
                <Text style={styles.noRatingText}>{t('no_rating')}</Text>
              )}
            </View>
            <View style={styles.ratingTextContainer}>
              {hasRating ? (
                <Text style={styles.ratingText}>
                  {displayRating.toFixed(1)} ({displayCount} {t('reviews')})
                </Text>
              ) : (
                <Text style={styles.ratingText}>{t('no_reviews_yet')}</Text>
              )}
              <Text style={styles.viewReviewsHint}>
                {displayCount > 0
                  ? t('tap_to_view_reviews')
                  : t('be_the_first_to_review')}
              </Text>
            </View>
          </TouchableOpacity>

          {/* Address */}
          <View style={styles.businessInfoGrid}>
            <View style={styles.infoItem}>
              <LocationIcon color={colors.primary} />
              <Text style={styles.infoText} numberOfLines={2}>
                {business.location}
              </Text>
            </View>
          </View>

          {/* Working hours — one row per day, translated day label */}
          <View style={styles.hoursBlock}>
            <View style={styles.hoursHeader}>
              <TimeIcon color={colors.primary} />
              <Text style={styles.hoursTitle}>
                {t('working_hours') || 'Hours'}
              </Text>
            </View>

            {hours.map((h, idx) => (
              <View
                key={h.day}
                style={[
                  styles.hourRow,
                  idx < hours.length - 1 && styles.hourRowDivider,
                ]}
              >
                <Text style={styles.hourDay}>{dayLabel(h.day)}</Text>
                <View style={styles.hourDot} />
                {h.isOpen ? (
                  <Text style={styles.hourTime}>
                    {h.openTime || '00:00'} – {h.closeTime || '00:00'}
                  </Text>
                ) : (
                  <Text style={styles.hourClosed}>
                    {t('closed') || 'Closed'}
                  </Text>
                )}
              </View>
            ))}
          </View>

          {/* Email (optional) */}
          {!!business.email && (
            <View style={styles.infoItem}>
              <EmailIcon color={colors.primary} />
              <Text style={styles.infoText} numberOfLines={1}>
                {business.email}
              </Text>
            </View>
          )}

          {/* Description */}
          <View style={styles.descriptionContainer}>
            <Text style={styles.businessDescription} numberOfLines={3}>
              {business.description}
            </Text>
          </View>

          <Divider style={styles.divider} />

          {/* Actions */}
          <View style={styles.contactSection}>
            <View style={styles.contactButtons}>
              <TouchableOpacity
                style={styles.contactButton}
                onPress={() => onCall(business.phoneNumbers, business.name)}
              >
                <View style={styles.contactButtonContent}>
                  <SolidPhoneIcon color={colors.buttonTextColor} />
                  <Text style={styles.contactButtonText}>{t('call')}</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.contactButton}
                onPress={() => onEmail(business.email)}
              >
                <View style={styles.contactButtonContent}>
                  <SolidEmailIcon color={colors.buttonTextColor} />
                  <Text style={styles.contactButtonText}>{t('email')}</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.contactButton}
                onPress={() => onRate(business.id, business.name)}
              >
                <View style={styles.contactButtonContent}>
                  <SolidRateIcon color={colors.buttonTextColor} />
                  <Text style={styles.contactButtonText}>{t('rate')}</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.contactButton}
                onPress={handleNavigate}
              >
                <View style={styles.contactButtonContent}>
                  <SolidNavigateIcon color={colors.buttonTextColor} />
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
    cardContent: { padding: scale(20) },

    // HEADER
    headerRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      marginBottom: verticalScale(12),
    },
    headerLeft: {
      flex: 1,
      paddingRight: scale(10),
    },
    businessName: {
      fontSize: moderateScale(20),
      fontWeight: '700',
      color: colors.primary,
    },
    verifiedRow: {
      marginTop: verticalScale(6),
      flexDirection: 'row',
      alignItems: 'center',
      gap: scale(8),
    },
    verifiedSpacer: {
      height: verticalScale(6), // keeps spacing consistent when not verified
    },
    verifiedBadge: {
      backgroundColor: '#4CAF50' + '15',
      paddingHorizontal: scale(8),
      paddingVertical: verticalScale(2),
      borderRadius: moderateScale(8),
    },
    verifiedText: {
      fontSize: moderateScale(11),
      color: '#4CAF50',
      fontWeight: '600',
    },

    headerRight: {
      alignItems: 'flex-end',
      maxWidth: '45%',
      gap: verticalScale(6),
    },
    statusChip: {},
    openStatusChip: { backgroundColor: '#4CAF50' + '15' },
    closedStatusChip: { backgroundColor: '#FF5722' + '15' },
    statusChipText: { fontSize: moderateScale(12), fontWeight: '600' },
    openStatusText: { color: '#4CAF50' },
    closedStatusText: { color: '#FF5722' },
    distanceText: {
      fontSize: moderateScale(12),
      color: colors.rangeTextColor,
      fontWeight: '500',
      textAlign: 'right',
    },

    // Seamless rating button
    ratingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'transparent',
      marginBottom: verticalScale(16),
      padding: scale(12),
      borderRadius: moderateScale(8),
    },
    starsContainer: { flexDirection: 'row', marginRight: scale(8) },
    ratingTextContainer: { flex: 1 },
    ratingText: {
      fontSize: moderateScale(14),
      color: colors.onSurfaceVariant,
      fontWeight: '500',
    },
    noRatingText: {
      fontSize: moderateScale(14),
      color: colors.onSurfaceVariant,
      fontStyle: 'italic',
    },
    viewReviewsHint: {
      fontSize: moderateScale(12),
      color: colors.primary,
      marginTop: verticalScale(2),
      fontWeight: '500',
      opacity: 0.8,
    },

    // Info
    businessInfoGrid: { marginBottom: verticalScale(8) },
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

    // Hours
    hoursBlock: {
      marginTop: verticalScale(4),
      marginBottom: verticalScale(8),
    },
    hoursHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: verticalScale(8),
    },
    hoursTitle: {
      fontSize: moderateScale(14),
      fontWeight: '600',
      color: colors.onSurface,
      marginLeft: scale(8),
    },
    hourRow: {
      marginLeft: scale(20),
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: verticalScale(6),
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.outline + '40',
    },
    hourRowDivider: {},
    hourDay: {
      width: scale(90),
      fontSize: moderateScale(13),
      color: colors.onSurface,
      fontWeight: '600',
    },
    hourDot: {
      width: scale(4),
      height: scale(4),
      borderRadius: scale(2),
      backgroundColor: colors.onSurfaceVariant,
      marginHorizontal: scale(8),
      opacity: 0.5,
    },
    hourTime: {
      fontSize: moderateScale(13),
      color: colors.onSurfaceVariant,
      flexShrink: 1,
    },
    hourClosed: {
      fontSize: moderateScale(13),
      color: colors.error || colors.onSurfaceVariant,
      fontWeight: '600',
    },

    // Description & divider
    descriptionContainer: {
      backgroundColor: colors.background,
      borderRadius: moderateScale(12),
      padding: scale(12),
      marginTop: verticalScale(8),
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

    // Actions
    contactSection: { marginTop: verticalScale(8) },
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
