// eyeColorList.ts
export const getEyeColorList = (t: (key: string) => string) => [
  {label: t('blue'), value: 'blue', color: '#0000FF'},
  {label: t('green'), value: 'green', color: '#00FF00'},
  {label: t('brown'), value: 'brown', color: '#8B4513'},
  {label: t('hazel'), value: 'hazel', color: '#8E7618'},
  {label: t('grey'), value: 'grey', color: '#808080'},
];
