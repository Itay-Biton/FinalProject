import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  useWindowDimensions,
  I18nManager,
} from 'react-native';
import { Switch, useTheme } from 'react-native-paper';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
import { useTranslation } from 'react-i18next';
import { ThemeColors } from '../../types/theme';
import CustomTextInputTime from '../UI/CustomTextInputTime';

export interface WorkingDay {
  day: string;
  isOpen: boolean;
  openTime: string;
  closeTime: string;
}

interface WorkingHoursSelectorProps {
  onWorkingHoursChange: (workingHours: WorkingDay[]) => void;
  initialWorkingHours?: WorkingDay[];
}

const WorkingHoursSelector: React.FC<WorkingHoursSelectorProps> = ({
  onWorkingHoursChange,
  initialWorkingHours,
}) => {
  const { width } = useWindowDimensions();
  const { colors }: { colors: ThemeColors } = useTheme();
  const { t } = useTranslation();
  const styles = useMemo(() => createStyles(width, colors), [width, colors]);

  const defaultWorkingHours: WorkingDay[] = [
    { day: 'sunday', isOpen: false, openTime: '09:00', closeTime: '17:00' },
    { day: 'monday', isOpen: true, openTime: '09:00', closeTime: '17:00' },
    { day: 'tuesday', isOpen: true, openTime: '09:00', closeTime: '17:00' },
    { day: 'wednesday', isOpen: true, openTime: '09:00', closeTime: '17:00' },
    { day: 'thursday', isOpen: true, openTime: '09:00', closeTime: '17:00' },
    { day: 'friday', isOpen: true, openTime: '09:00', closeTime: '17:00' },
    { day: 'saturday', isOpen: false, openTime: '09:00', closeTime: '17:00' },
  ];

  const [workingHours, setWorkingHours] = useState<WorkingDay[]>(
    initialWorkingHours || defaultWorkingHours,
  );

  const updateWorkingHours = (updatedHours: WorkingDay[]) => {
    setWorkingHours(updatedHours);
    onWorkingHoursChange(updatedHours);
  };

  const toggleDay = (dayIndex: number) => {
    const updated = [...workingHours];
    updated[dayIndex].isOpen = !updated[dayIndex].isOpen;
    updateWorkingHours(updated);
  };

  const updateTime = (
    dayIndex: number,
    timeType: 'openTime' | 'closeTime',
    time: string,
  ) => {
    const updated = [...workingHours];
    updated[dayIndex][timeType] = time;
    updateWorkingHours(updated);
  };

  const renderTimeInput = (
    dayIndex: number,
    timeType: 'openTime' | 'closeTime',
    currentTime: string,
  ) => {
    return (
      <View style={styles.timeContainer}>
        <Text style={styles.timeLabel}>
          {timeType === 'openTime' ? t('open') : t('close')}
        </Text>
        <CustomTextInputTime
          placeholder={t('select_time')}
          value={currentTime}
          onChangeText={time => updateTime(dayIndex, timeType, time)}
          colors={colors}
          containerStyle={styles.timeInputContainer}
          leftIconContainerStyle={styles.iconContainer}
          iconColor={colors.onSurfaceVariant}
        />
      </View>
    );
  };

  const renderDayRow = (dayData: WorkingDay, index: number) => {
    return (
      <View key={dayData.day} style={styles.dayContainer}>
        <View style={styles.dayHeader}>
          <Text style={styles.dayName}>{t(dayData.day)}</Text>
          <View style={styles.switchContainer}>
            <Text style={styles.switchLabel}>
              {dayData.isOpen ? t('open') : t('closed')}
            </Text>
            <Switch
              style={styles.switch}
              value={dayData.isOpen}
              onValueChange={() => toggleDay(index)}
              thumbColor={colors.buttonColor}
              trackColor={{
                false: colors.outline + '40',
                true: colors.outline,
              }}
            />
          </View>
        </View>

        {dayData.isOpen && (
          <View style={styles.timeSelectorContainer}>
            {renderTimeInput(index, 'openTime', dayData.openTime)}
            {renderTimeInput(index, 'closeTime', dayData.closeTime)}
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('working_hours')}</Text>
      {workingHours.map((dayData, index) => renderDayRow(dayData, index))}
    </View>
  );
};

const createStyles = (width: number, colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      marginBottom: verticalScale(16),
    },
    title: {
      fontSize: moderateScale(18),
      color: colors.primary,
      marginBottom: verticalScale(8),
      textAlign: 'left',
    },
    dayContainer: {
      marginBottom: verticalScale(12),
      backgroundColor: colors.surface,
      borderRadius: moderateScale(8),
      padding: moderateScale(12),
      borderWidth: 1,
      borderColor: colors.outline,
    },
    dayHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: verticalScale(8),
    },
    dayName: {
      fontSize: moderateScale(16),
      color: colors.primary,
      fontWeight: '500',
      textAlign: 'left',
    },
    switchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    switchLabel: {
      fontSize: moderateScale(20),
      color: colors.onSurfaceVariant,
      marginRight: scale(8),
    },
    timeSelectorContainer: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginTop: verticalScale(8),
      gap: scale(12),
    },
    switch: {
      transform: [{ scale: 1 }],
    },
    timeContainer: {
      flex: 1,
    },
    timeLabel: {
      fontSize: moderateScale(14),
      color: colors.primary,
      marginBottom: verticalScale(4),
      textAlign: 'left',
    },
    timeInputContainer: {
      backgroundColor: colors.background,
      borderRadius: moderateScale(8),
      borderWidth: 1,
      borderColor: colors.outline,
      height: verticalScale(52),
    },
    iconContainer: {
      width: moderateScale(20),
      height: moderateScale(20),
      marginLeft: scale(12),
      marginRight: scale(8),
      justifyContent: 'center',
      alignItems: 'center',
    },
  });

export default WorkingHoursSelector;
