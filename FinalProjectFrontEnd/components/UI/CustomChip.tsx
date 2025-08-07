// File: components/ui/CustomChip.tsx
import React from 'react';
import {
  Pressable,
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';

export type CustomChipProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
  backgroundColor?: string;
  textColor?: string;
  icon?: React.ReactNode;
  /** Width/height of the icon container (reserve space) */
  iconSize?: number;
};

const CustomChip: React.FC<CustomChipProps> = ({
  label,
  selected,
  onPress,
  style,
  textStyle,
  backgroundColor,
  textColor,
  icon,
  iconSize = 16, // default reserved size
}) => (
  <Pressable
    onPress={onPress}
    style={[
      chipStyles.container,
      backgroundColor ? { backgroundColor } : {},
      style,
    ]}
  >
    {/* Always render the icon slot, but show the real icon only when selected */}
    <View
      style={[chipStyles.iconContainer, { width: iconSize, height: iconSize }]}
    >
      {selected && icon ? (
        <View style={styles.iconWrapper}>{icon}</View>
      ) : (
        /* transparent placeholder to reserve space */
        <View style={{ width: iconSize, height: iconSize }} />
      )}
    </View>

    <Text
      style={[
        chipStyles.label,
        textColor ? { color: textColor } : {},
        textStyle,
      ]}
    >
      {label}
    </Text>
  </Pressable>
);

const chipStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 4,
  },
  label: {
    fontSize: 14,
    color: '#000',
  },
});

// Optional: if you need to scale the icon down a bit inside its slot
const styles = StyleSheet.create({
  iconWrapper: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
});

export default CustomChip;
