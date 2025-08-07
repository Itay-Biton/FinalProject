// RouteMapModal.tsx
import React, { memo, useEffect, useState, useMemo } from 'react';
import {
  StyleSheet,
  View,
  ActivityIndicator,
  useWindowDimensions,
  TouchableOpacity,
} from 'react-native';
import MapView, { Polyline, Marker } from 'react-native-maps';
import { Portal, Modal, Text, useTheme } from 'react-native-paper';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
import NavigationAppModal, { Coordinate } from './NavigationAppModal';
import { ThemeColors } from '../../types/theme';

// Icons - MOVED OUTSIDE OF COMPONENT (Placeholders for your actual icons)
import DirectionsIconSvg from '../../assets/icons/ic_directions.svg'; // Replace with your actual icon
import CloseIconSvg from '../../assets/icons/ic_close.svg'; // Replace with your actual icon
import { useTranslation } from 'react-i18next';

export interface RouteMapModalProps {
  visible: boolean;
  onClose: () => void;
  origin: Coordinate;
  destination: Coordinate;
  polylineOptions?: Omit<React.ComponentProps<typeof Polyline>, 'coordinates'>;
}

// Icon components - MOVED OUTSIDE OF COMPONENT
const DirectionsIcon = ({ color }: { color?: string }) => (
  <DirectionsIconSvg
    width={moderateScale(36)}
    height={moderateScale(36)}
    stroke="none"
    fill={color || 'black'}
  />
);

const CloseIcon = ({ color }: { color?: string }) => (
  <CloseIconSvg
    width={moderateScale(24)}
    height={moderateScale(24)}
    stroke={color || 'black'}
    fill="none"
  />
);

const RouteMapModal: React.FC<RouteMapModalProps> = memo(
  ({ visible, onClose, origin, destination, polylineOptions }) => {
    const { colors }: { colors: ThemeColors } = useTheme();
    const { width: screenWidth, height: screenHeight } = useWindowDimensions();
    const [coords, setCoords] = useState<Coordinate[]>([]);
    const [loading, setLoading] = useState(true);
    const [navVisible, setNavVisible] = useState(false);
    const styles = useMemo(
      () => createMapStyles(colors, screenWidth, screenHeight),
      [colors, screenWidth, screenHeight],
    );
    const { t } = useTranslation();

    useEffect(() => {
      if (!visible) return;
      (async () => {
        setLoading(true);
        try {
          const res = await fetch(
            `https://router.project-osrm.org/route/v1/driving/${origin.longitude},${origin.latitude};${destination.longitude},${destination.latitude}?overview=full&geometries=geojson`,
          );
          const json = await res.json();
          setCoords(
            json.routes?.[0].geometry.coordinates.map(
              ([lon, lat]: number[]) => ({ latitude: lat, longitude: lon }),
            ) || [],
          );
        } catch {
          setCoords([]);
        } finally {
          setLoading(false);
        }
      })();
    }, [visible, origin, destination]);

    const centerLat = (origin.latitude + destination.latitude) / 2;
    const centerLon = (origin.longitude + destination.longitude) / 2;
    const latDelta = Math.abs(origin.latitude - destination.latitude) * 2;
    const lonDelta = Math.abs(origin.longitude - destination.longitude) * 2;

    return (
      <Portal>
        <Modal
          visible={visible}
          onDismiss={onClose}
          contentContainerStyle={styles.modal}
        >
          <View style={styles.mapWrapper}>
            <MapView
              style={styles.map}
              initialRegion={{
                latitude: centerLat,
                longitude: centerLon,
                latitudeDelta: latDelta,
                longitudeDelta: lonDelta,
              }}
            >
              {coords.length > 0 && (
                <Polyline {...polylineOptions} coordinates={coords} />
              )}
              <Marker coordinate={origin} />
              <Marker coordinate={destination} />
            </MapView>
            {loading && (
              <View style={styles.loading}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={[styles.loadingText, { color: colors.onSurface }]}>
                  {t('loading_route')}
                </Text>
              </View>
            )}
          </View>

          {/* Directions Button - Bottom button with background color and onPrimary text */}
          <TouchableOpacity
            style={[styles.fab, { backgroundColor: colors.background }]}
            onPress={() => setNavVisible(true)}
          >
            <DirectionsIcon color={colors.primary} />
          </TouchableOpacity>

          {/* Close Button - Top button with buttonColor background and buttonTextColor icon */}
          <TouchableOpacity
            style={[
              styles.closeButton,
              { backgroundColor: colors.buttonColor },
            ]}
            onPress={onClose}
          >
            <CloseIcon color={colors.buttonTextColor} />
          </TouchableOpacity>

          <NavigationAppModal
            visible={navVisible}
            onClose={() => setNavVisible(false)}
            origin={origin}
            destination={destination}
          />
        </Modal>
      </Portal>
    );
  },
);

const createMapStyles = (
  colors: ThemeColors,
  screenWidth: number,
  screenHeight: number,
) => {
  const modalWidth = screenWidth * 0.9;
  const modalHeight = screenHeight * 0.9;

  return StyleSheet.create({
    modal: {
      width: modalWidth,
      height: modalHeight,
      backgroundColor: colors.surface,
      alignSelf: 'center',
      borderRadius: moderateScale(12),
      overflow: 'hidden',
      elevation: 6,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.25,
      shadowRadius: 8,
    },
    mapWrapper: {
      flex: 1,
      position: 'relative',
    },
    map: {
      flex: 1,
      borderRadius: moderateScale(12),
    },
    loading: {
      position: 'absolute',
      top: verticalScale(20),
      left: scale(20),
      right: scale(20),
      backgroundColor: colors.background + 'cc',
      padding: moderateScale(10),
      borderRadius: moderateScale(8),
      flexDirection: 'row',
      alignItems: 'center',
      zIndex: 1000,
    },
    loadingText: {
      marginLeft: scale(8),
      fontSize: moderateScale(14),
    },
    fab: {
      position: 'absolute',
      bottom: verticalScale(24),
      right: scale(24),
      borderRadius: moderateScale(30),
      width: moderateScale(56),
      height: moderateScale(56),
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 6,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 3,
      },
      shadowOpacity: 0.27,
      shadowRadius: 4.65,
      zIndex: 1000,
    },
    closeButton: {
      position: 'absolute',
      top: verticalScale(12),
      right: scale(12),
      borderRadius: moderateScale(25),
      width: moderateScale(48),
      height: moderateScale(48),
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 6,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 3,
      },
      shadowOpacity: 0.27,
      shadowRadius: 4.65,
      zIndex: 1000,
    },
  });
};

export { RouteMapModal };
