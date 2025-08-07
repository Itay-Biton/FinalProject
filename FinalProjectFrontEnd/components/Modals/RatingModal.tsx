// components/Modals/RatingModal.tsx
import React, { memo, useMemo, useState, useCallback } from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
import { useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { ThemeColors } from '../../types/theme';
import Shake from '../Animations/Shake';

// Icons
import StarIconSvg from '../../assets/icons/ic_star.svg';
import CloseIconSvg from '../../assets/icons/ic_cancel.svg';

const StarIcon = ({
  color,
  filled = false,
  size = 32,
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

interface RatingModalProps {
  visible: boolean;
  onClose: () => void;
  businessId: string;
  businessName: string;
  onSubmit: (
    businessId: string,
    rating: number,
    comment?: string,
  ) => Promise<void>;
  existingRating?: number;
  existingComment?: string;
}

const RatingModal: React.FC<RatingModalProps> = memo(
  ({
    visible,
    onClose,
    businessId,
    businessName,
    onSubmit,
    existingRating = 0,
    existingComment = '',
  }) => {
    const { width, height } = useWindowDimensions();
    const { colors }: { colors: ThemeColors } = useTheme();
    const { t } = useTranslation();
    const styles = useMemo(
      () => createStyles(width, height, colors),
      [width, height, colors],
    );

    const [rating, setRating] = useState(existingRating);
    const [comment, setComment] = useState(existingComment);
    const [submitting, setSubmitting] = useState(false);

    // Reset state when modal becomes visible
    React.useEffect(() => {
      if (visible) {
        setRating(existingRating);
        setComment(existingComment);
        setSubmitting(false);
      }
    }, [visible, existingRating, existingComment]);

    const handleStarPress = useCallback((starRating: number) => {
      setRating(starRating);
    }, []);

    const handleSubmit = useCallback(async () => {
      if (rating === 0) return; // Don't allow submission without rating

      setSubmitting(true);
      try {
        await onSubmit(businessId, rating, comment.trim() || undefined);
        onClose();
      } catch (error) {
        console.error('Error submitting rating:', error);
        // Error handling is done in the parent component
      } finally {
        setSubmitting(false);
      }
    }, [businessId, rating, comment, onSubmit, onClose]);

    const handleClose = useCallback(() => {
      if (!submitting) {
        onClose();
      }
    }, [submitting, onClose]);

    const renderStars = useCallback(() => {
      const stars = [];
      for (let i = 1; i <= 5; i++) {
        stars.push(
          <TouchableOpacity
            key={i}
            onPress={() => handleStarPress(i)}
            style={styles.starButton}
            disabled={submitting}
          >
            <StarIcon
              color={colors.buttonTextColor || '#FFD700'}
              filled={i <= rating}
              size={40}
            />
          </TouchableOpacity>,
        );
      }
      return stars;
    }, [
      rating,
      handleStarPress,
      submitting,
      styles.starButton,
      colors.buttonTextColor,
    ]);

    const getRatingText = useCallback(
      (currentRating: number) => {
        const ratingTexts = {
          1: t('rating_terrible', { defaultValue: 'Terrible' }),
          2: t('rating_poor', { defaultValue: 'Poor' }),
          3: t('rating_average', { defaultValue: 'Average' }),
          4: t('rating_good', { defaultValue: 'Good' }),
          5: t('rating_excellent', { defaultValue: 'Excellent' }),
        };
        return ratingTexts[currentRating as keyof typeof ratingTexts] || '';
      },
      [t],
    );

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
                disabled={submitting}
              >
                <CloseIcon color={colors.onSurface} />
              </TouchableOpacity>

              {/* Header */}
              <View style={styles.header}>
                <Shake visible={visible}>
                  <StarIcon
                    color={colors.buttonTextColor || '#FFD700'}
                    filled
                    size={48}
                  />
                </Shake>
                <Text style={styles.title}>
                  {existingRating > 0 ? t('update_rating') : t('rate_business')}
                </Text>
                <Text style={styles.businessName} numberOfLines={2}>
                  {businessName}
                </Text>
              </View>

              {/* Star Rating */}
              <View style={styles.starsContainer}>
                <View style={styles.starsRow}>{renderStars()}</View>
                {rating > 0 && (
                  <Text style={styles.ratingText}>{getRatingText(rating)}</Text>
                )}
              </View>

              {/* Comment Input */}
              <View style={styles.commentContainer}>
                <Text style={styles.commentLabel}>
                  {t('add_comment_optional')}
                </Text>
                <TextInput
                  style={styles.commentInput}
                  value={comment}
                  onChangeText={setComment}
                  placeholder={t('share_your_experience')}
                  placeholderTextColor={colors.onSurfaceVariant + '80'}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  maxLength={500}
                  editable={!submitting}
                />
                <Text style={styles.characterCount}>{comment.length}/500</Text>
              </View>

              {/* Action Buttons */}
              <View style={styles.buttonsContainer}>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={handleClose}
                  disabled={submitting}
                >
                  <Text style={[styles.buttonText, styles.cancelButtonText]}>
                    {t('cancel')}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.button,
                    styles.submitButton,
                    { backgroundColor: colors.buttonColor },
                    (rating === 0 || submitting) && styles.submitButtonDisabled,
                  ]}
                  onPress={handleSubmit}
                  disabled={rating === 0 || submitting}
                >
                  {submitting ? (
                    <View style={styles.submittingContainer}>
                      <ActivityIndicator
                        size="small"
                        color={colors.buttonTextColor}
                      />
                      <Text
                        style={[
                          styles.buttonText,
                          { color: colors.buttonTextColor },
                        ]}
                      >
                        {t('submitting')}
                      </Text>
                    </View>
                  ) : (
                    <Text
                      style={[
                        styles.buttonText,
                        { color: colors.buttonTextColor },
                      ]}
                    >
                      {existingRating > 0
                        ? t('update_rating')
                        : t('submit_rating')}
                    </Text>
                  )}
                </TouchableOpacity>
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
      maxWidth: width * 0.9,
      width: '100%',
      maxHeight: height * 0.8,
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
      right: moderateScale(15),
      padding: moderateScale(5),
      zIndex: 1,
    },
    header: {
      alignItems: 'center',
      marginBottom: verticalScale(24),
      paddingTop: verticalScale(10),
    },
    title: {
      fontSize: moderateScale(20),
      color: colors.modalText || colors.onSurface,
      textAlign: 'center',
      marginTop: verticalScale(16),
      marginBottom: verticalScale(8),
      fontWeight: '600',
    },
    businessName: {
      fontSize: moderateScale(16),
      color: colors.modalText || colors.onSurface,
      textAlign: 'center',
      opacity: 0.8,
      maxWidth: '90%',
    },
    starsContainer: {
      alignItems: 'center',
      marginBottom: verticalScale(24),
    },
    starsRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: verticalScale(12),
    },
    starButton: {
      padding: moderateScale(8),
      marginHorizontal: moderateScale(2),
    },
    ratingText: {
      fontSize: moderateScale(16),
      color: colors.modalText || colors.onSurface,
      fontWeight: '600',
      textAlign: 'center',
    },
    commentContainer: {
      marginBottom: verticalScale(24),
    },
    commentLabel: {
      fontSize: moderateScale(16),
      color: colors.modalText || colors.onSurface,
      marginBottom: verticalScale(8),
      fontWeight: '500',
    },
    commentInput: {
      borderWidth: 1,
      borderColor: colors.outline,
      borderRadius: moderateScale(8),
      padding: moderateScale(12),
      fontSize: moderateScale(14),
      color: colors.modalText || colors.onSurface,
      backgroundColor: colors.background,
      minHeight: verticalScale(80),
      maxHeight: verticalScale(120),
      textAlignVertical: 'top',
    },
    characterCount: {
      fontSize: moderateScale(12),
      color: colors.onSurfaceVariant,
      textAlign: 'right',
      marginTop: verticalScale(4),
    },
    buttonsContainer: {
      flexDirection: 'row',
      gap: scale(12),
    },
    button: {
      flex: 1,
      paddingVertical: verticalScale(14),
      borderRadius: moderateScale(8),
      alignItems: 'center',
      justifyContent: 'center',
    },
    cancelButton: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.outline,
    },
    submitButton: {
      // backgroundColor set dynamically
    },
    submitButtonDisabled: {
      opacity: 0.6,
    },
    buttonText: {
      fontSize: moderateScale(16),
      fontWeight: '600',
    },
    cancelButtonText: {
      color: colors.modalText || colors.onSurface,
    },
    submittingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
  });

RatingModal.displayName = 'RatingModal';

export default RatingModal;
