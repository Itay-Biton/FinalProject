import React, { memo, useMemo } from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  ScrollView,
} from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import { useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { ThemeColors } from '../../types/theme';

// Placeholder icon imports (replace these with your actual SVG imports)
import PhoneIconSvg from '../../assets/icons/ic_phone.svg';
import CloseIconSvg from '../../assets/icons/ic_cancel.svg';
import Shake from '../Animations/Shake';

type PhoneNumberPickerModalProps = {
  visible: boolean;
  onClose: () => void;
  phoneNumbers: string[];
  businessName: string;
  onSelectPhone: (phoneNumber: string) => void;
};

const PhoneIcon = ({ color }: { color?: string }) => (
  <PhoneIconSvg
    width={moderateScale(20)}
    height={moderateScale(20)}
    stroke={color || 'black'}
  />
);

const CloseIcon = ({ color }: { color?: string }) => (
  <CloseIconSvg
    width={moderateScale(20)}
    height={moderateScale(20)}
    stroke={color || 'black'}
  />
);

const PhoneNumberPickerModal: React.FC<PhoneNumberPickerModalProps> = memo(
  ({ visible, onClose, phoneNumbers, businessName, onSelectPhone }) => {
    const { width, height } = useWindowDimensions();
    const { colors }: { colors: ThemeColors } = useTheme();
    const { t } = useTranslation();
    const styles = useMemo(
      () => createStyles(width, height, colors),
      [width, height, colors],
    );

    const handlePhoneSelect = (phoneNumber: string) => {
      onSelectPhone(phoneNumber);
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
            <Text style={styles.title}>{t('select_phone_number')}</Text>
            <Text style={styles.businessName}>{businessName}</Text>

            <ScrollView
              style={styles.phoneListContainer}
              showsVerticalScrollIndicator={false}
            >
              {phoneNumbers.map((phoneNumber, index) => (
                <Pressable
                  key={index}
                  style={styles.phoneButton}
                  onPress={() => handlePhoneSelect(phoneNumber)}
                >
                  <Shake visible={visible}>
                    <PhoneIcon color={colors.primary} />
                  </Shake>
                  <Text
                    style={styles.phoneButtonText}
                  >{`\u202D${phoneNumber}\u202C`}</Text>
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
      marginBottom: moderateScale(8),
      fontWeight: '600',
    },
    businessName: {
      fontSize: moderateScale(16),
      color: colors.modalText,
      textAlign: 'center',
      marginBottom: moderateScale(16),
      opacity: 0.8,
    },
    phoneListContainer: {
      maxHeight: moderateScale(200),
      marginBottom: moderateScale(16),
    },
    phoneButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-start',
      paddingVertical: moderateScale(12),
      paddingHorizontal: moderateScale(16),
      marginBottom: moderateScale(8),
      backgroundColor: colors.surface,
      borderRadius: moderateScale(8),
      borderWidth: 1,
      borderColor: colors.outline + '30',
    },
    phoneButtonText: {
      fontSize: moderateScale(16),
      color: colors.modalText,
      marginLeft: moderateScale(12),
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

export default PhoneNumberPickerModal;
