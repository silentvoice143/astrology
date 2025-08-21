import React from 'react';
import {View, StyleSheet} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
  runOnJS,
} from 'react-native-reanimated';

const Skeleton = ({
  // Basic props
  width = 100,
  height = 20,
  borderRadius = 4,
  backgroundColor = '#D9D9D9',
  highlightColor = '#f3f3f3',

  // Animation props
  duration = 1200,
  direction = 'ltr', // 'ltr' | 'rtl'

  // Layout props
  style,

  // Avatar + Text layout
  variant = 'rectangular', // 'rectangular' | 'avatar-text' | 'circle'

  // Avatar specific props (when variant is 'avatar-text')
  avatarSize = 40,
  textLines = 2,
  textHeight = 16,
  textSpacing = 8,
  avatarToTextSpacing = 12,

  // Animation control
  animate = true,
}: any) => {
  const animatedValue = useSharedValue(0);

  React.useEffect(() => {
    if (animate) {
      animatedValue.value = withRepeat(withTiming(1, {duration}), -1, false);
    }
  }, [animate, duration]);

  const animatedStyle = useAnimatedStyle(() => {
    const translateX = interpolate(
      animatedValue.value,
      [0, 1],
      direction === 'ltr' ? [-width, width] : [width, -width],
    );

    return {
      transform: [{translateX}],
    };
  });

  const renderRectangularSkeleton = () => (
    <View
      style={[
        styles.container,
        {
          width,
          height,
          borderRadius,
          backgroundColor,
        },
        style,
      ]}>
      {animate && (
        <Animated.View
          style={[
            styles.shimmer,
            {
              backgroundColor: highlightColor,
              width: width * 0.5,
              height: '100%',
              borderRadius,
            },
            animatedStyle,
          ]}
        />
      )}
    </View>
  );

  const renderCircleSkeleton = () => (
    <View
      style={[
        styles.container,
        {
          width: width,
          height: width, // Make it a perfect circle
          borderRadius: width / 2,
          backgroundColor,
        },
        style,
      ]}>
      {animate && (
        <Animated.View
          style={[
            styles.shimmer,
            {
              backgroundColor: highlightColor,
              width: width * 0.5,
              height: '100%',
              borderRadius: width / 2,
            },
            animatedStyle,
          ]}
        />
      )}
    </View>
  );

  const renderAvatarTextSkeleton = () => {
    const totalHeight = Math.max(
      avatarSize,
      textLines * textHeight + (textLines - 1) * textSpacing,
    );

    return (
      <View style={[styles.avatarTextContainer, {height: totalHeight}, style]}>
        {/* Avatar */}
        <View
          style={[
            styles.container,
            {
              width: avatarSize,
              height: avatarSize,
              borderRadius: avatarSize / 2,
              backgroundColor,
              marginRight: avatarToTextSpacing,
            },
          ]}>
          {animate && (
            <Animated.View
              style={[
                styles.shimmer,
                {
                  backgroundColor: highlightColor,
                  width: avatarSize * 0.5,
                  height: '100%',
                  borderRadius: avatarSize / 2,
                },
                animatedStyle,
              ]}
            />
          )}
        </View>

        {/* Text Lines */}
        <View style={styles.textContainer}>
          {Array.from({length: textLines}).map((_, index) => {
            const isLastLine = index === textLines - 1;
            const lineWidth = isLastLine ? width * 0.6 : width; // Last line is shorter

            return (
              <View
                key={index}
                style={[
                  styles.container,
                  {
                    width: lineWidth,
                    height: textHeight,
                    borderRadius: borderRadius,
                    backgroundColor,
                    marginBottom: index < textLines - 1 ? textSpacing : 0,
                  },
                ]}>
                {animate && (
                  <Animated.View
                    style={[
                      styles.shimmer,
                      {
                        backgroundColor: highlightColor,
                        width: lineWidth * 0.5,
                        height: '100%',
                        borderRadius: borderRadius,
                      },
                      animatedStyle,
                    ]}
                  />
                )}
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  switch (variant) {
    case 'circle':
      return renderCircleSkeleton();
    case 'avatar-text':
      return renderAvatarTextSkeleton();
    case 'rectangular':
    default:
      return renderRectangularSkeleton();
  }
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    position: 'relative',
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    left: 0,
    opacity: 0.5,
  },
  avatarTextContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
});

export default Skeleton;

// Usage Examples:
/*

// Basic rectangular skeleton
<Skeleton 
  width={200} 
  height={20} 
  borderRadius={8} 
/>

// Circle skeleton (avatar)
<Skeleton 
  variant="circle"
  width={50}
  backgroundColor="#f0f0f0"
  highlightColor="#ffffff"
/>

// Avatar with text lines
<Skeleton 
  variant="avatar-text"
  width={250}
  avatarSize={50}
  textLines={3}
  textHeight={18}
  textSpacing={6}
  avatarToTextSpacing={15}
  borderRadius={6}
/>

// Custom styled skeleton
<Skeleton 
  width={300} 
  height={100} 
  borderRadius={12}
  backgroundColor="#e0e0e0"
  highlightColor="#f5f5f5"
  duration={1500}
  direction="rtl"
  style={{ marginVertical: 10 }}
/>

// Non-animated skeleton
<Skeleton 
  width={150} 
  height={30} 
  animate={false}
  backgroundColor="#d0d0d0"
/>

*/
