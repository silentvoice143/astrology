import React from 'react';
import {StyleSheet, View, Text, Dimensions} from 'react-native';

const {width} = Dimensions.get('window');
const chartSize = width * 0.85; // 85% of screen width for charts

// --- Helper Data ---
const zodiacSigns = {
  1: 'Aries',
  2: 'Taurus',
  3: 'Gemini',
  4: 'Cancer',
  5: 'Leo',
  6: 'Virgo',
  7: 'Libra',
  8: 'Scorpio',
  9: 'Sagittarius',
  10: 'Capricorn',
  11: 'Aquarius',
  12: 'Pisces',
};

const getPlanetDisplay = planets => {
  return planets.map(p => p.planet).join(', ');
};

// --- Generic Chart House Cell Component ---
// This component renders a single house, showing its details.
const ChartHouseCell = ({houseNum, zodiacRashi, planets, isLagna, style}) => (
  <View style={[styles.houseCell, style, isLagna && styles.lagnaHouse]}>
    {houseNum && <Text style={styles.houseLabel}>H{houseNum}</Text>}
    {zodiacRashi && <Text style={styles.zodiacText}>{zodiacRashi}</Text>}
    {planets && <Text style={styles.planetsText}>{planets}</Text>}
    {isLagna && <Text style={styles.lagnaIndicator}>L</Text>}
  </View>
);

// --- North Indian Style Lagna Chart ---
// Houses are fixed, zodiac signs and planets move. Lagna (H1) is at the top-middle.
const NorthIndianChart = ({lagnaSign, planetPositions}) => {
  const houseData = {}; // Stores { sign, planets } for each logical house number (1-12)

  // 1. Determine which Zodiac Sign falls into each FIXED House position.
  // In North Indian style, House 1 (Lagna House) always contains the lagnaSign.
  // Houses proceed anti-clockwise.
  for (let i = 0; i < 12; i++) {
    const currentHouseNum = i + 1; // Logical house number (1 to 12)
    // Calculate the zodiac sign that occupies this fixed house.
    // Example: if Lagna (H1) is Leo (5), then H2 (anti-clockwise) is Virgo (6), H12 is Cancer (4).
    const signInThisHouse = ((lagnaSign - 1 + i) % 12) + 1;
    houseData[currentHouseNum] = {
      sign: signInThisHouse,
      planets: [],
    };
  }

  // 2. Distribute Planets to their respective Houses based on their zodiac sign placement.
  planetPositions.forEach(planet => {
    // Find the house that contains this planet's sign.
    const houseNumContainingSign = Object.keys(houseData).find(
      hNum => houseData[hNum].sign === planet.sign,
    );
    if (houseNumContainingSign) {
      houseData[houseNumContainingSign].planets.push(planet);
    }
  });

  // 3. Define the visual grid order for rendering North Indian chart.
  // This array maps logical house numbers to their positions in a 4x4 grid.
  // 'null' represents empty visual cells for spacing/layout.
  const NORTH_GRID_VISUAL_ORDER = [
    12,
    1,
    2,
    3, // Row 1: H12 (top-left), H1 (top-center/Lagna), H2 (top-right), H3 (far right)
    11,
    null,
    null,
    4, // Row 2: H11 (mid-left), empty, empty, H4 (mid-right)
    10,
    null,
    null,
    5, // Row 3: H10 (bottom-left), empty, empty, H5 (bottom-right)
    9,
    8,
    7,
    6, // Row 4: H9 (far left), H8 (bottom-mid-left), H7 (bottom-mid-right), H6 (far right)
  ];

  return (
    <View style={styles.chartContainer}>
      <Text style={styles.chartTitle}>North Indian Style</Text>
      <View style={styles.northChartWrapper}>
        <View style={styles.northChartGrid}>
          {NORTH_GRID_VISUAL_ORDER.map((houseNumber, index) => {
            if (houseNumber === null) {
              return (
                <View
                  key={`empty-${index}`}
                  style={styles.northGridCellEmpty}
                />
              );
            }
            const data = houseData[houseNumber];
            const isLagnaHouse = houseNumber === 1; // H1 is always the Lagna house in North style
            return (
              <ChartHouseCell
                key={index}
                houseNum={houseNumber}
                zodiacRashi={zodiacSigns[data.sign]}
                planets={getPlanetDisplay(data.planets)}
                isLagna={isLagnaHouse}
                style={styles.northGridCell}
              />
            );
          })}
        </View>
      </View>
    </View>
  );
};

export default NorthIndianChart;

// --- Stylesheet ---
const styles = StyleSheet.create({
  chartContainer: {
    width: chartSize,
    padding: 15,
    marginVertical: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    elevation: 8, // Android shadow
    shadowColor: '#000', // iOS shadow
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  chartTitle: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 15,
    color: '#34495E',
  },
  // --- Common House Cell Styling ---
  houseCell: {
    borderWidth: 1,
    borderColor: '#BDC3C7',
    borderRadius: 8,
    padding: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ECF0F1',
    margin: 2, // Small margin between cells
  },
  lagnaHouse: {
    backgroundColor: '#D6EAF8', // Light blue for Lagna house
    borderColor: '#2980B9',
    borderWidth: 2,
  },
  houseLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#555',
  },
  zodiacText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#2C3E50',
    textAlign: 'center',
  },
  planetsText: {
    fontSize: 9,
    color: '#666',
    marginTop: 2,
    textAlign: 'center',
  },
  lagnaIndicator: {
    position: 'absolute',
    top: 2,
    right: 5,
    fontSize: 10,
    fontWeight: 'bold',
    color: '#E74C3C', // Red 'L'
  },

  // --- North Indian Specific Styles ---
  northChartWrapper: {
    width: chartSize * 0.9,
    height: chartSize * 0.9,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    // Apply diamond rotation to the wrapper
    transform: [{rotate: '45deg'}],
  },
  northChartGrid: {
    width: '100%', // Take full width of rotated wrapper
    height: '100%', // Take full height of rotated wrapper
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between', // Distribute cells evenly
    // Counter-rotate the grid itself to keep content within cells upright
    transform: [{rotate: '-45deg'}],
  },
  northGridCell: {
    flexBasis: '23%', // Use flexBasis for more robust sizing for 4 cells in a row (23% + margins)
    height: '25%', // 4 rows
    aspectRatio: 1, // Maintain square shape
  },
  northGridCellEmpty: {
    flexBasis: '23%',
    height: '25%',
    aspectRatio: 1,
  },
});
