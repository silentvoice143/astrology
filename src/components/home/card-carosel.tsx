import {
  View,
  Text,
  FlatList,
  Dimensions,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import React from 'react';
import Animated, {
  interpolate,
  SharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import {moderateScale, scale, verticalScale} from '../../utils/sizer';
import LinearGradient from 'react-native-linear-gradient';
import {colors} from '../../constants/colors';
import Avatar from '../avatar';
import {textStyle} from '../../constants/text-style';
import ChatIcon from '../../assets/icons/chat-icon';
import CallIcon from '../../assets/icons/call-icon';
import {useNavigation} from '@react-navigation/native';
const DATA = [
  {
    id: 1,
    name: 'Pandit Morya',
    rate: '8 Rs / Min',
    avatar: 'https://i.pravatar.cc/300?img=5',
    specialty: 'Vedic Astrology',
    colors: ['#FF6B6B', '#4ECDC4'],
  },
  {
    id: 2,
    name: 'Guru Rajesh',
    rate: '12 Rs / Min',
    avatar: 'https://i.pravatar.cc/300?img=6',
    specialty: 'Love & Relationships',
    colors: ['#A8E6CF', '#FFD93D'],
  },
  {
    id: 3,
    name: 'Pandit Sharma',
    rate: '15 Rs / Min',
    avatar: 'https://i.pravatar.cc/300?img=7',
    specialty: 'Career Guidance',
    colors: ['#FFA500', '#FF0066'],
  },
  {
    id: 4,
    name: 'Mata Devi',
    rate: '10 Rs / Min',
    avatar: 'https://i.pravatar.cc/300?img=8',
    specialty: 'Spiritual Healing',
    colors: ['#667eea', '#764ba2'],
  },
  {
    id: 5,
    name: 'Baba Vishnu',
    rate: '20 Rs / Min',
    avatar: 'https://i.pravatar.cc/300?img=9',
    specialty: 'Numerology',
    colors: ['#f093fb', '#f5576c'],
  },
];

const {width} = Dimensions.get('screen');
const _cardWidth = width * 0.6;
const _cardHeight = _cardWidth * 1.4;
const _spacing = 12;

function Card({
  item,
  index,
  scrollX,
}: {
  item: any;
  index: number;
  scrollX: SharedValue<number>;
}) {
  const stylez = useAnimatedStyle(() => ({
    transform: [
      {
        scale: interpolate(
          scrollX.value,
          [index - 1, index, index + 1],
          [0.7, 1, 0.7],
        ),
      },
    ],
  }));
  return (
    <Animated.View
      style={[
        {
          width: _cardWidth,
          overflow: 'hidden',
          borderRadius: 24,
        },
        stylez,
      ]}>
      <LinearGradient
        style={{flex: 1, padding: moderateScale(20)}}
        colors={[
          colors.tertiary_card,
          colors.secondary_Card,
          colors.primary_card,
        ]}>
        <View style={{justifyContent: 'center', alignItems: 'center'}}>
          <Avatar
            borderColor={colors.glow_shadow}
            containerStyle={{
              height: moderateScale(80),
              width: moderateScale(80),
            }}
            image={{uri: item.avatar}}
            fallbackText={item.name}
          />
          <Text
            style={[
              textStyle.fs_mont_16_600,
              {
                color: colors.whiteText,
                marginTop: verticalScale(8),
              },
            ]}>
            {item.name}
          </Text>
          <Text
            style={[
              textStyle.fs_mont_14_400,
              {
                color: colors.whiteText,
                marginTop: verticalScale(8),
                marginBottom: verticalScale(20),
                textAlign: 'center',
              },
            ]}>
            This is Pandit raveena tandon specialist in vedic gyan.
          </Text>
          <Text
            style={[
              textStyle.fs_mont_16_600,
              {
                color: colors.whiteText,
              },
            ]}>
            {item.rate}
          </Text>
        </View>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginTop: verticalScale(24),
          }}>
          <TouchableOpacity
            style={{
              height: moderateScale(60),
              width: moderateScale(60),
              backgroundColor: colors.primary_surface,
              borderRadius: moderateScale(30),
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <ChatIcon colors={['#000']} height={scale(24)} width={scale(24)} />
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              height: moderateScale(60),
              width: moderateScale(60),
              backgroundColor: colors.primary_surface,
              borderRadius: moderateScale(30),
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <CallIcon colors={['#000']} height={scale(24)} width={scale(24)} />
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

const SlidingCard = () => {
  const scrollX = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler(e => {
    scrollX.value = e.contentOffset.x / (_cardWidth + _spacing);
  });
  const navigation = useNavigation<any>();
  return (
    <View style={{justifyContent: 'center', alignItems: 'center'}}>
      <Animated.FlatList
        showsHorizontalScrollIndicator={false}
        data={DATA}
        keyExtractor={item => String(item.id)}
        horizontal
        snapToInterval={_cardWidth + _spacing}
        decelerationRate={'fast'}
        contentContainerStyle={{
          gap: _spacing,
          paddingHorizontal: (width - _cardWidth) / 2,
        }}
        renderItem={({item, index}) => (
          <Pressable onPress={() => navigation.navigate('DetailsProfile')}>
            <Card item={item} index={index} scrollX={scrollX} />
          </Pressable>
        )}
        onScroll={onScroll}
        scrollEventThrottle={1000 / 60}
      />
    </View>
  );
};

export default SlidingCard;
