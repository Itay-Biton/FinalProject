import { MD3LightTheme as DefaultTheme } from 'react-native-paper';

const dayTheme = {
  ...DefaultTheme,
  colors: {
    //default colors to change later if needed
    primary: 'rgb(0, 0, 0)',
    onPrimary: 'rgb(255, 255, 255)',
    primaryContainer: 'rgb(240, 219, 255)',
    onPrimaryContainer: 'rgb(44, 0, 81)',
    secondary: 'rgb(102, 90, 111)',
    onSecondary: 'rgb(255, 255, 255)',
    secondaryContainer: 'rgb(237, 221, 246)',
    onSecondaryContainer: 'rgb(33, 24, 42)',
    tertiary: 'rgb(128, 81, 88)',
    onTertiary: 'rgb(255, 255, 255)',
    tertiaryContainer: 'rgb(255, 217, 221)',
    onTertiaryContainer: 'rgb(50, 16, 23)',
    error: 'rgb(186, 26, 26)',
    onError: 'rgb(255, 255, 255)',
    errorContainer: 'rgb(255, 218, 214)',
    onErrorContainer: 'rgb(65, 0, 2)',
    background: 'rgb(255, 251, 255)',
    onBackground: 'rgb(29, 27, 30)',
    surface: 'rgb(255, 251, 255)',
    onSurface: 'rgb(29, 27, 30)',
    surfaceVariant: 'rgb(233, 223, 235)',
    onSurfaceVariant: 'rgb(74, 69, 78)',
    outline: 'rgb(124, 117, 126)',
    outlineVariant: 'rgb(204, 196, 206)',
    shadow: 'rgb(0, 0, 0)',
    scrim: 'rgb(0, 0, 0)',
    inverseSurface: 'rgb(50, 47, 51)',
    inverseOnSurface: 'rgb(245, 239, 244)',
    inversePrimary: 'rgb(220, 184, 255)',
    elevation: {
      level0: 'transparent',
      level1: 'rgb(248, 242, 251)',
      level2: 'rgb(244, 236, 248)',
      level3: 'rgb(240, 231, 246)',
      level4: 'rgb(239, 229, 245)',
      level5: 'rgb(236, 226, 243)',
    },
    surfaceDisabled: 'rgba(29, 27, 30, 0.12)',
    onSurfaceDisabled: 'rgba(29, 27, 30, 0.38)',
    backdrop: 'rgba(51, 47, 55, 0.4)',

    //customColors :
    cardColor: 'rgb(255, 255, 255)',
    CardColorText: 'rgb(0, 0, 0)',
    buttonColor: 'rgb(255, 193, 7)',
    iconColor: 'rgba(192, 180, 59, 0.83)',
    buttonTextColor: 'rgb(0, 0, 0)',
    dropDownSelected: ' rgb(241, 227, 132)',
    modalColor: 'rgb(246, 242, 248)',
    modalText: 'rgb(0, 0, 0)',
    modalHandle: 'rgb(255, 193, 7)',
    rangeTextColor: 'rgba(32, 151, 243, 1))',
    selectedColor: 'rgb(255, 193, 7)',
    success: 'rgb(129, 199, 132)', // Green for success states
    warning: 'rgb(255, 193, 7)', // Amber/Yellow for warnings (you can reuse your buttonColor)
  },
};

export default dayTheme;
