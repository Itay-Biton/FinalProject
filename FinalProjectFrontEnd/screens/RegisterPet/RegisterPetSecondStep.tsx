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
  const { petId, isFound } = route.params;

  const { width } = useWindowDimensions();
  const { colors }: { colors: ThemeColors } = useTheme();
  const styles = useMemo(() => createStyles(width, colors), [width, colors]);
  const { t } = useTranslation();

  // View model hook (no unused vars)
  const { loading, uploadPetImages } = useRegisterPetViewModel();

  // selected image paths per slot
  const [images, setImages] = useState<(string | null)[]>(Array(6).fill(null));
  // per-slot runtime state
  const [uploadingSlots, setUploadingSlots] = useState<boolean[]>(
    Array(6).fill(false),
  );
  const [uploadedSlots, setUploadedSlots] = useState<boolean[]>(
    Array(6).fill(false),
  );

  const [modalVisible, setModalVisible] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const getSelectedImagesCount = () => images.filter(Boolean).length;
  const getUploadedImagesCount = () =>
    images.reduce(
      (acc, uri, idx) => acc + (uri && uploadedSlots[idx] ? 1 : 0),
      0,
    );

  // allow Next even with 0 images; only block while any upload is in-flight
  const anyUploading = uploadingSlots.some(Boolean) || loading;
  const canProceed = !anyUploading;

  // helpers that avoid literal-type inference issues
  const setSlotUploading = (index: number, value: boolean) =>
    setUploadingSlots(prev => {
      const next = [...prev];
      next[index] = value;
      return next;
    });

  const setSlotUploaded = (index: number, value: boolean) =>
    setUploadedSlots(prev => {
      const next = [...prev];
      next[index] = value;
      return next;
    });

  const setSlotImage = (index: number, value: string | null) =>
    setImages(prev => {
      const next = [...prev];
      next[index] = value;
      return next;
    });

  const uploadOne = async (index: number, uri: string) => {
    setSlotUploading(index, true);
    setSlotUploaded(index, false);
    try {
      await uploadPetImages(petId, [uri], 'pet');
      setSlotUploaded(index, true);
      console.log(`Slot ${index} uploaded successfully`);
    } catch (e: any) {
      console.warn('Single upload failed:', e?.message || e);
      setSlotUploaded(index, false);
      Alert.alert(
        t('uploadFailed', { defaultValue: 'Upload Failed' }),
        e?.message ||
          t('failedToUploadImages', {
            defaultValue:
              'Failed to upload image. Please check your connection and try again.',
          }),
      );
      // optional UX: clear the slot on failure
      // setSlotImage(index, null);
    } finally {
      setSlotUploading(index, false);
    }
  };

  const pickImage = async (fromCamera = false) => {
    try {
      if (fromCamera) StatusBar.setHidden(true, 'fade');

      const photo = fromCamera
        ? await ImageCropPicker.openCamera({
            width: 1080,
            height: 1080,
            cropping: true,
            compressImageQuality: 0.8,
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
        setSlotImage(activeIndex, photo.path);
        console.log(`Image added at index ${activeIndex}:`, photo.path);
        // immediately upload just this image; "Next" locks only while uploading
        await uploadOne(activeIndex, photo.path);
      }
    } catch (err: any) {
      if (err?.message !== 'User cancelled image selection') {
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
    setSlotImage(index, null);
    setSlotUploaded(index, false);
    setSlotUploading(index, false);
  };

  const handleNext = () => {
    if (anyUploading) {
      Alert.alert(
        t('stillUploading', { defaultValue: 'Still Uploading' }),
        t('pleaseWaitUploads', {
          defaultValue: 'Please wait until current uploads finish.',
        }),
      );
      return;
    }

    // With 0 images selected or all uploads settled, proceed.
    navigation.replace('RegisterPetThirdStep', { petId, isFound });
  };

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

          <Text style={styles.countText}>
            {t('imagesSelected', {
              count: getSelectedImagesCount(),
              total: 6,
              defaultValue: `${getSelectedImagesCount()}/6 images selected`,
            })}
          </Text>

          <View style={styles.boxesContainer}>
            {images.map((uri, idx) => (
              <View key={idx} style={[styles.imageBox, styles.wrapperBox]}>
                <DottedCubeWithPlus
                  imageUri={uri}
                  onPress={() => {
                    if (uploadingSlots[idx]) return; // lock tile while uploading
                    setActiveIndex(idx);
                    setModalVisible(true);
                  }}
                  onRemove={uri ? () => handleRemoveImage(idx) : undefined}
                  style={styles.imageBox}
                />

                {/* Per-tile overlay while uploading */}
                {uploadingSlots[idx] && (
                  <View style={styles.tileOverlay}>
                    <ActivityIndicator
                      size="small"
                      color={colors.buttonTextColor}
                    />
                    <Text style={styles.tileOverlayText}>
                      {t('uploading', { defaultValue: 'Uploading…' })}
                    </Text>
                  </View>
                )}

                {/* Small badge if picked but not uploaded yet (not uploading now) */}
                {uri && !uploadedSlots[idx] && !uploadingSlots[idx] && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>
                      {t('pending', { defaultValue: 'Pending' })}
                    </Text>
                  </View>
                )}
              </View>
            ))}
          </View>

          <Text style={styles.italicText}>{t('ensureQuality')}</Text>

          {(loading || anyUploading) && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.buttonColor} />
              <Text style={styles.loadingText}>
                {t('uploadingImages', { defaultValue: 'Uploading images…' })}
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
              accessibilityState={{ disabled: !canProceed }}
            >
              {anyUploading ? (
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
      marginBottom: moderateScale(15),
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
    /** moved from inline to satisfy react-native/no-inline-styles */
    wrapperBox: {
      position: 'relative',
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
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
    },
    disabledButton: {
      opacity: 0.6,
      elevation: 0,
      shadowOpacity: 0,
    },
    // overlays / badges
    tileOverlay: {
      position: 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      backgroundColor: 'rgba(0,0,0,0.35)',
      borderRadius: moderateScale(10),
      alignItems: 'center',
      justifyContent: 'center',
    },
    tileOverlayText: {
      marginTop: 6,
      fontSize: moderateScale(11),
      color: '#fff',
    },
    badge: {
      position: 'absolute',
      bottom: 6,
      right: 6,
      backgroundColor: 'rgba(255,165,0,0.9)',
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 8,
    },
    badgeText: {
      color: '#111',
      fontSize: moderateScale(10),
      fontWeight: '600',
    },
  });
