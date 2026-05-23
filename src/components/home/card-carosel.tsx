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
import { moderateScale, scale, verticalScale } from '../../utils/sizer';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS, colors, themeColors } from '../../constants/colors';
import Avatar from '../avatar';
import { textStyle } from '../../constants/text-style';
import ChatIcon from '../../assets/icons/chat-icon';
import CallIcon from '../../assets/icons/call-icon';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('screen');
const _cardWidth = width * 0.9;
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

  console.log(item, "rendering the astrologe in card")
  return (
    <Animated.View
      style={[
        {
          backgroundColor: COLORS.theme.secondary,
          padding: verticalScale(20),
          width: _cardWidth,
          overflow: 'hidden',
          borderRadius: 24,
          minHeight: verticalScale(100),
          height: verticalScale(180),
          alignItems: 'flex-start',
          justifyContent: 'center'

        },
        stylez,
      ]}>

      <View
        style={{
          flexDirection: 'row',
          gap: scale(20),
          alignItems: 'flex-start',
        }}>

        <View>
          <Avatar
            borderColor={
              !item.online
                ? themeColors.status.error.base
                : themeColors.status.success.base
            }
            containerStyle={{
              height: moderateScale(80),
              width: moderateScale(80),
            }}
            image={{ uri: item?.user?.imgUri }}
            fallbackText={item?.user?.name?.charAt(0)}
          />
        </View>

        {/* TEXT CONTAINER */}
        <View
          style={{
            flex: 1,
            paddingRight: scale(10),
          }}>

          <Text
            numberOfLines={1}
            style={[
              textStyle.fs_mont_16_700,
              {
                color: COLORS.theme.primary,
                marginBottom: verticalScale(8),
              },
            ]}>
            {item?.user?.name}
          </Text>

          <Text
            numberOfLines={3}
            style={[
              textStyle.fs_mont_14_400,
              {
                color: COLORS.theme.primary,
                marginBottom: verticalScale(12),
                lineHeight: verticalScale(20),
                marginRight: 55
              },
            ]}>
            {item?.about}
          </Text>

          <Text
            numberOfLines={1}
            style={[
              textStyle.fs_mont_14_700,
              {
                color: COLORS.theme.primary,
              },
            ]}>
            {item?.expertise}
          </Text>
        </View>
      </View>

    </Animated.View>
  );
}

const SlidingCard = ({
  data,
}: {
  data: {
    id: string;
    imgUri: string;
    name: string;
    expertise: string;
    about: string;
    online: boolean;
  }[];
}) => {
  const scrollX = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler(e => {
    scrollX.value = e.contentOffset.x / (_cardWidth + _spacing);
  });
  const navigation = useNavigation<any>();
  return (
    <View
      style={{
        justifyContent: 'center',
        alignItems: 'center',
      }}>
      <Animated.FlatList
        showsHorizontalScrollIndicator={false}
        data={data}
        keyExtractor={item => String(item.id)}
        horizontal
        snapToInterval={_cardWidth + _spacing}
        decelerationRate={'fast'}
        contentContainerStyle={{
          gap: _spacing,
          paddingHorizontal: (width - _cardWidth) / 2,
        }}
        renderItem={({ item, index }) => (
          <Pressable
            onPress={() =>
              navigation.navigate("Astrologers", { screen: "AstrologerDetails", params: { id: item.id } })
            }>
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
