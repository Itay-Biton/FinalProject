// screens/RegisterPet/RegisterPetThirdStep.tsx

import React, { useState, useMemo } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Pressable,
  useWindowDimensions,
  Alert,
  I18nManager,
} from 'react-native';
import { TextInput, Text, ProgressBar, useTheme } from 'react-native-paper';
import { moderateScale, verticalScale } from 'react-native-size-matters';
import { useTranslation } from 'react-i18next';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { RegisterPetStackParamList } from '../../navigation/RegisterPetNavigation';
import CustomBackButton from '../../components/UI/CustomBackButton';
import RegisterIconSvg from '../../assets/icons/ic_register.svg';
import { useRegisterPetViewModel } from '../../viewModels/RegisterPetViewModel';
import { ThemeColors } from '../../types/theme';

type Props = NativeStackScreenProps<
  RegisterPetStackParamList,
  'RegisterPetThirdStep'
>;

const RegisterIcon = ({ color }: { color?: string }) => (
  <RegisterIconSvg
    width={moderateScale(40)}
    height={moderateScale(40)}
    fill={color || 'black'}
  />
);

export default function RegisterPetThirdStep({ navigation, route }: Props) {
  const { petId } = route.params;
  const { width } = useWindowDimensions();
  const { colors }: { colors: ThemeColors } = useTheme();
  const { t } = useTranslation();
  const styles = useMemo(() => createStyles(width, colors), [width, colors]);

  const [description, setDescription] = useState('');
  const { loading, updatePetDescription } = useRegisterPetViewModel();

  const handleFinish = async () => {
    try {
      await updatePetDescription(petId, description);
      Alert.alert(
        t('success'),
        t('pet_registered_successfully'),
        [{ text: t('ok'), onPress: () => navigation.popToTop() }],
        { cancelable: false },
      );
    } catch (err: any) {
      Alert.alert(t('error'), err.message);
    }
  };

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.scrollViewContent}
    >
      <View style={styles.container}>
        <ProgressBar
          progress={1.0}
          color={colors.buttonColor}
          style={[
            styles.progressBar,
            I18nManager.isRTL && styles.progressBarRTL,
          ]}
        />

        <View style={styles.backButton}>
          <CustomBackButton />
        </View>

        <Text style={styles.title}>{t('pet_description')}</Text>

        <View style={styles.card}>
          <Text style={styles.label}>{t('description')}</Text>
          <TextInput
            mode="outlined"
            placeholder={t('enter_pet_description_example')}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={6}
            maxLength={500}
            style={styles.descriptionInput}
            contentStyle={styles.descriptionContent}
            outlineStyle={styles.inputOutline}
            placeholderTextColor={colors.onSurfaceVariant}
          />

          <Text style={styles.characterCounter}>{description.length}/500</Text>
        </View>

        <Pressable
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleFinish}
          disabled={loading}
        >
          <RegisterIcon color={colors.buttonTextColor} />
        </Pressable>
      </View>
    </ScrollView>
  );
}

const createStyles = (width: number, colors: any) =>
  StyleSheet.create({
    scrollView: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollViewContent: {
      flexGrow: 1,
      padding: moderateScale(16),
    },
    container: {
      flex: 1,
      alignItems: 'center',
    },
    progressBar: {
      width: width - moderateScale(32),
      marginBottom: verticalScale(12),
    },
    progressBarRTL: {
      transform: [{ scaleX: -1 }],
    },
    backButton: {
      alignSelf: I18nManager.isRTL ? 'flex-end' : 'flex-start',
      marginBottom: verticalScale(10),
    },
    title: {
      fontSize: moderateScale(22),
      color: colors.primary,
      marginBottom: verticalScale(20),
      fontWeight: '500',
      textAlign: 'center',
    },
    card: {
      width: '100%',
      marginBottom: verticalScale(24),
    },
    label: {
      fontSize: moderateScale(18),
      color: colors.primary,
      marginBottom: verticalScale(8),
    },
    descriptionInput: {
      backgroundColor: colors.surface,
      minHeight: verticalScale(140),
      borderRadius: moderateScale(12),
    },
    descriptionContent: {
      padding: verticalScale(16),
      textAlignVertical: 'top',
      fontSize: moderateScale(16),
      lineHeight: verticalScale(24),
    },
    inputOutline: {
      borderColor: colors.outline,
      borderWidth: 1,
      borderRadius: moderateScale(12),
    },
    characterCounter: {
      alignSelf: 'flex-end',
      fontSize: moderateScale(12),
      color: colors.onSurfaceVariant,
      marginTop: verticalScale(4),
    },
    button: {
      backgroundColor: colors.buttonColor,
      padding: moderateScale(16),
      borderRadius: moderateScale(50),
      alignItems: 'center',
      marginBottom: verticalScale(20),
    },
    buttonDisabled: {
      opacity: 0.6,
    },
  });
