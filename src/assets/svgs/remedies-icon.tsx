import React from 'react';
import Svg, {G, Path, Defs, ClipPath, Rect} from 'react-native-svg';

type Props = {
  size?: number;
  color?: string;
};

const RemediesIcon: React.FC<Props> = ({size = 24, color = '#000'}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <G clipPath="url(#clip0)">
        <Path
          d="M7.06055 19.0606L11.9999 24L16.9392 19.0606L11.9999 14.1213L7.06055 19.0606Z"
          fill={color}
        />
        <Path
          d="M4.93934 16.9394L9.87869 12L4.93934 7.06067L0 12L4.93934 16.9394Z"
          fill={color}
        />
        <Path
          d="M7.06055 4.93934L11.9999 0L16.9392 4.93934L11.9999 9.87869L7.06055 4.93934Z"
          fill={color}
        />
        <Path
          d="M19.0604 7.06067L14.1211 12L19.0604 16.9394L23.9998 12L19.0604 7.06067Z"
          fill={color}
        />
      </G>
      <Defs>
        <ClipPath id="clip0">
          <Rect width="24" height="24" fill="white" />
        </ClipPath>
      </Defs>
    </Svg>
  );
};

export default RemediesIcon;
