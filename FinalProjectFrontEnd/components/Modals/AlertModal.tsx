import React, { memo, useMemo } from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
import { useTheme } from 'react-native-paper';
import { ThemeColors } from '../../types/theme';

// Placeholder icon imports (replace with your actual SVG imports)
import AlertIconSvg from '../../assets/icons/ic_alert.svg';
import CheckIconSvg from '../../assets/icons/ic_save.svg';
import CloseIconSvg from '../../assets/icons/ic_cancel.svg';
import Shake from '../Animations/Shake';

type AlertButton = {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
};

type AlertModalProps = {
  visible: boolean;
  onClose: () => void;
  title: string;
  message: string;
  buttons: AlertButton[];
  icon?: 'alert' | 'success' | 'error' | 'info';
};

const AlertIcon = ({ color, type }: { color?: string; type?: string }) => {
  switch (type) {
    case 'success':
      return (
        <CheckIconSvg
          width={moderateScale(24)}
          height={moderateScale(24)}
          stroke={color || 'black'}
        />
      );
    case 'error':
    case 'destructive':
      return (
        <CloseIconSvg
          width={moderateScale(24)}
          height={moderateScale(24)}
          stroke={color || 'black'}
        />
      );
    default:
      return (
        <AlertIconSvg
          width={moderateScale(24)}
          height={moderateScale(24)}
          stroke={color || 'black'}
        />
      );
  }
};

const AlertModal: React.FC<AlertModalProps> = memo(
  ({ visible, onClose, title, message, buttons, icon = 'alert' }) => {
    const { width, height } = useWindowDimensions();
    const { colors }: { colors: ThemeColors } = useTheme();
    const styles = useMemo(
      () => createStyles(width, height, colors),
      [width, height, colors],
    );

    const getIconColor = () => {
      switch (icon) {
        case 'success':
          return colors.success || colors.primary;
        case 'error':
          return colors.error;
        case 'info':
          return colors.primary;
        default:
          return colors.warning || colors.primary;
      }
    };

    const handleButtonPress = (button: AlertButton) => {
      if (button.onPress) {
        button.onPress();
      }
      onClose();
    };

    const renderButton = (button: AlertButton, index: number) => {
      const isLast = index === buttons.length - 1;
      const isCancel = button.style === 'cancel';
      const isDestructive = button.style === 'destructive';

      return (
        <Pressable
          key={index}
          style={[
            styles.alertButton,
            !isLast && styles.alertButtonBorder,
            isCancel && styles.cancelButton,
            isDestructive && styles.destructiveButton,
          ]}
          onPress={() => handleButtonPress(button)}
        >
          <Text
            style={[
              styles.alertButtonText,
              isCancel && styles.cancelButtonText,
              isDestructive && styles.destructiveButtonText,
            ]}
          >
            {button.text}
          </Text>
        </Pressable>
      );
    };

    return (
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={onClose}
      >
        <Pressable style={styles.overlay} onPress={onClose}>
          <View style={styles.modalContainer} pointerEvents="box-none">
            {/* Icon */}
            <View style={styles.iconContainer}>
              <Shake visible={visible}>
                <AlertIcon color={getIconColor()} type={icon} />
              </Shake>
            </View>

            {/* Title */}
            <Text style={styles.title}>{title}</Text>

            {/* Message */}
            <Text style={styles.message}>{message}</Text>

            {/* Buttons */}
            <View style={styles.buttonsContainer}>
              {buttons.map(renderButton)}
            </View>
          </View>
        </Pressable>
      </Modal>
    );
  },
);

const createStyles = (width: number, height: number, colors: ThemeColors) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: scale(20),
    },
    modalContainer: {
      backgroundColor: colors.modalColor,
      borderRadius: moderateScale(16),
      padding: moderateScale(20),
      maxWidth: width * 0.85,
      width: '100%',
      alignItems: 'center',
      elevation: 10,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 5,
      },
      shadowOpacity: 0.3,
      shadowRadius: 10,
    },
    iconContainer: {
      width: moderateScale(48),
      height: moderateScale(48),
      borderRadius: moderateScale(24),
      backgroundColor: colors.surface,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: verticalScale(16),
      borderWidth: 1,
      borderColor: colors.outline + '30',
    },
    title: {
      fontSize: moderateScale(18),
      color: colors.modalText,
      textAlign: 'center',
      marginBottom: verticalScale(8),
      fontWeight: '600',
    },
    message: {
      fontSize: moderateScale(16),
      color: colors.modalText,
      textAlign: 'center',
      marginBottom: verticalScale(20),
      lineHeight: moderateScale(22),
      opacity: 0.9,
    },
    buttonsContainer: {
      flexDirection: 'row',
      width: '100%',
      borderRadius: moderateScale(8),
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: colors.outline + '30',
    },
    alertButton: {
      flex: 1,
      paddingVertical: verticalScale(12),
      paddingHorizontal: scale(16),
      backgroundColor: colors.surface,
      justifyContent: 'center',
      alignItems: 'center',
    },
    alertButtonBorder: {
      borderRightWidth: 1,
      borderRightColor: colors.outline + '30',
    },
    cancelButton: {
      backgroundColor: colors.surface,
    },
    destructiveButton: {
      backgroundColor: colors.error + '10',
    },
    alertButtonText: {
      fontSize: moderateScale(16),
      color: colors.modalText,
      fontWeight: '500',
    },
    cancelButtonText: {
      color: colors.onSurfaceVariant,
      fontWeight: '400',
    },
    destructiveButtonText: {
      color: colors.error,
      fontWeight: '600',
    },
  });

export default AlertModal;
