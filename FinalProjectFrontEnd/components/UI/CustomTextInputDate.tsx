import React, { useState } from 'react';
import { View, StyleSheet, Pressable, ViewStyle } from 'react-native';
import DateTimePicker, {
  DateType,
  useDefaultStyles,
} from 'react-native-ui-datepicker';
import { moderateScale, verticalScale } from 'react-native-size-matters';
import { ThemeColors } from '../../types/theme';
import CustomInputText from './CustomInputText';
import CalendarIconSvg from '../../assets/icons/ic_calendar.svg';

const CalendarIcon = ({ color }: { color?: string }) => (
  <CalendarIconSvg
    width={moderateScale(20)}
    height={moderateScale(20)}
    stroke={color || 'black'}
  />
);

interface CustomTextInputDateProps {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  leftIcon?: React.ComponentType<{ color?: string }>;
  containerStyle?: ViewStyle;
  leftIconContainerStyle?: ViewStyle;
  rightIconContainerStyle?: ViewStyle;
  iconColor?: string;
  colors: ThemeColors;
  maxDate?: Date;
  minDate?: Date;
  /** Font size (dp) for every label in the calendar */
  fontSize?: number;
}

const CustomTextInputDate: React.FC<CustomTextInputDateProps> = ({
  placeholder,
  value,
  onChangeText,
  leftIcon: LeftIcon,
  containerStyle,
  leftIconContainerStyle,
  rightIconContainerStyle,
  iconColor,
  colors,
  maxDate,
  minDate,
  fontSize = 14, // default if not provided
}) => {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const defaultDatePickerStyles = useDefaultStyles();
  const styles = createStyles(colors);

  const scaledFont = moderateScale(fontSize);

  const formatDate = (date: Date): string => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const parseDate = (dateString: string): Date => {
    if (!dateString) return new Date();
    const [day, month, year] = dateString.split('/').map(Number);
    return new Date(year, month - 1, day);
  };

  const handleDateChange = (date: DateType) => {
    setShowDatePicker(false);
    if (date) {
      const selectedDate =
        typeof date === 'number' || typeof date === 'string'
          ? new Date(date)
          : date instanceof Date
          ? date
          : (date as any).toDate(); // Dayjs fallback

      if (!isNaN(selectedDate.getTime())) {
        onChangeText(formatDate(selectedDate));
      }
    }
  };

  return (
    <View>
      <Pressable onPress={() => setShowDatePicker(true)}>
        <CustomInputText
          placeholder={placeholder}
          value={value}
          editable={false}
          leftIcon={LeftIcon}
          rightIcon={CalendarIcon}
          containerStyle={containerStyle}
          leftIconContainerStyle={leftIconContainerStyle}
          rightIconContainerStyle={rightIconContainerStyle}
          iconColor={iconColor}
        />
      </Pressable>

      {showDatePicker && (
        <View style={styles.datePickerContainer}>
          <DateTimePicker
            mode="single"
            date={value ? parseDate(value) : new Date()}
            onChange={({ date }) => handleDateChange(date)}
            maxDate={maxDate || new Date()}
            minDate={minDate}
            locale="en_GB"
            style={styles.datePicker}
            styles={{
              ...defaultDatePickerStyles,
              /* ---------- custom overrides ---------- */
              header: {
                backgroundColor: colors.buttonColor,
                borderBottomWidth: 1,
                borderBottomColor: colors.outline,
                fontSize: scaledFont,
              },
              today: {
                borderColor: colors.background,
                borderWidth: 1,
              },
              selected: {
                backgroundColor: colors.buttonColor,
                borderRadius: moderateScale(8),
              },
              /* --- apply uniform font size --- */
              selected_label: {
                color: colors.buttonTextColor,
                fontSize: scaledFont,
              },
              selected_year: {
                backgroundColor: colors.buttonColor,
                color: colors.buttonTextColor,
                fontSize: scaledFont,
              },
              day: { color: colors.onSurface, fontSize: scaledFont },
              day_label: { color: colors.onSurface, fontSize: scaledFont },
              month_label: { color: colors.onSurface, fontSize: scaledFont },
              year_label: { color: colors.onSurface, fontSize: scaledFont },
              weekdays: { fontSize: scaledFont },
              weekday_label: { color: colors.onSurface, fontSize: scaledFont },
              time_label: { fontSize: scaledFont },
              today_label: { fontSize: scaledFont },
              outside_label: { fontSize: scaledFont },
              active_year_label: { fontSize: scaledFont },
              disabled_label: { fontSize: scaledFont },
              range_end_label: { fontSize: scaledFont },
              range_start_label: { fontSize: scaledFont },
              range_middle_label: { fontSize: scaledFont },
              selected_year_label: { fontSize: scaledFont },
              time_selector_label: { fontSize: scaledFont },
              year_selector_label: { fontSize: scaledFont },
              month_selector_label: { fontSize: scaledFont },
              selected_month_label: { fontSize: scaledFont },
            }}
          />
        </View>
      )}
    </View>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    datePickerContainer: {
      position: 'absolute',
      top: '100%',
      left: 0,
      right: 0,
      zIndex: 1000,
      marginTop: verticalScale(4),
    },
    datePicker: {
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.outline,
    },
  });

export default CustomTextInputDate;
