import React, { memo, useMemo } from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  ScrollView,
} from 'react-native';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
import { useTheme } from 'react-native-paper';
import { ThemeColors } from '../../types/theme';

// Icons
import CloseIconSvg from '../../assets/icons/ic_cancel.svg';
import LocationIconSvg from '../../assets/icons/ic_location.svg';
import CalendarIconSvg from '../../assets/icons/ic_calendar.svg';

const CloseIcon = ({ color }: { color?: string }) => (
  <CloseIconSvg
    width={moderateScale(18)}
    height={moderateScale(18)}
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
const CalendarIcon = ({ color }: { color?: string }) => (
  <CalendarIconSvg
    width={moderateScale(16)}
    height={moderateScale(16)}
    stroke={color || 'black'}
  />
);

type LostDetails = {
  dateLost?: string;
  lastSeen?: { address?: string; coordinates?: [number, number] };
  notes?: string;
};

type FoundDetails = {
  dateFound?: string;
  location?: { address?: string; coordinates?: [number, number] };
  notes?: string;
};

type LostFoundDetailsModalProps = {
  visible: boolean;
  onClose: () => void;
  mode: 'lost' | 'found';
  petName: string;
  lostDetails?: LostDetails;
  foundDetails?: FoundDetails;
};

const formatDate = (iso?: string) => {
  if (!iso) return '';
  const d = new Date(iso);
  return isNaN(d.getTime()) ? iso : d.toLocaleDateString();
};

const LostFoundDetailsModal: React.FC<LostFoundDetailsModalProps> = memo(
  ({ visible, onClose, mode, petName, lostDetails, foundDetails }) => {
    const { width } = useWindowDimensions();
    const { colors }: { colors: ThemeColors } = useTheme();
    const styles = useMemo(() => createStyles(width, colors), [width, colors]);

    const isLost = mode === 'lost';
    const primary = isLost ? '#FF5722' : '#4CAF50';

    const date = isLost
      ? formatDate(lostDetails?.dateLost)
      : formatDate(foundDetails?.dateFound);
    const address = isLost
      ? lostDetails?.lastSeen?.address
      : foundDetails?.location?.address;
    const notes = isLost ? lostDetails?.notes : foundDetails?.notes;

    return (
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={onClose}
      >
        <View style={styles.overlay}>
          <View style={styles.modal}>
            {/* Header */}
            <View style={styles.header}>
              <View
                style={[
                  styles.badge,
                  { backgroundColor: primary + '20', borderColor: primary },
                ]}
              >
                <Text style={[styles.badgeText, { color: primary }]}>
                  {isLost ? 'LOST' : 'FOUND'}
                </Text>
              </View>
              <Pressable onPress={onClose} hitSlop={8} style={styles.closeBtn}>
                <CloseIcon color={colors.modalText} />
              </Pressable>
            </View>

            {/* Title */}
            <Text style={styles.title}>{petName}</Text>

            <ScrollView contentContainerStyle={styles.content}>
              {/* Date */}
              {!!date && (
                <View style={styles.row}>
                  <CalendarIcon color={colors.primary} />
                  <Text style={styles.rowText}>
                    {isLost ? 'Date Lost:' : 'Date Found:'} {date}
                  </Text>
                </View>
              )}

              {/* Address */}
              {!!address && (
                <View style={styles.row}>
                  <LocationIcon color={colors.primary} />
                  <Text style={styles.rowText}>{address}</Text>
                </View>
              )}

              {/* Notes */}
              {!!notes && (
                <View style={styles.notesBox}>
                  <Text style={styles.notesTitle}>Notes</Text>
                  <Text style={styles.notesText}>{notes}</Text>
                </View>
              )}
            </ScrollView>

            {/* Footer */}
            <Pressable
              style={[styles.okBtn, { backgroundColor: colors.buttonColor }]}
              onPress={onClose}
            >
              <Text
                style={[styles.okBtnText, { color: colors.buttonTextColor }]}
              >
                OK
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    );
  },
);

const createStyles = (width: number, colors: ThemeColors) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      alignItems: 'center',
      justifyContent: 'center',
      padding: scale(16),
    },
    modal: {
      width: Math.min(420, width * 0.92),
      backgroundColor: colors.modalColor,
      borderRadius: moderateScale(16),
      padding: scale(16),
      borderWidth: 1,
      borderColor: colors.outline + '30',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: verticalScale(8),
    },
    badge: {
      borderRadius: moderateScale(12),
      paddingHorizontal: scale(8),
      paddingVertical: verticalScale(4),
      borderWidth: 1,
    },
    badgeText: {
      fontWeight: '700',
      fontSize: moderateScale(12),
      letterSpacing: 0.8,
    },
    closeBtn: {
      padding: scale(6),
      borderRadius: moderateScale(8),
    },
    title: {
      fontSize: moderateScale(18),
      fontWeight: '700',
      color: colors.modalText,
      marginBottom: verticalScale(10),
    },
    content: {
      paddingVertical: verticalScale(4),
      gap: verticalScale(10),
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: scale(8),
    },
    rowText: {
      color: colors.modalText,
      fontSize: moderateScale(14),
      flex: 1,
    },
    notesBox: {
      backgroundColor: colors.surface,
      borderRadius: moderateScale(12),
      borderWidth: 1,
      borderColor: colors.outline + '30',
      padding: scale(12),
    },
    notesTitle: {
      fontWeight: '700',
      color: colors.modalText,
      marginBottom: verticalScale(6),
    },
    notesText: {
      color: colors.modalText,
      opacity: 0.9,
      lineHeight: verticalScale(18),
    },
    okBtn: {
      marginTop: verticalScale(14),
      paddingVertical: verticalScale(10),
      borderRadius: moderateScale(10),
      alignItems: 'center',
    },
    okBtnText: {
      fontSize: moderateScale(16),
      fontWeight: '700',
    },
  });

export default LostFoundDetailsModal;
