import React, { useEffect, useRef, useMemo } from 'react';
import {
  Animated,
  Easing,
  Pressable,
  ViewStyle,
  StyleSheet,
} from 'react-native';
import { moderateScale } from 'react-native-size-matters';

interface TabIconAnimationProps {
  focused: boolean;
  activeColor: string;
  inactiveColor: string;
  IconComponent: React.ComponentType<any>;
  onPress: () => void;
  style?: ViewStyle;
}

const TabIconAnimation: React.FC<TabIconAnimationProps> = ({
  focused,
  activeColor,
  inactiveColor,
  IconComponent,
  onPress,
  style,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const styles = useMemo(() => createStyles(), []);

  // Handle focus change animations (scale only)
  useEffect(() => {
    const animationDuration = 400;
    const easing = Easing.out(Easing.exp);

    // Animate scale
    Animated.timing(scaleAnim, {
      toValue: focused ? 1.5 : 1,
      duration: animationDuration,
      easing,
      useNativeDriver: true,
    }).start();
  }, [focused, scaleAnim]);

  return (
    <Pressable onPress={onPress} style={styles.pressable}>
      <Animated.View
        style={[
          style,
          {
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {focused ? (
          // When focused: show with stroke and active color
          <>
            {/* Black outline (outer stroke) */}
            <IconComponent
              width={moderateScale(24)}
              height={moderateScale(24)}
              fill="none"
              stroke="#000000"
              strokeWidth={4}
              style={styles.absolutePosition}
            />

            {/* Active inner stroke */}
            <IconComponent
              width={moderateScale(24)}
              height={moderateScale(24)}
              fill="none"
              stroke={activeColor}
              strokeWidth={2}
            />
          </>
        ) : (
          // When not focused: show regular stroke with inactive color
          <IconComponent
            width={moderateScale(24)}
            height={moderateScale(24)}
            fill="none"
            stroke={inactiveColor}
            strokeWidth={2}
          />
        )}
      </Animated.View>
    </Pressable>
  );
};

const createStyles = () =>
  StyleSheet.create({
    pressable: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    absolutePosition: {
      position: 'absolute',
    },
  });

export default TabIconAnimation;
