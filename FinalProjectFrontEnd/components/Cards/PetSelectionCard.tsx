// components/Cards/PetSelectionCard.tsx
import React, { memo } from 'react';
import { View, Image } from 'react-native';
import { Text, Card } from 'react-native-paper';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
import { useTranslation } from 'react-i18next';
import { ThemeColors } from '../../types/theme';

type PetLike = {
  id?: string;
  _id?: string;
  name: string;
  species: string;
  breed?: string;
  age?: number | string;
  weight?: { value: number; unit: string };
  image?: string;
  images?: string[];
  furColor?: string;
  eyeColor?: string;
};

interface PetSelectionCardProps {
  pet: PetLike;
  isSelected: boolean;
  onPress: (petId: string) => void;
  colors: ThemeColors;
}

const PetSelectionCard: React.FC<PetSelectionCardProps> = memo(
  ({ pet, isSelected, onPress, colors }) => {
    const { t } = useTranslation();

    const id = (pet.id || pet._id || '').toString();
    const primaryImage =
      pet.image || (Array.isArray(pet.images) ? pet.images[0] : undefined);

    const ageNum =
      typeof pet.age === 'number'
        ? pet.age
        : typeof pet.age === 'string'
        ? parseFloat(pet.age) || undefined
        : undefined;

    const formatAge = (age?: number) =>
      typeof age === 'number'
        ? `${Number.isInteger(age) ? age : age.toFixed(1)} ${t('years')}`
        : undefined;

    const formatWeight = (w?: { value: number; unit: string }) =>
      w
        ? `${Number.isInteger(w.value) ? w.value : w.value.toFixed(1)} ${t(
            w.unit,
          )}`
        : undefined;

    return (
      <Card
        style={[
          styles.petCard,
          {
            backgroundColor: isSelected
              ? colors.buttonColor + '20'
              : colors.surface,
            borderColor: isSelected
              ? colors.buttonColor
              : colors.outline + '30',
          },
        ]}
        onPress={() => onPress(id)}
        mode="outlined"
      >
        <View style={styles.petCardContentWrapper}>
          <Card.Content style={styles.petCardContent}>
            <View style={styles.petCardHeader}>
              <View style={styles.petInfo}>
                {/* Image (fallback to a colored circle if missing) */}
                {primaryImage ? (
                  <Card.Cover
                    source={{ uri: primaryImage }}
                    style={[
                      styles.petImage,
                      { borderColor: colors.outline + '40' },
                    ]}
                    resizeMode="cover"
                  />
                ) : (
                  <View
                    style={[
                      styles.petImage,
                      {
                        borderColor: colors.outline + '40',
                        backgroundColor: colors.outline + '20',
                        justifyContent: 'center',
                        alignItems: 'center',
                      },
                    ]}
                  >
                    <Text style={{ color: colors.onSurfaceVariant }}>
                      {pet.name?.charAt(0)?.toUpperCase() || '?'}
                    </Text>
                  </View>
                )}

                <View style={styles.petDetails}>
                  <Text
                    style={[
                      styles.petName,
                      {
                        color: isSelected
                          ? colors.buttonTextColor
                          : colors.primary,
                      },
                    ]}
                  >
                    {pet.name}
                  </Text>

                  {!!pet.breed && (
                    <Text
                      style={[
                        styles.petBreed,
                        {
                          color: isSelected
                            ? colors.buttonTextColor
                            : colors.onSurface,
                        },
                      ]}
                    >
                      {pet.breed}
                    </Text>
                  )}

                  <Text
                    style={[
                      styles.petMeta,
                      {
                        color: isSelected
                          ? colors.buttonTextColor
                          : colors.onSurfaceVariant,
                      },
                    ]}
                    numberOfLines={1}
                  >
                    {[
                      t(pet.species),
                      formatAge(ageNum),
                      formatWeight(pet.weight),
                      pet.furColor && t(pet.furColor),
                    ]
                      .filter(Boolean)
                      .join(' • ')}
                  </Text>
                </View>
              </View>
            </View>
          </Card.Content>
        </View>
      </Card>
    );
  },
);

const styles = {
  petCard: {
    marginBottom: verticalScale(16),
    borderRadius: moderateScale(20),
    borderWidth: 2,
  },
  petCardContentWrapper: {
    borderRadius: moderateScale(20),
    overflow: 'hidden' as const,
  },
  petCardContent: {
    padding: scale(20),
  },
  petCardHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
  },
  petInfo: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    flex: 1,
  },
  petImage: {
    width: moderateScale(80),
    height: moderateScale(80),
    borderRadius: moderateScale(40),
    marginRight: scale(20),
    borderWidth: 3,
  },
  petDetails: {
    flex: 1,
  },
  petName: {
    fontSize: moderateScale(18),
    fontWeight: '700' as const,
    marginBottom: verticalScale(4),
    textAlign: 'left' as const,
  },
  petBreed: {
    fontSize: moderateScale(14),
    marginBottom: verticalScale(4),
    textAlign: 'left' as const,
    fontWeight: '500' as const,
  },
  petMeta: {
    fontSize: moderateScale(12),
    textAlign: 'left' as const,
  },
};

PetSelectionCard.displayName = 'PetSelectionCard';
export default PetSelectionCard;
