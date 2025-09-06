import React, { memo, useCallback } from 'react';
import { View, StyleSheet, I18nManager } from 'react-native';
import { useTheme, Text, Card, IconButton } from 'react-native-paper';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
import { useTranslation } from 'react-i18next';
import { ThemeColors } from '../../types/theme';
import { Pet, MyPetEntry, PetWeight } from '../../types/pet';
import PetImageSlider from '../UI/PetImageSlider';

// SVG icons
import EditIconSvg from '../../assets/icons/ic_edit.svg';
import DeleteIconSvg from '../../assets/icons/ic_delete.svg';
import EyeIconSvg from '../../assets/icons/ic_eye.svg';
import FurIconSvg from '../../assets/icons/ic_fur.svg';
import AgeIconSvg from '../../assets/icons/ic_age.svg';
import WeightIconSvg from '../../assets/icons/ic_weight.svg';
import VaccinatedIconSvg from '../../assets/icons/ic_vaccinated.svg';
import ChipIconSvg from '../../assets/icons/ic_chip.svg';
import SpeciesIconSvg from '../../assets/icons/ic_species.svg';
import BirthdayIconSvg from '../../assets/icons/ic_age.svg';
import LocationIconSvg from '../../assets/icons/ic_location.svg';
import DistanceIconSvg from '../../assets/icons/ic_lock.svg';
// If you have your own check-circle svg, uncomment and use it instead of the MDI string:
// import CheckCircleSvg from '../../assets/icons/ic_check_circle.svg';

type PetCardData = Pet | MyPetEntry;

/** Wrap a react-native-svg component so it can be used as a Paper IconSource */
const createSvgIcon =
  (SvgComp: any) =>
  ({ size, color }: { size: number; color: string }) =>
    (
      <SvgComp
        width={size}
        height={size}
        // Most of your line icons use strokes; apply both to be safe:
        stroke={color}
        fill="none"
      />
    );

const EditIcon = createSvgIcon(EditIconSvg);
const DeleteIcon = createSvgIcon(DeleteIconSvg);
const EyeIcon = createSvgIcon(EyeIconSvg);
const FurIcon = createSvgIcon(FurIconSvg);
const AgeIcon = createSvgIcon(AgeIconSvg);
const WeightIcon = createSvgIcon(WeightIconSvg);
const VaccinatedIcon = createSvgIcon(VaccinatedIconSvg);
const ChipIcon = createSvgIcon(ChipIconSvg);
const SpeciesIcon = createSvgIcon(SpeciesIconSvg);
const BirthdayIcon = createSvgIcon(BirthdayIconSvg);
const LocationIcon = createSvgIcon(LocationIconSvg);
const DistanceIcon = createSvgIcon(DistanceIconSvg);
// const CheckCircleIcon = createSvgIcon(CheckCircleSvg); // use if you prefer SVG over font icon

interface MyPetCardProps {
  pet: PetCardData;
  currentImageIndex: number;
  onOpenEdit?: (pet: PetCardData) => void;
  onMarkFound?: (pet: PetCardData) => void;
  onEditPet?: (pet: PetCardData) => void; // legacy
  onDeletePet: (petId: string, petName: string) => void;
  onImageIndexChange: (petId: string, index: number) => void;
  onImageScroll: (event: any, petId: string, imageCount: number) => void;
}

const MyPetCard: React.FC<MyPetCardProps> = memo(
  ({
    pet,
    currentImageIndex,
    onOpenEdit,
    onMarkFound,
    onEditPet,
    onDeletePet,
    onImageIndexChange,
    onImageScroll,
  }) => {
    const { colors }: { colors: ThemeColors } = useTheme();
    const { t } = useTranslation();
    const styles = getStyles(colors);

    const getPetId = (p: PetCardData): string =>
      (p as Pet)._id || (p as MyPetEntry).id;

    const parseAge = (age?: string | number): number => {
      if (typeof age === 'number') return age;
      if (typeof age === 'string') return parseFloat(age) || 0;
      return 0;
    };

    const formatAge = useCallback(
      (age?: string | number) => {
        if (!age) return null;
        const n = parseAge(age);
        const formatted = n % 1 === 0 ? n.toString() : n.toFixed(1);
        return `${formatted} ${t('years')}`;
      },
      [t],
    );

    const formatBirthday = useCallback((birthday?: string) => {
      if (!birthday) return null;
      const date = new Date(birthday);
      return date.toLocaleDateString();
    }, []);

    const formatWeight = useCallback(
      (weight?: PetWeight) => {
        if (!weight) return null;
        const formatted =
          weight.value % 1 === 0
            ? weight.value.toString()
            : weight.value.toFixed(1);
        return `${formatted} ${t(weight.unit)}`;
      },
      [t],
    );

    const isLost = (pet as Pet).isLost === true;
    const isFound = (pet as Pet).isFound === true;
    const statusAllowsLocation = isLost || isFound;

    const rawAddress = statusAllowsLocation
      ? (pet as Pet)?.location?.address
      : undefined;
    const trimmedAddress =
      typeof rawAddress === 'string' ? rawAddress.trim() : '';
    const hasAddress = Boolean(trimmedAddress);

    const formattedLocation = hasAddress
      ? trimmedAddress.length > 30
        ? `${trimmedAddress.substring(0, 30)}...`
        : trimmedAddress
      : null;

    const rawDistance = statusAllowsLocation
      ? (pet as Pet).distance
      : undefined;
    const distance =
      typeof rawDistance === 'string' && rawDistance.trim() !== ''
        ? rawDistance
        : undefined;

    const showInfoRow = Boolean(distance) || Boolean(formattedLocation);

    const petId = getPetId(pet);
    const formattedAge = formatAge((pet as any).age);
    const formattedBirthday = formatBirthday((pet as Pet).birthday);
    const formattedWeight = formatWeight((pet as any).weight);

    const handleDeletePress = useCallback(() => {
      onDeletePet(getPetId(pet), (pet as any).name);
    }, [onDeletePet, pet]);

    const handleOpenEditPress = useCallback(() => {
      onOpenEdit?.(pet);
    }, [onOpenEdit, pet]);

    const handleMarkFoundPress = useCallback(() => {
      onMarkFound?.(pet);
    }, [onMarkFound, pet]);

    const handleLegacyEditPress = useCallback(() => {
      onEditPet?.(pet);
    }, [onEditPet, pet]);

    return (
      <Card style={styles.petCard} mode="outlined">
        <Card.Content style={styles.petCardContent}>
          <View style={styles.petMainInfo}>
            <View style={styles.petImageContainer}>
              <PetImageSlider
                images={(pet as any).images}
                petId={petId}
                isLost={(pet as Pet).isLost}
                isFound={(pet as Pet).isFound}
                currentIndex={currentImageIndex}
                onIndexChange={onImageIndexChange}
                onScroll={onImageScroll}
                size={90}
              />
            </View>

            <View style={styles.petInfoSection}>
              <View style={styles.petHeader}>
                <View style={styles.petTitleContainer}>
                  <Text style={styles.petName}>{(pet as any).name}</Text>
                  {!!(pet as any).breed && (
                    <Text style={styles.petBreed}>{(pet as any).breed}</Text>
                  )}
                </View>

                <View style={styles.petActions}>
                  {/* EDIT — always when provided */}
                  {onOpenEdit && (
                    <IconButton
                      icon={EditIcon}
                      size={moderateScale(22)}
                      iconColor={colors.primary}
                      onPress={handleOpenEditPress}
                      style={styles.actionButton}
                      accessibilityLabel={t('edit')}
                    />
                  )}

                  {/* FOUND — show only when LOST and handler provided */}
                  {isLost && onMarkFound && (
                    <IconButton
                      // If RN Vector Icons are linked, this works:
                      icon="check-circle-outline"
                      // Otherwise, switch to your SVG:
                      // icon={CheckCircleIcon}
                      size={moderateScale(22)}
                      iconColor="#4CAF50"
                      onPress={handleMarkFoundPress}
                      style={styles.actionButton}
                      accessibilityLabel={t('mark_as_found', {
                        defaultValue: 'Mark as found',
                      })}
                    />
                  )}

                  {/* Optional legacy special edit (kept for backwards-compat) */}
                  {isLost && onEditPet && (
                    <IconButton
                      icon={EditIcon}
                      size={moderateScale(22)}
                      iconColor="#e7d6d1ff"
                      onPress={handleLegacyEditPress}
                      style={styles.actionButton}
                      accessibilityLabel={t('edit')}
                    />
                  )}

                  {/* DELETE */}
                  <IconButton
                    icon={DeleteIcon}
                    size={moderateScale(22)}
                    iconColor="#FF5722"
                    onPress={handleDeletePress}
                    style={styles.actionButton}
                    accessibilityLabel={t('delete')}
                  />
                </View>
              </View>

              <View style={styles.characteristicsRow}>
                {!!formattedAge && (
                  <View style={styles.characteristicPill}>
                    <AgeIcon
                      size={moderateScale(14) as any}
                      color={colors.buttonTextColor!}
                    />
                    <Text style={styles.characteristicText}>
                      {formattedAge}
                    </Text>
                  </View>
                )}

                {!!formattedBirthday && (
                  <View style={styles.characteristicPill}>
                    <BirthdayIcon
                      size={moderateScale(14) as any}
                      color={colors.buttonTextColor!}
                    />
                    <Text style={styles.characteristicText}>
                      {formattedBirthday}
                    </Text>
                  </View>
                )}

                {!!(pet as any).furColor && (
                  <View style={styles.characteristicPill}>
                    <FurIcon
                      size={moderateScale(14) as any}
                      color={colors.buttonTextColor!}
                    />
                    <Text style={styles.characteristicText}>
                      {t((pet as any).furColor)}
                    </Text>
                  </View>
                )}

                {!!(pet as any).eyeColor && (
                  <View style={styles.characteristicPill}>
                    <EyeIcon
                      size={moderateScale(14) as any}
                      color={colors.buttonTextColor!}
                    />
                    <Text style={styles.characteristicText}>
                      {t((pet as any).eyeColor)}
                    </Text>
                  </View>
                )}

                {!!formattedWeight && (
                  <View style={styles.characteristicPill}>
                    <WeightIcon
                      size={moderateScale(14) as any}
                      color={colors.buttonTextColor!}
                    />
                    <Text style={styles.characteristicText}>
                      {formattedWeight}
                    </Text>
                  </View>
                )}
              </View>

              {/* Only when LOST/FOUND & address/distance available */}
              {(Boolean(distance) || Boolean(formattedLocation)) && (
                <View style={styles.infoRow}>
                  {!!distance && (
                    <View style={styles.infoItem}>
                      <DistanceIcon
                        size={moderateScale(14) as any}
                        color={colors.primary}
                      />
                      <Text style={styles.infoText}>{distance}</Text>
                    </View>
                  )}

                  {!!formattedLocation && (
                    <View style={styles.infoItem}>
                      <LocationIcon
                        size={moderateScale(14) as any}
                        color={colors.primary}
                      />
                      <Text style={styles.infoText}>{formattedLocation}</Text>
                    </View>
                  )}
                </View>
              )}
            </View>
          </View>

          {!!(pet as any).description && (
            <View style={styles.descriptionContainer}>
              <Text style={styles.petDescription} numberOfLines={2}>
                {(pet as any).description}
              </Text>
            </View>
          )}

          <View style={styles.bottomSection}>
            <View style={styles.healthStatusContainer}>
              {(pet as any).vaccinated !== undefined && (
                <View
                  style={[
                    styles.healthIndicator,
                    (pet as any).vaccinated
                      ? styles.healthIndicatorPositive
                      : styles.healthIndicatorNegative,
                  ]}
                >
                  <VaccinatedIcon
                    size={moderateScale(16) as any}
                    color={(pet as any).vaccinated ? '#4CAF50' : '#FF5722'}
                  />
                  <Text
                    style={[
                      styles.healthIndicatorText,
                      (pet as any).vaccinated
                        ? styles.healthTextPositive
                        : styles.healthTextNegative,
                    ]}
                  >
                    {(pet as any).vaccinated
                      ? t('vaccinated')
                      : t('needs_vaccine')}
                  </Text>
                </View>
              )}

              {(pet as any).microchipped !== undefined && (
                <View
                  style={[
                    styles.healthIndicator,
                    (pet as any).microchipped
                      ? styles.healthIndicatorPositive
                      : styles.healthIndicatorNegative,
                  ]}
                >
                  <ChipIcon
                    size={moderateScale(16) as any}
                    color={(pet as any).microchipped ? '#4CAF50' : '#FF5722'}
                  />
                  <Text
                    style={[
                      styles.healthIndicatorText,
                      (pet as any).microchipped
                        ? styles.healthTextPositive
                        : styles.healthTextNegative,
                    ]}
                  >
                    {(pet as any).microchipped ? t('chipped') : t('no_chip')}
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.speciesChip}>
              <SpeciesIcon
                size={moderateScale(16) as any}
                color={colors.buttonTextColor!}
              />
              <Text style={styles.speciesChipText}>
                {t((pet as any).species).toUpperCase()}
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
    actionButton: { margin: 0, marginLeft: scale(4) },
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
      color: colors.buttonTextColor!,
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
      paddingHorizontal: scale(16),
      paddingVertical: verticalScale(12),
      marginBottom: verticalScale(16),
      borderWidth: 1,
      borderColor: colors.outline + '20',
    },
    petDescription: {
      fontSize: moderateScale(14),
      color: colors.onSurface + 'AA',
      lineHeight: verticalScale(20),
      textAlign: 'left',
      fontStyle: 'italic',
    },
    bottomSection: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    healthStatusContainer: { flexDirection: 'row', flex: 1 },
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
    healthTextPositive: { color: '#4CAF50' },
    healthTextNegative: { color: '#FF5722' },
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
      color: colors.buttonTextColor!,
      fontSize: moderateScale(12),
      fontWeight: '600',
      marginLeft: I18nManager.isRTL ? 0 : scale(4),
      marginRight: I18nManager.isRTL ? scale(4) : 0,
    },
  });

MyPetCard.displayName = 'MyPetCard';
export default MyPetCard;
