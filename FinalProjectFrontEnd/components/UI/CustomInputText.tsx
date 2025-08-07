import React, {
  useState,
  forwardRef,
  useImperativeHandle,
  useEffect,
} from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TextInputProps,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useTheme } from 'react-native-paper';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
import { ThemeColors } from '../../types/theme';

export interface CustomInputTextHandle {
  enable: () => void;
  disable: () => void;
  toggle: () => void;
}

interface CustomInputTextProps extends TextInputProps {
  leftIcon?: React.ComponentType<{ color?: string }>;
  rightIcon?: React.ComponentType<{ color?: string }>;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  leftIconContainerStyle?: ViewStyle;
  rightIconContainerStyle?: ViewStyle;
  iconColor?: string;
  /**
   * Controls whether the input is editable. Initial value.
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

const CustomInputText = forwardRef<CustomInputTextHandle, CustomInputTextProps>(
  (
    {
      leftIcon: LeftIcon,
      rightIcon: RightIcon,
      containerStyle,
      inputStyle,
      leftIconContainerStyle,
      rightIconContainerStyle,
      iconColor,
      enabled = true,
      style,
      value,
      onChangeText,
      ...textInputProps
    },
    ref,
  ) => {
    const { colors }: { colors: ThemeColors } = useTheme();
    const [isEnabled, setIsEnabled] = useState(enabled);
    const [currentValue, setCurrentValue] = useState(value || '');
    const [isTextRTL, setIsTextRTL] = useState(() => {
      // Initial RTL detection based on value or placeholder
      const initialValue = value || '';
      if (initialValue.trim().length > 0) {
        return isHebrewText(initialValue);
      } else {
        const placeholderText = textInputProps.placeholder || '';
        return isHebrewText(placeholderText);
      }
    });

    // Sync prop changes
    useEffect(() => {
      setIsEnabled(enabled);
    }, [enabled]);

    // Update current value and detect text direction
    useEffect(() => {
      const textValue = value || '';
      setCurrentValue(textValue);

      // If there's text, use text direction; otherwise use placeholder direction
      if (textValue.trim().length > 0) {
        setIsTextRTL(isHebrewText(textValue));
      } else {
        // Check placeholder direction when input is empty
        const placeholderText = textInputProps.placeholder || '';
        setIsTextRTL(isHebrewText(placeholderText));
      }
    }, [value, textInputProps.placeholder]);

    useImperativeHandle(ref, () => ({
      enable: () => setIsEnabled(true),
      disable: () => setIsEnabled(false),
      toggle: () => setIsEnabled(prev => !prev),
    }));

    const handleTextChange = (text: string) => {
      setCurrentValue(text);

      // If there's text, use text direction; otherwise use placeholder direction
      if (text.trim().length > 0) {
        setIsTextRTL(isHebrewText(text));
      } else {
        // Check placeholder direction when input becomes empty
        const placeholderText = textInputProps.placeholder || '';
        setIsTextRTL(isHebrewText(placeholderText));
      }

      if (onChangeText) {
        onChangeText(text);
      }
    };

    // Determine final text alignment based on text content
    const finalTextAlign = isTextRTL ? 'right' : 'left';
    const finalWritingDirection = isTextRTL ? 'rtl' : 'ltr';

    const styles = createStyles(colors, isEnabled);

    return (
      <View style={[styles.container, containerStyle]}>
        {LeftIcon && (
          <View style={[styles.leftIconContainer, leftIconContainerStyle]}>
            <LeftIcon color={iconColor || colors.onSurfaceVariant} />
          </View>
        )}

        <TextInput
          {...textInputProps}
          value={currentValue}
          onChangeText={handleTextChange}
          editable={isEnabled}
          placeholderTextColor={colors.onSurfaceVariant}
          selectionColor={colors.primary}
          // Dynamic RTL based on text content or placeholder
          textAlign={finalTextAlign}
          // Force writing direction based on text content or placeholder
          style={[
            styles.textInput,
            LeftIcon && styles.textInputWithLeftIcon,
            RightIcon && styles.textInputWithRightIcon,
            { writingDirection: finalWritingDirection },
            inputStyle,
            style,
          ]}
        />

        {RightIcon && (
          <View style={[styles.rightIconContainer, rightIconContainerStyle]}>
            <RightIcon color={iconColor || colors.onSurfaceVariant} />
          </View>
        )}
      </View>
    );
  },
);

const createStyles = (colors: ThemeColors, enabled: boolean) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.outline,
      borderRadius: moderateScale(4),
      height: verticalScale(52),
      marginBottom: verticalScale(16),
      paddingVertical: verticalScale(12),
      paddingHorizontal: scale(12),
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
    rightIconContainer: {
      width: moderateScale(20),
      height: moderateScale(20),
      marginLeft: scale(8),
      marginRight: scale(12),
      justifyContent: 'center',
      alignItems: 'center',
    },
    textInput: {
      flex: 1,
      fontSize: moderateScale(16),
      color: colors.onSurface,
      paddingVertical: 0,
      paddingHorizontal: 0,
      textAlignVertical: 'center',
      height: '100%',
    },
    textInputWithLeftIcon: {
      // Adjust margins based on text direction
      marginLeft: scale(12),
    },
    textInputWithRightIcon: {
      // Adjust margins based on text direction
      marginRight: scale(8),
    },
  });

export default CustomInputText;
