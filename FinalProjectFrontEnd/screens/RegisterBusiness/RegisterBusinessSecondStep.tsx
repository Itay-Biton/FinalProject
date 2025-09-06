// screens/RegisterBusiness/RegisterBusinessSecondStep.tsx
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
import { RegisterBusinessStackParamList } from '../../navigation/RegisterBusinessNavigation';
import { ThemeColors } from '../../types/theme';
import CustomBackButton from '../../components/UI/CustomBackButton';
import ImagePickerModal from '../../components/Modals/ImagePickerModal';
import ImageCropPicker from 'react-native-image-crop-picker';
import DottedCubeWithPlus from '../../components/UI/DottedCubeWithPlus';
import NextIconSvg from '../../assets/icons/ic_next.svg';
import { useRegisterBusinessViewModel } from '../../viewModels/RegisterBusinessViewModel';

const NextIcon = ({ color }: { color?: string }) => (
  <NextIconSvg
    width={moderateScale(40)}
    height={moderateScale(40)}
    fill={color ?? 'black'}
  />
);

type Props = NativeStackScreenProps<
  RegisterBusinessStackParamList,
  'RegisterBusinessSecondStep'
>;

const RegisterBusinessSecondStep: React.FC<Props> = ({ navigation, route }) => {
  const { businessId } = route.params;
  const { width, height } = useWindowDimensions();
  const { colors }: { colors: ThemeColors } = useTheme();
  const { t } = useTranslation();
  const styles = useMemo(
    () => createStyles(width, height, colors),
    [width, height, colors],
  );

  // ViewModel (keep `error` to display server-side failures)
  const { loading, error, uploadBusinessImages } =
    useRegisterBusinessViewModel();

  // Selected image paths per slot
  const [images, setImages] = useState<(string | null)[]>(Array(6).fill(null));
  // Per-slot runtime state
  const [uploadingSlots, setUploadingSlots] = useState<boolean[]>(
    Array(6).fill(false),
  );
  const [uploadedSlots, setUploadedSlots] = useState<boolean[]>(
    Array(6).fill(false),
  );

  const [modalVisible, setModalVisible] = useState(false);
  const [activeBox, setActiveBox] = useState<number | null>(null);

  const getSelectedImagesCount = () => images.filter(Boolean).length;
  const getUploadedImagesCount = () =>
    images.reduce(
      (acc, uri, idx) => acc + (uri && uploadedSlots[idx] ? 1 : 0),
      0,
    );

  // Allow Next with zero images; otherwise require every selected to be uploaded.
  const selectedCount = getSelectedImagesCount();
  const uploadedCount = getUploadedImagesCount();
  const anyUploading = uploadingSlots.some(Boolean) || loading;
  const allSelectedUploaded =
    selectedCount === 0 || uploadedCount === selectedCount;
  const canProceed = !anyUploading && allSelectedUploaded;

  // --- local setters to avoid literal-type inference issues ---
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
      // Upload only this one image now (service accepts string[] of URIs)
      await uploadBusinessImages(businessId, [uri]);
      setSlotUploaded(index, true);
      console.log(`Business slot ${index} uploaded successfully`);
    } catch (e: any) {
      console.warn('Business single upload failed:', e?.message || e);
      setSlotUploaded(index, false);
      Alert.alert(
        t('upload_failed', { defaultValue: 'Upload Failed' }),
        e?.message ||
          t('failed_to_upload_business_images', {
            defaultValue:
              'Failed to upload image. Please check your connection and try again.',
          }),
      );
      // Optional UX: auto-clear the slot on failure:
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
          })
        : await ImageCropPicker.openPicker({
            width: 1080,
            height: 1080,
            cropping: true,
            compressImageQuality: 0.8,
          });

      if (activeBox !== null && photo.path) {
        setSlotImage(activeBox, photo.path);
        console.log(`Business image added at index ${activeBox}:`, photo.path);
        // Immediately upload this single image; Next will only enable after success.
        await uploadOne(activeBox, photo.path);
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
      setActiveBox(null);
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

    if (!allSelectedUploaded) {
      Alert.alert(
        t('pendingImages', { defaultValue: 'Pending Images' }),
        t('pleaseUploadOrRemovePending', {
          defaultValue:
            'Some selected images have not finished uploading. Please wait, retry, or remove them.',
        }),
      );
      return;
    }

    navigation.navigate('RegisterBusinessThirdStep', { businessId });
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
            <CustomBackButton onPress={() => navigation.goBack()} />
          </View>

          <Image
            source={require('../../assets/icons/ic_business_camera.png')}
            style={styles.logo}
          />

          <Text style={styles.title}>{t('business_photos')}</Text>

          {/* Selected count */}
          <Text style={styles.countText}>
            {t('images_selected', {
              count: selectedCount,
              total: 6,
              defaultValue: `${selectedCount}/6 images selected`,
            })}
          </Text>

          {/* Server error (if any) */}
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <View style={styles.boxesContainer}>
            {images.map((uri, i) => (
              <View key={i} style={[styles.imageBox, styles.wrapperBox]}>
                <DottedCubeWithPlus
                  imageUri={uri}
                  onPress={() => {
                    if (uploadingSlots[i]) return; // lock tile during its upload
                    setActiveBox(i);
                    setModalVisible(true);
                  }}
                  onRemove={uri ? () => handleRemoveImage(i) : undefined}
                  style={styles.imageBox}
                />

                {/* Per-tile overlay while uploading */}
                {uploadingSlots[i] && (
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

                {/* Badge when picked but not uploaded yet (and not uploading now) */}
                {uri && !uploadedSlots[i] && !uploadingSlots[i] && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>
                      {t('pending', { defaultValue: 'Pending' })}
                    </Text>
                  </View>
                )}
              </View>
            ))}
          </View>

          <Text style={styles.helperText}>
            {t('business_photos_helper', {
              defaultValue:
                'Add photos of your business, services, and facilities to attract more customers.',
            })}
          </Text>

          {(loading || anyUploading) && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.buttonColor} />
              <Text style={styles.loadingText}>
                {t('uploading_business_images', {
                  defaultValue: 'Uploading business images…',
                })}
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
                <NextIcon color={colors.buttonTextColor} />
              )}
            </Pressable>
          </View>
        </View>
      </ScrollView>

      <ImagePickerModal
        visible={modalVisible}
        onClose={() => {
          setModalVisible(false);
          setActiveBox(null);
        }}
        onTakePhoto={() => pickImage(true)}
        onChooseFromGallery={() => pickImage(false)}
      />
    </>
  );
};

const GAP = moderateScale(8);
const BOX = moderateScale(94);

const createStyles = (_w: number, _h: number, colors: ThemeColors) =>
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
      width: _w - moderateScale(32),
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
      marginBottom: moderateScale(10),
      textAlign: 'center',
    },
    countText: {
      fontSize: moderateScale(14),
      color: colors.primary,
      marginBottom: moderateScale(15),
      opacity: 0.7,
    },
    errorContainer: {
      backgroundColor: colors.errorContainer,
      marginHorizontal: moderateScale(16),
      marginVertical: verticalScale(8),
      padding: moderateScale(12),
      borderRadius: moderateScale(8),
      alignItems: 'center',
      width: _w - moderateScale(64),
    },
    errorText: {
      color: colors.error,
      textAlign: 'center',
      fontSize: moderateScale(14),
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
    /** wrapper to avoid inline styles */
    wrapperBox: {
      position: 'relative',
    },
    helperText: {
      fontStyle: 'italic',
      fontSize: moderateScale(15),
      color: colors.primary,
      textAlign: 'center',
      marginVertical: verticalScale(20),
      paddingHorizontal: moderateScale(20),
      lineHeight: moderateScale(22),
      opacity: 0.8,
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

export default RegisterBusinessSecondStep;
