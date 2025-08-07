import React, { memo, useCallback } from 'react';
import { View, StyleSheet, I18nManager } from 'react-native';
import { useTheme, Text, Card, IconButton } from 'react-native-paper';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
import { useTranslation } from 'react-i18next';
import { ThemeColors } from '../../types/theme';
import { Pet, MyPetEntry, PetWeight } from '../../types/pet';
import PetImageSlider from '../UI/PetImageSlider';

// Icons
import EditIconSvg from '../../assets/icons/ic_edit.svg';
import DeleteIconSvg from '../../assets/icons/ic_delete.svg';
import EyeIconSvg from '../../assets/icons/ic_eye.svg';
import FurIconSvg from '../../assets/icons/ic_fur.svg';
import AgeIconSvg from '../../assets/icons/ic_age.svg';
import WeightIconSvg from '../../assets/icons/ic_weight.svg';
import VaccinatedIconSvg from '../../assets/icons/ic_vaccinated.svg';
import ChipIconSvg from '../../assets/icons/ic_chip.svg';
import SpeciesIconSvg from '../../assets/icons/ic_species.svg';
import BirthdayIconSvg from '../../assets/icons/ic_age.svg'; // New icon
import LocationIconSvg from '../../assets/icons/ic_location.svg'; // New icon
import DistanceIconSvg from '../../assets/icons/ic_lock.svg'; // New icon

// Icon components
const EditIcon = ({ color }: { color?: string }) => (
  <EditIconSvg
    width={moderateScale(20)}
    height={moderateScale(20)}
    stroke={color || 'black'}
  />
);

const DeleteIcon = ({ color }: { color?: string }) => (
  <DeleteIconSvg
    width={moderateScale(20)}
    height={moderateScale(20)}
    stroke={color || 'black'}
  />
);

const EyeIcon = ({ color }: { color?: string }) => (
  <EyeIconSvg
    width={moderateScale(14)}
    height={moderateScale(14)}
    stroke={color || 'black'}
  />
);

const FurIcon = ({ color }: { color?: string }) => (
  <FurIconSvg
    width={moderateScale(14)}
    height={moderateScale(14)}
    stroke={color || 'black'}
  />
);

const AgeIcon = ({ color }: { color?: string }) => (
  <AgeIconSvg
    width={moderateScale(14)}
    height={moderateScale(14)}
    stroke={color || 'black'}
  />
);

const WeightIcon = ({ color }: { color?: string }) => (
  <WeightIconSvg
    width={moderateScale(14)}
    height={moderateScale(14)}
    stroke={color || 'black'}
  />
);

const VaccinatedIcon = ({ color }: { color?: string }) => (
  <VaccinatedIconSvg
    width={moderateScale(16)}
    height={moderateScale(16)}
    stroke={color || 'black'}
  />
);

const ChipIcon = ({ color }: { color?: string }) => (
  <ChipIconSvg
    width={moderateScale(16)}
    height={moderateScale(16)}
    stroke={color || 'black'}
  />
);

const SpeciesIcon = ({ color }: { color?: string }) => (
  <SpeciesIconSvg
    width={moderateScale(16)}
    height={moderateScale(16)}
    stroke={color || 'black'}
  />
);

const BirthdayIcon = ({ color }: { color?: string }) => (
  <BirthdayIconSvg
    width={moderateScale(14)}
    height={moderateScale(14)}
    stroke={color || 'black'}
  />
);

const LocationIcon = ({ color }: { color?: string }) => (
  <LocationIconSvg
    width={moderateScale(14)}
    height={moderateScale(14)}
    stroke={color || 'black'}
  />
);

const DistanceIcon = ({ color }: { color?: string }) => (
  <DistanceIconSvg
    width={moderateScale(14)}
    height={moderateScale(14)}
    stroke={color || 'black'}
  />
);

// Icon render functions
const renderEditIcon = (color: string) => () => <EditIcon color={color} />;
const renderDeleteIcon = (color: string) => () => <DeleteIcon color={color} />;

// Union type for flexibility - works with both Pet and MyPetEntry
type PetCardData = Pet | MyPetEntry;

interface MyPetCardProps {
  pet: PetCardData;
  currentImageIndex: number;
  onEditPet: (petId: string) => void;
  onDeletePet: (petId: string, petName: string) => void;
  onImageIndexChange: (petId: string, index: number) => void;
  onImageScroll: (event: any, petId: string, imageCount: number) => void;
}

const MyPetCard: React.FC<MyPetCardProps> = memo(
  ({
    pet,
    currentImageIndex,
    onEditPet,
    onDeletePet,
    onImageIndexChange,
    onImageScroll,
  }) => {
    const { colors }: { colors: ThemeColors } = useTheme();
    const { t } = useTranslation();

    // Helper to get pet ID (handle both _id and id)
    const getPetId = (pet: PetCardData): string => {
      return (pet as Pet)._id || (pet as MyPetEntry).id;
    };

    // Helper function to parse age (string or number)
    const parseAge = (age?: string | number): number => {
      if (typeof age === 'number') return age;
      if (typeof age === 'string') return parseFloat(age) || 0;
      return 0;
    };

    // Helper function to format age with translation
    const formatAge = useCallback(
      (age?: string | number) => {
        if (!age) return null;
        const ageNum = parseAge(age);
        const formattedAge =
          ageNum % 1 === 0 ? ageNum.toString() : ageNum.toFixed(1);
        return `${formattedAge} ${t('years')}`;
      },
      [t],
    );

    // Helper function to format birthday
    const formatBirthday = useCallback((birthday?: string) => {
      if (!birthday) return null;
      const date = new Date(birthday);
      return date.toLocaleDateString();
    }, []);

    // Helper function to format weight with translation
    const formatWeight = useCallback(
      (weight?: PetWeight) => {
        if (!weight) return null;
        const formattedWeight =
          weight.value % 1 === 0
            ? weight.value.toString()
            : weight.value.toFixed(1);
        return `${formattedWeight} ${t(weight.unit)}`;
      },
      [t],
    );

    // Helper function to format location
    const formatLocation = useCallback((location?: any) => {
      if (!location?.address) return null;
      // Truncate long addresses
      return location.address.length > 30
        ? `${location.address.substring(0, 30)}...`
        : location.address;
    }, []);

    const handleEditPress = useCallback(() => {
      onEditPet(getPetId(pet));
    }, [onEditPet, pet]);

    const handleDeletePress = useCallback(() => {
      onDeletePet(getPetId(pet), pet.name);
    }, [onDeletePet, pet]);

    const styles = getStyles(colors);

    const petId = getPetId(pet);
    const formattedAge = formatAge(pet.age);
    const formattedBirthday = formatBirthday((pet as Pet).birthday);
    const formattedWeight = formatWeight(pet.weight);
    const formattedLocation = formatLocation((pet as Pet).location);
    const distance = (pet as Pet).distance;

    return (
      <Card style={styles.petCard} mode="outlined">
        <Card.Content style={styles.petCardContent}>
          {/* Main Pet Info Section */}
          <View style={styles.petMainInfo}>
            <View style={styles.petImageContainer}>
              <PetImageSlider
                images={pet.images}
                petId={petId}
                isLost={pet.isLost}
                isFound={pet.isFound}
                currentIndex={currentImageIndex}
                onIndexChange={onImageIndexChange}
                onScroll={onImageScroll}
                size={90}
              />
            </View>

            <View style={styles.petInfoSection}>
              <View style={styles.petHeader}>
                <View style={styles.petTitleContainer}>
                  <Text style={styles.petName}>{pet.name}</Text>
                  {pet.breed && (
                    <Text style={styles.petBreed}>{pet.breed}</Text>
                  )}
                </View>

                <View style={styles.petActions}>
                  {/* <IconButton
                    icon={renderEditIcon(colors.primary)}
                    size={moderateScale(22)}
                    onPress={handleEditPress}
                    style={styles.actionButton}
                  /> */}
                  <IconButton
                    icon={renderDeleteIcon('#FF5722')}
                    size={moderateScale(22)}
                    onPress={handleDeletePress}
                    style={styles.actionButton}
                  />
                </View>
              </View>

              {/* Pet Characteristics Row */}
              <View style={styles.characteristicsRow}>
                {formattedAge && (
                  <View style={styles.characteristicPill}>
                    <AgeIcon color={colors.buttonTextColor!!} />
                    <Text style={styles.characteristicText}>
                      {formattedAge}
                    </Text>
                  </View>
                )}

                {formattedBirthday && (
                  <View style={styles.characteristicPill}>
                    <BirthdayIcon color={colors.buttonTextColor!!} />
                    <Text style={styles.characteristicText}>
                      {formattedBirthday}
                    </Text>
                  </View>
                )}

                {pet.furColor && (
                  <View style={styles.characteristicPill}>
                    <FurIcon color={colors.buttonTextColor!!} />
                    <Text style={styles.characteristicText}>
                      {t(pet.furColor)}
                    </Text>
                  </View>
                )}

                {pet.eyeColor && (
                  <View style={styles.characteristicPill}>
                    <EyeIcon color={colors.buttonTextColor!!} />
                    <Text style={styles.characteristicText}>
                      {t(pet.eyeColor)}
                    </Text>
                  </View>
                )}

                {formattedWeight && (
                  <View style={styles.characteristicPill}>
                    <WeightIcon color={colors.buttonTextColor!!} />
                    <Text style={styles.characteristicText}>
                      {formattedWeight}
                    </Text>
                  </View>
                )}
              </View>

              {/* Distance and Location Row */}
              <View style={styles.infoRow}>
                {distance && (
                  <View style={styles.infoItem}>
                    <DistanceIcon color={colors.primary} />
                    <Text style={styles.infoText}>{distance}</Text>
                  </View>
                )}

                {formattedLocation && (
                  <View style={styles.infoItem}>
                    <LocationIcon color={colors.primary} />
                    <Text style={styles.infoText}>{formattedLocation}</Text>
                  </View>
                )}
              </View>
            </View>
          </View>

          {/* Description */}
          {pet.description && (
            <View style={styles.descriptionContainer}>
              <Text style={styles.petDescription} numberOfLines={2}>
                {pet.description}
              </Text>
            </View>
          )}

          {/* Bottom Section with Health Status and Species */}
          <View style={styles.bottomSection}>
            <View style={styles.healthStatusContainer}>
              {pet.vaccinated !== undefined && (
                <View
                  style={[
                    styles.healthIndicator,
                    pet.vaccinated
                      ? styles.healthIndicatorPositive
                      : styles.healthIndicatorNegative,
                  ]}
                >
                  <VaccinatedIcon
                    color={pet.vaccinated ? '#4CAF50' : '#FF5722'}
                  />
                  <Text
                    style={[
                      styles.healthIndicatorText,
                      pet.vaccinated
                        ? styles.healthTextPositive
                        : styles.healthTextNegative,
                    ]}
                  >
                    {pet.vaccinated ? t('vaccinated') : t('needs_vaccine')}
                  </Text>
                </View>
              )}

              {pet.microchipped !== undefined && (
                <View
                  style={[
                    styles.healthIndicator,
                    pet.microchipped
                      ? styles.healthIndicatorPositive
                      : styles.healthIndicatorNegative,
                  ]}
                >
                  <ChipIcon color={pet.microchipped ? '#4CAF50' : '#FF5722'} />
                  <Text
                    style={[
                      styles.healthIndicatorText,
                      pet.microchipped
                        ? styles.healthTextPositive
                        : styles.healthTextNegative,
                    ]}
                  >
                    {pet.microchipped ? t('chipped') : t('no_chip')}
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.speciesChip}>
              <SpeciesIcon color={colors.buttonTextColor!!} />
              <Text style={styles.speciesChipText}>
                {t(pet.species).toUpperCase()}
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>
    );
  },
);

const getStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    petCard: {
      backgroundColor: colors.surface,
      marginBottom: verticalScale(20),
      borderRadius: moderateScale(16),
      overflow: 'hidden',
      borderWidth: 1,
      width: '100%',
      borderColor: colors.outline + '30',
    },
    petCardContent: {
      padding: scale(20),
    },
    petMainInfo: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: verticalScale(16),
    },
    petImageContainer: {
      position: 'relative',
      marginRight: scale(16),
    },
    petInfoSection: {
      flex: 1,
    },
    petHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: verticalScale(12),
    },
    petTitleContainer: {
      flex: 1,
    },
    petName: {
      fontSize: moderateScale(22),
      fontWeight: '700',
      color: colors.primary,
      textAlign: 'left',
      marginBottom: verticalScale(2),
    },
    petBreed: {
      fontSize: moderateScale(14),
      color: colors.onSurface,
      textAlign: 'left',
      fontWeight: '500',
    },
    petActions: {
      flexDirection: 'row',
    },
    actionButton: {
      margin: 0,
      marginLeft: scale(4),
    },
    characteristicsRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginBottom: verticalScale(8),
    },
    characteristicPill: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.buttonColor + '10',
      paddingHorizontal: scale(10),
      paddingVertical: verticalScale(4),
      borderRadius: moderateScale(12),
      marginRight: scale(6),
      marginBottom: verticalScale(4),
    },
    characteristicText: {
      fontSize: moderateScale(12),
      color: colors.buttonTextColor!!,
      marginLeft: scale(4),
      fontWeight: '500',
    },
    infoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: verticalScale(4),
    },
    infoItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginRight: scale(16),
    },
    infoText: {
      fontSize: moderateScale(14),
      color: colors.onSurface,
      fontWeight: '600',
      marginLeft: scale(6),
    },
    descriptionContainer: {
      backgroundColor: colors.background + '08',
      borderRadius: moderateScale(12),
      paddingHorizontal: scale(16), // Align with main content
      paddingVertical: verticalScale(12),
      marginBottom: verticalScale(16),
      borderWidth: 1,
      borderColor: colors.outline + '20',
    },
    petDescription: {
      fontSize: moderateScale(14),
      color: colors.onSurface + 'AA', // More muted/disabled appearance
      lineHeight: verticalScale(20),
      textAlign: 'left',
      fontStyle: 'italic',
    },
    bottomSection: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    healthStatusContainer: {
      flexDirection: 'row',
      flex: 1,
    },
    healthIndicator: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderRadius: moderateScale(8),
      paddingHorizontal: scale(8),
      paddingVertical: verticalScale(4),
      marginRight: I18nManager.isRTL ? 0 : scale(8),
      marginLeft: I18nManager.isRTL ? scale(8) : 0,
    },
    healthIndicatorText: {
      fontSize: moderateScale(11),
      fontWeight: '600',
      marginLeft: I18nManager.isRTL ? 0 : scale(4),
      marginRight: I18nManager.isRTL ? scale(4) : 0,
    },
    healthIndicatorPositive: {
      backgroundColor: '#4CAF50' + '20',
      borderColor: '#4CAF50',
    },
    healthIndicatorNegative: {
      backgroundColor: '#FF5722' + '20',
      borderColor: '#FF5722',
    },
    healthTextPositive: {
      color: '#4CAF50',
    },
    healthTextNegative: {
      color: '#FF5722',
    },
    speciesChip: {
      flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
      alignItems: 'center',
      backgroundColor: colors.buttonColor + '15',
      paddingHorizontal: scale(10),
      paddingVertical: verticalScale(6),
      borderRadius: moderateScale(12),
      alignSelf: 'center',
    },
    speciesChipText: {
      color: colors.buttonTextColor!!,
      fontSize: moderateScale(12),
      fontWeight: '600',
      marginLeft: I18nManager.isRTL ? 0 : scale(4),
      marginRight: I18nManager.isRTL ? scale(4) : 0,
    },
  });

MyPetCard.displayName = 'MyPetCard';

export default MyPetCard;
