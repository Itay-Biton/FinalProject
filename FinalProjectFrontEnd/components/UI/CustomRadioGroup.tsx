// components/ui/CustomRadioGroup.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { CustomRadioButton } from './CustomRadioButton';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';

export interface Option<V extends string> {
  value: V;
  label: string;
}

export interface CustomRadioGroupProps<V extends string> {
  options: Option<V>[];
  selectedValue: V;
  onValueChange: (value: V) => void;
  /** circle & text color when selected */
  selectedColor?: string;
  /** circle & text color when not selected */
  unselectedColor?: string;
}

export function CustomRadioGroup<V extends string>({
  options,
  selectedValue,
  onValueChange,
  selectedColor = '#6200ee',
  unselectedColor = '#888',
}: CustomRadioGroupProps<V>) {
  return (
    <View style={styles.container}>
      {options.map(opt => {
        const isSelected = opt.value === selectedValue;
        return (
          <TouchableOpacity
            key={opt.value}
            style={styles.row}
            onPress={() => onValueChange(opt.value)}
            activeOpacity={0.7}
          >
            <CustomRadioButton
              selected={isSelected}
              onPress={() => onValueChange(opt.value)}
              selectedColor={selectedColor}
              unselectedColor={unselectedColor}
            />
            <Text
              style={[
                styles.label,
                {
                  color: isSelected ? selectedColor : unselectedColor,
                },
              ]}
            >
              {opt.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: verticalScale(8),
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: verticalScale(8),
  },
  label: {
    marginLeft: scale(8),
    fontSize: moderateScale(16),
  },
});
