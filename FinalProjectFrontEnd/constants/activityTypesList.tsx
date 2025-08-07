// activityTypesList.ts
import React from 'react';
import { moderateScale } from 'react-native-size-matters';

// Icons
import FeedIconSvg from '../assets/icons/ic_food.svg';
import MedicineIconSvg from '../assets/icons/ic_medicine.svg';
import WalkIconSvg from '../assets/icons/ic_walk.svg';
import PlayIconSvg from '../assets/icons/ic_play.svg';
import GroomIconSvg from '../assets/icons/ic_grooming.svg';
import HealthIconSvg from '../assets/icons/ic_health.svg';
import NoteIconSvg from '../assets/icons/ic_note.svg';

// Icon Components
const FeedIcon = ({ color }: { color?: string }) => (
  <FeedIconSvg
    width={moderateScale(20)}
    height={moderateScale(20)}
    stroke={color || 'black'}
  />
);

const MedicineIcon = ({ color }: { color?: string }) => (
  <MedicineIconSvg
    width={moderateScale(20)}
    height={moderateScale(20)}
    stroke={color || 'black'}
  />
);

const WalkIcon = ({ color }: { color?: string }) => (
  <WalkIconSvg
    width={moderateScale(20)}
    height={moderateScale(20)}
    stroke={color || 'black'}
  />
);

const PlayIcon = ({ color }: { color?: string }) => (
  <PlayIconSvg
    width={moderateScale(20)}
    height={moderateScale(20)}
    stroke={color || 'black'}
  />
);

const GroomIcon = ({ color }: { color?: string }) => (
  <GroomIconSvg
    width={moderateScale(20)}
    height={moderateScale(20)}
    stroke={color || 'black'}
  />
);

const HealthIcon = ({ color }: { color?: string }) => (
  <HealthIconSvg
    width={moderateScale(20)}
    height={moderateScale(20)}
    stroke={color || 'black'}
  />
);

const NoteIcon = ({ color }: { color?: string }) => (
  <NoteIconSvg
    width={moderateScale(20)}
    height={moderateScale(20)}
    stroke={color || 'black'}
  />
);

// Activity Type Interface
export interface ActivityType {
  value: string;
  label: string;
  icon: React.ComponentType<{ color?: string }>;
}

// Activity Types List
export const getActivityTypesList = (
  t: (key: string) => string,
): ActivityType[] => [
  { value: 'feeding', label: t('feeding'), icon: FeedIcon },
  { value: 'medication', label: t('medication'), icon: MedicineIcon },
  { value: 'exercise', label: t('exercise'), icon: WalkIcon },
  { value: 'grooming', label: t('grooming'), icon: GroomIcon },
  { value: 'play', label: t('play'), icon: PlayIcon },
  { value: 'health', label: t('health'), icon: HealthIcon },
  { value: 'other', label: t('other'), icon: NoteIcon },
];

// Helper function to get activity type by value
export const getActivityTypeByValue = (
  value: string,
  t: (key: string) => string,
): ActivityType | undefined => {
  return getActivityTypesList(t).find(type => type.value === value);
};

// Export individual icons for other uses
export {
  FeedIcon,
  MedicineIcon,
  WalkIcon,
  PlayIcon,
  GroomIcon,
  HealthIcon,
  NoteIcon,
};
