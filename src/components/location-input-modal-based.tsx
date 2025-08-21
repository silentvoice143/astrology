import React, {useState, useEffect} from 'react';
import {
  View,
  TextInput,
  FlatList,
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  Modal,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';
import axios from 'axios';
import {verticalScale, scale, moderateScale} from '../utils/sizer';
import CustomInput from './custom-input-v2';

interface Props {
  placeholder?: string;
  onSelectLocation: (location: {
    name: string;
    lat: string;
    lon: string;
  }) => void;
  label?: string;
  value?: string;
  modalTitle?: string;
}

const GOOGLE_API_KEY = 'AIzaSyBJRSfltVasH85IEnXRY6a_UQsVlkB4HAs';

const LocationModalPicker: React.FC<Props> = ({
  placeholder = 'Search location...',
  onSelectLocation,
  label,
  value = '',
  modalTitle = 'Select Location',
}) => {
  const [selectedLocation, setSelectedLocation] = useState(value);
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setSelectedLocation(value);
  }, [value]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (searchQuery.length > 2) {
        fetchLocations(searchQuery);
      } else {
        setResults([]);
      }
    }, 500);

    return () => clearTimeout(timeout);
  }, [searchQuery]);

  const fetchLocations = async (searchText: string) => {
    setLoading(true);
    try {
      const response = await axios.get(
        'https://maps.googleapis.com/maps/api/place/autocomplete/json',
        {
          params: {
            input: searchText,
            key: GOOGLE_API_KEY,
            types: 'geocode', // you can adjust types, e.g. '(regions)', 'address'
            language: 'en',
          },
        },
      );
      console.log(response);
      setResults(response.data.predictions);
    } catch (err) {
      console.error('Failed to fetch locations', err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchPlaceDetails = async (placeId: string) => {
    try {
      const response = await axios.get(
        'https://maps.googleapis.com/maps/api/place/details/json',
        {
          params: {
            place_id: placeId,
            key: GOOGLE_API_KEY,
            fields: 'geometry,name,formatted_address',
            language: 'en',
          },
        },
      );
      return response.data.result;
    } catch (err) {
      console.error('Failed to fetch place details', err);
      return null;
    }
  };

  const handleOpenModal = () => {
    setModalVisible(true);
    setSearchQuery('');
    setResults([]);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSearchQuery('');
    setResults([]);
  };

  const handleSelectLocation = async (item: any) => {
    const details = await fetchPlaceDetails(item.place_id);
    if (!details) return;

    const name = details.name || item.description;
    const lat = details.geometry.location.lat;
    const lon = details.geometry.location.lng;

    setSelectedLocation(item.description);
    onSelectLocation({
      name,
      lat: lat.toString(),
      lon: lon.toString(),
    });
    handleCloseModal();
  };

  const renderLocationItem = ({item}: {item: any}) => (
    <TouchableOpacity
      style={styles.locationItem}
      onPress={() => handleSelectLocation(item)}
      activeOpacity={0.7}>
      <View style={styles.locationItemContent}>
        <Text style={styles.locationName} numberOfLines={1}>
          {item.structured_formatting?.main_text || item.description}
        </Text>
        <Text style={styles.locationAddress} numberOfLines={2}>
          {item.description}
        </Text>
      </View>
      <View style={styles.selectIcon}>
        <Text style={styles.selectIconText}>→</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <>
      <TouchableOpacity onPress={handleOpenModal} activeOpacity={0.7}>
        <View pointerEvents="none">
          <CustomInput
            label={label}
            placeholder={placeholder}
            value={selectedLocation}
            editable={false}
            onChangeText={() => {}}
          />
        </View>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleCloseModal}>
        <SafeAreaView style={styles.modalContainer}>
          <StatusBar barStyle="dark-content" backgroundColor="#fff" />

          {/* Header */}
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={handleCloseModal}
              style={styles.closeButton}>
              <Text style={styles.closeButtonText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>{modalTitle}</Text>
            <View style={styles.closeButton} />
          </View>

          {/* Search Input */}
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search for a location..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus={true}
              placeholderTextColor="#999"
            />
          </View>

          {/* Results */}
          <View style={styles.resultsContainer}>
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={styles.loadingText}>Searching locations...</Text>
              </View>
            ) : searchQuery.length <= 2 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  Type at least 3 characters to search for locations
                </Text>
              </View>
            ) : results.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  No locations found for "{searchQuery}"
                </Text>
              </View>
            ) : (
              <FlatList
                data={results}
                keyExtractor={item => item.place_id}
                renderItem={renderLocationItem}
                showsVerticalScrollIndicator={true}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={styles.listContainer}
              />
            )}
          </View>
        </SafeAreaView>
      </Modal>
    </>
  );
};

export default LocationModalPicker;

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(16),
    paddingVertical: scale(12),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  closeButton: {
    minWidth: 60,
  },
  closeButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '400',
  },
  modalTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  searchContainer: {
    paddingHorizontal: scale(16),
    paddingVertical: scale(12),
    backgroundColor: '#f8f8f8',
  },
  searchInput: {
    backgroundColor: '#fff',
    borderRadius: moderateScale(10),
    paddingHorizontal: scale(16),
    paddingVertical: Platform.OS === 'ios' ? scale(12) : scale(8),
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    color: '#000',
  },
  resultsContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: scale(20),
  },
  loadingText: {
    marginTop: scale(12),
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: scale(20),
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  listContainer: {
    paddingBottom: scale(20),
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(16),
    paddingVertical: scale(16),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#fff',
  },
  locationItemContent: {
    flex: 1,
    marginRight: scale(12),
  },
  locationName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: scale(4),
  },
  locationAddress: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  selectIcon: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectIconText: {
    fontSize: 18,
    color: '#007AFF',
    fontWeight: '600',
  },
});
