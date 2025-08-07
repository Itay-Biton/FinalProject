import React, {useEffect, useRef} from 'react';
import {Animated, Easing, ViewStyle} from 'react-native';

interface ShakeProps {
  visible: boolean;
  style?: ViewStyle;
  children: React.ReactNode;
  /** Starting angle to animate to (in degrees). Default is 65. */
  startingAngle?: number;
  /** The default angle (in degrees) to settle at. Default is 0. */
  defaultAngle?: number;
  /** Duration (in milliseconds) for each animation step. Default is 200ms. */
  duration?: number;
}

const Shake: React.FC<ShakeProps> = ({
  visible,
  style,
  children,
  startingAngle = 90,
  defaultAngle = 0,
  duration = 300,
}) => {
  const shakeAnim = useRef(new Animated.Value(defaultAngle)).current;

  useEffect(() => {
    if (visible) {
      // Reset the animated value before starting the shake sequence.
      shakeAnim.setValue(defaultAngle);
      Animated.sequence([
        Animated.timing(shakeAnim, {
          toValue: startingAngle,
          duration,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: defaultAngle,
          duration,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, shakeAnim, startingAngle, defaultAngle, duration]);

  const rotate = shakeAnim.interpolate({
    inputRange: [0, 360],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View style={[style, {transform: [{rotate}]}]}>
      {children}
    </Animated.View>
  );
};

export default Shake;
