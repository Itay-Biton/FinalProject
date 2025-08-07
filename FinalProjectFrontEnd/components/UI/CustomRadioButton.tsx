// components/ui/CustomRadioButton.tsx
import React from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';

interface CustomRadioButtonProps {
  /** whether this button is selected */
  selected: boolean;
  /** callback when user taps */
  onPress: () => void;
  /** outer circle diameter */
  size?: number;
  /** color for border & fill when selected */
  selectedColor?: string;
  /** color for border when not selected */
  unselectedColor?: string;
}

export const CustomRadioButton: React.FC<CustomRadioButtonProps> = ({
  selected,
  onPress,
  size = 24,
  selectedColor = '#6200ee',
  unselectedColor = '#888',
}) => (
  <TouchableOpacity
    onPress={onPress}
    style={[styles.touchable, { width: size, height: size }]}
    activeOpacity={0.7}
  >
    <View
      style={[
        styles.outer,
        {
          borderColor: selected ? selectedColor : unselectedColor,
          width: size,
          height: size,
          borderRadius: size / 2,
        },
      ]}
    >
      {selected && (
        <View
          style={[
            styles.inner,
            {
              backgroundColor: selectedColor,
              width: size * 0.5,
              height: size * 0.5,
              borderRadius: (size * 0.5) / 2,
            },
          ]}
        />
      )}
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  touchable: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  outer: {
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inner: {},
});
