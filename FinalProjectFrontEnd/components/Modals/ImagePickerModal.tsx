import React, { memo, useMemo } from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import { useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { ThemeColors } from '../../types/theme';

// Placeholder icon imports (replace these with your actual SVG imports)
import CameraIconSvg from '../../assets/icons/ic_camera.svg';
import GalleryIconSvg from '../../assets/icons/ic_gallery.svg';
import CloseIconSvg from '../../assets/icons/ic_cancel.svg';
import Shake from '../Animations/Shake';

type ImagePickerModalProps = {
  visible: boolean;
  onClose: () => void;
  onTakePhoto: () => void;
  onChooseFromGallery: () => void;
};

const CameraIcon = ({ color }: { color?: string }) => (
  <CameraIconSvg
    width={moderateScale(20)}
    height={moderateScale(20)}
    stroke={color || 'black'}
  />
);

const GalleryIcon = ({ color }: { color?: string }) => (
  <GalleryIconSvg
    width={moderateScale(20)}
    height={moderateScale(20)}
    stroke={color || 'black'}
  />
);

const CloseIcon = ({ color }: { color?: string }) => (
  <CloseIconSvg
    width={moderateScale(20)}
    height={moderateScale(20)}
    stroke={color || 'black'}
  />
);

const ImagePickerModal: React.FC<ImagePickerModalProps> = memo(
  ({ visible, onClose, onTakePhoto, onChooseFromGallery }) => {
    const { width, height } = useWindowDimensions();
    const { colors }: { colors: ThemeColors } = useTheme();
    const { t } = useTranslation();
    const styles = useMemo(
      () => createStyles(width, height, colors),
      [width, height, colors],
    );

    return (
      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={onClose}
      >
        <Pressable style={styles.overlay} onPress={onClose}>
          <View style={styles.modalContainer} pointerEvents="box-none">
            {/* Animated handle */}
            <View style={styles.handle} />
            <Text style={styles.title}>{t('select_option')}</Text>
            <Pressable style={styles.button} onPress={onTakePhoto}>
              <Shake visible={visible}>
                <CameraIcon color={colors.primary} />
              </Shake>
              <Text style={styles.buttonText}>{t('take_photo')}</Text>
            </Pressable>
            <Pressable style={styles.button} onPress={onChooseFromGallery}>
              <Shake visible={visible}>
                <GalleryIcon color={colors.primary} />
              </Shake>
              <Text style={styles.buttonText}>{t('choose_from_gallery')}</Text>
            </Pressable>
            <Pressable style={styles.cancelButton} onPress={onClose}>
              <Shake visible={visible}>
                <CloseIcon color={colors.error} />
              </Shake>
              <Text style={styles.cancelButtonText}>{t('cancel')}</Text>
            </Pressable>
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
      backgroundColor: 'transplant',
      justifyContent: 'flex-end',
    },
    modalContainer: {
      backgroundColor: colors.modalColor,
      padding: moderateScale(16),
      borderTopLeftRadius: moderateScale(16),
      borderTopRightRadius: moderateScale(16),
    },
    handle: {
      width: moderateScale(40),
      height: moderateScale(4),
      borderRadius: moderateScale(2),
      backgroundColor: colors.modalHandle,
      alignSelf: 'center',
      marginBottom: moderateScale(10),
    },
    title: {
      fontSize: moderateScale(20),
      color: colors.modalText,
      textAlign: 'center',
      marginBottom: moderateScale(8),
    },
    button: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: moderateScale(8),
      marginBottom: moderateScale(6),
    },
    buttonText: {
      fontSize: moderateScale(18),
      color: colors.modalText,
      marginLeft: moderateScale(12),
    },
    cancelButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: moderateScale(8),
      marginBottom: moderateScale(6),
    },
    cancelButtonText: {
      fontSize: moderateScale(18),
      color: colors.error,
      marginLeft: moderateScale(12),
    },
  });

export default ImagePickerModal;
