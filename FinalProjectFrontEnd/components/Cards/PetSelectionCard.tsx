import React, { memo } from 'react';
import { View } from 'react-native';
import { Text, Card } from 'react-native-paper';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
import { useTranslation } from 'react-i18next';
import { ThemeColors } from '../../types/theme';

interface Pet {
  id: string;
  name: string;
  species: string;
  breed: string;
  age: number;
  weight: { value: number; unit: string };
  image: string;
  furColor: string;
  eyeColor: string;
}

interface PetSelectionCardProps {
  pet: Pet;
  isSelected: boolean;
  onPress: (petId: string) => void;
  colors: ThemeColors;
}

const PetSelectionCard: React.FC<PetSelectionCardProps> = memo(
  ({ pet, isSelected, onPress, colors }) => {
    const { t } = useTranslation();

    const formatAge = (age: number) => {
      const formattedAge = age % 1 === 0 ? age.toString() : age.toFixed(1);
      return `${formattedAge} ${t('years')}`;
    };

    const formatWeight = (weight: { value: number; unit: string }) => {
      const formattedWeight =
        weight.value % 1 === 0
          ? weight.value.toString()
          : weight.value.toFixed(1);
      return `${formattedWeight} ${t(weight.unit)}`;
    };

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
        onPress={() => onPress(pet.id)}
        mode="outlined"
      >
        <View style={styles.petCardContentWrapper}>
          <Card.Content style={styles.petCardContent}>
            <View style={styles.petCardHeader}>
              <View style={styles.petInfo}>
                <Card.Cover
                  source={{ uri: pet.image }}
                  style={[
                    styles.petImage,
                    { borderColor: colors.outline + '40' },
                  ]}
                />
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
                  <Text
                    style={[
                      styles.petMeta,
                      {
                        color: isSelected
                          ? colors.buttonTextColor
                          : colors.onSurfaceVariant,
                      },
                    ]}
                  >
                    {t(pet.species)} • {formatAge(pet.age)} •{' '}
                    {formatWeight(pet.weight)} • {t(pet.furColor)}
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
