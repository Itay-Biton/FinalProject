// DottedCubeWithPlus.tsx

import React, { useMemo, useState } from 'react';
import {
  View,
  Image,
  StyleSheet,
  Pressable,
  ViewStyle,
  useWindowDimensions,
} from 'react-native';
import PlusIconSvg from '../../assets/icons/ic_plus.svg';
import CloseIconSvg from '../../assets/icons/ic_close.svg'; // Add this icon
import { useTheme } from 'react-native-paper';
import { ThemeColors } from '../../types/theme';
import Shake from '../Animations/Shake';

// Close icon component
const CloseIcon = ({ color }: { color?: string }) => (
  <CloseIconSvg
    width={16}
    height={16}
    stroke={color || 'white'}
    strokeWidth={2}
  />
);

interface DottedCubeWithPlusProps {
  imageUri?: string | null;
  onPress: () => void;
  onRemove?: () => void; // Optional remove callback
  style?: ViewStyle;
}

const DottedCubeWithPlus: React.FC<DottedCubeWithPlusProps> = ({
  imageUri,
  onPress,
  onRemove,
  style,
}) => {
  const { width, height } = useWindowDimensions();
  const { colors }: { colors: ThemeColors } = useTheme();
  const styles = useMemo(
    () => createStyles(width, height, colors),
    [width, height, colors],
  );
  const [shake, setShake] = useState(false);

  const handleAddPress = () => {
    setShake(true);
    // Wait for the shake animation to complete
    setTimeout(() => {
      setShake(false);
      onPress();
    }, 600);
  };

  const handleImagePress = () => {
    // When image exists, pressing it should allow replacement
    onPress();
  };

  const handleRemovePress = (event: any) => {
    // Stop propagation to prevent triggering onPress
    event.stopPropagation();
    if (onRemove) {
      onRemove();
    }
  };

  return (
    <View style={[styles.container, style]}>
      <Pressable
        style={styles.pressable}
        onPress={imageUri ? handleImagePress : handleAddPress}
      >
        {imageUri ? (
          <>
            {/* Image */}
            <Image source={{ uri: imageUri }} style={styles.image} />

            {/* Remove button - only show if onRemove is provided */}
            {onRemove && (
              <Pressable
                style={styles.removeButton}
                onPress={handleRemovePress}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <View style={styles.removeButtonInner}>
                  <CloseIcon color="white" />
                </View>
              </Pressable>
            )}

            {/* Overlay for better visual feedback */}
            <View style={styles.imageOverlay} />
          </>
        ) : (
          /* Plus icon for empty state */
          <Shake visible={shake} style={styles.plusContainer} duration={300}>
            <PlusIconSvg width={24} height={24} fill={colors.primary} />
          </Shake>
        )}
      </Pressable>
    </View>
  );
};

const createStyles = (width: number, height: number, colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      width: 100,
      height: 100,
      borderRadius: 12,
      borderWidth: 2,
      borderStyle: 'dotted',
      borderColor: colors.primary || '#000',
      overflow: 'hidden',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.background,
    },
    pressable: {
      flex: 1,
      width: '100%',
      height: '100%',
      justifyContent: 'center',
      alignItems: 'center',
    },
    image: {
      width: '100%',
      height: '100%',
      resizeMode: 'cover',
    },
    imageOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.1)', // Subtle overlay for better button visibility
      pointerEvents: 'none',
    },
    plusContainer: {
      justifyContent: 'center',
      alignItems: 'center',
      width: '100%',
      height: '100%',
    },
    removeButton: {
      position: 'absolute',
      top: 4,
      right: 4,
      zIndex: 2,
    },
    removeButtonInner: {
      backgroundColor: 'rgba(255, 77, 77, 0.9)', // Red background with transparency
      borderRadius: 12,
      padding: 4,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.3)',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.3,
      shadowRadius: 2,
      elevation: 3, // Android shadow
    },
  });

export default DottedCubeWithPlus;
