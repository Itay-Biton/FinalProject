import React, { memo, useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useTheme, Text, Card, Divider } from 'react-native-paper';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
import { useTranslation } from 'react-i18next';
import { ThemeColors } from '../../types/theme';
import BusinessImageSlider from '../UI/BusinessImageSlider';

// Icons
import PhoneIconSvg from '../../assets/icons/ic_phone.svg';
import LocationIconSvg from '../../assets/icons/ic_location.svg';
import EmailIconSvg from '../../assets/icons/ic_email2.svg';
import ViewIconSvg from '../../assets/icons/ic_eye.svg';
import NavigateIconSvg from '../../assets/icons/ic_navigate.svg';
import AgeIconSvg from '../../assets/icons/ic_age.svg';
import WeightIconSvg from '../../assets/icons/ic_weight.svg';
import VaccinatedIconSvg from '../../assets/icons/ic_vaccinated.svg';
import ChipIconSvg from '../../assets/icons/ic_chip.svg';
import SpeciesIconSvg from '../../assets/icons/ic_species.svg';
import FurIconSvg from '../../assets/icons/ic_fur.svg';
import EyeIconSvg from '../../assets/icons/ic_eye.svg';
import ProfileIconSvg from '../../assets/icons/ic_profile.svg';
// Icon components
const ProfileIcon = ({ color }: { color?: string }) => (
  <ProfileIconSvg
    width={moderateScale(16)}
    height={moderateScale(16)}
    stroke={color || 'black'}
  />
);

// Icon components
const PhoneIcon = ({ color }: { color?: string }) => (
  <PhoneIconSvg
    width={moderateScale(16)}
    height={moderateScale(16)}
    stroke={color || 'black'}
  />
);

const LocationIcon = ({ color }: { color?: string }) => (
  <LocationIconSvg
    width={moderateScale(16)}
    height={moderateScale(16)}
    stroke={color || 'black'}
  />
);

const EmailIcon = ({ color }: { color?: string }) => (
  <EmailIconSvg
    width={moderateScale(16)}
    height={moderateScale(16)}
    stroke={color || 'black'}
  />
);

const ViewIcon = ({ color }: { color?: string }) => (
  <ViewIconSvg
    width={moderateScale(16)}
    height={moderateScale(16)}
    stroke={color || 'black'}
  />
);

const NavigateIcon = ({ color }: { color?: string }) => (
  <NavigateIconSvg
    width={moderateScale(16)}
    height={moderateScale(16)}
    stroke={color || 'black'}
  />
);

const AgeIcon = ({ color }: { color?: string }) => (
  <AgeIconSvg
    width={moderateScale(16)}
    height={moderateScale(16)}
    stroke={color || 'black'}
  />
);

const WeightIcon = ({ color }: { color?: string }) => (
  <WeightIconSvg
    width={moderateScale(16)}
    height={moderateScale(16)}
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

const FurIcon = ({ color }: { color?: string }) => (
  <FurIconSvg
    width={moderateScale(14)}
    height={moderateScale(14)}
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

// Pet data interface
interface Pet {
  id: string;
  name: string;
  species: string;
  breed: string;
  age: string;
  furColor: string;
  eyeColor: string;
  weight: string;
  ownerName: string;
  ownerEmail: string;
  phones: string[];
  location: string;
  distance: string;
  registrationDate: string;
  images: string[];
  description: string;
  isLost: boolean;
  isFound: boolean;
  vaccinated: boolean;
  microchipped: boolean;
}

// Props interface
interface PetCardProps {
  pet: Pet;
  currentImageIndex: number;
  onImageIndexChange: (petId: string, index: number) => void;
  onImageScroll: (event: any, petId: string, imageCount: number) => void;
  onCall: (phones: string[], ownerName: string) => void;
  onEmail: (email: string) => void;
  onViewDetails: (petId: string, petName: string) => void;
  onNavigate?: (petId: string, petName: string) => void;
}

const PetCard: React.FC<PetCardProps> = memo(
  ({
    pet,
    currentImageIndex,
    onImageIndexChange,
    onImageScroll,
    onCall,
    onEmail,
    onViewDetails,
    onNavigate,
  }) => {
    const { colors }: { colors: ThemeColors } = useTheme();
    const { t } = useTranslation();

    const handleNavigate = useCallback(() => {
      if (onNavigate) {
        onNavigate(pet.id, pet.name);
      } else {
        // Default behavior
        onViewDetails(pet.id, pet.name);
      }
    }, [pet.id, pet.name, onNavigate, onViewDetails]);

    const styles = createStyles(colors);

    return (
      <Card key={pet.id} style={styles.petCard} mode="outlined">
        {/* Full-width Image Slider */}
        <View style={styles.imageSliderContainer}>
          <BusinessImageSlider
            images={pet.images}
            businessId={pet.id}
            currentIndex={currentImageIndex}
            onIndexChange={onImageIndexChange}
            onScroll={onImageScroll}
          />

          {/* Status Overlay */}
          <View style={styles.statusOverlay}>
            {pet.isLost && (
              <View style={[styles.statusCircle, styles.lostStatusCircle]}>
                <Text style={styles.statusText}>{t('lost').toUpperCase()}</Text>
              </View>
            )}
            {pet.isFound && (
              <View style={[styles.statusCircle, styles.foundStatusCircle]}>
                <Text style={styles.statusText}>
                  {t('found').toUpperCase()}
                </Text>
              </View>
            )}
          </View>
        </View>

        <Card.Content style={styles.cardContent}>
          {/* Pet Header */}
          <View style={styles.petHeader}>
            <View style={styles.petTitleContainer}>
              <Text style={styles.petName} numberOfLines={2}>
                {pet.name}
              </Text>
              <View style={styles.petBasicInfo}>
                <View style={styles.speciesBreedContainer}>
                  <View style={styles.speciesChip}>
                    <SpeciesIcon color={colors.buttonTextColor!!} />
                    <Text style={styles.speciesText}>
                      {t(pet.species).toUpperCase()}
                    </Text>
                  </View>
                  <Text style={styles.breedText}>{pet.breed}</Text>
                </View>
                <Text style={styles.distanceText}>{pet.distance}</Text>
              </View>
            </View>
          </View>

          {/* Pet Characteristics */}
          <View style={styles.characteristicsContainer}>
            <View style={styles.characteristicsRow}>
              <View style={styles.characteristicPill}>
                <AgeIcon color={colors.primary} />
                <Text style={styles.characteristicText}>{pet.age}</Text>
              </View>

              <View style={styles.characteristicPill}>
                <WeightIcon color={colors.primary} />
                <Text style={styles.characteristicText}>{pet.weight}</Text>
              </View>

              <View style={styles.characteristicPill}>
                <FurIcon color={colors.primary} />
                <Text style={styles.characteristicText}>{t(pet.furColor)}</Text>
              </View>

              <View style={styles.characteristicPill}>
                <EyeIcon color={colors.primary} />
                <Text style={styles.characteristicText}>{t(pet.eyeColor)}</Text>
              </View>
            </View>
          </View>

          {/* Pet Info Grid */}
          <View style={styles.petInfoGrid}>
            <View style={styles.infoItem}>
              <LocationIcon color={colors.primary} />
              <Text style={styles.infoText} numberOfLines={2}>
                {pet.location}
              </Text>
            </View>

            <View style={styles.infoItem}>
              <ProfileIcon color={colors.primary} />
              <Text style={styles.infoText} numberOfLines={1}>
                {pet.ownerName}
              </Text>
            </View>

            <View style={styles.infoItem}>
              <EmailIcon color={colors.primary} />
              <Text style={styles.infoText} numberOfLines={1}>
                {pet.ownerEmail}
              </Text>
            </View>
          </View>

          {/* Description */}
          <View style={styles.descriptionContainer}>
            <Text style={styles.petDescription} numberOfLines={3}>
              {pet.description}
            </Text>
          </View>

          {/* Health Status */}
          <View style={styles.healthStatusContainer}>
            <View
              style={[
                styles.healthIndicator,
                pet.vaccinated
                  ? styles.healthIndicatorPositive
                  : styles.healthIndicatorNegative,
              ]}
            >
              <VaccinatedIcon color={pet.vaccinated ? '#4CAF50' : '#FF5722'} />
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
          </View>

          <Divider style={styles.divider} />

          {/* Contact Buttons */}
          <View style={styles.contactSection}>
            <View style={styles.contactButtons}>
              <TouchableOpacity
                style={styles.contactButton}
                onPress={() => onCall(pet.phones, pet.ownerName)}
              >
                <View style={styles.contactButtonContent}>
                  <PhoneIcon color={colors.buttonTextColor} />
                  <Text style={styles.contactButtonText}>{t('call')}</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.contactButton}
                onPress={() => onEmail(pet.ownerEmail)}
              >
                <View style={styles.contactButtonContent}>
                  <EmailIcon color={colors.buttonTextColor} />
                  <Text style={styles.contactButtonText}>{t('email')}</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.contactButton}
                onPress={() => onViewDetails(pet.id, pet.name)}
              >
                <View style={styles.contactButtonContent}>
                  <ViewIcon color={colors.buttonTextColor} />
                  <Text style={styles.contactButtonText}>{t('details')}</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.contactButton}
                onPress={handleNavigate}
              >
                <View style={styles.contactButtonContent}>
                  <NavigateIcon color={colors.buttonTextColor} />
                  <Text style={styles.contactButtonText}>{t('navigate')}</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </Card.Content>
      </Card>
    );
  },
);

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    petCard: {
      backgroundColor: colors.surface,
      marginBottom: verticalScale(24),
      borderRadius: moderateScale(16),
      overflow: 'hidden',
      borderWidth: 1,
      width: '100%',
      borderColor: colors.outline + '30',
    },
    imageSliderContainer: {
      width: '100%',
      borderTopLeftRadius: moderateScale(16),
      borderTopRightRadius: moderateScale(16),
      overflow: 'hidden',
      position: 'relative',
    },
    statusOverlay: {
      position: 'absolute',
      top: scale(12),
      left: scale(12),
      zIndex: 10,
    },
    statusCircle: {
      borderRadius: moderateScale(25),
      width: moderateScale(50),
      height: moderateScale(50),
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 3,
    },
    lostStatusCircle: {
      backgroundColor: '#FF5722',
    },
    foundStatusCircle: {
      backgroundColor: '#4CAF50',
    },
    statusText: {
      color: 'white',
      fontSize: moderateScale(16),
      fontWeight: '700',
      textAlign: 'center',
    },
    cardContent: {
      padding: scale(20),
    },
    petHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: verticalScale(16),
    },
    petTitleContainer: {
      flex: 1,
    },
    petName: {
      fontSize: moderateScale(20),
      fontWeight: '700',
      color: colors.primary,
      textAlign: 'left',
      marginBottom: verticalScale(8),
    },
    petBasicInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    speciesBreedContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    speciesChip: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.buttonColor + '15',
      paddingHorizontal: scale(8),
      paddingVertical: verticalScale(4),
      borderRadius: moderateScale(12),
      marginRight: scale(8),
    },
    speciesText: {
      color: colors.buttonTextColor!!,
      fontSize: moderateScale(11),
      fontWeight: '600',
      marginLeft: scale(4),
    },
    breedText: {
      fontSize: moderateScale(14),
      color: colors.onSurface,
      fontWeight: '500',
      flex: 1,
    },
    distanceText: {
      fontSize: moderateScale(12),
      color: colors.rangeTextColor,
      fontWeight: '500',
      textAlign: 'right',
    },
    characteristicsContainer: {
      marginBottom: verticalScale(16),
    },
    characteristicsRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: scale(6),
    },
    characteristicPill: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.background,
      paddingHorizontal: scale(10),
      paddingVertical: verticalScale(6),
      borderRadius: moderateScale(12),
      borderWidth: 1,
      borderColor: colors.outline + '30',
    },
    characteristicText: {
      fontSize: moderateScale(12),
      color: colors.onSurface,
      marginLeft: scale(4),
      fontWeight: '500',
    },
    petInfoGrid: {
      marginBottom: verticalScale(16),
    },
    infoItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: verticalScale(8),
    },
    infoText: {
      fontSize: moderateScale(14),
      color: colors.onSurface,
      marginLeft: scale(8),
      flex: 1,
    },
    ownerLabel: {
      fontSize: moderateScale(14),
      color: colors.primary,
      fontWeight: '600',
      marginLeft: scale(8),
    },
    ownerText: {
      fontSize: moderateScale(14),
      color: colors.onSurface,
      flex: 1,
    },
    descriptionContainer: {
      backgroundColor: colors.background,
      borderRadius: moderateScale(12),
      padding: scale(12),
      marginBottom: verticalScale(16),
    },
    petDescription: {
      fontSize: moderateScale(14),
      color: colors.onSurface,
      lineHeight: verticalScale(20),
      fontStyle: 'italic',
    },
    healthStatusContainer: {
      flexDirection: 'row',
      marginBottom: verticalScale(16),
      gap: scale(8),
    },
    healthIndicator: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderRadius: moderateScale(8),
      paddingHorizontal: scale(8),
      paddingVertical: verticalScale(6),
      flex: 1,
    },
    healthIndicatorText: {
      fontSize: moderateScale(12),
      fontWeight: '600',
      marginLeft: scale(4),
      textAlign: 'center',
      flex: 1,
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
    divider: {
      marginVertical: verticalScale(12),
      backgroundColor: colors.outline,
    },
    contactSection: {
      marginTop: verticalScale(8),
    },
    contactButtons: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
    },
    contactButton: {
      flex: 1,
      marginRight: scale(4),
      marginBottom: verticalScale(8),
      minWidth: scale(90),
      borderRadius: moderateScale(8),
      paddingVertical: verticalScale(10),
      paddingHorizontal: scale(12),
      backgroundColor: colors.buttonColor,
    },
    contactButtonContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    contactButtonText: {
      fontSize: moderateScale(14),
      fontWeight: '600',
      color: colors.buttonTextColor,
      marginLeft: scale(6),
    },
  });

PetCard.displayName = 'PetCard';

export default PetCard;
