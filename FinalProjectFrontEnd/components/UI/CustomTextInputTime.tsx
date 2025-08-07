import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Modal,
} from 'react-native';
import { Text } from 'react-native-paper';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
import { useTranslation } from 'react-i18next';
import DateTimePicker from '@react-native-community/datetimepicker';
import { ThemeColors } from '../../types/theme';
import AlertModal from '../Modals/AlertModal';

// Import TimeIcon
import TimeIconSvg from '../../assets/icons/ic_time.svg';

const TimeIcon = ({ color }: { color?: string }) => (
  <TimeIconSvg
    width={moderateScale(16)}
    height={moderateScale(16)}
    stroke={color || 'black'}
  />
);

interface CustomTextInputTimeProps {
  value: string;
  onChangeText: (time: string) => void;
  placeholder?: string;
  colors: ThemeColors;
  containerStyle?: any;
  leftIconContainerStyle?: any;
  iconColor?: string;
  disabled?: boolean;
  minTime?: Date;
  maxTime?: Date;
  is24Hour?: boolean;
}

const CustomTextInputTime: React.FC<CustomTextInputTimeProps> = ({
  value,
  onChangeText,
  placeholder = 'Select time',
  colors,
  containerStyle,
  leftIconContainerStyle,
  iconColor = colors.onSurfaceVariant,
  disabled = false,
  minTime,
  maxTime,
  is24Hour = false, // Default to 12-hour format for better UX
}) => {
  const { t, i18n } = useTranslation();
  const [showPicker, setShowPicker] = useState(false);
  const [alertModal, setAlertModal] = useState({
    visible: false,
    title: '',
    message: '',
  });
  const [pickerDate, setPickerDate] = useState<Date>(() => {
    // Parse the time string into a Date object
    if (value) {
      const [hours, minutes] = value.split(':').map(Number);
      const date = new Date();
      date.setHours(hours, minutes, 0, 0);
      return date;
    }
    return new Date();
  });

  const styles = useMemo(() => createStyles(colors), [colors]);

  // Format time for display (12-hour format with Hebrew AM/PM or English)
  const formatDisplayTime = useCallback(
    (timeString: string) => {
      if (!timeString) return '';

      const [hours, minutes] = timeString.split(':').map(Number);
      if (is24Hour) {
        return `${hours.toString().padStart(2, '0')}:${minutes
          .toString()
          .padStart(2, '0')}`;
      } else {
        const hour12 = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;

        // Use Hebrew translations for Hebrew language
        if (i18n.language === 'he') {
          const period = hours >= 12 ? t('evening') : t('morning'); // ערב / בוקר
          return `${hour12}:${minutes.toString().padStart(2, '0')} ${period}`;
        } else {
          const period = hours >= 12 ? 'PM' : 'AM';
          return `${hour12}:${minutes.toString().padStart(2, '0')} ${period}`;
        }
      }
    },
    [is24Hour, i18n.language, t],
  );

  // Format time to HH:MM format for storage
  const formatTimeForStorage = useCallback((date: Date) => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }, []);

  const handleTimeChange = useCallback(
    (event: any, selectedDate?: Date) => {
      if (Platform.OS === 'android') {
        setShowPicker(false);
      }

      if (selectedDate) {
        // Check time constraints
        if (minTime && selectedDate < minTime) {
          setAlertModal({
            visible: true,
            title: t('invalid_time'),
            message: t('time_too_early'),
          });
          return;
        }
        if (maxTime && selectedDate > maxTime) {
          setAlertModal({
            visible: true,
            title: t('invalid_time'),
            message: t('time_too_late'),
          });
          return;
        }

        setPickerDate(selectedDate);
        const timeString = formatTimeForStorage(selectedDate);
        onChangeText(timeString);
      }
    },
    [onChangeText, minTime, maxTime, t, formatTimeForStorage],
  );

  const handlePress = useCallback(() => {
    if (disabled) return;
    setShowPicker(true);
  }, [disabled]);

  const handleIOSConfirm = useCallback(() => {
    setShowPicker(false);
    const timeString = formatTimeForStorage(pickerDate);
    onChangeText(timeString);
  }, [pickerDate, onChangeText, formatTimeForStorage]);

  const handleIOSCancel = useCallback(() => {
    setShowPicker(false);
    // Reset to original value
    if (value) {
      const [hours, minutes] = value.split(':').map(Number);
      const date = new Date();
      date.setHours(hours, minutes, 0, 0);
      setPickerDate(date);
    }
  }, [value]);

  const closeAlert = useCallback(() => {
    setAlertModal(prev => ({ ...prev, visible: false }));
  }, []);

  const renderIOSPicker = () => (
    <Modal
      visible={showPicker}
      transparent={true}
      animationType="slide"
      onRequestClose={handleIOSCancel}
    >
      <View style={styles.modalOverlay}>
        <View
          style={[styles.modalContent, { backgroundColor: colors.background }]}
        >
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={handleIOSCancel}
              style={styles.modalButton}
            >
              <Text
                style={[styles.modalButtonText, { color: colors.onSurface }]}
              >
                {t('cancel')}
              </Text>
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.primary }]}>
              {t('select_time')}
            </Text>
            <TouchableOpacity
              onPress={handleIOSConfirm}
              style={styles.modalButton}
            >
              <Text
                style={[styles.modalButtonText, { color: colors.buttonColor }]}
              >
                {t('confirm')}
              </Text>
            </TouchableOpacity>
          </View>
          <DateTimePicker
            value={pickerDate}
            mode="time"
            display="spinner"
            onChange={(event, date) => {
              if (date) setPickerDate(date);
            }}
            is24Hour={is24Hour}
            minuteInterval={1}
            style={[styles.picker, { backgroundColor: colors.background }]}
            textColor={colors.buttonColor} // Clock hands/מחוגים color
            accentColor={colors.buttonColor} // Accent color for selection
          />
        </View>
      </View>
    </Modal>
  );

  const renderAndroidPicker = () => {
    if (!showPicker) return null;

    return (
      <DateTimePicker
        value={pickerDate}
        mode="time"
        display="default"
        onChange={handleTimeChange}
        is24Hour={is24Hour}
        minuteInterval={1}
        accentColor={colors.buttonColor} // Clock hands/מחוגים color
      />
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.inputContainer,
          containerStyle, // Apply external container styles
          disabled && styles.disabledContainer,
          { backgroundColor: colors.background }, // Set background color
        ]}
        onPress={handlePress}
        disabled={disabled}
        activeOpacity={0.7}
      >
        <View style={[styles.iconContainer, leftIconContainerStyle]}>
          <TimeIcon color={iconColor} />
        </View>

        <View style={styles.textContainer}>
          <Text
            style={[
              styles.inputText,
              !value && styles.placeholderText,
              disabled && styles.disabledText,
              { color: value ? colors.onSurface : colors.onSurfaceVariant },
            ]}
          >
            {value ? formatDisplayTime(value) : placeholder}
          </Text>
        </View>
      </TouchableOpacity>

      {Platform.OS === 'ios' ? renderIOSPicker() : renderAndroidPicker()}

      <AlertModal
        visible={alertModal.visible}
        onClose={closeAlert}
        title={alertModal.title}
        message={alertModal.message}
        icon="error"
        buttons={[
          {
            text: t('confirm'),
            onPress: closeAlert,
            style: 'default',
          },
        ]}
      />
    </View>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      width: '100%',
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: verticalScale(12),
      paddingHorizontal: scale(12),
      borderRadius: moderateScale(4),
      borderWidth: 1,
      borderColor: colors.outline,
      height: verticalScale(52), // Use fixed height instead of minHeight
    },
    disabledContainer: {
      opacity: 0.6,
    },
    iconContainer: {
      width: moderateScale(20),
      height: moderateScale(20),
      marginRight: scale(8),
      justifyContent: 'center',
      alignItems: 'center',
    },
    textContainer: {
      flex: 1,
      justifyContent: 'center',
    },
    inputText: {
      fontSize: moderateScale(14),
      fontWeight: '500',
      includeFontPadding: false,
      textAlignVertical: 'center',
    },
    placeholderText: {
      fontStyle: 'italic',
    },
    disabledText: {
      opacity: 0.6,
    },

    // iOS Modal Styles
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    },
    modalContent: {
      borderTopLeftRadius: moderateScale(16),
      borderTopRightRadius: moderateScale(16),
      paddingBottom: verticalScale(Platform.OS === 'ios' ? 34 : 16),
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: scale(16),
      paddingVertical: verticalScale(16),
      borderBottomWidth: 1,
      borderBottomColor: colors.outline + '30',
    },
    modalButton: {
      minWidth: scale(60),
      alignItems: 'center',
    },
    modalButtonText: {
      fontSize: moderateScale(16),
      fontWeight: '600',
    },
    modalTitle: {
      fontSize: moderateScale(18),
      fontWeight: '600',
    },
    picker: {
      marginHorizontal: scale(16),
    },
  });

export default CustomTextInputTime;
