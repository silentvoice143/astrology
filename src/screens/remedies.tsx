import React from 'react';
import {
  View,
  Text,
  FlatList,
  ImageBackground,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import ScreenLayout from '../components/screen-layout';
import {scale, verticalScale} from '../utils/sizer';

const {width} = Dimensions.get('window');
const ITEM_WIDTH = (width - scale(48)) / 2;

const remedies = [
  {
    title: 'Gemstone & Crystal',
    image: require('../assets/imgs/remedies/gemstones.jpg'),
  },
  {
    title: 'Rudraksha',
    image: require('../assets/imgs/remedies/rudraksha.jpg'),
  },
  {
    title: 'Palmistry',
    image: require('../assets/imgs/remedies/palmisty.jpg'),
    badge: 'Flat 10% OFF',
  },
  {
    title: 'Feng Shui',
    image: require('../assets/imgs/remedies/feng_sui.jpg'),
    badge: 'Starts at ₹499',
  },
  {
    title: 'Vastu',
    image: require('../assets/imgs/remedies/vastu.jpg'),
    badge: 'Starts at ₹1100',
  },
  {
    title: 'Select Name',
    image: require('../assets/imgs/remedies/namkaran.jpg'),
    badge: '7 Days Replacement',
  },
  {
    title: 'Numerology',
    image: require('../assets/imgs/remedies/numerology.jpg'),
    badge: 'Starts at ₹1100',
  },
];

const Remedies = () => {
  const renderItem = ({item}: any) => (
    <TouchableOpacity style={styles.itemContainer} activeOpacity={0.8}>
      <ImageBackground
        source={item.image}
        style={styles.image}
        imageStyle={styles.imageStyle}>
        {item.badge && (
          <View style={styles.badgeContainer}>
            <Text style={styles.badgeText}>{item.badge}</Text>
          </View>
        )}
        <View style={styles.overlay}>
          <Text style={styles.title}>{item.title}</Text>
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );

  return (
    <ScreenLayout>
      <FlatList
        data={remedies}
        numColumns={2}
        renderItem={renderItem}
        keyExtractor={(_, i) => i.toString()}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  listContainer: {
    paddingHorizontal: scale(12),
    paddingTop: verticalScale(16),
    paddingBottom: verticalScale(20),
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: verticalScale(16),
  },
  itemContainer: {
    width: ITEM_WIDTH,
    height: ITEM_WIDTH,
    borderRadius: scale(12),
    overflow: 'hidden',
    backgroundColor: '#eee',
  },
  image: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  imageStyle: {
    borderRadius: scale(12),
    resizeMode: 'cover',
  },
  overlay: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: scale(8),
  },
  title: {
    color: '#fff',
    fontSize: scale(13),
    fontWeight: '600',
  },
  badgeContainer: {
    position: 'absolute',
    top: 2,
    left: 2,
    backgroundColor: '#E53935',
    paddingVertical: verticalScale(4),
    paddingHorizontal: scale(8),
    alignSelf: 'flex-start',
    margin: scale(8),
    borderRadius: scale(6),
  },
  badgeText: {
    color: '#fff',
    fontSize: scale(10),
    fontWeight: 'bold',
  },
});

export default Remedies;
