import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Text, Card } from 'react-native-paper';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
import { useTranslation } from 'react-i18next';
import { ThemeColors } from '../../types/theme';
import { ActivityEntry } from '../../types/activity';
import CustomTextInputDate from '../UI/CustomTextInputDate';
import CustomInputText from '../UI/CustomInputText';
import CustomTextInputTime from '../UI/CustomTextInputTime';
import IconDropdown from '../UI/IconDropdown';
import { getActivityTypesList } from '../../constants/activityTypesList';

// Icons
import ServiceIconSvg from '../../assets/icons/ic_service.svg';
import NoteIconSvg from '../../assets/icons/ic_note.svg';

const ServiceIcon = ({ color }: { color?: string }) => (
  <ServiceIconSvg
    width={moderateScale(20)}
    height={moderateScale(20)}
    stroke={color || 'black'}
  />
);

const NoteIcon = ({ color }: { color?: string }) => (
  <NoteIconSvg
    width={moderateScale(20)}
    height={moderateScale(20)}
    stroke={color || 'black'}
  />
);

// Local interface for form data (matches the existing component interface)
interface ActivityEntryLocal {
  id?: string;
  date: string;
  time: string;
  activityType: string;
  description: string;
}

interface ActivityFormProps {
  visible: boolean;
  editingEntry?: ActivityEntry | null;
  colors: ThemeColors;
  onSave: (entry: ActivityEntryLocal) => Promise<void>;
  onCancel: () => void;
  saving?: boolean;
}

const ActivityForm: React.FC<ActivityFormProps> = ({
  visible,
  editingEntry,
  colors,
  onSave,
  onCancel,
  saving = false,
}) => {
  const { t } = useTranslation();

  // Helper function to get current time in HH:MM format
  const getCurrentTime = useCallback(() => {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }, []);

  // Helper function to get current date
  const getCurrentDate = useCallback(() => {
    return new Date().toLocaleDateString('en-GB').split('/').join('/');
  }, []);

  const activityTypes = useMemo(() => getActivityTypesList(t), [t]);

  // Form state
  const [formData, setFormData] = useState<ActivityEntryLocal>({
    date: getCurrentDate(),
    time: getCurrentTime(),
    activityType: '',
    description: '',
  });

  const [errors, setErrors] = useState<Partial<ActivityEntryLocal>>({});

  // Update form data when editing entry changes
  useEffect(() => {
    if (editingEntry) {
      // Convert API response format to local format
      setFormData({
        id: editingEntry._id, // Convert _id to id for local use
        date: editingEntry.date,
        time: editingEntry.time,
        activityType: editingEntry.activityType,
        description: editingEntry.description,
      });
    } else {
      // Reset form for new entry
      setFormData({
        date: getCurrentDate(),
        time: getCurrentTime(),
        activityType: '',
        description: '',
      });
    }
    setErrors({});
  }, [editingEntry, getCurrentDate, getCurrentTime]);

  const validateForm = useCallback(() => {
    const newErrors: Partial<ActivityEntryLocal> = {};

    if (!formData.date.trim()) {
      newErrors.date = t('date_required', { defaultValue: 'Date is required' });
    } else if (!/^\d{2}\/\d{2}\/\d{4}$/.test(formData.date)) {
      newErrors.date = t('invalid_date_format', {
        defaultValue: 'Use DD/MM/YYYY format',
      });
    }

    if (!formData.time.trim()) {
      newErrors.time = t('time_required', { defaultValue: 'Time is required' });
    } else if (!/^\d{2}:\d{2}$/.test(formData.time)) {
      newErrors.time = t('invalid_time_format', {
        defaultValue: 'Use HH:MM format',
      });
    }

    if (!formData.activityType.trim()) {
      newErrors.activityType = t('activity_type_required', {
        defaultValue: 'Activity type is required',
      });
    }

    if (!formData.description.trim()) {
      newErrors.description = t('description_required', {
        defaultValue: 'Description is required',
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, t]);

  const handleSave = useCallback(async () => {
    if (!validateForm() || saving) {
      return;
    }

    try {
      await onSave(formData);
    } catch (error) {
      // Error handling is done in the parent component
    }
  }, [formData, validateForm, onSave, saving]);

  const handleCancel = useCallback(() => {
    if (saving) return;

    // Reset form
    setFormData({
      date: getCurrentDate(),
      time: getCurrentTime(),
      activityType: '',
      description: '',
    });
    setErrors({});
    onCancel();
  }, [onCancel, getCurrentDate, getCurrentTime, saving]);

  const updateFormData = useCallback(
    (field: keyof ActivityEntryLocal, value: string) => {
      setFormData(prev => ({ ...prev, [field]: value }));
      // Clear error when user starts typing
      if (errors[field]) {
        setErrors(prev => ({ ...prev, [field]: undefined }));
      }
    },
    [errors],
  );

  const styles = useMemo(() => createStyles(colors), [colors]);

  if (!visible) {
    return null;
  }

  return (
    <Card style={styles.addFormCard} mode="outlined">
      <Card.Content style={styles.formContent}>
        <Text style={styles.formTitle}>
          {editingEntry ? t('edit_activity') : t('add_activity')}
        </Text>

        {/* Date and Time Row */}
        <View style={styles.dateTimeRow}>
          {/* Date */}
          <View style={styles.dateContainer}>
            <CustomTextInputDate
              placeholder={t('select_date')}
              value={formData.date}
              onChangeText={text => updateFormData('date', text)}
              colors={colors}
              containerStyle={styles.inputContainer}
              leftIconContainerStyle={styles.iconContainer}
              iconColor={colors.onSurfaceVariant}
              maxDate={new Date()}
            />
            {errors.date && <Text style={styles.errorText}>{errors.date}</Text>}
          </View>

          {/* Time */}
          <View style={styles.timeInputContainer}>
            <CustomTextInputTime
              placeholder={t('select_time')}
              value={formData.time}
              onChangeText={text => updateFormData('time', text)}
              colors={colors}
              containerStyle={[
                styles.inputContainer,
                errors.time && styles.inputError,
              ]}
              leftIconContainerStyle={styles.iconContainer}
              iconColor={colors.onSurfaceVariant}
            />
            {errors.time && <Text style={styles.errorText}>{errors.time}</Text>}
          </View>
        </View>

        {/* Activity Type */}
        <View style={styles.fieldContainer}>
          <IconDropdown
            label={t('activity_type')}
            data={activityTypes}
            value={formData.activityType}
            onChange={item => updateFormData('activityType', item.value)}
            labelField="label"
            valueField="value"
            placeholder={t('select_activity_type')}
            renderItem={(item: any) => (
              <View style={styles.dropdownItemContainer}>
                <item.icon color={colors.onSurface} />
                <Text style={styles.dropdownItemText}>{item.label}</Text>
              </View>
            )}
            containerStyle={styles.inputContainer}
            icon={ServiceIcon}
          />
          {errors.activityType && (
            <Text style={styles.errorText}>{errors.activityType}</Text>
          )}
        </View>

        {/* Description */}
        <View style={styles.fieldContainer}>
          <CustomInputText
            placeholder={t('enter_description')}
            value={formData.description}
            onChangeText={text => updateFormData('description', text)}
            containerStyle={styles.inputContainer}
            leftIcon={NoteIcon}
            leftIconContainerStyle={styles.iconContainer}
            iconColor={colors.onSurfaceVariant}
            multiline
            numberOfLines={3}
            editable={!saving}
          />
          {errors.description && (
            <Text style={styles.errorText}>{errors.description}</Text>
          )}
        </View>

        {/* Form Actions */}
        <View style={styles.formActions}>
          <TouchableOpacity
            onPress={handleCancel}
            style={[styles.cancelButton, saving && styles.buttonDisabled]}
            activeOpacity={0.7}
            disabled={saving}
          >
            <Text
              style={[
                styles.cancelButtonText,
                saving && styles.disabledButtonText,
              ]}
            >
              {t('cancel')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleSave}
            style={[
              styles.saveButton,
              { backgroundColor: colors.buttonColor },
              saving && styles.buttonDisabled,
            ]}
            activeOpacity={0.7}
            disabled={saving}
          >
            {saving ? (
              <View style={styles.savingContainer}>
                <ActivityIndicator
                  size="small"
                  color={colors.buttonTextColor}
                />
                <Text
                  style={[
                    styles.saveButtonText,
                    { color: colors.buttonTextColor },
                    styles.savingText,
                  ]}
                >
                  {editingEntry ? t('updating') : t('creating')}
                </Text>
              </View>
            ) : (
              <Text
                style={[
                  styles.saveButtonText,
                  { color: colors.buttonTextColor },
                ]}
              >
                {t('save')}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </Card.Content>
    </Card>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    addFormCard: {
      backgroundColor: colors.surface,
      marginBottom: verticalScale(16),
      borderRadius: moderateScale(12),
      borderWidth: 1,
      borderColor: colors.outline + '30',
      width: '100%',
    },
    formContent: {
      padding: scale(16),
    },
    formTitle: {
      fontSize: moderateScale(18),
      fontWeight: '600',
      color: colors.primary,
      marginBottom: verticalScale(16),
    },
    dateTimeRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: verticalScale(12),
      gap: scale(12),
    },
    dateContainer: {
      flex: 2,
    },
    timeInputContainer: {
      flex: 1,
    },
    fieldContainer: {
      marginBottom: verticalScale(12),
    },
    inputContainer: {
      backgroundColor: colors.background,
      borderRadius: moderateScale(8),
      borderWidth: 1,
      borderColor: colors.outline,
      height: verticalScale(52),
    },
    inputError: {
      borderColor: colors.error,
    },
    textAreaContainer: {
      height: verticalScale(80),
    },
    iconContainer: {
      width: moderateScale(20),
      height: moderateScale(20),
      marginLeft: scale(12),
      marginRight: scale(8),
      justifyContent: 'center',
      alignItems: 'center',
    },
    dropdownItemContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: verticalScale(12),
      paddingHorizontal: scale(16),
    },
    dropdownItemText: {
      fontSize: moderateScale(16),
      color: colors.onSurface,
      marginLeft: scale(12),
    },
    errorText: {
      fontSize: moderateScale(12),
      color: colors.error,
      marginTop: verticalScale(4),
      marginLeft: scale(4),
    },
    formActions: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: verticalScale(16),
    },
    cancelButton: {
      flex: 1,
      marginRight: scale(8),
      borderColor: colors.outline,
      borderWidth: 1,
      borderRadius: moderateScale(8),
      paddingVertical: verticalScale(12),
      paddingHorizontal: scale(16),
      backgroundColor: 'transparent',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: verticalScale(48),
    },
    saveButton: {
      flex: 1,
      marginLeft: scale(8),
      borderRadius: moderateScale(8),
      paddingVertical: verticalScale(12),
      paddingHorizontal: scale(16),
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: verticalScale(48),
    },
    buttonDisabled: {
      opacity: 0.6,
    },
    cancelButtonText: {
      fontSize: moderateScale(16),
      fontWeight: '500',
      color: colors.primary,
      textAlign: 'center',
    },
    saveButtonText: {
      fontSize: moderateScale(16),
      fontWeight: '500',
      textAlign: 'center',
    },
    disabledButtonText: {
      color: colors.onSurfaceVariant,
    },
    savingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    savingText: {
      marginLeft: scale(8),
    },
  });

export default ActivityForm;
