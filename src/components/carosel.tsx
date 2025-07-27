import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  Dimensions,
  Pressable,
  Text,
  FlatList,
  ScrollView,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  SharedValue,
  useAnimatedStyle,
  interpolate,
  withTiming,
} from 'react-native-reanimated';
import {useNavigation} from '@react-navigation/native';
import {colors} from '../constants/colors';

const _spacing = 12;

type CarouselProps<T> = {
  data: any[];
  cardWidthScale?: number;
  pagination?: boolean;
  showTabs?: boolean;
  CardComponent: React.FC<{
    item: T;
    index: number;
    scrollX: SharedValue<number>;
    cardWidth: number;
    currentTab?: number;
  }>;
  onChange?: (index: number) => void;
};

function Carousel<T>({
  data,
  cardWidthScale = 1,
  pagination = false,
  showTabs = false,
  CardComponent,
  onChange,
}: CarouselProps<T>) {
  const [screenWidth, setScreenWidth] = useState(
    Dimensions.get('window').width,
  );

  const [tabLayouts, setTabLayouts] = useState<{width: number; x: number}[]>(
    [],
  );
  const navigation = useNavigation<any>();
  const scrollX = useSharedValue(0);
  const [currentTab, setCurrentTab] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const cardWidth = screenWidth * cardWidthScale;
  const scrollViewRef = useRef<ScrollView>(null);
  // const tabWidth = screenWidth / data.length;

  const onScroll = useAnimatedScrollHandler({
    onScroll: e => {
      scrollX.value = e.contentOffset.x / (cardWidth + _spacing);
    },
  });

  const onTabPress = (index: number) => {
    flatListRef.current?.scrollToIndex({
      index,
      animated: true,
    });
    setCurrentTab(index);
    onChange && onChange(index);
  };
  const underlineStyle = useAnimatedStyle(() => {
    if (tabLayouts.length === 0) return {};

    const inputRange = data.map((_, i) => i);
    const translateX = interpolate(
      scrollX.value,
      inputRange,
      tabLayouts.map(t => t?.x ?? 0),
    );
    const width = interpolate(
      scrollX.value,
      inputRange,
      tabLayouts.map(t => t?.width ?? 0),
    );

    return {
      transform: [{translateX}],
      width,
    };
  });

  useEffect(() => {
    const onChange = ({screen}: {screen: {width: number}}) => {
      setScreenWidth(screen.width);
    };

    const subscription = Dimensions.addEventListener('change', onChange);

    return () => subscription.remove();
  }, []);

  return (
    <View style={{flex: 1}}>
      {showTabs && (
        <View>
          <ScrollView
            ref={scrollViewRef}
            nestedScrollEnabled
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{paddingHorizontal: 12}}>
            <View style={{flexDirection: 'row', position: 'relative'}}>
              {data.map((_, index) => (
                <Pressable
                  key={index}
                  onPress={() => onTabPress(index)}
                  onLayout={event => {
                    const {width, x} = event.nativeEvent.layout;
                    setTabLayouts(prev => {
                      const copy = [...prev];
                      copy[index] = {width, x};
                      return copy;
                    });
                  }}
                  style={{paddingVertical: 12, paddingHorizontal: 16}}>
                  <Text
                    style={{
                      fontWeight: currentTab === index ? 'bold' : 'normal',
                    }}>
                    {data[index]?.screen}
                  </Text>
                </Pressable>
              ))}
              <Animated.View
                style={[
                  {
                    position: 'absolute',
                    bottom: 0,
                    height: 3,
                    backgroundColor: colors.primary_surface_2,
                  },
                  underlineStyle,
                ]}
              />
            </View>
          </ScrollView>
        </View>
      )}

      <Animated.FlatList
        nestedScrollEnabled
        ref={flatListRef}
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
            currentTab={currentTab}
          />
        )}
        onScroll={onScroll}
        onMomentumScrollEnd={e => {
          const offsetX = e.nativeEvent.contentOffset.x;
          const index = Math.round(offsetX / (cardWidth + _spacing));
          setCurrentTab(index);
          onChange && onChange(index);

          // Auto-scroll tab into view
          const layout = tabLayouts[index];
          if (layout && scrollViewRef.current) {
            scrollViewRef.current.scrollTo({
              x: layout.x - 24, // scroll slightly before tab start
              animated: true,
            });
          }
        }}
        scrollEventThrottle={16}
      />

      {/* {pagination && (
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
      )} */}
    </View>
  );
}

export default Carousel;
