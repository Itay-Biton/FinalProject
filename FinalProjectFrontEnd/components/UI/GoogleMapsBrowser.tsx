import React, { useState, useMemo } from 'react';
import {
  View,
  Modal,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  ScrollView,
  I18nManager,
  useWindowDimensions,
  Alert,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { Text, useTheme } from 'react-native-paper';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
import { useTranslation } from 'react-i18next';
import { ThemeColors } from '../../types/theme';
import CustomInputText from './CustomInputText';

// Icons
import HelpIconSvg from '../../assets/icons/ic_help.svg';
import BackIconSvg from '../../assets/icons/ic_back.svg';

const HelpIcon = ({ color }: { color?: string }) => (
  <HelpIconSvg
    width={moderateScale(24)}
    height={moderateScale(24)}
    stroke={color || 'white'}
  />
);
const BackIcon = ({ color }: { color?: string }) => (
  <BackIconSvg
    width={moderateScale(24)}
    height={moderateScale(24)}
    stroke={color || 'white'}
  />
);

interface GoogleMapsBrowserProps {
  onSelect: (coords: { lat: number; lon: number }) => void;
  onClose: () => void;
}

const GoogleMapsBrowser: React.FC<GoogleMapsBrowserProps> = ({
  onSelect,
  onClose,
}) => {
  const { width, height } = useWindowDimensions();
  const { colors }: { colors: ThemeColors } = useTheme();
  const { t } = useTranslation();
  const styles = useMemo(
    () => createStyles(width, height, colors),
    [width, height, colors],
  );

  const [inputCoords, setInputCoords] = useState('');
  const [showInstructions, setShowInstructions] = useState(false);

  const validateCoords = (latStr: string, lonStr: string) => {
    const lat = parseFloat(latStr);
    const lon = parseFloat(lonStr);
    return !isNaN(lat) &&
      !isNaN(lon) &&
      lat >= -90 &&
      lat <= 90 &&
      lon >= -180 &&
      lon <= 180
      ? { lat, lon }
      : null;
  };

  const handleConfirm = () => {
    const parts = inputCoords.trim().split(/[, ]+/);
    if (parts.length >= 2) {
      const result = validateCoords(parts[0], parts[1]);
      if (result) {
        onSelect(result);
        onClose();
        return;
      }
    }
    Alert.alert(t('invalid_coordinates'), t('invalid_coordinates_message'));
  };

  const handleNavState = (nav: any) => {
    const { url } = nav;
    if (url.includes('/place/')) {
      const at = url.indexOf('@');
      const data = url.indexOf('/data', at);
      if (at !== -1 && data !== -1) {
        const [lat, lon] = url.substring(at + 1, data).split(',');
        const result = validateCoords(lat, lon);
        if (result) {
          onSelect(result);
          onClose();
        }
      }
    }
  };

  return (
    <Modal
      visible
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* Fullscreen map */}
        <WebView
          source={{ uri: 'https://www.google.com/maps' }}
          style={styles.webview}
          onNavigationStateChange={handleNavState}
          userAgent="Mozilla/5.0"
        />

        {/* Back button (top-right) */}
        <TouchableOpacity style={styles.backButton} onPress={onClose}>
          <BackIcon color={colors.buttonTextColor} />
        </TouchableOpacity>

        {/* Help circle icon */}
        <TouchableOpacity
          style={styles.helpButton}
          onPress={() => setShowInstructions(true)}
        >
          <HelpIcon color={colors.buttonTextColor} />
        </TouchableOpacity>

        {/* Manual input modal */}
        {showInstructions && (
          <Modal
            visible
            transparent
            animationType="fade"
            onRequestClose={() => setShowInstructions(false)}
          >
            <View style={styles.instructionsOverlay}>
              <View style={styles.instructionsContainer}>
                <ScrollView contentContainerStyle={styles.instructionsContent}>
                  {/* Larger instruction text */}
                  <Text style={styles.instructionsText}>
                    {t('google_maps_instructions')}
                  </Text>

                  {/* Manual entry label */}
                  <Text style={styles.manualInputLabel}>
                    {t('or_enter_coordinates_manually')}
                  </Text>

                  {/* Input field */}
                  <CustomInputText
                    placeholder={t('coordinates_placeholder')}
                    value={inputCoords}
                    onChangeText={setInputCoords}
                    containerStyle={styles.coordinatesInputContainer}
                    iconColor={colors.primary}
                  />

                  {/* Centered circular Accept button */}
                  <TouchableOpacity
                    style={styles.acceptTouchable}
                    onPress={handleConfirm}
                  >
                    <Text style={styles.acceptText}>✓</Text>
                  </TouchableOpacity>
                </ScrollView>
              </View>
            </View>
          </Modal>
        )}
      </SafeAreaView>
    </Modal>
  );
};

const createStyles = (width: number, height: number, colors: ThemeColors) =>
  StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: colors.background },
    webview: { flex: 1 },
    backButton: {
      position: 'absolute',
      top: verticalScale(16),
      right: scale(16),
      backgroundColor: colors.buttonColor,
      borderRadius: moderateScale(24),
      padding: moderateScale(8),
    },
    helpButton: {
      position: 'absolute',
      bottom: verticalScale(32),
      right: scale(16),
      backgroundColor: colors.buttonColor,
      borderRadius: moderateScale(24),
      padding: moderateScale(12),
    },
    instructionsOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      padding: scale(20),
    },
    instructionsContainer: {
      backgroundColor: colors.surface,
      borderRadius: moderateScale(8),
      padding: scale(16),
    },
    instructionsContent: { paddingBottom: verticalScale(16) },
    instructionsText: {
      marginBottom: verticalScale(12),
      color: colors.onSurface,
      fontSize: moderateScale(16),
      lineHeight: verticalScale(24),
    },
    manualInputLabel: {
      marginBottom: verticalScale(8),
      color: colors.primary,
      fontSize: moderateScale(16),
    },
    coordinatesInputContainer: { marginBottom: verticalScale(16) },
    acceptTouchable: {
      alignSelf: 'center',
      backgroundColor: colors.buttonColor,
      width: moderateScale(48),
      height: moderateScale(48),
      borderRadius: moderateScale(24),
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: verticalScale(8),
    },
    acceptText: {
      color: colors.buttonTextColor,
      fontSize: moderateScale(24),
    },
  });

export default GoogleMapsBrowser;
