import React from 'react';
import Svg, {Path} from 'react-native-svg';

const MatchmakingIcon = ({size = 24, color = '#000', strokeWidth = 0}) => {
  // Default size to 24, color to black, and strokeWidth to 0
  return (
    <Svg viewBox="0 0 100 100" width={size} height={size}>
      {/* Changed viewBox height from 125 to 100 */}
      <Path
        d="M50,5C38.9,5,27.6,9.5,19.1,17.4C10,25.7,5,36.9,5,48.7c0,12.2,4.5,23.8,12.7,32.5 C26.1,90.1,37.4,95,49.5,95c9.1,0,17.6-2.6,25.3-7.8c0.9-0.6,1.2-1.9,0.6-2.8c-0.6-0.9-1.9-1.2-2.8-0.6c-7,4.7-14.8,7.1-23,7.1 c-22.3,0-40.4-19-40.4-42.3C9.1,25,30.2,9.1,50,9.1S90.9,25,90.9,48.7c0,17.3-7.5,25-9.5,25c-3.5,0-3.9-7.4-3.9-10.5V28.4 c0-1.1-0.9-2-2-2c-1.1,0-2,0.9-2,2v3.1c-2.8-2.8-6.8-3.6-11.1-2.9c-6.4,1-11.2,6.7-11.2,6.7s-4.8-5.7-11.2-6.7 c-8.4-1.4-15.6,2.9-14.8,16.1c1.1,16.7,26,31,26,31s15.2-8.7,22.3-20.4v7.9c0,12,4.3,14.6,7.9,14.6c5.6,0,13.5-11.1,13.5-29.1 C95,22.6,71.7,5,50,5z"
        fill={color}
        stroke={color} // Apply color to stroke
        strokeWidth={strokeWidth} // Apply strokeWidth
      />
    </Svg>
  );
};

export default MatchmakingIcon;
