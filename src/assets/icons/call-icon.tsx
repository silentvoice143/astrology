import React from 'react';
import Svg, {Path, Defs, LinearGradient, Stop} from 'react-native-svg';

interface CallIconProps {
  width?: number;
  height?: number;
  colors?: string[]; // single color = solid, multiple = gradient
}

const CallIcon: React.FC<CallIconProps> = ({
  width = 40,
  height = 40,
  colors = ['#FAA347', '#EC504A', '#AA1358'],
}) => {
  const useSolidColor = colors.length === 1;
  const gradientId = 'gradientFill';

  return (
    <Svg width={width} height={height} viewBox="0 0 40 40" fill="none">
      <Defs>
        {!useSolidColor && (
          <LinearGradient
            id={gradientId}
            x1="0"
            y1="0"
            x2="0"
            y2="40"
            gradientUnits="userSpaceOnUse">
            {colors.map((color, index) => (
              <Stop
                key={index}
                offset={index / (colors.length - 1)}
                stopColor={color}
              />
            ))}
          </LinearGradient>
        )}
      </Defs>

      <Path
        d="M36.965 18.646c.797-4.681-1.165-9.447-4.276-12.733-3.102-3.277-7.622-5.352-12.12-4.13l.735 2.682c3.18-.864 6.695.547 9.354 3.355 2.65 2.8 4.175 6.722 3.555 10.361l2.752.465z"
        fill={useSolidColor ? colors[0] : `url(#${gradientId})`}
      />
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M0 10.482c0-4.448 3.62-8.053 8.085-8.053a8.11 8.11 0 012.505.394c1.01.328 1.604 1.202 1.757 2.073l1.374 7.848.238 1.672c.123.86-.157 1.853-.986 2.48a8.07 8.07 0 01-2.936 1.402 19.705 19.705 0 004.172 6.12 19.79 19.79 0 006.148 4.157 8.009 8.009 0 011.406-2.924c.63-.826 1.627-1.105 2.49-.982l1.677.238 7.882 1.368c.875.152 1.753.743 2.082 1.75a8.02 8.02 0 01.395 2.493c0 4.448-3.62 8.053-8.085 8.053-.358 0-.712-.023-1.06-.068a28.25 28.25 0 01-9.717-2.115 28.161 28.161 0 01-9.133-6.079A28.036 28.036 0 01.666 16.323a27.937 27.937 0 01-.598-4.795A8.084 8.084 0 010 10.482zM25.473 27.65l-1.559-.221a5.233 5.233 0 00-.866 1.89 2.81 2.81 0 01-1.203 1.716c-.616.396-1.453.566-2.284.223a22.582 22.582 0 01-7.325-4.875 22.484 22.484 0 01-4.895-7.296c-.344-.827-.173-1.66.224-2.272a2.815 2.815 0 011.721-1.196 5.272 5.272 0 001.902-.865l-.23-1.607L9.72 6.084l-.114-.654c-.48-.144-.991-.22-1.522-.22a5.292 5.292 0 00-5.12 3.93 5.262 5.262 0 00-.122 2.078l.01.072.002.072a25.166 25.166 0 001.915 8.786 25.255 25.255 0 005.498 8.195 25.37 25.37 0 0012.65 6.845 25.45 25.45 0 004.395.539l.073.002.072.01c.243.035.492.052.746.052 2.924 0 5.294-2.36 5.294-5.273 0-.528-.078-1.036-.221-1.514l-7.804-1.354z"
        fill={useSolidColor ? colors[0] : `url(#${gradientId})`}
      />
      <Path
        d="M28.678 10.692c1.795 1.892 2.734 4.687 1.978 7.4l-2.69-.744c.457-1.64-.092-3.455-1.317-4.746-1.205-1.27-2.966-1.928-4.862-1.406l-.744-2.68c3.025-.833 5.82.264 7.635 2.176z"
        fill={useSolidColor ? colors[0] : `url(#${gradientId})`}
      />
    </Svg>
  );
};

export default CallIcon;
