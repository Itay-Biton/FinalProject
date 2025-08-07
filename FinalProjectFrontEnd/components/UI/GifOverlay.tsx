import React from 'react';
import { View, Image, StyleSheet, ImageSourcePropType } from 'react-native';
import { useTheme } from 'react-native-paper';
import { moderateScale } from 'react-native-size-matters';

type GifOverlayProps = {
  imageSource: ImageSourcePropType;
};

const GifOverlay: React.FC<GifOverlayProps> = ({ imageSource }) => {
  const { colors } = useTheme();
  return (
    <View style={[styles.overlay, { backgroundColor: colors.background }]}>
      <Image source={imageSource} style={styles.gif} resizeMode="contain" />
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  gif: {
    width: moderateScale(200),
    height: moderateScale(200),
  },
});

export default GifOverlay;
