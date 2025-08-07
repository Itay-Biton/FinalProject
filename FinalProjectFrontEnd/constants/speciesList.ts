export const getSpeciesList = (t: (key: string) => string) => [
  {
    label: t('dog'),
    value: 'dog',
    icon: require('../assets/icons/dog.png'),
  },
  {
    label: t('cat'),
    value: 'cat',
    icon: require('../assets/icons/cat.png'),
  },
  {
    label: t('bird'),
    value: 'bird',
    icon: require('../assets/icons/bird.png'),
  },
  {
    label: t('ferret'),
    value: 'ferret',
    icon: require('../assets/icons/ferret.png'),
  },
  {
    label: t('fish'),
    value: 'fish',
    icon: require('../assets/icons/fish.png'),
  },
  {
    label: t('rabbit'),
    value: 'rabbit',
    icon: require('../assets/icons/rabbit.png'),
  },
  {
    label: t('horse'),
    value: 'horse',
    icon: require('../assets/icons/horse.png'),
  },
  {
    label: t('other'),
    value: 'other',
    icon: require('../assets/icons/livestock.png'),
  },
];
