// Hamburger.tsx
import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { Animated, StyleProp, ViewStyle } from 'react-native';

export type HamburgerHandle = {
  /** Animate from "closed" → "open" */
  start: () => void;
  /** Animate from "open" → "closed" */
  end: () => void;
  /** Immediately snap back to "closed" (no animation) */
  reset: () => void;
};

type Props = {
  size?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
  /** Optional callback when "start" animation finishes */
  onStartComplete?: () => void;
};

const Hamburger = forwardRef<HamburgerHandle, Props>(
  ({ size = 24, color = '#000', style, onStartComplete }, ref) => {
    const anim = useRef(new Animated.Value(0)).current;

    useImperativeHandle(
      ref,
      () => ({
        start: () =>
          Animated.timing(anim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }).start(() => onStartComplete?.()),
        end: () =>
          Animated.timing(anim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }).start(),
        reset: () => anim.setValue(0),
      }),
      [anim, onStartComplete],
    );

    const barStyle = {
      height: size / 12, // ⬅️ Made thinner (was size / 8)
      width: size,
      backgroundColor: color,
      marginVertical: size / 14, // ⬅️ Increased spacing (was size / 20)
      borderRadius: size / 24, // ⬅️ Adjusted border radius proportionally
    };

    const topBar = {
      transform: [
        {
          rotate: anim.interpolate({
            inputRange: [0, 1],
            outputRange: ['0deg', '45deg'],
          }),
        },
        {
          translateY: anim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, size / 4],
          }),
        },
      ],
    };
    const middleBar = {
      opacity: anim.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [1, 0, 0],
      }),
    };
    const bottomBar = {
      transform: [
        {
          rotate: anim.interpolate({
            inputRange: [0, 1],
            outputRange: ['0deg', '-45deg'],
          }),
        },
        {
          translateY: anim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, -size / 4],
          }),
        },
      ],
    };

    return (
      <Animated.View style={style} pointerEvents="none">
        <Animated.View style={[barStyle, topBar]} />
        <Animated.View style={[barStyle, middleBar]} />
        <Animated.View style={[barStyle, bottomBar]} />
      </Animated.View>
    );
  },
);

export default Hamburger;
