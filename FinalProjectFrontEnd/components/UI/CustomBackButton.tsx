import React from 'react';
import { Pressable, StyleSheet, I18nManager } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from 'react-native-paper';
import BackIconSvg from '../../assets/icons/ic_back.svg';
import BackIconRtlSvg from '../../assets/icons/ic_back_rtl.svg';
import { moderateScale } from 'react-native-size-matters';

const CustomBackButton: React.FC = () => {
  const navigation = useNavigation();
  const { colors } = useTheme();

  // Choose the appropriate icon based on RTL setting
  const IconComponent = I18nManager.isRTL ? BackIconSvg : BackIconRtlSvg;

  return (
    <Pressable onPress={() => navigation.goBack()} style={styles.button}>
      <IconComponent
        width={moderateScale(24)}
        height={moderateScale(24)}
        stroke={colors.primary}
      />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: moderateScale(16),
    paddingTop: moderateScale(8),
  },
});

export default CustomBackButton;
