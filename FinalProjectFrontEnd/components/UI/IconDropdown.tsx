import React from 'react';
import { View, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
import { Dropdown } from 'react-native-element-dropdown';
import { Text, useTheme } from 'react-native-paper';
import { ThemeColors } from '../../types/theme';
export type IconDropdownProps<T> = {
  label: string;
  icon: React.ComponentType<{ color?: string }>;
  data: T[];
  value: string;
  onChange: (item: T) => void;
  labelField: keyof T & string;
  valueField: keyof T & string;
  placeholder: string;
  /**
   * A custom item renderer that takes the data item and returns any ReactNode.
   * Under the hood, we wrap it to satisfy react-native-element-dropdown's API.
   */
  renderItem: (item: T) => React.ReactNode;
  /** style overrides **/
  containerStyle?: ViewStyle;
  labelStyle?: TextStyle;
  iconContainerStyle?: ViewStyle;
  dropdownStyle?: ViewStyle;
  dropdownContainerStyle?: ViewStyle;
  selectedTextStyleOverride?: TextStyle;
  placeholderStyleOverride?: TextStyle;
  inputSearchStyleOverride?: TextStyle;
  itemContainerStyleOverride?: ViewStyle;
  itemTextStyleOverride?: TextStyle;
};

function IconDropdown<T extends object>({
  label,
  icon: Icon,
  data,
  value,
  onChange,
  labelField,
  valueField,
  placeholder,
  renderItem,
  containerStyle,
  labelStyle,
  iconContainerStyle,
  dropdownStyle,
  dropdownContainerStyle,
  selectedTextStyleOverride,
  placeholderStyleOverride,
  inputSearchStyleOverride,
  itemContainerStyleOverride,
  itemTextStyleOverride,
}: IconDropdownProps<T>) {
  const { colors }: { colors: ThemeColors } = useTheme();
  const styles = makeStyles(colors);

  return (
    <>
      <Text style={[styles.label, labelStyle]}>{label}</Text>
      <View style={[styles.inputFieldContainer, containerStyle]}>
        {/* absolute-positioned icon */}
        <View style={[styles.inputIconContainer, iconContainerStyle]}>
          <Icon color={colors.onSurface} />
        </View>

        {/* full-width dropdown, text padded to avoid icon */}
        <Dropdown
          style={[styles.dropdownInline, dropdownStyle]}
          containerStyle={[styles.dropdownContainer, dropdownContainerStyle]}
          data={data}
          labelField={labelField}
          valueField={valueField}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          renderItem={item => <>{renderItem(item)}</>}
          search
          searchPlaceholder={placeholder}
          searchPlaceholderTextColor={colors.onSurfaceVariant}
          selectedTextStyle={
            selectedTextStyleOverride ?? styles.selectedTextStyle
          }
          placeholderStyle={placeholderStyleOverride ?? styles.placeholderStyle}
          inputSearchStyle={inputSearchStyleOverride ?? styles.inputSearchStyle}
          itemContainerStyle={
            itemContainerStyleOverride ?? styles.itemContainerStyle
          }
          itemTextStyle={itemTextStyleOverride ?? styles.itemTextStyle}
          activeColor={colors.selectedColor}
        />
      </View>
    </>
  );
}

const makeStyles = (colors: any) =>
  StyleSheet.create({
    label: {
      fontSize: moderateScale(16),
      marginBottom: verticalScale(8),
      marginTop: verticalScale(4),
      color: colors.primary,
      fontWeight: '500',
    },
    inputFieldContainer: {
      position: 'relative', // full width, allow absolute child
      backgroundColor: colors.surface,
      borderRadius: moderateScale(4),
      borderWidth: 1,
      borderColor: colors.outline,
      height: verticalScale(52),
      marginBottom: verticalScale(16),
    },
    inputIconContainer: {
      position: 'absolute', // overlay onto dropdown
      left: scale(24), // moved further right
      top: verticalScale(16), // vertically center
      width: moderateScale(20),
      height: moderateScale(20),
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 10,
    },
    dropdownInline: {
      width: '100%', // span entire container
      height: verticalScale(52),
      paddingLeft: scale(48), // match new icon position + spacing
      borderWidth: 0,
      backgroundColor: 'transparent',
    },
    dropdownContainer: {
      backgroundColor: colors.surface,
      borderColor: colors.outline,
      borderWidth: 1,
      borderRadius: moderateScale(4),
      marginTop: verticalScale(4),
    },
    selectedTextStyle: {
      marginLeft: 0,
      fontSize: moderateScale(16),
      color: colors.onSurface,
      lineHeight: verticalScale(52),
      textAlign: 'left',
    },
    placeholderStyle: {
      marginLeft: 0,
      fontSize: moderateScale(16),
      color: colors.onSurfaceVariant,
      lineHeight: verticalScale(52),
      textAlign: 'left',
    },
    inputSearchStyle: {
      height: verticalScale(40),
      fontSize: moderateScale(16),
      color: colors.onSurface,
      backgroundColor: colors.surface,
    },
    itemContainerStyle: {
      backgroundColor: colors.surface,
      borderBottomWidth: 0.5,
      borderBottomColor: colors.outline,
    },
    itemTextStyle: {
      fontSize: moderateScale(16),
      color: colors.onSurface,
    },
  });

export default IconDropdown;
