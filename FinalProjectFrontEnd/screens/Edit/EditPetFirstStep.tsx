// screens/Edit/EditPetFirstStep.tsx
import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Image,
  useWindowDimensions,
  StyleSheet,
  Pressable,
  I18nManager,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useTheme, Text, ProgressBar } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { EditPetStackParamList } from '../../navigation/EditPetNavigation';
import { ThemeColors } from '../../types/theme';
import { getSpeciesList } from '../../constants/speciesList';
import { getEyeColorList } from '../../constants/eyeColorList';
import { getFurColorList } from '../../constants/furColorList';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { useEditPetViewModel } from '../../viewModels/EditPetViewModel';

// UI bits (same style/components as Register)
import CustomInputText from '../../components/UI/CustomInputText';
import CustomTextInputDate from '../../components/UI/CustomTextInputDate';
import CustomInputCheckBox from '../../components/UI/CustomInputCheckBox';
import IconDropdown from '../../components/UI/IconDropdown';

// Icons (reuse same register icons)
import RegisterIconSvg from '../../assets/icons/ic_next.svg';
import PetNameIconSvg from '../../assets/icons/ic_petname.svg';
import SpeciesIconSvg from '../../assets/icons/ic_species.svg';
import BreedIconSvg from '../../assets/icons/ic_breed.svg';
import EyeIconSvg from '../../assets/icons/ic_eye.svg';
import FurIconSvg from '../../assets/icons/ic_fur.svg';
import WeightIconSvg from '../../assets/icons/ic_weight.svg';
import VaccinatedIconSvg from '../../assets/icons/ic_vaccinated.svg';
import ChipIconSvg from '../../assets/icons/ic_chip.svg';
import BirthdayIconSvg from '../../assets/icons/ic_age.svg';
import FoundIconSvg from '../../assets/icons/ic_user.svg';

const RegisterIcon = ({ color }: { color?: string }) => (
  <RegisterIconSvg
    width={moderateScale(40)}
    height={moderateScale(40)}
    fill={color || 'black'}
  />
);
const PetNameIcon = ({ color }: { color?: string }) => (
  <PetNameIconSvg
    width={moderateScale(20)}
    height={moderateScale(20)}
    stroke={color || 'black'}
  />
);
const SpeciesIcon = ({ color }: { color?: string }) => (
  <SpeciesIconSvg
    width={moderateScale(20)}
    height={moderateScale(20)}
    stroke={color || 'black'}
  />
);
const BreedIcon = ({ color }: { color?: string }) => (
  <BreedIconSvg
    width={moderateScale(20)}
    height={moderateScale(20)}
    stroke={color || 'black'}
  />
);
const EyeIcon = ({ color }: { color?: string }) => (
  <EyeIconSvg
    width={moderateScale(20)}
    height={moderateScale(20)}
    stroke={color || 'black'}
  />
);
const FurIcon = ({ color }: { color?: string }) => (
  <FurIconSvg
    width={moderateScale(20)}
    height={moderateScale(20)}
    stroke={color || 'black'}
  />
);
const WeightIcon = ({ color }: { color?: string }) => (
  <WeightIconSvg
    width={moderateScale(20)}
    height={moderateScale(20)}
    stroke={color || 'black'}
  />
);
const VaccinatedIcon = ({ color }: { color?: string }) => (
  <VaccinatedIconSvg
    width={moderateScale(20)}
    height={moderateScale(20)}
    stroke={color || 'black'}
  />
);
const ChipIcon = ({ color }: { color?: string }) => (
  <ChipIconSvg
    width={moderateScale(20)}
    height={moderateScale(20)}
    stroke={color || 'black'}
  />
);
const BirthdayIcon = ({ color }: { color?: string }) => (
  <BirthdayIconSvg
    width={moderateScale(20)}
    height={moderateScale(20)}
    stroke={color || 'black'}
  />
);
const FoundIcon = ({ color }: { color?: string }) => (
  <FoundIconSvg
    width={moderateScale(20)}
    height={moderateScale(20)}
    stroke={color || 'black'}
  />
);

type Props = NativeStackScreenProps<EditPetStackParamList, 'EditPetFirstStep'>;

const EditPetFirstStep: React.FC<Props> = ({ route, navigation }) => {
  const { petId } = route.params;
  const { colors }: { colors: ThemeColors } = useTheme();
  const { t } = useTranslation();
  const { width, height } = useWindowDimensions();
  const styles = useMemo(
    () => createStyles(width, height, colors),
    [width, height, colors],
  );

  const { pet, loading, saving, error, loadPet, updatePet } =
    useEditPetViewModel();

  // Form state (mirrors register)
  const [petName, setPetName] = useState('');
  const [species, setSpecies] = useState('');
  const [breed, setBreed] = useState('');
  const [birthday, setBirthday] = useState('');
  const [eyeColor, setEyeColor] = useState('');
  const [furColor, setFurColor] = useState('');
  const [weight, setWeight] = useState(''); // string input, convert on save
  const [isVaccinated, setIsVaccinated] = useState(false);
  const [hasChip, setHasChip] = useState(false);
  const [isFound, setIsFound] = useState(false); // mirrors your register toggle

  // Lists
  const speciesList = useMemo(() => getSpeciesList(t), [t]);
  const eyeColorList = useMemo(() => getEyeColorList(t), [t]);
  const furColorList = useMemo(() => getFurColorList(t), [t]);

  useEffect(() => {
    (async () => {
      try {
        const p = await loadPet(petId);
        // Prefill fields safely
        setPetName(p.name || '');
        setSpecies(p.species || '');
        setBreed(p.breed || '');
        setBirthday((p as any).birthday || '');
        setEyeColor((p as any).eyeColor || '');
        setFurColor((p as any).furColor || '');
        setWeight(p?.weight?.value != null ? String(p.weight.value) : '');
        setIsVaccinated(!!(p as any).vaccinated);
        setHasChip(!!(p as any).microchipped);
        // Your model uses isLost in other places; keep a consistent toggle here for UX only
        setIsFound(Boolean((p as any).isFound)); // if not present, stays false
      } catch (e) {
        // loadPet already sets error
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [petId]);

  useEffect(() => {
    if (error) {
      Alert.alert(t('error', { defaultValue: 'Error' }), error);
    }
  }, [error, t]);

  const handleSave = async () => {
    try {
      await updatePet(petId, {
        name: petName,
        species,
        breed,
        birthday,
        eyeColor,
        furColor,
        weight: weight ? { value: +weight, unit: 'kg' } : undefined,
        microchipped: hasChip,
        vaccinated: isVaccinated,
        // Note: server likely manages lost/found in separate flows.
        // Keep "isFound" as UX toggle only, omit unless your API expects it here.
      } as any);

      Alert.alert(
        t('pet_updated', { defaultValue: 'Pet updated' }),
        t('pet_updated_success', { defaultValue: 'Your changes were saved.' }),
        [
          {
            text: t('ok', { defaultValue: 'OK' }),
            onPress: () => navigation.goBack(),
          },
        ],
      );
    } catch (e: any) {
      Alert.alert(
        t('error', { defaultValue: 'Error' }),
        e?.message || 'Failed to update pet',
      );
    }
  };

  // Reuse the same renderers as register
  const renderSpeciesItem = (item: any) => (
    <View style={styles.itemContainer}>
      <Image source={item.icon} style={styles.itemIcon} resizeMode="contain" />
      <Text style={styles.itemText}>{item.label}</Text>
    </View>
  );
  const renderEyeColorItem = (item: any) => (
    <View style={styles.itemContainer}>
      <View style={[styles.colorCube, { backgroundColor: item.color }]} />
      <Text style={styles.itemText}>{item.label}</Text>
    </View>
  );
  const renderFurColorItem = (item: any) => (
    <View style={styles.itemContainer}>
      <View style={[styles.colorCube, { backgroundColor: item.color }]} />
      <Text style={styles.itemText}>{item.label}</Text>
    </View>
  );

  return (
    <KeyboardAwareScrollView
      enabled
      bottomOffset={20}
      extraKeyboardSpace={10}
      disableScrollOnKeyboardHide={false}
      style={styles.scrollView}
      contentContainerStyle={styles.scrollViewContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.container}>
        <Image
          source={require('../../assets/icons/ic_register_pet.png')}
          style={styles.logo}
        />
        <View style={styles.card}>
          {/* Full Pet Name */}
          <Text style={styles.label}>
            {t('full_pet_name', { defaultValue: 'Full pet name' })}
          </Text>
          <CustomInputText
            placeholder={t('enter_full_pet_name', {
              defaultValue: 'Enter full pet name',
            })}
            value={petName}
            onChangeText={setPetName}
            leftIcon={PetNameIcon}
            containerStyle={styles.inputFieldContainer}
            leftIconContainerStyle={styles.inputIconContainer}
            iconColor={colors.primary}
          />

          {/* Species */}
          <IconDropdown
            label={t('species', { defaultValue: 'Species' })}
            icon={SpeciesIcon}
            data={speciesList}
            value={species}
            onChange={item => setSpecies(item.value)}
            labelField="label"
            valueField="value"
            placeholder={t('select_species', {
              defaultValue: 'Select species',
            })}
            renderItem={renderSpeciesItem}
          />

          {/* Breed */}
          <Text style={styles.label}>
            {t('breed', { defaultValue: 'Breed' })}
          </Text>
          <CustomInputText
            placeholder={t('enter_breed', { defaultValue: 'Enter breed' })}
            value={breed}
            onChangeText={setBreed}
            leftIcon={BreedIcon}
            containerStyle={styles.inputFieldContainer}
            leftIconContainerStyle={styles.inputIconContainer}
            iconColor={colors.primary}
          />

          {/* Birthday */}
          <Text style={styles.label}>
            {t('birthday', { defaultValue: 'Birthday' })}
          </Text>
          <View style={styles.dateInputWrapper}>
            <CustomTextInputDate
              placeholder={t('select_birthday', {
                defaultValue: 'Select birthday',
              })}
              value={birthday}
              onChangeText={setBirthday}
              leftIcon={BirthdayIcon}
              containerStyle={styles.inputDateFieldContainer}
              leftIconContainerStyle={styles.inputIconContainer}
              rightIconContainerStyle={styles.inputIconContainer}
              iconColor={colors.primary}
              fontSize={moderateScale(8)}
              colors={colors}
              maxDate={new Date()} // Prevent future dates
            />
          </View>

          {/* Weight */}
          <Text style={styles.label}>
            {t('weight', { defaultValue: 'Weight' })}
          </Text>
          <CustomInputText
            placeholder={t('enter_weight_kg', {
              defaultValue: 'Enter weight (kg)',
            })}
            value={weight}
            onChangeText={setWeight}
            keyboardType="numeric"
            leftIcon={WeightIcon}
            containerStyle={styles.inputFieldContainer}
            leftIconContainerStyle={styles.inputIconContainer}
            iconColor={colors.primary}
          />

          {/* Eye Color */}
          <IconDropdown
            label={t('eye_color', { defaultValue: 'Eye color' })}
            icon={EyeIcon}
            data={eyeColorList}
            value={eyeColor}
            onChange={item => setEyeColor(item.value)}
            labelField="label"
            valueField="value"
            placeholder={t('select_eye_color', {
              defaultValue: 'Select eye color',
            })}
            renderItem={renderEyeColorItem}
          />

          {/* Fur Color */}
          <IconDropdown
            label={t('fur_color', { defaultValue: 'Fur color' })}
            icon={FurIcon}
            data={furColorList}
            value={furColor}
            onChange={item => setFurColor(item.value)}
            labelField="label"
            valueField="value"
            placeholder={t('select_fur_color', {
              defaultValue: 'Select fur color',
            })}
            renderItem={renderFurColorItem}
          />

          {/* Found / Stray (UX parity with register) */}
          <CustomInputCheckBox
            leftIcon={FoundIcon}
            label={t('found_animal', { defaultValue: 'Found / Stray' })}
            value={isFound}
            onValueChange={setIsFound}
            iconColor={colors.primary}
            boxColor={colors.buttonColor}
            checkIconColor={colors.buttonTextColor}
          />

          {/* Microchip */}
          <CustomInputCheckBox
            leftIcon={ChipIcon}
            label={t('has_microchip', { defaultValue: 'Has microchip' })}
            value={hasChip}
            onValueChange={setHasChip}
            iconColor={colors.primary}
            boxColor={colors.buttonColor}
            checkIconColor={colors.buttonTextColor}
          />

          {/* Vaccinated */}
          <CustomInputCheckBox
            leftIcon={VaccinatedIcon}
            label={t('vaccinated', { defaultValue: 'Vaccinated' })}
            value={isVaccinated}
            onValueChange={setIsVaccinated}
            iconColor={colors.onSurface}
            boxColor={colors.buttonColor}
            checkIconColor={colors.buttonTextColor}
          />

          <View style={styles.buttonContainer}>
            <Pressable
              style={[
                styles.customButton,
                (loading || saving) && styles.disabledButton,
              ]}
              onPress={handleSave}
              disabled={loading || saving}
            >
              {loading || saving ? (
                <ActivityIndicator
                  animating
                  size="small"
                  color={colors.buttonTextColor}
                />
              ) : (
                <RegisterIcon color={colors.buttonTextColor} />
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </KeyboardAwareScrollView>
  );
};

const createStyles = (width: number, height: number, colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'flex-start',
      alignItems: 'center',
      backgroundColor: colors.background,
      paddingTop: verticalScale(50),
    },
    progressBar: {
      width: width - moderateScale(32),
      marginBottom: moderateScale(8),
    },
    progressBarRTL: {
      transform: [{ scaleX: -1 }],
    },
    logo: {
      width: moderateScale(150),
      height: moderateScale(150),
      resizeMode: 'contain',
    },
    card: {
      width: '90%',
      paddingHorizontal: scale(8),
      marginTop: verticalScale(8),
      paddingBottom: verticalScale(16),
    },
    label: {
      fontSize: moderateScale(16),
      marginBottom: verticalScale(8),
      marginTop: verticalScale(4),
      color: colors.primary,
      fontWeight: '500',
    },
    disabledButton: {
      opacity: 0.6,
    },
    inputFieldContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: verticalScale(12),
      paddingHorizontal: scale(12),
      backgroundColor: colors.surface,
      borderRadius: moderateScale(4),
      borderWidth: 1,
      borderColor: colors.outline,
      height: verticalScale(52),
      marginBottom: verticalScale(16),
    },
    inputDateFieldContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: verticalScale(12),
      paddingHorizontal: scale(12),
      backgroundColor: colors.surface,
      borderRadius: moderateScale(4),
      borderWidth: 1,
      borderColor: colors.outline,
      height: verticalScale(52),
      marginBottom: 0,
    },
    inputIconContainer: {
      width: moderateScale(20),
      height: moderateScale(20),
      marginLeft: scale(12),
      marginRight: scale(8),
      justifyContent: 'center',
      alignItems: 'center',
    },
    dropdownWrapper: {
      width: '100%',
      height: verticalScale(52),
      marginBottom: verticalScale(16),
    },
    dropdown: {
      width: '100%',
      height: verticalScale(52),
      borderColor: colors.outline,
      borderWidth: 1,
      borderRadius: moderateScale(4),
      paddingHorizontal: scale(12),
      backgroundColor: colors.surface,
      paddingVertical: 0,
    },
    dropdownContainer: {
      backgroundColor: colors.surface,
      borderColor: colors.outline,
      borderWidth: 1,
      borderRadius: moderateScale(4),
    },
    selectedTextStyle: {
      marginLeft: scale(6),
      fontSize: moderateScale(16),
      color: colors.onSurface,
      backgroundColor: colors.surface,
      lineHeight: verticalScale(52),
    },
    inputSearchStyle: {
      height: verticalScale(40),
      fontSize: moderateScale(16),
      color: colors.onSurface,
      backgroundColor: colors.surface,
    },
    placeholderStyle: {
      marginLeft: scale(6),
      fontSize: moderateScale(16),
      color: colors.onSurfaceVariant,
      backgroundColor: colors.surface,
      lineHeight: verticalScale(52),
    },
    iconContainer: {
      width: moderateScale(20),
      height: moderateScale(20),
      marginLeft: scale(12),
      marginRight: scale(8),
      justifyContent: 'center',
      alignItems: 'center',
    },
    iconContainerRTL: {
      width: moderateScale(20),
      height: moderateScale(20),
      marginRight: scale(12),
      marginLeft: scale(8),
      justifyContent: 'center',
      alignItems: 'center',
    },
    iconImage: { width: moderateScale(20), height: moderateScale(20) },
    itemContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: verticalScale(12),
      paddingHorizontal: scale(16),
      minHeight: verticalScale(52),
    },
    itemContainerStyle: {
      backgroundColor: colors.surface,
      borderBottomWidth: 0.5,
      borderBottomColor: colors.outline,
    },
    itemTextStyle: { fontSize: moderateScale(16), color: colors.onSurface },
    itemIcon: {
      width: moderateScale(20),
      height: moderateScale(20),
      marginRight: scale(12),
      marginLeft: scale(12),
    },
    itemText: { fontSize: moderateScale(16), color: colors.onSurface },
    buttonContainer: {
      alignItems: 'center',
      marginTop: verticalScale(24),
      paddingTop: verticalScale(8),
    },
    customButton: {
      backgroundColor: colors.buttonColor,
      borderRadius: moderateScale(50),
      padding: moderateScale(20),
    },
    scrollView: { backgroundColor: colors.background },
    scrollViewContent: { flexGrow: 1, padding: 0 },
    colorCube: {
      width: moderateScale(20),
      height: moderateScale(20),
      borderWidth: 1,
      borderColor: colors.outline,
      borderRadius: moderateScale(3),
      marginRight: scale(7),
    },
    dateInputWrapper: {
      position: 'relative',
      zIndex: 1000,
      marginBottom: verticalScale(16),
    },
  });

export default EditPetFirstStep;
