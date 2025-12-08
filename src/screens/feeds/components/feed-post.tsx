import React, {useRef, useState} from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  Dimensions,
} from 'react-native';
import ImageViewing from 'react-native-image-viewing';
import {scale, verticalScale, scaleFont} from '../../../utils/sizer';
import {COLORS} from '../../../constants/colors';

const {width} = Dimensions.get('window');

interface FeedPostProps {
  astrologerName?: string;
  profileImage?: any;
  postImages?: any[];
  caption?: string;
}

const FeedPost = ({
  astrologerName = 'Astro Priya',
  profileImage = require('../../../assets/imgs/profile-demo.jpg'),
  postImages = [require('../../../assets/imgs/astrology-feed-demo.jpg')],
  caption = 'Today’s moon transition will bring emotional stability and clarity 💫🌙',
}: FeedPostProps) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isViewerVisible, setIsViewerVisible] = useState(false);

  const flatListRef = useRef<FlatList>(null);

  const onViewableItemsChanged = useRef(({viewableItems}: any) => {
    if (viewableItems.length > 0) {
      setActiveIndex(viewableItems[0].index);
    }
  }).current;

  // ✅ Convert require() to URI for full screen
  const formattedImages = postImages.map(img => Image.resolveAssetSource(img));

  return (
    <View
      style={{
        backgroundColor: COLORS.theme.white,
        marginBottom: verticalScale(20),
      }}>
      {/* ✅ HEADER */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: scale(16),
          paddingVertical: verticalScale(10),
        }}>
        <Image
          source={profileImage}
          style={{
            height: scale(40),
            width: scale(40),
            borderRadius: scale(20),
            marginRight: scale(10),
          }}
        />

        <View>
          <Text style={{fontWeight: '600', fontSize: scaleFont(14)}}>
            {astrologerName}
          </Text>
          <Text
            style={{fontSize: scaleFont(11), color: COLORS.theme.gray.text}}>
            Vedic Astrologer • ★ 4.9
          </Text>
        </View>
      </View>

      {/* ✅ IMAGE CAROUSEL */}
      <FlatList
        ref={flatListRef}
        data={postImages}
        keyExtractor={(_, index) => index.toString()}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{viewAreaCoveragePercentThreshold: 50}}
        renderItem={({item, index}) => (
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => {
              setActiveIndex(index);
              setIsViewerVisible(true);
            }}>
            <Image
              source={item}
              style={{
                width: width,
                height: verticalScale(350),
                resizeMode: 'cover',
              }}
            />
          </TouchableOpacity>
        )}
      />

      {/* ✅ DOT INDICATOR */}
      {postImages.length > 1 && (
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            marginTop: verticalScale(8),
          }}>
          {postImages.map((_, index) => (
            <View
              key={index}
              style={{
                width: scale(6),
                height: scale(6),
                borderRadius: 10,
                backgroundColor:
                  activeIndex === index
                    ? COLORS.theme.primary
                    : COLORS.theme.gray.light,
                marginHorizontal: scale(4),
              }}
            />
          ))}
        </View>
      )}

      {/* ✅ CAPTION */}
      <View
        style={{
          paddingHorizontal: scale(16),
          paddingBottom: verticalScale(10),
        }}>
        <Text style={{fontWeight: '600', fontSize: scaleFont(14)}}>
          {astrologerName}
        </Text>
        <Text style={{fontSize: scaleFont(13), marginTop: 4}}>{caption}</Text>
      </View>

      <ImageViewing
        images={formattedImages}
        imageIndex={activeIndex}
        visible={isViewerVisible}
        onRequestClose={() => setIsViewerVisible(false)}
        /* ✅ TOP USER INFO */
        HeaderComponent={() => (
          <View
            style={{
              position: 'absolute',
              top: 40,
              left: 20,
              flexDirection: 'row',
              alignItems: 'center',
            }}>
            <Image
              source={profileImage}
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                marginRight: 10,
              }}
            />
            <Text style={{color: '#fff', fontSize: 14, fontWeight: '600'}}>
              {astrologerName}
            </Text>
          </View>
        )}
        /* ✅ BOTTOM CAPTION */
        FooterComponent={() => (
          <View
            style={{
              position: 'absolute',
              bottom: 40,
              left: 20,
              right: 20,
            }}>
            <Text
              style={{
                color: '#fff',
                fontSize: 14,
                textAlign: 'center',
              }}>
              {caption}
            </Text>
          </View>
        )}
      />
    </View>
  );
};

export default FeedPost;
