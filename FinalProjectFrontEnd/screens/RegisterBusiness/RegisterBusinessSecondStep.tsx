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

  // ViewModel
  const { loading, error, uploadBusinessImages } =
    useRegisterBusinessViewModel();

  const [images, setImages] = useState<(string | null)[]>(Array(6).fill(null));
  const [modalVisible, setModalVisible] = useState(false);
  const [activeBox, setActiveBox] = useState<number | null>(null);

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
        setImages(prev => {
          const next = [...prev];
          next[activeBox] = photo.path;
          return next;
        });

        console.log(`Business image added at index ${activeBox}:`, photo.path);
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
      setActiveBox(null);
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

    if (selectedCount === 0) {
      Alert.alert(
        t('no_images_selected', { defaultValue: 'No Images Selected' }),
        t('business_needs_images', {
          defaultValue:
            'Please add at least one image of your business to continue.',
        }),
        [
          {
            text: t('add_images', { defaultValue: 'Add Images' }),
            style: 'default',
          },
          {
            text: t('skip', { defaultValue: 'Skip for Now' }),
            style: 'cancel',
            onPress: () => {
              // Allow skipping but show warning
              Alert.alert(
                t('skip_images', { defaultValue: 'Skip Images?' }),
                t('skip_images_warning', {
                  defaultValue:
                    'Businesses with images get more visibility. You can add them later.',
                }),
                [
                  {
                    text: t('go_back', { defaultValue: 'Go Back' }),
                    style: 'cancel',
                  },
                  {
                    text: t('continue', { defaultValue: 'Continue' }),
                    onPress: () =>
                      navigation.navigate('RegisterBusinessThirdStep', {
                        businessId,
                      }),
                  },
                ],
              );
            },
          },
        ],
      );
      return;
    }

    try {
      console.log(
        `Starting upload of ${selectedCount} business images for business ${businessId}`,
      );

      // Upload all selected images
      await uploadBusinessImages(businessId, images);

      console.log('All business images uploaded successfully');

      // Navigate to next step
      navigation.navigate('RegisterBusinessThirdStep', { businessId });
    } catch (err: any) {
      console.error('Business image upload failed:', err);

      Alert.alert(
        t('upload_failed', { defaultValue: 'Upload Failed' }),
        err.message ||
          t('failed_to_upload_business_images', {
            defaultValue:
              'Failed to upload business images. Please check your connection and try again.',
          }),
        [
          {
            text: t('try_again', { defaultValue: 'Try Again' }),
            onPress: handleNext,
          },
          {
            text: t('skip', { defaultValue: 'Skip for Now' }),
            style: 'cancel',
            onPress: () =>
              navigation.navigate('RegisterBusinessThirdStep', { businessId }),
          },
        ],
      );
    }
  };

  const canProceed = !loading; // Allow proceeding even without images (with warning)

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

          {/* Show selected count */}
          <Text style={styles.countText}>
            {t('images_selected', {
              count: getSelectedImagesCount(),
              total: 6,
              defaultValue: `${getSelectedImagesCount()}/6 images selected`,
            })}
          </Text>

          {/* Error Display */}
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <View style={styles.boxesContainer}>
            {images.map((img, i) => (
              <DottedCubeWithPlus
                key={i}
                imageUri={img}
                onPress={() => {
                  setActiveBox(i);
                  setModalVisible(true);
                }}
                onRemove={img ? () => handleRemoveImage(i) : undefined}
                style={styles.imageBox}
              />
            ))}
          </View>

          <Text style={styles.helperText}>
            {t('business_photos_helper', {
              defaultValue:
                'Add photos of your business, services, and facilities to attract more customers.',
            })}
          </Text>

          {/* Loading indicator */}
          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.buttonColor} />
              <Text style={styles.loadingText}>
                {t('uploading_business_images', {
                  defaultValue: 'Uploading business images...',
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
            >
              {loading ? (
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
      marginBottom: verticalScale(10),
      textAlign: 'center',
    },
    countText: {
      fontSize: moderateScale(14),
      color: colors.primary,
      marginBottom: verticalScale(15),
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

export default RegisterBusinessSecondStep;
