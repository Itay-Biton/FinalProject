import React, { useRef, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  I18nManager,
} from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { moderateScale, scale } from 'react-native-size-matters';
import { ThemeColors } from '../../types/theme';
import { I18nContext } from 'react-i18next';

interface PetImageSliderProps {
  images: string[];
  petId: string;
  isLost: boolean;
  isFound: boolean;
  currentIndex: number;
  onIndexChange: (petId: string, index: number) => void;
  onScroll: (event: any, petId: string, imageCount: number) => void;
  size?: number;
}

const PetImageSlider: React.FC<PetImageSliderProps> = ({
  images,
  petId,
  isLost,
  isFound,
  currentIndex,
  onIndexChange,
  onScroll,
  size = 90,
}) => {
  const { colors }: { colors: ThemeColors } = useTheme();
  const scrollViewRef = useRef<ScrollView>(null);

  const handleDotPress = useCallback(
    (index: number) => {
      const imageWidth = moderateScale(size);
      scrollViewRef.current?.scrollTo({
        x: index * imageWidth,
        animated: true,
      });
      onIndexChange(petId, index);
    },
    [petId, onIndexChange, size],
  );

  const imageSize = moderateScale(size);
  const borderRadius = moderateScale(size / 2);

  return (
    <View style={[styles.container, { width: imageSize, height: imageSize }]}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={event => onScroll(event, petId, images.length)}
        scrollEventThrottle={16}
        style={[
          styles.scrollView,
          {
            width: imageSize,
            height: imageSize,
            borderRadius: borderRadius,
          },
        ]}
        contentContainerStyle={styles.scrollContent}
      >
        {images.map((imageUri, index) => (
          <View
            key={index}
            style={[
              styles.imageContainer,
              {
                width: imageSize,
                height: imageSize,
                borderRadius: borderRadius,
                borderColor: colors.buttonColor + '40',
              },
            ]}
          >
            <Image
              source={{ uri: imageUri }}
              style={styles.image}
              resizeMode="cover"
            />
          </View>
        ))}
      </ScrollView>

      {/* Status Badge - Lost or Safe */}
      {(isFound || isLost) && (
        <View
          style={[
            styles.statusBadge,
            {
              borderColor: colors.surface,
              backgroundColor: isLost ? '#FF3D00' : '#4CAF50',
            },
          ]}
        >
          <Text style={styles.statusBadgeText}>{isLost ? '!' : '●'}</Text>
        </View>
      )}

      {/* Dots Indicator */}
      {images.length > 1 && (
        <View style={styles.dotsContainer}>
          {images.map((_, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.dot,
                {
                  backgroundColor:
                    index === currentIndex
                      ? colors.buttonColor
                      : colors.outline,
                },
              ]}
              onPress={() => handleDotPress(index)}
            />
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  scrollView: {
    overflow: 'hidden',
  },
  scrollContent: {
    alignItems: 'center',
  },
  imageContainer: {
    borderWidth: 3,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  statusBadge: {
    position: 'absolute',
    top: -moderateScale(4),
    right: I18nManager.isRTL ? undefined : -moderateScale(4),
    left: I18nManager.isRTL ? -moderateScale(4) : undefined,
    width: moderateScale(24),
    height: moderateScale(24),
    borderRadius: moderateScale(12),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    zIndex: 1,
  },
  statusBadgeText: {
    color: 'white',
    fontSize: moderateScale(12),
    fontWeight: 'bold',
  },
  dotsContainer: {
    position: 'absolute',
    bottom: -moderateScale(12),
    left: 0,
    right: 0,
    flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    width: moderateScale(6),
    height: moderateScale(6),
    borderRadius: moderateScale(3),
    marginHorizontal: scale(2),
  },
});

export default PetImageSlider;
