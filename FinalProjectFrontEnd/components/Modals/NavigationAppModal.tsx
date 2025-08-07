// NavigationAppModal.tsx
import React, { memo, useEffect, useState, useMemo } from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  ScrollView,
  Image,
} from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import { useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import {
  getApps,
  showLocation,
  type GetAppsResponse,
} from 'react-native-map-link';
import { ThemeColors } from '../../types/theme';

// Placeholder icon imports (replace with your actual SVG imports)
import CloseIconSvg from '../../assets/icons/ic_cancel.svg';
import Shake from '../Animations/Shake';

export interface Coordinate {
  latitude: number;
  longitude: number;
}

export interface NavigationAppModalProps {
  visible: boolean;
  onClose: () => void;
  origin: Coordinate;
  destination: Coordinate;
}

const CloseIcon = ({ color }: { color?: string }) => (
  <CloseIconSvg
    width={moderateScale(20)}
    height={moderateScale(20)}
    stroke={color || 'black'}
  />
);

const NavigationAppModal: React.FC<NavigationAppModalProps> = memo(
  ({ visible, onClose, origin, destination }) => {
    const { width, height } = useWindowDimensions();
    const { colors }: { colors: ThemeColors } = useTheme();
    const { t } = useTranslation();
    const [apps, setApps] = useState<GetAppsResponse[]>([]);
    const styles = useMemo(
      () => createStyles(width, height, colors),
      [width, height, colors],
    );

    useEffect(() => {
      if (!visible) return;
      (async () => {
        try {
          const result = await getApps({
            latitude: destination.latitude,
            longitude: destination.longitude,
            sourceLatitude: origin.latitude,
            sourceLongitude: origin.longitude,
            title: 'Destination',
            alwaysIncludeGoogle: true,
            directionsMode: 'car',
          });
          setApps(result);
        } catch {
          setApps([]);
        }
      })();
    }, [visible, origin, destination]);

    const handleAppPress = (app: GetAppsResponse) => {
      showLocation({
        latitude: destination.latitude,
        longitude: destination.longitude,
        sourceLatitude: origin.latitude,
        sourceLongitude: origin.longitude,
        title: 'Destination',
        app: app.id,
        directionsMode: 'car',
      });
      onClose();
    };

    return (
      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={onClose}
      >
        <Pressable style={styles.overlay} onPress={onClose}>
          <View style={styles.modalContainer} pointerEvents="box-none">
            {/* Animated handle */}
            <View style={styles.handle} />
            <Text style={styles.title}>{t('select_navigation_app')}</Text>

            <ScrollView
              style={styles.appListContainer}
              showsVerticalScrollIndicator={false}
            >
              {apps.map(app => (
                <Pressable
                  key={app.id}
                  style={styles.appButton}
                  onPress={() => handleAppPress(app)}
                >
                  <Shake visible={visible}>
                    <Image source={app.icon} style={styles.appIcon} />
                  </Shake>
                  <Text style={styles.appButtonText}>{app.name}</Text>
                </Pressable>
              ))}
            </ScrollView>

            <Pressable style={styles.cancelButton} onPress={onClose}>
              <Shake visible={visible}>
                <CloseIcon color={colors.error} />
              </Shake>
              <Text style={styles.cancelButtonText}>{t('cancel')}</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    );
  },
);

const createStyles = (width: number, height: number, colors: ThemeColors) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    },
    modalContainer: {
      backgroundColor: colors.modalColor,
      padding: moderateScale(16),
      borderTopLeftRadius: moderateScale(16),
      borderTopRightRadius: moderateScale(16),
      maxHeight: height * 0.6,
    },
    handle: {
      width: moderateScale(40),
      height: moderateScale(4),
      borderRadius: moderateScale(2),
      backgroundColor: colors.modalHandle,
      alignSelf: 'center',
      marginBottom: moderateScale(10),
    },
    title: {
      fontSize: moderateScale(20),
      color: colors.modalText,
      textAlign: 'center',
      marginBottom: moderateScale(16),
      fontWeight: '600',
    },
    appListContainer: {
      maxHeight: moderateScale(200),
      marginBottom: moderateScale(16),
    },
    appButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: moderateScale(12),
      paddingHorizontal: moderateScale(16),
      marginBottom: moderateScale(8),
      backgroundColor: colors.surface,
      borderRadius: moderateScale(8),
      borderWidth: 1,
      borderColor: colors.outline + '30',
    },
    appIcon: {
      width: moderateScale(24),
      height: moderateScale(24),
      marginRight: moderateScale(12),
    },
    appButtonText: {
      fontSize: moderateScale(16),
      color: colors.modalText,
      fontWeight: '500',
    },
    cancelButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: moderateScale(12),
      marginTop: moderateScale(8),
    },
    cancelButtonText: {
      fontSize: moderateScale(18),
      color: colors.error,
      marginLeft: moderateScale(12),
      fontWeight: '600',
    },
  });

export default NavigationAppModal;
