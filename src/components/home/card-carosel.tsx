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
const _cardWidth = 180;

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
    <Animated.View style={{ justifyContent: 'center', alignItems: 'center' }}>
      <Avatar
        size={70}
        borderColor={
          !item.online
            ? themeColors.status.error.base
            : themeColors.status.success.base
        }
        containerStyle={{
          height: moderateScale(70),
          width: moderateScale(70),
        }}
        image={{ uri: item?.user?.imgUri }}
        fallbackText={item?.user?.name?.charAt(0)}
      />

      <Text
        numberOfLines={1}
        ellipsizeMode="tail"
        style={[

          {
            fontWeight: '500',
            textAlign: 'center',
            width: moderateScale(90),
          },
        ]}>
        {item?.user?.name}
      </Text>
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
          // paddingHorizontal: (width - _cardWidth) / 2,
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
