// components/Modals/ReviewsModal.tsx
import React, { memo, useMemo, useState, useCallback, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  I18nManager,
} from 'react-native';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
import { useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { ThemeColors } from '../../types/theme';
import { Review } from '../../types/business';

// Icons
import StarIconSvg from '../../assets/icons/ic_star.svg';
import CloseIconSvg from '../../assets/icons/ic_cancel.svg';
import UserIconSvg from '../../assets/icons/ic_user.svg';

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

const CloseIcon = ({ color }: { color?: string }) => (
  <CloseIconSvg
    width={moderateScale(24)}
    height={moderateScale(24)}
    stroke={color || 'black'}
  />
);

const UserIcon = ({ color }: { color?: string }) => (
  <UserIconSvg
    width={moderateScale(20)}
    height={moderateScale(20)}
    stroke={color || 'black'}
  />
);

interface ReviewsModalProps {
  visible: boolean;
  onClose: () => void;
  businessId: string;
  businessName: string;
  onFetchReviews: (
    businessId: string,
    params?: { limit?: number; offset?: number },
  ) => Promise<{
    success: boolean;
    data?: any[];
    error?: string;
    pagination?: {
      total: number;
      hasMore: boolean;
      limit: number;
      offset: number;
    };
  }>;
}

const ReviewsModal: React.FC<ReviewsModalProps> = memo(
  ({ visible, onClose, businessId, businessName, onFetchReviews }) => {
    // Hooks must be called unconditionally
    const { width, height } = useWindowDimensions();
    const { colors }: { colors: ThemeColors } = useTheme();
    const { t } = useTranslation();
    const styles = useMemo(
      () => createStyles(width, height, colors),
      [width, height, colors],
    );

    const [reviews, setReviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadReviews = useCallback(
      async (reset = false) => {
        if (reset) {
          setLoading(true);
          setError(null);
        } else {
          if (!hasMore || loadingMore) return;
          setLoadingMore(true);
        }

        try {
          const params = {
            limit: 10,
            offset: reset ? 0 : reviews.length,
          };
          const response = await onFetchReviews(businessId, params);

          if (response.success && response.data) {
            const newReviews = reset
              ? response.data
              : [...reviews, ...response.data];
            setReviews(newReviews);
            setHasMore(response.pagination?.hasMore || false);
          } else {
            setError(response.error || t('failed_to_load_reviews'));
          }
        } catch (err: any) {
          setError(err.message || t('failed_to_load_reviews'));
        } finally {
          setLoading(false);
          setLoadingMore(false);
          setRefreshing(false);
        }
      },
      [businessId, hasMore, loadingMore, onFetchReviews, reviews, t],
    );

    useEffect(() => {
      if (visible && businessId) {
        setReviews([]);
        setError(null);
        setHasMore(true);
        loadReviews(true);
      }
    }, [visible, businessId]);

    const handleRefresh = useCallback(() => {
      setRefreshing(true);
      loadReviews(true);
    }, [loadReviews]);

    const handleLoadMore = useCallback(() => {
      if (hasMore && !loading && !loadingMore) {
        loadReviews(false);
      }
    }, [hasMore, loading, loadingMore, loadReviews]);

    const handleClose = useCallback(() => {
      if (!loading) {
        onClose();
      }
    }, [loading, onClose]);

    const renderStars = useCallback((rating: number) => {
      const stars = [];
      const fullStars = Math.floor(rating);
      const hasHalfStar = rating % 1 !== 0;
      for (let i = 0; i < fullStars; i++) {
        stars.push(
          <StarIcon key={`full-${i}`} color="#FFD700" filled size={14} />,
        );
      }
      if (hasHalfStar) {
        stars.push(<StarIcon key="half" color="#FFD700" filled size={14} />);
      }
      const emptyStars = 5 - Math.ceil(rating);
      for (let i = 0; i < emptyStars; i++) {
        stars.push(
          <StarIcon
            key={`empty-${i}`}
            color="#FFD700"
            filled={false}
            size={14}
          />,
        );
      }
      return stars;
    }, []);

    const formatDate = useCallback(
      (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - date.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          return t('yesterday');
        } else if (diffDays < 7) {
          return t('days_ago', { count: diffDays });
        } else if (diffDays < 30) {
          const weeks = Math.floor(diffDays / 7);
          return t('weeks_ago', { count: weeks });
        } else if (diffDays < 365) {
          const months = Math.floor(diffDays / 30);
          return t('months_ago', { count: months });
        } else {
          return date.toLocaleDateString();
        }
      },
      [t],
    );

    const renderReviewItem = useCallback(
      ({ item }: { item: any }) => (
        <View style={styles.reviewItem}>
          <View style={styles.reviewHeader}>
            <View style={styles.userInfo}>
              <View style={styles.userIconContainer}>
                <UserIcon color={colors.primary} />
              </View>
              <View style={styles.userDetails}>
                <Text style={styles.userName} numberOfLines={1}>
                  {item.user?.name || t('anonymous_user')}
                </Text>
                <Text style={styles.reviewDate}>
                  {formatDate(item.createdAt || new Date().toISOString())}
                </Text>
              </View>
            </View>
            <View style={styles.ratingContainer}>
              <View style={styles.starsRow}>{renderStars(item.rating)}</View>
              <Text style={styles.ratingValue}>{Math.ceil(item.rating)}</Text>
            </View>
          </View>
          {item.comment && (
            <View style={styles.commentContainer}>
              <Text style={styles.commentText}>{item.comment}</Text>
            </View>
          )}
        </View>
      ),
      [colors.primary, formatDate, renderStars, styles, t],
    );

    const renderEmptyState = useCallback(
      () => (
        <View style={styles.emptyContainer}>
          <StarIcon color={colors.onSurfaceVariant} size={48} />
          <Text style={styles.emptyTitle}>{t('no_reviews_yet')}</Text>
          <Text style={styles.emptySubtitle}>
            {t('be_the_first_to_review')}
          </Text>
        </View>
      ),
      [colors.onSurfaceVariant, styles, t],
    );

    const renderFooter = useCallback(() => {
      if (!loadingMore) return null;
      return (
        <View style={styles.loadingFooter}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={styles.loadingText}>{t('loading_more_reviews')}</Text>
        </View>
      );
    }, [loadingMore, colors.primary, styles, t]);

    const averageRating = useMemo(() => {
      if (reviews.length === 0) return 0;
      const total = reviews.reduce(
        (sum, review) => sum + (review.rating || 0),
        0,
      );
      return Math.round((total / reviews.length) * 10) / 10;
    }, [reviews]);

    // guard after Hooks
    if (!businessId) {
      console.log('ReviewsModal: businessId is empty, not rendering');
      return null;
    }

    return (
      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={handleClose}
      >
        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <Pressable style={styles.overlay} onPress={handleClose}>
            <Pressable style={styles.modalContainer} onPress={() => {}}>
              {/* Close Button */}
              <TouchableOpacity
                style={styles.closeButton}
                onPress={handleClose}
                disabled={loading}
              >
                <CloseIcon color={colors.onSurface} />
              </TouchableOpacity>

              {/* Header */}
              <View style={styles.header}>
                <StarIcon
                  color={colors.buttonTextColor || '#FFD700'}
                  filled
                  size={32}
                />
                <Text style={styles.title}>{t('reviews')}</Text>
                <Text style={styles.businessName} numberOfLines={2}>
                  {businessName}
                </Text>

                {reviews.length > 0 && (
                  <View style={styles.averageRatingContainer}>
                    <View style={styles.averageStars}>
                      {renderStars(averageRating)}
                    </View>
                    <Text style={styles.averageRatingText}>
                      {Math.ceil(averageRating)} ({reviews.length}{' '}
                      {t('reviews_count')})
                    </Text>
                  </View>
                )}
              </View>

              {/* Reviews List */}
              <View style={styles.reviewsContainer}>
                {loading && reviews.length === 0 ? (
                  <View style={styles.initialLoadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={styles.loadingText}>
                      {t('loading_reviews')}
                    </Text>
                  </View>
                ) : error ? (
                  <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity
                      style={styles.retryButton}
                      onPress={() => loadReviews(true)}
                    >
                      <Text style={styles.retryButtonText}>{t('retry')}</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <FlatList
                    data={reviews}
                    renderItem={renderReviewItem}
                    keyExtractor={item =>
                      item._id || item.id || Math.random().toString()
                    }
                    showsVerticalScrollIndicator={false}
                    refreshing={refreshing}
                    onRefresh={handleRefresh}
                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.5}
                    ListEmptyComponent={renderEmptyState}
                    ListFooterComponent={renderFooter}
                    contentContainerStyle={[
                      styles.reviewsList,
                      reviews.length === 0 && styles.reviewsListEmpty,
                    ]}
                  />
                )}
              </View>
            </Pressable>
          </Pressable>
        </KeyboardAvoidingView>
      </Modal>
    );
  },
);

const createStyles = (width: number, height: number, colors: ThemeColors) =>
  StyleSheet.create({
    keyboardView: {
      flex: 1,
    },
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: scale(20),
    },
    modalContainer: {
      backgroundColor: colors.modalColor || colors.surface,
      borderRadius: moderateScale(16),
      padding: moderateScale(20),
      maxWidth: width * 0.95,
      width: '100%',
      maxHeight: height * 0.85,
      elevation: 10,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 5,
      },
      shadowOpacity: 0.3,
      shadowRadius: 10,
    },
    closeButton: {
      position: 'absolute',
      top: moderateScale(15),
      right: I18nManager.isRTL ? undefined : moderateScale(15),
      left: I18nManager.isRTL ? moderateScale(15) : undefined,
      padding: moderateScale(5),
      zIndex: 1,
    },
    header: {
      alignItems: 'center',
      marginBottom: verticalScale(20),
      paddingTop: verticalScale(10),
      paddingHorizontal: moderateScale(10),
    },
    title: {
      fontSize: moderateScale(20),
      color: colors.modalText || colors.onSurface,
      textAlign: 'center',
      marginTop: verticalScale(12),
      marginBottom: verticalScale(8),
      fontWeight: '600',
    },
    businessName: {
      fontSize: moderateScale(16),
      color: colors.modalText || colors.onSurface,
      textAlign: 'center',
      opacity: 0.8,
      maxWidth: '90%',
      marginBottom: verticalScale(12),
    },
    averageRatingContainer: {
      alignItems: 'center',
      padding: moderateScale(12),
      backgroundColor: colors.background,
      borderRadius: moderateScale(8),
      borderWidth: 1,
      borderColor: colors.outline + '30',
    },
    averageStars: {
      flexDirection: 'row',
      marginBottom: verticalScale(4),
    },
    averageRatingText: {
      fontSize: moderateScale(14),
      color: colors.modalText || colors.onSurface,
      fontWeight: '500',
    },
    reviewsContainer: {
      flex: 1,
      minHeight: verticalScale(300),
    },
    reviewsList: {
      paddingBottom: verticalScale(10),
    },
    reviewsListEmpty: {
      flexGrow: 1,
      justifyContent: 'center',
    },
    reviewItem: {
      backgroundColor: colors.background,
      borderRadius: moderateScale(12),
      padding: moderateScale(16),
      marginBottom: verticalScale(12),
      borderWidth: 1,
      borderColor: colors.outline + '20',
    },
    reviewHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: verticalScale(12),
    },
    userInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    userIconContainer: {
      width: moderateScale(40),
      height: moderateScale(40),
      borderRadius: moderateScale(20),
      backgroundColor: colors.primary + '15',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: I18nManager.isRTL ? 0 : scale(12),
      marginLeft: I18nManager.isRTL ? scale(12) : 0,
    },
    userDetails: {
      flex: 1,
    },
    userName: {
      fontSize: moderateScale(16),
      fontWeight: '600',
      color: colors.modalText || colors.onSurface,
      marginBottom: verticalScale(2),
      textAlign: I18nManager.isRTL ? 'right' : 'left',
    },
    reviewDate: {
      fontSize: moderateScale(12),
      color: colors.onSurfaceVariant,
      textAlign: I18nManager.isRTL ? 'right' : 'left',
    },
    ratingContainer: {
      alignItems: 'flex-end',
    },
    starsRow: {
      flexDirection: 'row',
      marginBottom: verticalScale(2),
    },
    ratingValue: {
      fontSize: moderateScale(12),
      color: colors.modalText || colors.onSurface,
      fontWeight: '500',
    },
    commentContainer: {
      backgroundColor: colors.surface + '50',
      borderRadius: moderateScale(8),
      padding: moderateScale(12),
      borderLeftWidth: 3,
      borderLeftColor: colors.primary,
    },
    commentText: {
      fontSize: moderateScale(14),
      color: colors.modalText || colors.onSurface,
      lineHeight: verticalScale(20),
      textAlign: I18nManager.isRTL ? 'right' : 'left',
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: verticalScale(40),
    },
    emptyTitle: {
      fontSize: moderateScale(18),
      fontWeight: '600',
      color: colors.modalText || colors.onSurface,
      textAlign: 'center',
      marginTop: verticalScale(16),
      marginBottom: verticalScale(8),
    },
    emptySubtitle: {
      fontSize: moderateScale(14),
      color: colors.onSurfaceVariant,
      textAlign: 'center',
    },
    initialLoadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: verticalScale(40),
    },
    loadingFooter: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: verticalScale(16),
    },
    loadingText: {
      fontSize: moderateScale(14),
      color: colors.onSurfaceVariant,
      marginLeft: I18nManager.isRTL ? 0 : scale(8),
      marginRight: I18nManager.isRTL ? scale(8) : 0,
    },
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: verticalScale(40),
    },
    errorText: {
      fontSize: moderateScale(16),
      color: colors.error,
      textAlign: 'center',
      marginBottom: verticalScale(16),
    },
    retryButton: {
      backgroundColor: colors.buttonColor,
      paddingVertical: verticalScale(12),
      paddingHorizontal: scale(24),
      borderRadius: moderateScale(8),
    },
    retryButtonText: {
      fontSize: moderateScale(14),
      color: colors.buttonTextColor,
      fontWeight: '600',
    },
  });

ReviewsModal.displayName = 'ReviewsModal';
export default ReviewsModal;
