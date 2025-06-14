import React, {useState, useEffect} from 'react';
import {
  View,
  TextInput,
  FlatList,
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import axios from 'axios';

interface LocationSuggestion {
  place_id: string;
  display_name: string;
  lat: string;
  lon: string;
}

interface Props {
  placeholder?: string;
  onSelectLocation: (location: {
    name: string;
    lat: string;
    lon: string;
  }) => void;
  dropdownPosition?: 'top' | 'bottom';
}

const LocationAutoComplete: React.FC<Props> = ({
  placeholder = 'Search location...',
  onSelectLocation,
  dropdownPosition = 'bottom',
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<LocationSuggestion[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (query.length > 2) {
        fetchLocations(query);
      } else {
        setResults([]);
      }
    }, 500);

    return () => clearTimeout(timeout);
  }, [query]);

  const fetchLocations = async (searchText: string) => {
    setLoading(true);
    try {
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/search`,
        {
          params: {
            q: searchText,
            format: 'json',
            addressdetails: 1,
            limit: 5,
          },
          headers: {
            'Accept-Language': 'en',
          },
        },
      );
      setResults(response.data);
    } catch (err) {
      console.error('Failed to fetch locations', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (item: LocationSuggestion) => {
    setQuery(item.display_name);
    setResults([]);
    onSelectLocation({
      name: item.display_name,
      lat: item.lat,
      lon: item.lon,
    });
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder={placeholder}
        value={query}
        onChangeText={setQuery}
        style={styles.input}
      />
      {loading && <ActivityIndicator style={styles.loader} />}
      {!loading && results.length > 0 && (
        <FlatList
          data={results}
          keyExtractor={item => item.place_id}
          style={[
            styles.dropdown,
            dropdownPosition === 'top'
              ? {bottom: 50, top: undefined}
              : {top: 50},
          ]}
          renderItem={({item}) => (
            <TouchableOpacity
              style={styles.item}
              onPress={() => handleSelect(item)}>
              <Text>{item.display_name}</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
};

export default LocationAutoComplete;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 16,
    position: 'relative',
    zIndex: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  loader: {
    marginTop: 10,
  },
  dropdown: {
    position: 'absolute',
    width: '100%',
    backgroundColor: '#fff',
    borderColor: '#ccc',
    borderWidth: 1,
    borderTopWidth: 0,
    maxHeight: 200,
    borderRadius: 6,
    zIndex: 100,
  },
  item: {
    padding: 12,
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
  },
});
