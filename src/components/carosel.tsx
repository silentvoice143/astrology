import {View, Dimensions} from 'react-native';
import React from 'react';
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  SharedValue,
  useAnimatedStyle,
  interpolate,
} from 'react-native-reanimated';

const {width: screenWidth} = Dimensions.get('screen');
const _spacing = 12;

type CarouselProps<T> = {
  data: T[];
  cardWidthScale?: number;
  pagination?: boolean;
  CardComponent: React.FC<{
    item: T;
    index: number;
    scrollX: SharedValue<number>;
    cardWidth: number;
  }>;
};

function Carousel<T>({
  data,
  cardWidthScale = 1,
  pagination = false,
  CardComponent,
}: CarouselProps<T>) {
  const scrollX = useSharedValue(0);
  const cardWidth = screenWidth * cardWidthScale;

  const onScroll = useAnimatedScrollHandler({
    onScroll: e => {
      scrollX.value = e.contentOffset.x / (cardWidth + _spacing);
    },
  });

  return (
    <View style={{justifyContent: 'center', alignItems: 'center'}}>
      <Animated.FlatList
        data={data}
        keyExtractor={(_, index) => index.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={cardWidth + _spacing}
        decelerationRate="fast"
        contentContainerStyle={{
          gap: _spacing,
        }}
        renderItem={({item, index}) => (
          <CardComponent
            item={item}
            index={index}
            scrollX={scrollX}
            cardWidth={cardWidth}
          />
        )}
        onScroll={onScroll}
        scrollEventThrottle={16}
      />

      {pagination && (
        <View
          style={{
            flexDirection: 'row',
            marginTop: 12,
            gap: 8,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          {data.map((_, index) => {
            const animatedDotStyle = useAnimatedStyle(() => {
              const scale = interpolate(
                scrollX.value,
                [index - 1, index, index + 1],
                [0.8, 1.2, 0.8],
              );

              const opacity = interpolate(
                scrollX.value,
                [index - 1, index, index + 1],
                [0.5, 1, 0.5],
              );

              return {
                transform: [{scale}],
                opacity,
              };
            });

            return (
              <Animated.View
                key={index}
                style={[
                  {
                    width: 10,
                    height: 10,
                    borderRadius: 5,
                    backgroundColor: '#333',
                  },
                  animatedDotStyle,
                ]}
              />
            );
          })}
        </View>
      )}
    </View>
  );
}

export default Carousel;
