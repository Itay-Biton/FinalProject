// screens/RegisterPet/RegisterPetSecondStep.tsx
import React, { useMemo, useState } from 'react';
import {
  View,
  Image,
  StyleSheet,
  ScrollView,
  useWindowDimensions,
  StatusBar,
  Pressable,
  I18nManager,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Text, ProgressBar, useTheme } from 'react-native-paper';
import { moderateScale, verticalScale } from 'react-native-size-matters';
import { useTranslation } from 'react-i18next';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { RegisterPetStackParamList } from '../../navigation/RegisterPetNavigation';
import { ThemeColors } from '../../types/theme';
import CustomBackButton from '../../components/UI/CustomBackButton';
import ImagePickerModal from '../../components/Modals/ImagePickerModal';
import ImageCropPicker from 'react-native-image-crop-picker';
import DottedCubeWithPlus from '../../components/UI/DottedCubeWithPlus';
import RegisterIconSvg from '../../assets/icons/ic_next.svg';

import { useRegisterPetViewModel } from '../../viewModels/RegisterPetViewModel';

const RegisterIcon = ({ color }: { color?: string }) => (
  <RegisterIconSvg
    width={moderateScale(40)}
    height={moderateScale(40)}
    fill={color ?? 'black'}
  />
);

type Props = NativeStackScreenProps<
  RegisterPetStackParamList,
  'RegisterPetSecondStep'
>;

export default function RegisterPetSecondStep({ navigation, route }: Props) {
  const { petId } = route.params;
  const { width } = useWindowDimensions();
  const { colors }: { colors: ThemeColors } = useTheme();
  const styles = useMemo(() => createStyles(width, colors), [width, colors]);
  const { t } = useTranslation();

  // View model hook
  const { loading, error, uploadPetImages } = useRegisterPetViewModel();

  const [images, setImages] = useState<(string | null)[]>(Array(6).fill(null));
  const [modalVisible, setModalVisible] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const pickImage = async (fromCamera = false) => {
    try {
      if (fromCamera) StatusBar.setHidden(true, 'fade');

      const photo = fromCamera
        ? await ImageCropPicker.openCamera({
            width: 1080,
            height: 1080,
            cropping: true,
            compressImageQuality: 0.8, // Slightly compress to reduce file size
            cropperCircleOverlay: false,
            cropperToolbarTitle: t('editPhoto', { defaultValue: 'Edit Photo' }),
          })
        : await ImageCropPicker.openPicker({
            width: 1080,
            height: 1080,
            cropping: true,
            compressImageQuality: 0.8,
            cropperCircleOverlay: false,
            cropperToolbarTitle: t('editPhoto', { defaultValue: 'Edit Photo' }),
          });

      if (activeIndex !== null && photo.path) {
        setImages(prev => {
          const next = [...prev];
          next[activeIndex] = photo.path;
          return next;
        });

        console.log(`Image added at index ${activeIndex}:`, photo.path);
      }
    } catch (err: any) {
      if (err.message !== 'User cancelled image selection') {
        console.warn('Image picker error:', err);
        Alert.alert(
          t('error'),
          t('failedToSelectImage', {
            defaultValue: 'Failed to select image. Please try again.',
          }),
        );
      }
    } finally {
      setModalVisible(false);
      setActiveIndex(null);
      StatusBar.setHidden(false, 'fade');
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(prev => {
      const next = [...prev];
      next[index] = null;
      return next;
    });
  };

  const getSelectedImagesCount = () => {
    return images.filter(img => img !== null).length;
  };

  const handleNext = async () => {
    const selectedCount = getSelectedImagesCount();

    // Validate that at least one image is selected
    if (selectedCount === 0) {
      Alert.alert(
        t('noImagesSelected', { defaultValue: 'No Images Selected' }),
        t('pleaseSelectAtLeastOneImage', {
          defaultValue:
            'Please select at least one image of your pet before continuing.',
        }),
      );
      return;
    }

    try {
      console.log(
        `Starting upload of ${selectedCount} images for pet ${petId}`,
      );

      // Upload all selected images
      await uploadPetImages(petId, images);

      console.log('All images uploaded successfully');

      // Navigate to next step
      navigation.replace('RegisterPetThirdStep', { petId });
    } catch (err: any) {
      console.error('Upload failed:', err);

      Alert.alert(
        t('uploadFailed', { defaultValue: 'Upload Failed' }),
        err.message ||
          t('failedToUploadImages', {
            defaultValue:
              'Failed to upload images. Please check your connection and try again.',
          }),
        [
          {
            text: t('tryAgain', { defaultValue: 'Try Again' }),
            onPress: handleNext,
          },
          {
            text: t('cancel', { defaultValue: 'Cancel' }),
            style: 'cancel',
          },
        ],
      );
    }
  };

  const canProceed = getSelectedImagesCount() > 0 && !loading;

  return (
    <>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
      >
        <StatusBar />
        <View style={styles.container}>
          <ProgressBar
            progress={0.66}
            color={colors.buttonColor}
            style={[
              styles.progressBar,
              I18nManager.isRTL && styles.progressBarRTL,
            ]}
          />

          <View style={styles.backButton}>
            <CustomBackButton />
          </View>

          <Image
            source={require('../../assets/icons/ic_take_pictures.png')}
            style={styles.logo}
          />

          <Text style={styles.title}>{t('takePictures')}</Text>

          {/* Show selected count */}
          <Text style={styles.countText}>
            {t('imagesSelected', {
              count: getSelectedImagesCount(),
              total: 6,
              defaultValue: `${getSelectedImagesCount()}/6 images selected`,
            })}
          </Text>

          <View style={styles.boxesContainer}>
            {images.map((uri, idx) => (
              <DottedCubeWithPlus
                key={idx}
                imageUri={uri}
                onPress={() => {
                  setActiveIndex(idx);
                  setModalVisible(true);
                }}
                onRemove={uri ? () => handleRemoveImage(idx) : undefined}
                style={styles.imageBox}
              />
            ))}
          </View>

          <Text style={styles.italicText}>{t('ensureQuality')}</Text>

          {/* Loading indicator */}
          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.buttonColor} />
              <Text style={styles.loadingText}>
                {t('uploadingImages', { defaultValue: 'Uploading images...' })}
              </Text>
            </View>
          )}

          <View style={styles.buttonContainer}>
            <Pressable
              style={[
                styles.customButton,
                !canProceed && styles.disabledButton,
              ]}
              onPress={handleNext}
              disabled={!canProceed}
            >
              {loading ? (
                <ActivityIndicator color={colors.buttonTextColor} />
              ) : (
                <RegisterIcon color={colors.buttonTextColor} />
              )}
            </Pressable>
          </View>
        </View>
      </ScrollView>

      <ImagePickerModal
        visible={modalVisible}
        onClose={() => {
          setModalVisible(false);
          setActiveIndex(null);
        }}
        onTakePhoto={() => pickImage(true)}
        onChooseFromGallery={() => pickImage(false)}
      />
    </>
  );
}

const GAP = moderateScale(8);
const BOX = moderateScale(94);

const createStyles = (width: number, colors: ThemeColors) =>
  StyleSheet.create({
    scrollView: {
      flexGrow: 1,
      backgroundColor: colors.background,
    },
    scrollViewContent: {
      flexGrow: 1,
    },
    container: {
      flex: 1,
      paddingTop: verticalScale(50),
      alignItems: 'center',
      backgroundColor: colors.background,
      paddingHorizontal: moderateScale(16),
    },
    progressBar: {
      width: width - moderateScale(32),
      marginBottom: moderateScale(8),
    },
    progressBarRTL: {
      transform: [{ scaleX: -1 }],
    },
    backButton: {
      alignSelf: I18nManager.isRTL ? 'flex-end' : 'flex-start',
      marginBottom: verticalScale(10),
    },
    logo: {
      width: moderateScale(150),
      height: moderateScale(150),
      resizeMode: 'contain',
      marginVertical: verticalScale(20),
    },
    title: {
      fontSize: moderateScale(20),
      color: colors.primary,
      marginBottom: verticalScale(10),
      textAlign: 'center',
    },
    countText: {
      fontSize: moderateScale(14),
      color: colors.primary,
      marginBottom: verticalScale(15),
      opacity: 0.7,
    },
    boxesContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      rowGap: GAP,
      columnGap: GAP,
      width: BOX * 3 + GAP * 2,
      alignSelf: 'center',
      marginBottom: verticalScale(15),
    },
    imageBox: {
      width: BOX,
      height: BOX,
    },
    italicText: {
      fontStyle: 'italic',
      fontSize: moderateScale(15),
      color: colors.primary,
      textAlign: 'center',
      marginVertical: verticalScale(20),
      paddingHorizontal: moderateScale(20),
      lineHeight: moderateScale(22),
    },
    loadingContainer: {
      alignItems: 'center',
      marginVertical: verticalScale(20),
    },
    loadingText: {
      marginTop: verticalScale(10),
      fontSize: moderateScale(14),
      color: colors.primary,
      opacity: 0.7,
    },
    buttonContainer: {
      alignItems: 'center',
      marginBottom: verticalScale(30),
      marginTop: 'auto',
    },
    customButton: {
      backgroundColor: colors.buttonColor,
      borderRadius: moderateScale(50),
      padding: moderateScale(20),
      elevation: 3,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
    },
    disabledButton: {
      opacity: 0.6,
      elevation: 0,
      shadowOpacity: 0,
    },
  });
