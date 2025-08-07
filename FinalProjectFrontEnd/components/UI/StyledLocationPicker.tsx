import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { useTheme, Text } from 'react-native-paper';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
import { useTranslation } from 'react-i18next';
import { ThemeColors } from '../../types/theme';
import GoogleMapsBrowser from './GoogleMapsBrowser';
import Config from 'react-native-config';

// Location icon import
import LocationIconSvg from '../../assets/icons/ic_location.svg';
import CustomInputText from './CustomInputText';

const LocationIcon = ({ color }: { color?: string }) => (
  <LocationIconSvg
    width={moderateScale(20)}
    height={moderateScale(20)}
    stroke={color || 'black'}
  />
);

export interface LocationResult {
  place_id: string;
  display_name: string;
  lat: string;
  lon: string;
}

interface StyledLocationPickerProps {
  onSelect: (item: {
    id: string;
    title: string;
    lat: string;
    lon: string;
  }) => void;
  placeholder?: string;
  label?: string;
  disabled?: boolean; // New disabled prop
}

const StyledLocationPicker: React.FC<StyledLocationPickerProps> = ({
  onSelect,
  placeholder,
  label,
  disabled = false, // Default to false
}) => {
  const { width } = useWindowDimensions();
  const { colors }: { colors: ThemeColors } = useTheme();
  const { t } = useTranslation();
  const styles = useMemo(() => createStyles(width, colors), [width, colors]);

  const [query, setQuery] = useState('');
  const [data, setData] = useState<LocationResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [hasSelected, setHasSelected] = useState(false);
  const [showGoogleMaps, setShowGoogleMaps] = useState(false);

  const abortController = useRef<AbortController | null>(null);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  // Watch for changes in query and trigger fetching if needed
  useEffect(() => {
    if (disabled || hasSelected) {
      return; // Do not fetch if disabled or an item was just selected
    }

    if (query.length < 3) {
      setData([]);
      setShowDropdown(false);
      if (abortController.current) {
        abortController.current.abort();
      }
      return;
    }

    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    debounceTimeout.current = setTimeout(() => {
      setLoading(true);

      if (abortController.current) {
        abortController.current.abort();
      }
      abortController.current = new AbortController();

      const url = `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(
        query,
      )}&lang=en&apiKey=${Config.GEOAPIFY_API_KEY}`;

      fetch(url, {
        signal: abortController.current.signal,
        headers: { 'User-Agent': 'MyPet/1.0' },
      })
        .then(response => response.json())
        .then((results: any) => {
          console.log('Geoapify API response:', results);
          const features = results.features || [];

          const mappedResults: LocationResult[] = features.map(
            (feature: any) => {
              const props = feature.properties;
              return {
                place_id:
                  props.place_id ||
                  String(feature.properties.osm_id || feature.id),
                display_name: props.formatted,
                lat: props.lat,
                lon: props.lon,
              };
            },
          );

          const uniqueResults = Array.from(
            new Map(mappedResults.map(item => [item.place_id, item])).values(),
          );
          setData(uniqueResults);
          setShowDropdown(uniqueResults.length > 0);
        })
        .catch(error => {
          if (error.name === 'AbortError') {
            console.log('Fetch aborted');
          } else {
            console.error('Geoapify API error:', error);
          }
        })
        .finally(() => {
          setLoading(false);
        });
    }, 1000); // 1000ms debounce delay

    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
      if (abortController.current) {
        abortController.current.abort();
      }
    };
  }, [query, hasSelected, disabled]);

  // Reset hasSelected when the user types new text
  const handleTextChange = (text: string) => {
    if (disabled) return; // Prevent changes when disabled
    setQuery(text);
    setHasSelected(false);
  };

  // Handle selection from the dropdown
  const handleSelect = (item: LocationResult) => {
    if (disabled) return; // Prevent selection when disabled

    setQuery(item.display_name);
    setShowDropdown(false);
    setHasSelected(true);
    onSelect({
      id: item.place_id,
      title: item.display_name,
      lat: item.lat,
      lon: item.lon,
    });
  };

  // Handle selection from Google Maps Browser
  const handleGoogleMapsSelect = (coords: { lat: number; lon: number }) => {
    if (disabled) return; // Prevent selection when disabled

    const location = {
      id: 'google-maps',
      title: `${coords.lat}, ${coords.lon}`,
      lat: coords.lat.toString(),
      lon: coords.lon.toString(),
    };
    setShowGoogleMaps(false);
    setHasSelected(true);
    setQuery(location.title);
    onSelect(location);
  };

  const handleGoogleMapsPress = () => {
    if (disabled) return; // Prevent opening when disabled
    setShowGoogleMaps(true);
  };

  return (
    <View style={[styles.container, disabled && styles.disabledContainer]}>
      {label && (
        <Text style={[styles.label, disabled && styles.disabledLabel]}>
          {label}
        </Text>
      )}

      <CustomInputText
        placeholder={placeholder || t('search_location')}
        value={query}
        onChangeText={handleTextChange}
        leftIcon={LocationIcon}
        containerStyle={styles.inputFieldContainer}
        leftIconContainerStyle={styles.inputIconContainer}
        iconColor={disabled ? colors.onSurfaceVariant : colors.primary}
        editable={!disabled} // Pass disabled state to input
      />

      {loading && !disabled && (
        <ActivityIndicator
          style={styles.loading}
          size="small"
          color={colors.buttonColor}
        />
      )}

      {query.length > 0 && query.length < 3 && !hasSelected && !disabled && (
        <Text style={styles.helperMessage}>
          {t('type_at_least_3_characters', {
            defaultValue: 'Type at least 3 characters to search',
          })}
        </Text>
      )}

      {showDropdown && !disabled && (
        <View style={styles.dropdown}>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            style={styles.dropdownList}
            nestedScrollEnabled={true}
          >
            {data.map(item => (
              <TouchableOpacity
                key={item.place_id}
                onPress={() => handleSelect(item)}
                style={styles.dropdownItem}
                disabled={disabled}
              >
                <Text style={styles.dropdownItemText}>{item.display_name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          {/* Fallback option to open Google Maps */}
          <TouchableOpacity
            style={[
              styles.fallbackButton,
              disabled && styles.disabledFallbackButton,
            ]}
            onPress={handleGoogleMapsPress}
            disabled={disabled}
          >
            <Text
              style={[
                styles.fallbackText,
                disabled && styles.disabledFallbackText,
              ]}
            >
              {t('cant_find_location_google_maps', {
                defaultValue: "Can't find your location? Try Google Maps",
              })}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Disabled state indicator */}
      {disabled && (
        <Text style={styles.disabledMessage}>
          {t('location_picker_disabled', {
            defaultValue: 'Location selection is currently disabled',
          })}
        </Text>
      )}

      {/* Render GoogleMapsBrowser as a modal */}
      {showGoogleMaps && !disabled && (
        <GoogleMapsBrowser
          onSelect={handleGoogleMapsSelect}
          onClose={() => setShowGoogleMaps(false)}
        />
      )}
    </View>
  );
};

const createStyles = (width: number, colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      marginBottom: verticalScale(12),
    },
    disabledContainer: {
      opacity: 0.6,
    },
    label: {
      fontSize: moderateScale(18),
      marginBottom: verticalScale(4),
      color: colors.primary,
      textAlign: 'left',
    },
    disabledLabel: {
      color: colors.onSurfaceVariant,
    },
    inputFieldContainer: {
      // Same styling as checkboxRow
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: verticalScale(12),
      paddingHorizontal: scale(12),
      backgroundColor: colors.surface,
      borderRadius: moderateScale(4),
      borderWidth: 1,
      borderColor: colors.outline,
      height: verticalScale(52),
      marginBottom: verticalScale(2),
    },
    disabledInputContainer: {
      backgroundColor: colors.surfaceDisabled || colors.surface,
      borderColor: colors.outline + '50', // More transparent border
    },
    inputIconContainer: {
      // Same styling as checkboxIconContainer
      width: moderateScale(20),
      height: moderateScale(20),
      marginLeft: scale(12),
      marginRight: scale(8),
      justifyContent: 'center',
      alignItems: 'center',
    },
    loading: {
      marginTop: verticalScale(8),
      alignSelf: 'center',
    },
    helperMessage: {
      marginTop: verticalScale(4),
      color: colors.onSurfaceVariant,
      fontSize: moderateScale(14),
      opacity: 0.8,
    },
    disabledMessage: {
      marginTop: verticalScale(4),
      color: colors.onSurfaceVariant,
      fontSize: moderateScale(12),
      opacity: 0.6,
      fontStyle: 'italic',
      textAlign: 'center',
    },
    dropdown: {
      width: '100%', // match CustomInputText width
      borderWidth: 1,
      borderColor: colors.outline,
      backgroundColor: colors.surface,
      maxHeight: verticalScale(200),
    },
    dropdownList: {
      maxHeight: verticalScale(150),
    },
    dropdownItem: {
      paddingVertical: verticalScale(12),
      paddingHorizontal: scale(16),
      borderBottomWidth: 0.5,
      borderBottomColor: colors.outline,
    },
    dropdownItemText: {
      fontSize: moderateScale(16),
      color: colors.onSurface,
    },
    fallbackButton: {
      paddingVertical: verticalScale(12),
      paddingHorizontal: scale(16),
      backgroundColor: colors.buttonColor,
      alignItems: 'center',
      justifyContent: 'center',
    },
    disabledFallbackButton: {
      backgroundColor: colors.onSurfaceVariant,
      opacity: 0.5,
    },
    fallbackText: {
      color: colors.buttonTextColor,
      fontSize: moderateScale(14),
      fontWeight: '500',
    },
    disabledFallbackText: {
      color: colors.onSurfaceVariant,
    },
  });

export default StyledLocationPicker;
