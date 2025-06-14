import React from 'react';
import Svg, {Path, Defs, LinearGradient, Stop} from 'react-native-svg';

type PlayVideoIconProps = {
  size?: number;
  colors?: string[]; // gradient or single color
};

const VideoCallIcon: React.FC<PlayVideoIconProps> = ({
  size = 24,
  colors = ['#FAA347', '#EC504A', '#AA1358'],
}) => {
  const isGradient = colors.length > 1;

  return (
    <Svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <Path
        d="M11.7122 9.64937L14.2969 11.4687C14.373 11.5026 14.4564 11.5169 14.5394 11.5103C14.6225 11.5037 14.7026 11.4765 14.7724 11.4311C14.8423 11.3857 14.8997 11.3236 14.9394 11.2504C14.9792 11.1772 15 11.0952 15 11.0119V4.98812C15 4.90481 14.9792 4.82282 14.9394 4.7496C14.8997 4.67638 14.8423 4.61426 14.7724 4.56886C14.7026 4.52347 14.6225 4.49626 14.5394 4.48969C14.4564 4.48312 14.373 4.4974 14.2969 4.53125L11.7122 6.35062C11.6466 6.39676 11.5932 6.45798 11.5562 6.52911C11.5193 6.60025 11.5 6.67922 11.5 6.75937V9.24062C11.5 9.32077 11.5193 9.39975 11.5562 9.47088C11.5932 9.54202 11.6466 9.60324 11.7122 9.64937Z"
        stroke={isGradient ? 'url(#grad1)' : colors[0]}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M8.375 12H2.625C2.1944 11.9988 1.7818 11.8272 1.47732 11.5227C1.17284 11.2182 1.00124 10.8056 1 10.375V5.625C1.00124 5.1944 1.17284 4.7818 1.47732 4.47732C1.7818 4.17284 2.1944 4.00124 2.625 4H8.39C8.81659 4.00132 9.22534 4.17137 9.52699 4.47301C9.82863 4.77466 9.99868 5.18341 10 5.61V10.375C9.99876 10.8056 9.82716 11.2182 9.52268 11.5227C9.2182 11.8272 8.8056 11.9988 8.375 12Z"
        stroke={isGradient ? 'url(#grad2)' : colors[0]}
        strokeMiterlimit="10"
      />
      {isGradient && (
        <Defs>
          <LinearGradient
            id="grad1"
            x1="13.25"
            y1="4.48813"
            x2="13.25"
            y2="11.5119"
            gradientUnits="userSpaceOnUse">
            {colors.map((color, index) => (
              <Stop
                key={index}
                offset={index / (colors.length - 1)}
                stopColor={color}
              />
            ))}
          </LinearGradient>
          <LinearGradient
            id="grad2"
            x1="5.5"
            y1="4"
            x2="5.5"
            y2="12"
            gradientUnits="userSpaceOnUse">
            {colors.map((color, index) => (
              <Stop
                key={index}
                offset={index / (colors.length - 1)}
                stopColor={color}
              />
            ))}
          </LinearGradient>
        </Defs>
      )}
    </Svg>
  );
};

export default VideoCallIcon;
