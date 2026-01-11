// import React, {useState} from 'react';
// import {View, Text, Image, TouchableOpacity, Dimensions} from 'react-native';

// import {Gesture, GestureDetector} from 'react-native-gesture-handler';
// import Animated, {
//   useSharedValue,
//   useAnimatedStyle,
//   withSpring,
// } from 'react-native-reanimated';

// import {scale, verticalScale, scaleFont} from '../../../utils/sizer';
// import {COLORS} from '../../../constants/colors';

// import LikeIcon from '../../../assets/icons/like-icon';
// import OutlineHeartIcon from '../../../assets/icons/outlinw-likw-ixon';
// import CommentIcon from '../../../assets/icons/comment_icon';

// import CommentsBottomSheet from './comments-bottom-sheet';

// const {width} = Dimensions.get('window');

// interface FeedPostProps {
//   postId: string;
//   astrologerName?: string;
//   astrologerExpertise?: string;
//   profileImage?: any;
//   postImages?: any[];
//   caption?: string;
// }

// const FeedPost = ({
//   postId,
//   astrologerName = 'Astro Priya',
//   astrologerExpertise = '',
//   profileImage = require('../../../assets/imgs/profile-demo.jpg'),
//   postImages = [require('../../../assets/imgs/astrology-feed-demo.jpg')],
//   caption = 'Today’s moon transition will bring emotional clarity ✨',
// }: FeedPostProps) => {
//   /* ---------------- STATE ---------------- */

//   const [liked, setLiked] = useState(false);
//   const [likesCount, setLikesCount] = useState(128);
//   const [commentVisible, setCommentVisible] = useState(false);

//   /* ---------------- HEART ANIMATION ---------------- */

//   const heartScale = useSharedValue(0);

//   const heartStyle = useAnimatedStyle(() => ({
//     transform: [{scale: heartScale.value}],
//     opacity: heartScale.value,
//   }));

//   /* ---------------- DOUBLE TAP ---------------- */

//   const doubleTap = Gesture.Tap()
//     .numberOfTaps(2)
//     .onEnd(() => {
//       if (!liked) {
//         setLiked(true);
//         setLikesCount(prev => prev + 1);
//       }

//       heartScale.value = 1;
//       heartScale.value = withSpring(0, {damping: 8});
//     });

//   /* ---------------- RENDER ---------------- */

//   return (
//     <View
//       style={{
//         backgroundColor: COLORS.theme.white,
//         marginBottom: verticalScale(20),
//       }}>
//       {/* HEADER */}
//       <View
//         style={{
//           flexDirection: 'row',
//           alignItems: 'center',
//           padding: scale(16),
//         }}>
//         <Image
//           source={profileImage}
//           style={{
//             width: scale(40),
//             height: scale(40),
//             borderRadius: scale(20),
//             marginRight: scale(10),
//           }}
//         />
//         <View>
//           <Text style={{fontWeight: '600', fontSize: scaleFont(14)}}>
//             {astrologerName}
//           </Text>
//           <Text
//             style={{
//               fontSize: scaleFont(11),
//               color: COLORS.theme.gray.text,
//             }}>
//             {astrologerExpertise}
//           </Text>
//         </View>
//       </View>

//       {/* IMAGE */}
//       <GestureDetector gesture={doubleTap}>
//         <Animated.View>
//           <Image
//             source={
//               typeof postImages[0] === 'string'
//                 ? {uri: postImages[0]}
//                 : postImages[0]
//             }
//             style={{
//               width,
//               height: verticalScale(350),
//             }}
//           />

//           {/* HEART POP */}
//           <Animated.View
//             style={[
//               {
//                 position: 'absolute',
//                 top: '40%',
//                 left: '40%',
//               },
//               heartStyle,
//             ]}>
//             {/* DO NOT PASS size unless your SVG supports it */}
//             <LikeIcon />
//           </Animated.View>
//         </Animated.View>
//       </GestureDetector>

//       {/* ACTION BAR */}
//       <View
//         style={{
//           flexDirection: 'row',
//           alignItems: 'center',
//           padding: scale(12),
//         }}>
//         <TouchableOpacity
//           onPress={() => {
//             setLiked(prev => !prev);
//             setLikesCount(prev => (liked ? prev - 1 : prev + 1));
//           }}>
//           {liked ? <LikeIcon /> : <OutlineHeartIcon />}
//         </TouchableOpacity>

//         <TouchableOpacity
//           style={{marginLeft: scale(14)}}
//           onPress={() => setCommentVisible(true)}>
//           <CommentIcon />
//         </TouchableOpacity>
//       </View>

//       {/* LIKES */}
//       <Text
//         style={{
//           paddingHorizontal: scale(16),
//           fontWeight: '600',
//           marginBottom: 4,
//         }}>
//         {likesCount} likes
//       </Text>

//       {/* CAPTION */}
//       <View style={{paddingHorizontal: scale(16)}}>
//         <Text style={{fontWeight: '600'}}>{astrologerName}</Text>
//         <Text>{caption}</Text>
//       </View>

//       {/* COMMENTS BOTTOM SHEET */}
//       <CommentsBottomSheet
//         visible={commentVisible}
//         onClose={() => setCommentVisible(false)}
//         postId={postId}
//       />
//     </View>
//   );
// };

// export default FeedPost;

import React, {useState} from 'react';
import {View, Text, Image, TouchableOpacity, Dimensions} from 'react-native';

import {useAppDispatch} from '../../../hooks/redux-hook';
import {likePost} from '../../../store/reducer/posts';

import {scale, verticalScale, scaleFont} from '../../../utils/sizer';
import {COLORS} from '../../../constants/colors';

import LikeIcon from '../../../assets/icons/like-icon';
import OutlineHeartIcon from '../../../assets/icons/outlinw-likw-ixon';
import CommentIcon from '../../../assets/icons/comment_icon';

import CommentsBottomSheet from './comments-bottom-sheet';

const {width} = Dimensions.get('window');

interface FeedPostProps {
  postId: string;
  astrologerName?: string;
  astrologerExpertise?: string;
  profileImage?: any;
  postImages?: any[];
  caption?: string;
  initialLiked?: boolean;
  initialLikesCount?: number;
  initialCommentCount?: number;
}

const FeedPost = ({
  postId,
  astrologerName = 'Astro Priya',
  astrologerExpertise = '',
  profileImage,
  postImages = [require('../../../assets/imgs/astrology-feed-demo.jpg')],
  caption = 'Today’s moon transition will bring emotional clarity ✨',
  initialLiked = false,
  initialLikesCount = 0,
  initialCommentCount = 0,
}: FeedPostProps) => {
  /* ---------------- STATE ---------------- */
  const tempImg = require('../../../assets/imgs/male.jpg');

  const dispatch = useAppDispatch();

  const [liked, setLiked] = useState(initialLiked);
  const [likesCount, setLikesCount] = useState(initialLikesCount);
  const [liking, setLiking] = useState(false);
  const [commentVisible, setCommentVisible] = useState(false);

  /* ---------------- LIKE HANDLER ---------------- */

  const handleLike = async () => {
    if (liking) return;

    // optimistic update
    const prevLiked = liked;
    const prevCount = likesCount;

    setLiking(true);
    setLiked(!prevLiked);
    setLikesCount(prevLiked ? prevCount + 1 : prevCount - 1);

    try {
      const payload = await dispatch(
        likePost({postId, like: liked ? 'like' : 'unlike'}),
      ).unwrap();
      console.log(payload, 'payload=====like');
    } catch (e) {
      // rollback on failure
      setLiked(prevLiked);
      setLikesCount(prevCount);
      console.log('like api error', e);
    } finally {
      setLiking(false);
    }
  };

  /* ---------------- RENDER ---------------- */

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
          padding: scale(16),
        }}>
        <Image
          source={profileImage ? {uri: profileImage} : tempImg}
          style={{
            width: scale(40),
            height: scale(40),
            borderRadius: scale(20),
            marginRight: scale(10),
          }}
        />
        <View>
          <Text style={{fontWeight: '600', fontSize: scaleFont(14)}}>
            {astrologerName}
          </Text>
          <Text
            style={{
              fontSize: scaleFont(11),
              color: COLORS.theme.gray.text,
            }}>
            {astrologerExpertise}
          </Text>
        </View>
      </View>

      {/* IMAGE */}
      <Image
        source={
          typeof postImages[0] === 'string'
            ? {uri: postImages[0]}
            : postImages[0]
        }
        style={{
          width,
          height: verticalScale(350),
        }}
      />

      {/* ACTION BAR */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          padding: scale(12),
        }}>
        <TouchableOpacity onPress={handleLike} disabled={liking}>
          {liked ? <OutlineHeartIcon /> : <LikeIcon />}
        </TouchableOpacity>

        <TouchableOpacity
          style={{marginLeft: scale(14)}}
          onPress={() => setCommentVisible(true)}>
          <CommentIcon />
        </TouchableOpacity>
      </View>

      {/* LIKES */}
      <View style={{flexDirection: 'row'}}>
        <Text
          style={{
            paddingLeft: scale(16),
            fontWeight: '600',
            marginBottom: 4,
          }}>
          {likesCount} likes
        </Text>
        <Text
          style={{
            paddingHorizontal: scale(16),
            fontWeight: '600',
            marginBottom: 4,
          }}>
          {initialCommentCount} Comments
        </Text>
      </View>
      {/* CAPTION */}
      <View style={{paddingHorizontal: scale(16)}}>
        <Text style={{fontWeight: '600'}}>{astrologerName}</Text>
        <Text>{caption}</Text>
      </View>

      {/* COMMENTS */}
      <CommentsBottomSheet
        visible={commentVisible}
        onClose={() => setCommentVisible(false)}
        postId={postId}
      />
    </View>
  );
};

export default FeedPost;
