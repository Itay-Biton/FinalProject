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
import { useTranslation } from 'react-i18next';
import { ThemeColors } from '../../types/theme';

// Icons (replace with your actual SVG files)
import CloseIconSvg from '../../assets/icons/ic_cancel.svg';
import CalendarIconSvg from '../../assets/icons/ic_calendar.svg';
import LocationIconSvg from '../../assets/icons/ic_location.svg';
import NoteIconSvg from '../../assets/icons/ic_note.svg';

type DetailsKind = 'lost' | 'found';

export type PetDetailsModalProps = {
  visible: boolean;
  onClose: () => void;
  kind: DetailsKind; // 'lost' or 'found'
  // Raw data
  date?: string; // ISO string
  address?: string;
  coordinates?: [number, number]; // [lng,lat]
  notes?: string;
  title?: string; // optional override title
};

const CalendarIcon = ({ color }: { color?: string }) => (
  <CalendarIconSvg
    width={moderateScale(18)}
    height={moderateScale(18)}
    stroke={color || 'black'}
  />
);

const LocationIcon = ({ color }: { color?: string }) => (
  <LocationIconSvg
    width={moderateScale(18)}
    height={moderateScale(18)}
    stroke={color || 'black'}
  />
);

const NoteIcon = ({ color }: { color?: string }) => (
  <NoteIconSvg
    width={moderateScale(18)}
    height={moderateScale(18)}
    stroke={color || 'black'}
  />
);

const CloseIcon = ({ color }: { color?: string }) => (
  <CloseIconSvg
    width={moderateScale(20)}
    height={moderateScale(20)}
    stroke={color || 'black'}
  />
);

const PetDetailsModal: React.FC<PetDetailsModalProps> = memo(
  ({ visible, onClose, kind, date, address, coordinates, notes }) => {
    const { width, height } = useWindowDimensions();
    const { colors }: { colors: ThemeColors } = useTheme();
    const { t } = useTranslation();
    const styles = useMemo(
      () => createStyles(width, height, colors),
      [width, height, colors],
    );

    const isLost = kind === 'lost';

    // i18n titles/labels (flat keys)
    const headerText = isLost
      ? t('pet_details_lost_title')
      : t('pet_details_found_title');
    const dateLabel = isLost
      ? t('pet_details_date_lost')
      : t('pet_details_date_found');
    const locationLabel = t('pet_details_location');
    const notesLabel = t('pet_details_notes');
    const closeText = t('pet_details_close');

    const prettyDate = date ? new Date(date).toLocaleDateString() : '—';

    const prettyCoords =
      Array.isArray(coordinates) && coordinates.length === 2
        ? `${coordinates[1]}, ${coordinates[0]}`
        : '—';

    return (
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={onClose}
      >
        <View style={styles.overlay}>
          <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.headerTitle}>{headerText}</Text>
              <Pressable style={styles.closeBtn} onPress={onClose}>
                <CloseIcon color={colors.modalText} />
              </Pressable>
            </View>

            {/* Body */}
            <ScrollView
              style={styles.body}
              contentContainerStyle={styles.bodyContent}
            >
              {/* Date */}
              <View style={styles.row}>
                <View style={styles.rowIconWrap}>
                  <CalendarIcon color={colors.primary} />
                </View>
                <View style={styles.rowTextWrap}>
                  <Text style={styles.rowLabel}>{dateLabel}</Text>
                  <Text style={styles.rowValue}>{prettyDate}</Text>
                </View>
              </View>

              {/* Location */}
              <View style={styles.row}>
                <View style={styles.rowIconWrap}>
                  <LocationIcon color={colors.primary} />
                </View>
                <View style={styles.rowTextWrap}>
                  <Text style={styles.rowLabel}>{locationLabel}</Text>
                  <Text style={styles.rowValue}>{address || '—'}</Text>
                  <Text style={styles.rowSubValue}>{prettyCoords}</Text>
                </View>
              </View>

              {/* Notes */}
              <View style={styles.row}>
                <View style={styles.rowIconWrap}>
                  <NoteIcon color={colors.primary} />
                </View>
                <View style={styles.rowTextWrap}>
                  <Text style={styles.rowLabel}>{notesLabel}</Text>
                  <Text style={styles.rowValue}>{notes || '—'}</Text>
                </View>
              </View>
            </ScrollView>

            {/* Footer */}
            <View style={styles.footer}>
              <Pressable style={styles.footerBtn} onPress={onClose}>
                <Text style={styles.footerBtnText}>{closeText}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    );
  },
);

const createStyles = (width: number, height: number, colors: ThemeColors) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: scale(18),
    },
    container: {
      width: '100%',
      maxWidth: width * 0.9,
      backgroundColor: colors.modalColor,
      borderRadius: moderateScale(16),
      borderWidth: 1,
      borderColor: colors.outline + '30',
      overflow: 'hidden',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: verticalScale(14),
      paddingHorizontal: scale(16),
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.outline + '20',
    },
    headerTitle: {
      flex: 1,
      color: colors.modalText,
      fontSize: moderateScale(18),
      fontWeight: '700',
    },
    closeBtn: {
      width: moderateScale(32),
      height: moderateScale(32),
      borderRadius: moderateScale(8),
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.outline + '30',
    },
    body: { maxHeight: height * 0.55, backgroundColor: colors.modalColor },
    bodyContent: { padding: scale(16) },
    row: {
      flexDirection: 'row',
      padding: scale(12),
      backgroundColor: colors.surface,
      borderRadius: moderateScale(12),
      borderWidth: 1,
      borderColor: colors.outline + '20',
      marginBottom: verticalScale(12),
    },
    rowIconWrap: {
      width: moderateScale(28),
      height: moderateScale(28),
      borderRadius: moderateScale(6),
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.outline + '30',
      marginRight: scale(10),
    },
    rowTextWrap: { flex: 1 },
    rowLabel: { fontSize: moderateScale(12), color: colors.onSurfaceVariant },
    rowValue: {
      marginTop: verticalScale(2),
      color: colors.modalText,
      fontSize: moderateScale(15),
      fontWeight: '600',
    },
    rowSubValue: {
      marginTop: verticalScale(2),
      color: colors.onSurfaceVariant,
      fontSize: moderateScale(12),
    },
    footer: {
      padding: scale(12),
      borderTopWidth: 1,
      borderTopColor: colors.outline + '20',
      backgroundColor: colors.surface,
    },
    footerBtn: {
      width: '100%',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: verticalScale(12),
      backgroundColor: colors.buttonColor,
      borderRadius: moderateScale(10),
    },
    footerBtnText: {
      color: colors.buttonTextColor,
      fontSize: moderateScale(16),
      fontWeight: '700',
    },
  });

export default PetDetailsModal;
