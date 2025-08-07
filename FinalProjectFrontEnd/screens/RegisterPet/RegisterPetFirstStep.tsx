import React, { useState, useMemo } from 'react';
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
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
import { useTranslation } from 'react-i18next';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RegisterPetStackParamList } from '../../navigation/RegisterPetNavigation';
import RegisterIconSvg from '../../assets/icons/ic_next.svg';

// Import the custom input components
import CustomInputText from '../../components/UI/CustomInputText';
import CustomTextInputDate from '../../components/UI/CustomTextInputDate';
import CustomInputCheckBox from '../../components/UI/CustomInputCheckBox';

// Dummy icon imports for pet registration fields
import PetNameIconSvg from '../../assets/icons/ic_petname.svg';
import SpeciesIconSvg from '../../assets/icons/ic_species.svg';
import BreedIconSvg from '../../assets/icons/ic_breed.svg';
import EyeIconSvg from '../../assets/icons/ic_eye.svg';
import FurIconSvg from '../../assets/icons/ic_fur.svg';
import WeightIconSvg from '../../assets/icons/ic_weight.svg';
import VaccinatedIconSvg from '../../assets/icons/ic_vaccinated.svg';
import ChipIconSvg from '../../assets/icons/ic_chip.svg';
import BirthdayIconSvg from '../../assets/icons/ic_age.svg'; // Birthday icon
import IconDropdown from '../../components/UI/IconDropdown';
import FoundIconSvg from '../../assets/icons/ic_user.svg';
import { ThemeColors } from '../../types/theme';
// Import Dropdown from react-native-element-dropdown for searchable dropdown
import { getSpeciesList } from '../../constants/speciesList';
import { getEyeColorList } from '../../constants/eyeColorList';
import { getFurColorList } from '../../constants/furColorList';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { useRegisterPetViewModel } from '../../viewModels/RegisterPetViewModel';

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

type RegisterPetScreenProps = NativeStackScreenProps<
  RegisterPetStackParamList,
  'RegisterPetFirstStep'
>;

const RegisterPetScreenFirstStep: React.FC<RegisterPetScreenProps> = ({
  navigation,
}) => {
  const { width, height } = useWindowDimensions();
  const { colors }: { colors: ThemeColors } = useTheme();
  const styles = useMemo(
    () => createStyles(width, height, colors),
    [width, height, colors],
  );
  const { t } = useTranslation();

  // Form states
  const [petName, setPetName] = useState('');
  const [species, setSpecies] = useState('');
  const [breed, setBreed] = useState('');
  const [birthday, setBirthday] = useState(''); // New birthday field
  const [eyeColor, setEyeColor] = useState('');
  const [furColor, setFurColor] = useState('');
  const [weight, setWeight] = useState('');
  const [isVaccinated, setIsVaccinated] = useState(false);
  const [hasChip, setHasChip] = useState(false);
  const [isFound, setIsFound] = useState(false);

  // Use the external lists
  const speciesList = useMemo(() => getSpeciesList(t), [t]);
  const eyeColorList = useMemo(() => getEyeColorList(t), [t]);
  const furColorList = useMemo(() => getFurColorList(t), [t]);

  // Custom renderItem to include image with each item
  const renderSpeciesItem = (item: any) => {
    return (
      <View style={styles.itemContainer}>
        <Image
          source={item.icon}
          style={styles.itemIcon}
          resizeMode="contain"
        />
        <Text style={styles.itemText}>{item.label}</Text>
      </View>
    );
  };

  // Custom renderItem for eye color, showing a colored cube with border
  const renderEyeColorItem = (item: any) => {
    return (
      <View style={styles.itemContainer}>
        <View style={[styles.colorCube, { backgroundColor: item.color }]} />
        <Text style={styles.itemText}>{item.label}</Text>
      </View>
    );
  };

  const renderFurColorItem = (item: any) => (
    <View style={styles.itemContainer}>
      <View style={[styles.colorCube, { backgroundColor: item.color }]} />
      <Text style={styles.itemText}>{item.label}</Text>
    </View>
  );

  // ViewModel hook
  const { registerPet, loading } = useRegisterPetViewModel();

  const handleRegister = async () => {
    try {
      const pet = await registerPet({
        name: petName,
        species,
        breed,
        birthday,
        eyeColor,
        furColor,
        weight: weight ? { value: +weight, unit: 'kg' } : undefined,
        isLost: isFound,
        microchipped: hasChip,
        vaccinated: isVaccinated,
        images: [],
      });
      navigation.replace('RegisterPetSecondStep', { petId: pet._id });
    } catch (err: any) {
      Alert.alert(t('error'), err.message);
    }
  };

  return (
    <KeyboardAwareScrollView
      enabled={true} // turn it on/off
      bottomOffset={20} // distance from input to keyboard
      extraKeyboardSpace={10} // extra padding under inputs
      disableScrollOnKeyboardHide={false} // keep scroll position on keyboard hide
      style={styles.scrollView}
      contentContainerStyle={styles.scrollViewContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.container}>
        <ProgressBar
          progress={0.33}
          color={colors.buttonColor}
          style={[
            styles.progressBar,
            I18nManager.isRTL && styles.progressBarRTL,
          ]}
        />
        <Image
          source={require('../../assets/icons/ic_register_pet.png')}
          style={styles.logo}
        />
        <View style={styles.card}>
          {/* Full Pet Name */}
          <Text style={styles.label}>{t('full_pet_name')}</Text>
          <CustomInputText
            placeholder={t('enter_full_pet_name')}
            value={petName}
            onChangeText={setPetName}
            leftIcon={PetNameIcon}
            containerStyle={styles.inputFieldContainer}
            leftIconContainerStyle={styles.inputIconContainer}
            iconColor={colors.primary}
          />

          {/* Species Dropdown using react-native-element-dropdown */}
          <IconDropdown
            label={t('species')}
            icon={SpeciesIcon}
            data={speciesList}
            value={species}
            onChange={item => setSpecies(item.value)}
            labelField="label"
            valueField="value"
            placeholder={t('select_species')}
            renderItem={renderSpeciesItem}
          />

          {/* Breed */}
          <Text style={styles.label}>{t('breed')}</Text>
          <CustomInputText
            placeholder={t('enter_breed')}
            value={breed}
            onChangeText={setBreed}
            leftIcon={BreedIcon}
            containerStyle={styles.inputFieldContainer}
            leftIconContainerStyle={styles.inputIconContainer}
            iconColor={colors.primary}
          />

          {/* Birthday */}
          <Text style={styles.label}>{t('birthday')}</Text>
          <View style={styles.dateInputWrapper}>
            <CustomTextInputDate
              placeholder={t('select_birthday')}
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
          <Text style={styles.label}>{t('weight')}</Text>
          <CustomInputText
            placeholder={t('enter_weight_kg')}
            value={weight}
            onChangeText={setWeight}
            keyboardType="numeric"
            leftIcon={WeightIcon}
            containerStyle={styles.inputFieldContainer}
            leftIconContainerStyle={styles.inputIconContainer}
            iconColor={colors.primary}
          />

          {/* Eye Color Dropdown */}
          <IconDropdown
            label={t('eye_color')}
            icon={EyeIcon}
            data={eyeColorList}
            value={eyeColor}
            onChange={item => setEyeColor(item.value)}
            labelField="label"
            valueField="value"
            placeholder={t('select_eye_color')}
            renderItem={renderEyeColorItem}
          />

          {/* Fur Color */}
          <IconDropdown
            label={t('fur_color')}
            icon={FurIcon}
            data={furColorList}
            value={furColor}
            onChange={item => setFurColor(item.value)}
            labelField="label"
            valueField="value"
            placeholder={t('select_fur_color')}
            renderItem={renderFurColorItem}
          />
          {/* Found / Stray Checkbox */}
          <CustomInputCheckBox
            leftIcon={FoundIcon}
            label={t('found_animal')}
            value={isFound}
            onValueChange={setIsFound}
            iconColor={colors.primary}
            boxColor={colors.buttonColor}
            checkIconColor={colors.buttonTextColor}
          />

          {/* Microchip Checkbox */}
          <CustomInputCheckBox
            leftIcon={ChipIcon}
            label={t('has_microchip')}
            value={hasChip}
            onValueChange={setHasChip}
            iconColor={colors.primary}
            boxColor={colors.buttonColor}
            checkIconColor={colors.buttonTextColor}
          />
          {/* Vaccinated Checkbox */}
          <CustomInputCheckBox
            leftIcon={VaccinatedIcon}
            label={t('vaccinated')}
            value={isVaccinated}
            onValueChange={setIsVaccinated}
            iconColor={colors.onSurface}
            boxColor={colors.buttonColor}
            checkIconColor={colors.buttonTextColor}
          />

          <View style={styles.buttonContainer}>
            <Pressable
              style={[styles.customButton, loading && styles.disabledButton]}
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
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
    // Input field styles that match checkbox styling exactly
    inputFieldContainer: {
      // Same styling as checkboxRow
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
      // Same styling as checkboxRow
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
      // Same styling as checkboxIconContainer
      width: moderateScale(20),
      height: moderateScale(20),
      marginLeft: scale(12),
      marginRight: scale(8),
      justifyContent: 'center',
      alignItems: 'center',
    },
    // Dropdown wrapper to ensure consistent sizing
    dropdownWrapper: {
      width: '100%', // make wrapper fill card
      height: verticalScale(52),
      marginBottom: verticalScale(16),
    },
    dropdown: {
      width: '100%', // span full wrapper width
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
    // Consistent icon positioning - all icons same size
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
    iconImage: {
      width: moderateScale(20),
      height: moderateScale(20),
    },
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
    itemTextStyle: {
      fontSize: moderateScale(16),
      color: colors.onSurface,
    },
    itemIcon: {
      width: moderateScale(20),
      height: moderateScale(20),
      marginRight: scale(12),
      marginLeft: scale(12),
    },
    itemText: {
      fontSize: moderateScale(16),
      color: colors.onSurface,
    },
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
    scrollView: {
      backgroundColor: colors.background,
    },
    scrollViewContent: {
      flexGrow: 1,
      padding: 0,
    },
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

export default RegisterPetScreenFirstStep;
