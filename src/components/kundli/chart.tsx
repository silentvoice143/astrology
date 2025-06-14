import React from 'react';
import {View, Text, StyleSheet, ScrollView} from 'react-native';
import NorthIndianChart from './charts/lagna-chart';

const ChartPage = () => {
  const tags = [
    {label: 'Retrograde', symbol: '⭒'},
    {label: 'Exalted', symbol: '+'},
    {label: 'Debilitated', symbol: '⬇'},
    {label: 'Combust', symbol: '^'},
    {label: 'Vargottama', symbol: '¤'},
  ];

  const planetData = [
    {planet: 'Lagna', symbol: 'La', position: '08°31\'06"'},
    {planet: 'Sun', symbol: 'Su', position: '15°12\'24"'},
    {planet: 'Moon', symbol: 'Mo', position: '21°42\'55"'},
  ];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Kundli Chart */}

      {/* Astrology Tags */}
      <View style={styles.tagContainer}>
        {tags.map((tag, idx) => (
          <View key={idx} style={styles.tag}>
            <Text style={styles.tagText}>
              {tag.symbol} {tag.label}
            </Text>
          </View>
        ))}
      </View>

      {/* Planetary Table */}
      <View style={styles.tableContainer}>
        <View style={styles.tableHeader}>
          <Text style={styles.headerCell}>Planet</Text>
          <Text style={styles.headerCell}>Symbol</Text>
          <Text style={styles.headerCell}>Position</Text>
        </View>

        {planetData.map((row, index) => (
          <View key={index} style={styles.tableRow}>
            <Text style={styles.cell}>{row.planet}</Text>
            <Text style={styles.cell}>{row.symbol}</Text>
            <Text style={styles.cell}>{row.position}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fefefe',
    gap: 20,
  },
  kundliContainer: {
    aspectRatio: 1,
    width: '100%',
    maxWidth: 320,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignSelf: 'center',
    borderRadius: 12,
    backgroundColor: '#fff6c2',
    borderWidth: 1,
    borderColor: '#e3b800',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: {width: 0, height: 4},
    elevation: 3,
  },
  kundliBox: {
    width: '33.33%',
    height: '33.33%',
    borderWidth: 0.5,
    borderColor: '#e3b800',
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
  },
  tag: {
    backgroundColor: '#f3f3f3',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  tagText: {
    fontSize: 13,
    color: '#444',
  },
  tableContainer: {
    marginTop: 10,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#eee',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#ff8c00',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  headerCell: {
    flex: 1,
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#fff',
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#f0f0f0',
  },
  cell: {
    flex: 1,
    textAlign: 'center',
    color: '#333',
    fontSize: 14,
  },
});

export default ChartPage;
