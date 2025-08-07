export const getServiceTypesList = (t: (key: string) => string) => [
  {
    label: t('veterinarian'),
    value: 'veterinarian',
    icon: require('../assets/icons/ic_veterinarian.png'),
  },
  {
    label: t('grooming'),
    value: 'grooming',
    icon: require('../assets/icons/ic_grooming.png'),
  },
  {
    label: t('pet_sitting'),
    value: 'pet_sitting',
    icon: require('../assets/icons/ic_pet_sitting.png'),
  },

  {
    label: t('pet_boarding'),
    value: 'pet_boarding',
    icon: require('../assets/icons/ic_pet_boarding.png'),
  },
  {
    label: t('pet_supplies'),
    value: 'pet_supplies',
    icon: require('../assets/icons/ic_pet_supplies.png'),
  },
  {
    label: t('pet_training'),
    value: 'pet_training',
    icon: require('../assets/icons/ic_pet_training.png'),
  },
  {
    label: t('pet_walking'),
    value: 'pet_walking',
    icon: require('../assets/icons/ic_pet_walking.png'),
  },
  {
    label: t('pet_photography'),
    value: 'pet_photography',
    icon: require('../assets/icons/ic_pet_photography.png'),
  },
  {
    label: t('other_service'),
    value: 'other_service',
    icon: require('../assets/icons/ic_other_service.png'),
  },
];
