import {StyleSheet} from 'react-native';
import {moderateScale} from 'react-native-size-matters';
import {ThemeColors} from '../types/theme';

export const createStyles = (
  width: number,
  height: number,
  colors: ThemeColors,
) =>
  StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    card: {
      margin: moderateScale(16),
      width: width * 0.9,
      // Use the theme's cardColor; fallback if not provided
      backgroundColor: colors.cardColor,
    },
    text: {
      fontSize: moderateScale(16),
      // Use the theme's CardColorText; fallback if not provided
      color: colors.CardColorText,
    },
    button: {
      margin: moderateScale(8),
    },
  });
