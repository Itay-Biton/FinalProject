// File: components/ui/SnakeSlider.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { Slider } from '@miblanchard/react-native-slider';
import CustomChip from './CustomChip';

// Defines a chip option for quick selection
export type ChipOption = {
  label: string;
  value: number;
  icon?: React.ReactNode;
};

// Props for the SnakeSlider component
export interface SnakeSliderProps {
  min: number;
  max: number;
  step?: number;
  value: number;
  onValueChange: (value: number) => void;
  style?: ViewStyle;
  labelTextSize?: number;
  labelStyle?: TextStyle;
  labelContainerStyle?: ViewStyle;
  minimumTrackTintColor?: string;
  maximumTrackTintColor?: string;
  sliderHeight?: number;
  thumbSize?: number;
  thumbTintColor?: string;
  thumbTextColor?: string;
  thumbTextSize?: number;
  chipOptions?: ChipOption[];
  chipContainerStyle?: ViewStyle;
  chipStyle?: ViewStyle;
  chipTextStyle?: TextStyle;
  chipBackgroundColor?: string;
  chipTextColor?: string;
}

export default function SnakeSlider({
  min,
  max,
  step = 1,
  value,
  onValueChange,
  style,
  labelTextSize = 14,
  labelStyle = {},
  labelContainerStyle = {},
  minimumTrackTintColor,
  maximumTrackTintColor,
  sliderHeight = 10,
  thumbSize = 20,
  thumbTintColor = '#888',
  thumbTextColor = '#fff',
  thumbTextSize = 12,
  chipOptions = [],
  chipContainerStyle = {},
  chipStyle = {},
  chipTextStyle = {},
  chipBackgroundColor,
  chipTextColor,
}: SnakeSliderProps) {
  const [currentValue, setCurrentValue] = useState<number>(value);

  useEffect(() => {
    setCurrentValue(value);
  }, [value]);

  const handleChange = (values: number[]) => {
    setCurrentValue(values[0] ?? min);
  };

  const handleComplete = (values: number[]) => {
    onValueChange(values[0] ?? min);
  };

  return (
    <View style={[styles.container, style]}>
      <View style={[styles.endLabelsContainer, labelContainerStyle]}>
        <Text
          style={[styles.labelText, { fontSize: labelTextSize }, labelStyle]}
        >
          {min}
        </Text>
        <Text
          style={[styles.labelText, { fontSize: labelTextSize }, labelStyle]}
        >
          {max}
        </Text>
      </View>

      <Slider
        value={[currentValue]}
        onValueChange={handleChange}
        onSlidingComplete={handleComplete}
        minimumValue={min}
        maximumValue={max}
        step={step}
        minimumTrackTintColor={minimumTrackTintColor}
        maximumTrackTintColor={maximumTrackTintColor}
        trackStyle={{ height: sliderHeight }}
        minimumTrackStyle={{ height: sliderHeight }}
        maximumTrackStyle={{ height: sliderHeight }}
        thumbStyle={{
          width: thumbSize,
          height: thumbSize,
          borderRadius: thumbSize / 2,
          backgroundColor: thumbTintColor,
        }}
        renderThumbComponent={() => (
          <View
            style={[
              styles.thumbContainer,
              {
                width: thumbSize,
                height: thumbSize,
                borderRadius: thumbSize / 2,
                backgroundColor: thumbTintColor,
              },
            ]}
          >
            <Text
              style={[
                styles.thumbText,
                { color: thumbTextColor, fontSize: thumbTextSize },
              ]}
            >
              {' '}
              {currentValue}{' '}
            </Text>
          </View>
        )}
      />

      {chipOptions.length > 0 && (
        <View style={[styles.chipsContainer, chipContainerStyle]}>
          {chipOptions.map(option => (
            <CustomChip
              key={option.value}
              label={option.label}
              selected={currentValue === option.value}
              onPress={() => {
                setCurrentValue(option.value);
                onValueChange(option.value);
              }}
              backgroundColor={chipBackgroundColor}
              textColor={chipTextColor}
              style={chipStyle}
              textStyle={chipTextStyle}
              icon={option.icon}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  endLabelsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  labelText: {
    color: '#555',
  },
  thumbContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbText: {
    fontWeight: 'bold',
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
    justifyContent: 'center',
  },
});
