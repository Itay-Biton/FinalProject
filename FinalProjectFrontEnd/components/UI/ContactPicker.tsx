// components/ui/ContactPicker.tsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  FlatList,
  Alert,
  Text,
  TextInput,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
import { useTranslation } from 'react-i18next';
import { ThemeColors } from '../../types/theme';
import {
  useContactPermission,
  ContactInfo,
} from '../../utils/ContactPermissions';

// Icon components - add these SVG files to your assets/icons folder
import CloseIconSvg from '../../assets/icons/ic_close.svg';
import SearchIconSvg from '../../assets/icons/ic_search.svg';

interface ContactPickerProps {
  visible: boolean;
  onClose: () => void;
  onSelectContact: (contact: ContactInfo) => void;
  colors: ThemeColors; // Pass colors as prop instead of using useTheme
}

const CloseIcon = ({ color }: { color?: string }) => (
  <CloseIconSvg
    width={moderateScale(24)}
    height={moderateScale(24)}
    stroke={color || 'black'}
  />
);

const SearchIcon = ({ color }: { color?: string }) => (
  <SearchIconSvg
    width={moderateScale(20)}
    height={moderateScale(20)}
    stroke={color || 'black'}
  />
);

const ContactPicker: React.FC<ContactPickerProps> = ({
  visible,
  onClose,
  onSelectContact,
  colors,
}) => {
  const { t } = useTranslation();
  const { getAllContacts, loading } = useContactPermission();

  const [contacts, setContacts] = useState<ContactInfo[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredContacts, setFilteredContacts] = useState<ContactInfo[]>([]);

  const styles = useMemo(() => createStyles(colors), [colors]);

  const loadContacts = useCallback(async () => {
    try {
      const allContacts = await getAllContacts();
      setContacts(allContacts);
      setFilteredContacts(allContacts);
    } catch (error) {
      Alert.alert(t('error'), t('failed_to_load_contacts'));
    }
  }, [getAllContacts, t]);

  useEffect(() => {
    if (visible) {
      loadContacts();
    }
  }, [visible, loadContacts]);

  useEffect(() => {
    if (searchTerm.trim()) {
      const filtered = contacts.filter(
        contact =>
          contact.displayName
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          contact.phoneNumbers?.some(phone =>
            phone.number.includes(searchTerm),
          ),
      );
      setFilteredContacts(filtered);
    } else {
      setFilteredContacts(contacts);
    }
  }, [searchTerm, contacts]);

  const handleSelectContact = useCallback(
    (contact: ContactInfo) => {
      onSelectContact(contact);
      onClose();
      setSearchTerm('');
    },
    [onSelectContact, onClose],
  );

  const clearSearch = () => {
    setSearchTerm('');
  };

  const renderContact = useCallback(
    ({ item }: { item: ContactInfo }) => (
      <Pressable
        style={styles.contactCard}
        onPress={() => handleSelectContact(item)}
        android_ripple={{ color: colors.primary + '20' }}
      >
        <View style={styles.contactContent}>
          <View style={styles.contactInfo}>
            <Text style={styles.contactName} numberOfLines={1}>
              {item.displayName || 'Unknown Contact'}
            </Text>
            {item.phoneNumbers.length > 0 && (
              <Text style={styles.contactPhone} numberOfLines={1}>
                {item.phoneNumbers[0].number}
              </Text>
            )}
            {item.phoneNumbers.length > 1 && (
              <Text style={styles.contactPhoneCount}>
                +{item.phoneNumbers.length - 1} {t('more_numbers')}
              </Text>
            )}
          </View>
        </View>
      </Pressable>
    ),
    [styles, handleSelectContact, t, colors.primary],
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{t('select_contact')}</Text>
          <Pressable
            style={styles.closeButton}
            onPress={onClose}
            android_ripple={{ color: colors.primary + '20', borderless: true }}
          >
            <CloseIcon color={colors.onSurface} />
          </Pressable>
        </View>

        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <View style={styles.searchIconContainer}>
              <SearchIcon color={colors.primary} />
            </View>
            <TextInput
              placeholder={t('search_contacts')}
              value={searchTerm}
              onChangeText={setSearchTerm}
              style={styles.searchInput}
              placeholderTextColor={colors.onSurfaceVariant}
            />
            {searchTerm ? (
              <Pressable
                style={styles.clearButton}
                onPress={clearSearch}
                android_ripple={{
                  color: colors.primary + '20',
                  borderless: true,
                }}
              >
                <CloseIcon color={colors.onSurfaceVariant} />
              </Pressable>
            ) : null}
          </View>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>{t('loading_contacts')}</Text>
          </View>
        ) : (
          <FlatList
            data={filteredContacts}
            renderItem={renderContact}
            keyExtractor={item => item.recordID}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  {searchTerm
                    ? t('no_contacts_found')
                    : t('no_contacts_available')}
                </Text>
              </View>
            }
          />
        )}
      </View>
    </Modal>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: scale(16),
      paddingTop: verticalScale(16),
      paddingBottom: verticalScale(8),
      borderBottomWidth: 1,
      borderBottomColor: colors.outline + '30',
    },
    title: {
      fontSize: moderateScale(20),
      fontWeight: '600',
      color: colors.onSurface,
    },
    closeButton: {
      padding: moderateScale(8),
      borderRadius: moderateScale(20),
    },
    searchContainer: {
      paddingHorizontal: scale(16),
      paddingVertical: verticalScale(16),
    },
    searchInputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: moderateScale(4),
      borderWidth: 1,
      borderColor: colors.outline,
      height: verticalScale(52),
      paddingHorizontal: scale(12),
    },
    searchIconContainer: {
      width: moderateScale(20),
      height: moderateScale(20),
      marginRight: scale(8),
      justifyContent: 'center',
      alignItems: 'center',
    },
    searchInput: {
      flex: 1,
      fontSize: moderateScale(16),
      color: colors.onSurface,
      paddingVertical: 0, // Remove default padding
    },
    clearButton: {
      padding: moderateScale(4),
      marginLeft: scale(8),
    },
    listContent: {
      paddingHorizontal: scale(16),
      paddingBottom: verticalScale(16),
    },
    contactCard: {
      backgroundColor: colors.surface,
      marginBottom: verticalScale(8),
      borderRadius: moderateScale(12),
      borderWidth: 1,
      borderColor: colors.outline + '20',
      // Shadow for elevation effect
      shadowColor: colors.shadow || '#000',
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 1,
    },
    contactContent: {
      paddingVertical: verticalScale(12),
      paddingHorizontal: scale(16),
    },
    contactInfo: {
      flex: 1,
    },
    contactName: {
      fontSize: moderateScale(16),
      fontWeight: '600',
      color: colors.onSurface,
      marginBottom: verticalScale(4),
    },
    contactPhone: {
      fontSize: moderateScale(14),
      color: colors.onSurfaceVariant,
      marginBottom: verticalScale(2),
    },
    contactPhoneCount: {
      fontSize: moderateScale(12),
      color: colors.primary,
      fontStyle: 'italic',
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      fontSize: moderateScale(16),
      color: colors.onSurfaceVariant,
      marginTop: verticalScale(16),
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: verticalScale(40),
    },
    emptyText: {
      fontSize: moderateScale(16),
      color: colors.onSurfaceVariant,
      textAlign: 'center',
    },
  });

export default ContactPicker;
