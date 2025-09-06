// components/Modals/ReviewsModal.tsx
import React, { memo, useMemo, useCallback, useRef, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  TextInput,
  SafeAreaView,
} from 'react-native';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
import { useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { ThemeColors } from '../../types/theme';
import { Review } from '../../types/business';
import { useReviewsModalViewModel } from '../../viewModels/useReviewsModalViewModel';

// Icons
import StarIconSvg from '../../assets/icons/ic_star.svg';
import CloseIconSvg from '../../assets/icons/ic_cancel.svg';
import UserIconSvg from '../../assets/icons/ic_user.svg';

const StarIcon = ({
  color,
  filled = false,
  size = 18,
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

// Half-star renderer for display rows
const StarsDisplay = ({ rating }: { rating: number }) => {
  const size = 14;
  const color = '#FFD700';
  const rounded = Math.max(0, Math.min(5, Math.round(rating * 2) / 2));
  const full = Math.floor(rounded);
  const half = rounded - full >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;

  return (
    <View style={{ flexDirection: 'row' }}>
      {Array.from({ length: full }).map((_, i) => (
        <StarIcon key={`f-${i}`} size={size} color={color} filled />
      ))}
      {half === 1 ? (
        <StarIcon key="half" size={size} color={color} filled />
      ) : null}
      {Array.from({ length: empty }).map((_, i) => (
        <StarIcon key={`e-${i}`} size={size} color={color} filled={false} />
      ))}
    </View>
  );
};

// Interactive star picker for composer
const StarsPicker = ({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) => {
  const color = '#FFD700';
  return (
    <View style={{ flexDirection: 'row' }}>
      {Array.from({ length: 5 }).map((_, i) => {
        const idx = i + 1;
        return (
          <TouchableOpacity
            key={idx}
            onPress={() => onChange(idx)}
            activeOpacity={0.7}
            style={{ marginRight: 4 }}
          >
            <StarIcon size={20} color={color} filled={value >= idx} />
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

interface ReviewsModalProps {
  visible: boolean;
  onClose: () => void;
  businessId: string;
  businessName: string;
}

const ReviewsModal: React.FC<ReviewsModalProps> = memo(
  ({ visible, onClose, businessId, businessName }) => {
    const { width, height } = useWindowDimensions();
    const { colors }: { colors: ThemeColors } = useTheme();
    const { t } = useTranslation();
    const styles = useMemo(
      () => createStyles(width, height, colors),
      [width, height, colors],
    );

    const vm = useReviewsModalViewModel(businessId);
    const listRef = useRef<FlatList<Review>>(null);

    const [draftText, setDraftText] = useState('');
    const [draftRating, setDraftRating] = useState(0);

    const close = useCallback(() => {
      if (!vm.loading && !vm.posting) onClose();
    }, [vm.loading, vm.posting, onClose]);

    const submit = useCallback(async () => {
      if (!draftRating) return;
      const res = await vm.submitReview(
        draftRating,
        draftText.trim() || undefined,
      );
      if (res.success) {
        setDraftText('');
        setDraftRating(0);
        // scroll to top to show the new review
        setTimeout(
          () =>
            listRef.current?.scrollToOffset?.({ animated: true, offset: 0 }),
          50,
        );
      }
    }, [vm, draftRating, draftText]);

    const renderItem = useCallback(
      ({ item }: { item: Review }) => (
        <View style={styles.reviewItem}>
          <View style={styles.reviewHeader}>
            <View style={styles.userInfo}>
              <View style={styles.userIconContainer}>
                <UserIcon color={colors.primary} />
              </View>
              <View style={styles.userDetails}>
                <Text style={styles.userName} numberOfLines={1}>
                  {`${item.userId?.firstName || ''} ${
                    item.userId?.lastName || ''
                  }`.trim() || t('anonymous_user')}
                </Text>
                <Text style={styles.reviewDate}>
                  {new Date(item.createdAt).toLocaleDateString()}
                </Text>
              </View>
            </View>
            <View style={styles.ratingContainer}>
              <StarsDisplay rating={item.rating} />
              <Text style={styles.ratingValue}>{item.rating.toFixed(1)}</Text>
            </View>
          </View>
          {!!item.comment && (
            <View style={styles.commentContainer}>
              <Text style={styles.commentText}>{item.comment}</Text>
            </View>
          )}
        </View>
      ),
      [colors.primary, styles, t],
    );

    return (
      <Modal
        visible={visible}
        transparent={false}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={close}
      >
        <SafeAreaView style={styles.safe}>
          {/* HEADER BAR */}
          <View style={styles.topBar}>
            <TouchableOpacity
              onPress={close}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <CloseIcon color={colors.onSurface} />
            </TouchableOpacity>

            <View style={styles.topBarCenter}>
              <Text style={styles.title}>{t('reviews')}</Text>
              <Text style={styles.businessName} numberOfLines={1}>
                {businessName}
              </Text>
            </View>

            {/* Right summary */}
            <View style={styles.summaryBox}>
              <StarsDisplay rating={vm.averageRating} />
              <Text style={styles.summaryText}>
                {vm.averageRating.toFixed(1)} • {vm.totalCount}
              </Text>
            </View>
          </View>

          {/* LIST */}
          <FlatList
            ref={listRef}
            style={styles.list}
            contentContainerStyle={[
              styles.listContent,
              vm.reviews.length === 0 && styles.listContentEmpty,
            ]}
            data={vm.reviews}
            keyExtractor={it => it._id}
            renderItem={renderItem}
            refreshing={vm.refreshing}
            onRefresh={vm.refresh}
            onEndReached={vm.loadMore}
            onEndReachedThreshold={0.5}
            ListEmptyComponent={
              vm.loading ? (
                <View style={styles.centerBox}>
                  <ActivityIndicator size="large" color={colors.primary} />
                  <Text style={styles.loadingText}>{t('loading_reviews')}</Text>
                </View>
              ) : (
                <View style={styles.centerBox}>
                  <StarIcon size={48} color={colors.onSurfaceVariant} />
                  <Text style={styles.emptyTitle}>{t('no_reviews_yet')}</Text>
                  <Text style={styles.emptySubtitle}>
                    {t('be_the_first_to_review')}
                  </Text>
                </View>
              )
            }
            ListFooterComponent={
              vm.loadingMore ? (
                <View style={styles.footerLoading}>
                  <ActivityIndicator size="small" color={colors.primary} />
                  <Text style={styles.loadingText}>
                    {t('loading_more_reviews')}
                  </Text>
                </View>
              ) : null
            }
          />

          {/* FOOTER COMPOSER */}
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
          >
            <View style={styles.composer}>
              <View style={styles.ratingPickerRow}>
                <Text style={styles.composerLabel}>{t('your_rating')}</Text>
                <StarsPicker value={draftRating} onChange={setDraftRating} />
              </View>
              <View style={styles.inputRow}>
                <TextInput
                  style={styles.input}
                  placeholder={t('write_a_review')}
                  placeholderTextColor={colors.onSurfaceVariant}
                  multiline
                  value={draftText}
                  onChangeText={setDraftText}
                  maxLength={600}
                />
                <TouchableOpacity
                  style={[
                    styles.sendBtn,
                    (!draftRating || vm.posting) && styles.sendBtnDisabled,
                  ]}
                  onPress={submit}
                  disabled={!draftRating || vm.posting}
                >
                  {vm.posting ? (
                    <ActivityIndicator
                      size="small"
                      color={colors.buttonTextColor}
                    />
                  ) : (
                    <Text style={styles.sendBtnText}>{t('send')}</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
    );
  },
);

const createStyles = (width: number, height: number, colors: ThemeColors) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.modalColor || colors.surface },

    // Top bar
    topBar: {
      height: verticalScale(56),
      paddingHorizontal: scale(16),
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.outline + '40',
    },
    topBarCenter: { alignItems: 'center', flex: 1 },
    title: {
      fontSize: moderateScale(18),
      fontWeight: '700',
      color: colors.onSurface,
    },
    businessName: {
      fontSize: moderateScale(12),
      color: colors.onSurfaceVariant,
      marginTop: verticalScale(2),
    },
    summaryBox: { alignItems: 'flex-end', minWidth: scale(60) },
    summaryText: {
      fontSize: moderateScale(12),
      color: colors.onSurfaceVariant,
      marginTop: verticalScale(2),
    },

    // List
    list: { flex: 1 },
    listContent: { padding: scale(16), paddingBottom: verticalScale(120) },
    listContentEmpty: {
      flexGrow: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    centerBox: { alignItems: 'center', justifyContent: 'center' },
    loadingText: {
      marginTop: verticalScale(8),
      color: colors.onSurfaceVariant,
    },
    emptyTitle: {
      marginTop: verticalScale(12),
      fontSize: moderateScale(16),
      fontWeight: '600',
      color: colors.onSurface,
    },
    emptySubtitle: {
      marginTop: verticalScale(4),
      fontSize: moderateScale(13),
      color: colors.onSurfaceVariant,
    },

    // Review item
    reviewItem: {
      backgroundColor: colors.background,
      borderRadius: moderateScale(12),
      padding: moderateScale(14),
      marginBottom: verticalScale(12),
      borderWidth: 1,
      borderColor: colors.outline + '20',
    },
    reviewHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: verticalScale(8),
    },
    userInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    userIconContainer: {
      width: moderateScale(36),
      height: moderateScale(36),
      borderRadius: moderateScale(18),
      backgroundColor: colors.primary + '15',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: scale(10),
    },
    userDetails: { flex: 1 },
    userName: {
      fontSize: moderateScale(14),
      fontWeight: '600',
      color: colors.onSurface,
    },
    reviewDate: {
      fontSize: moderateScale(12),
      color: colors.onSurfaceVariant,
      marginTop: verticalScale(2),
    },
    ratingContainer: { alignItems: 'flex-end', marginLeft: scale(8) },
    ratingValue: {
      fontSize: moderateScale(12),
      color: colors.onSurfaceVariant,
      marginTop: verticalScale(2),
    },
    commentContainer: {
      backgroundColor: colors.surface + '50',
      borderRadius: moderateScale(8),
      padding: moderateScale(10),
      borderLeftWidth: 3,
      borderLeftColor: colors.primary,
    },
    commentText: {
      fontSize: moderateScale(14),
      color: colors.onSurface,
      lineHeight: verticalScale(20),
    },

    footerLoading: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: verticalScale(12),
    },

    // Composer
    composer: {
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.outline + '40',
      backgroundColor: colors.modalColor || colors.surface,
      paddingHorizontal: scale(12),
      paddingTop: verticalScale(8),
      paddingBottom: verticalScale(12),
    },
    ratingPickerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: verticalScale(8),
    },
    composerLabel: { fontSize: moderateScale(13), color: colors.onSurface },
    inputRow: { flexDirection: 'row', alignItems: 'flex-end' },
    input: {
      flex: 1,
      minHeight: verticalScale(40),
      maxHeight: verticalScale(110),
      borderWidth: 1,
      borderColor: colors.outline + '40',
      borderRadius: moderateScale(10),
      paddingHorizontal: scale(10),
      paddingVertical: verticalScale(8),
      color: colors.onSurface,
      backgroundColor: colors.background,
    },
    sendBtn: {
      marginLeft: scale(8),
      paddingHorizontal: scale(16),
      paddingVertical: verticalScale(10),
      borderRadius: moderateScale(10),
      backgroundColor: colors.buttonColor,
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: scale(72),
    },
    sendBtnDisabled: {
      opacity: 0.6,
    },
    sendBtnText: {
      color: colors.buttonTextColor,
      fontWeight: '700',
      fontSize: moderateScale(14),
    },
  });

ReviewsModal.displayName = 'ReviewsModal';
export default ReviewsModal;
