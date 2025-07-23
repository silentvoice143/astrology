import React from 'react';
import {View, Text, Image, StyleSheet} from 'react-native';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import {scale} from '../utils/sizer';

interface SkeletonItemProps {
  width?: number;
  height?: number;
  borderRadius?: number;
  avatarSize?: number;
  showImage?: boolean;
  showText?: boolean;
  showAvatar?: boolean;
}

const SkeletonItem: React.FC<SkeletonItemProps> = ({
  width = 120,
  height = 20,
  borderRadius = 4,
  avatarSize = 60,
  showImage = true,
  showText = true,
  showAvatar = true,
}) => {
  return (
    <SkeletonPlaceholder borderRadius={borderRadius}>
      <View
        style={{
          borderRadius: scale(12),
          height: height,
          width: width,
          position: 'relative',
        }}>
        {showAvatar && (
          <View
            style={{
              width: avatarSize,
              height: avatarSize,
              borderRadius: avatarSize / 2,
            }}
          />
        )}
        <View style={{height: '100%', width: '100%'}}>
          {showText && (
            <View style={{marginTop: 6, width: '100%', height: '100%'}} />
          )}
        </View>
      </View>
    </SkeletonPlaceholder>
  );
};

export default SkeletonItem;
