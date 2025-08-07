import React, {
  useState,
  forwardRef,
  useImperativeHandle,
  useEffect,
} from 'react';
import { View, StyleSheet, ViewStyle, Pressable, Text } from 'react-native';
import { useTheme, Text as PaperText } from 'react-native-paper';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
import { ThemeColors } from '../../types/theme';

export interface CustomInputCheckBoxHandle {
  enable: () => void;
  disable: () => void;
  toggle: () => void;
  setChecked: (checked: boolean) => void;
}

interface CustomInputCheckBoxProps {
  leftIcon?: React.ComponentType<{ color?: string }>;
  checkIcon?: React.ComponentType<{ color?: string }>;
  label: string;
  containerStyle?: ViewStyle;
  iconColor?: string;
  boxColor?: string;
  checkIconColor?: string;
  value?: boolean;
  onValueChange?: (value: boolean) => void;
  /**
   * Controls whether the checkbox is editable. Initial value.
   * @default true
   */
  enabled?: boolean;
}

// Function to detect if text is Hebrew
const isHebrewText = (text: string): boolean => {
  if (!text || text.length === 0) return false;

  // Get the first non-whitespace character
  const firstChar = text.trim().charAt(0);
  if (!firstChar) return false;

  // Hebrew Unicode range: U+0590 to U+05FF
  const charCode = firstChar.charCodeAt(0);
  return charCode >= 0x0590 && charCode <= 0x05ff;
};

// Default checkmark component if no checkIcon is provided
const DefaultCheckIcon = ({ color }: { color?: string }) => (
  <Text
    style={{
      fontSize: moderateScale(12),
      color: color || 'white',
      fontWeight: 'bold',
    }}
  >
    ✓
  </Text>
);

const CustomInputCheckBox = forwardRef<
  CustomInputCheckBoxHandle,
  CustomInputCheckBoxProps
>(
  (
    {
      leftIcon: LeftIcon,
      checkIcon: CheckIcon = DefaultCheckIcon,
      label,
      containerStyle,
      iconColor,
      boxColor,
      checkIconColor,
      enabled = true,
      value = false,
      onValueChange,
    },
    ref,
  ) => {
    const { colors }: { colors: ThemeColors } = useTheme();
    const [isEnabled, setIsEnabled] = useState(enabled);
    const [isChecked, setIsChecked] = useState(value);

    // Detect if label is RTL
    const isLabelRTL = isHebrewText(label);

    // Sync prop changes
    useEffect(() => {
      setIsEnabled(enabled);
    }, [enabled]);

    useEffect(() => {
      setIsChecked(value);
    }, [value]);

    useImperativeHandle(ref, () => ({
      enable: () => setIsEnabled(true),
      disable: () => setIsEnabled(false),
      toggle: () => setIsEnabled(prev => !prev),
      setChecked: (checked: boolean) => {
        setIsChecked(checked);
        if (onValueChange) {
          onValueChange(checked);
        }
      },
    }));

    const handlePress = () => {
      if (!isEnabled) return;

      const newValue = !isChecked;
      setIsChecked(newValue);
      if (onValueChange) {
        onValueChange(newValue);
      }
    };

    const styles = createStyles(
      colors,
      isEnabled,
      isLabelRTL,
      isChecked,
      boxColor,
    );

    return (
      <Pressable
        style={[styles.container, containerStyle]}
        onPress={handlePress}
        disabled={!isEnabled}
      >
        {LeftIcon && (
          <View style={styles.leftIconContainer}>
            <LeftIcon color={iconColor || colors.primary} />
          </View>
        )}

        <PaperText style={styles.label}>{label}</PaperText>

        <View style={styles.checkboxContainer}>
          <View style={styles.checkboxBox}>
            {isChecked && (
              <CheckIcon color={checkIconColor || colors.buttonTextColor} />
            )}
          </View>
        </View>
      </Pressable>
    );
  },
);

const createStyles = (
  colors: ThemeColors,
  enabled: boolean,
  isLabelRTL: boolean,
  isChecked: boolean,
  boxColor?: string,
) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: verticalScale(12),
      paddingHorizontal: scale(12),
      backgroundColor: colors.surface,
      borderRadius: moderateScale(4),
      borderWidth: 1,
      borderColor: colors.outline,
      height: verticalScale(52),
      marginBottom: verticalScale(16),
      opacity: enabled ? 1 : 0.5,
    },
    leftIconContainer: {
      width: moderateScale(20),
      height: moderateScale(20),
      marginLeft: scale(12),
      marginRight: scale(8),
      justifyContent: 'center',
      alignItems: 'center',
    },
    label: {
      flex: 1,
      fontSize: moderateScale(16),
      color: colors.onSurface,
      marginLeft: scale(12),
      textAlign: 'left',
    },
    checkboxContainer: {
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: scale(4),
    },
    checkboxBox: {
      width: moderateScale(20),
      height: moderateScale(20),
      borderRadius: moderateScale(3),
      borderWidth: 2,
      borderColor: isChecked ? boxColor || colors.primary : colors.outline,
      backgroundColor: isChecked ? boxColor || colors.primary : 'transparent',
      justifyContent: 'center',
      alignItems: 'center',
    },
  });

export default CustomInputCheckBox;
