import React from 'react';
import {
  View,
  Text,
  FlatList,
  Dimensions,
  Image,
  StyleSheet,
  Pressable,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';

const {width} = Dimensions.get('window');
const CARD_WIDTH = width * 0.7;
const SPACING = 20;
const ITEM_SIZE = CARD_WIDTH + SPACING;

const DATA = Array.from({length: 5}).map((_, i) => ({
  id: i,
  name: `Pandit Morya`,
  rate: '8 Rs / Min',
  avatar: 'https://i.pravatar.cc/300?img=' + (i + 5),
}));

const SlidingCard = () => {
  const scrollX = useSharedValue(0);

  const renderItem = ({item, index}: any) => {
    const animatedStyle = useAnimatedStyle(() => {
      const inputRange = [
        (index - 1) * ITEM_SIZE,
        index * ITEM_SIZE,
        (index + 1) * ITEM_SIZE,
      ];

      const scale = interpolate(
        scrollX.value,
        inputRange,
        [0.9, 1, 0.9],
        Extrapolate.CLAMP,
      );

      const opacity = interpolate(
        scrollX.value,
        inputRange,
        [0.6, 1, 0.6],
        Extrapolate.CLAMP,
      );

      return {
        transform: [{scale}],
        opacity,
      };
    });

    return (
      <Animated.View style={[styles.card, animatedStyle]}>
        <LinearGradient
          colors={['#FFA500', '#FF0066']}
          style={styles.gradient}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}>
          <View style={styles.avatarContainer}>
            <Image source={{uri: item.avatar}} style={styles.avatar} />
            <View style={styles.onlineDot} />
          </View>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.rate}>{item.rate}</Text>

          <View style={styles.iconRow}>
            <Pressable style={styles.iconButton}>
              <Text style={styles.iconText}>💬</Text>
            </Pressable>
            <Pressable style={styles.iconButton}>
              <Text style={styles.iconText}>📞</Text>
            </Pressable>
          </View>
        </LinearGradient>
      </Animated.View>
    );
  };

  return (
    <View style={{flex: 1, justifyContent: 'center'}}>
      <FlatList
        data={DATA}
        keyExtractor={item => item.id.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: (width - CARD_WIDTH) / 2,
        }}
        snapToInterval={ITEM_SIZE}
        decelerationRate="fast"
        onScroll={Animated.event(
          [{nativeEvent: {contentOffset: {x: scrollX}}}],
          {useNativeDriver: true},
        )}
        scrollEventThrottle={16}
        renderItem={renderItem}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    marginRight: SPACING,
    borderRadius: 20,
    overflow: 'hidden',
  },
  gradient: {
    flex: 1,
    borderRadius: 20,
    padding: 16,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 10,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  onlineDot: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: 'limegreen',
    borderRadius: 6,
    width: 12,
    height: 12,
    borderWidth: 2,
    borderColor: '#fff',
  },
  name: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  rate: {
    fontSize: 14,
    color: '#fff',
    marginBottom: 12,
  },
  iconRow: {
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 50,
  },
  iconText: {
    fontSize: 18,
  },
});

export default SlidingCard;
