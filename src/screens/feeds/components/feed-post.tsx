import React from 'react';
import {View, Text, Image, TouchableOpacity} from 'react-native';
import {scale, verticalScale, scaleFont} from '../../../utils/sizer';
import {COLORS} from '../../../constants/colors';
// import MoreIcon from '../../assets/icons/more-icon'; // add or replace
// import HeartIcon from '../../assets/icons/heart-icon'; // or use emoji
// import CommentIcon from '../../assets/icons/comment-icon';
// import ShareIcon from '../../assets/icons/share-icon';

interface FeedPostProps {
  astrologerName?: string;
  profileImage?: any;
  postImage?: any;
  caption?: string;
}

const FeedPost = ({
  astrologerName = 'Astro Priya',
  profileImage = require('../../../assets/imgs/profile-demo.jpg'),
  postImage = require('../../../assets/imgs/astrology-feed-demo.jpg'),
  caption = 'Today’s moon transition will bring emotional stability and clarity 💫🌙',
}: FeedPostProps) => {
  return (
    <View
      style={{
        backgroundColor: COLORS.theme.white,
        marginBottom: verticalScale(20),
      }}>
      {/* HEADER */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: scale(16),
          paddingVertical: verticalScale(10),
          justifyContent: 'space-between',
        }}>
        {/* Profile */}
        <View
          style={{flexDirection: 'row', alignItems: 'center', gap: scale(10)}}>
          <Image
            source={profileImage}
            style={{
              height: scale(40),
              width: scale(40),
              borderRadius: scale(20),
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

        {/* <TouchableOpacity>
          <MoreIcon size={18} color={COLORS.theme.black} />
        </TouchableOpacity> */}
      </View>

      {/* IMAGE */}
      <Image
        source={postImage}
        style={{
          width: '100%',
          height: verticalScale(350),
          resizeMode: 'cover',
        }}
      />

      {/* ACTIONS */}
      {/* <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: scale(16),
          paddingVertical: verticalScale(10),
          gap: scale(16),
        }}>
        <TouchableOpacity>
          <HeartIcon size={26} />
        </TouchableOpacity>
        <TouchableOpacity>
          <CommentIcon size={26} />
        </TouchableOpacity>
        <TouchableOpacity>
          <ShareIcon size={26} />
        </TouchableOpacity>
      </View> */}

      {/* CAPTION */}
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
    </View>
  );
};

export default FeedPost;
