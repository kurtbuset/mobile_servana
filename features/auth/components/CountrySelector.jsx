import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  TextInput,
  StyleSheet,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { COUNTRIES, getFlagEmoji } from '../../../shared/constants';

/**
 * Country Selector Component
 */
export const CountrySelector = ({ selectedCountry, onSelect }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCountries = COUNTRIES.filter((country) => {
    const query = searchQuery.toLowerCase();
    return (
      country.label.toLowerCase().includes(query) ||
      country.callingCode.includes(query) ||
      country.code.toLowerCase().includes(query)
    );
  });

  const handleSelect = (country) => {
    onSelect(country);
    setModalVisible(false);
    setSearchQuery('');
  };

  return (
    <>
      <TouchableOpacity
        style={styles.selector}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.7}
      >
        <Text style={styles.flag}>{getFlagEmoji(selectedCountry.code)}</Text>
        <Text style={styles.countryText}>
          {selectedCountry.label} (+{selectedCountry.callingCode})
        </Text>
        <Feather name="chevron-down" size={20} color="#666" />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Country</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Feather name="x" size={24} color="#1A1A1A" />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.searchInput}
              placeholder="Search country..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />

            <FlatList
              data={filteredCountries}
              keyExtractor={(item) => item.code}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.countryItem}
                  onPress={() => handleSelect(item)}
                >
                  <Text style={styles.flag}>{getFlagEmoji(item.code)}</Text>
                  <Text style={styles.countryLabel}>{item.label}</Text>
                  <Text style={styles.callingCode}>+{item.callingCode}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  flag: {
    fontSize: 24,
    marginRight: 8,
  },
  countryText: {
    flex: 1,
    fontSize: 16,
    color: '#1A1A1A',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  searchInput: {
    margin: 16,
    padding: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    fontSize: 16,
  },
  countryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  countryLabel: {
    flex: 1,
    fontSize: 16,
    color: '#1A1A1A',
    marginLeft: 8,
  },
  callingCode: {
    fontSize: 14,
    color: '#666',
  },
});

export default CountrySelector;
