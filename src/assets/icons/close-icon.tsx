import * as React from 'react';
import Svg, {Path, G, Defs, ClipPath, Rect} from 'react-native-svg';

const CloseIcon = (props: {size?: number; color?: string}) => {
  const {size = 24, color = '#292929'} = props;

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <G clipPath="url(#clip0)">
        <Path
          d="M7 7.00006L17 17.0001M7 17.0001L17 7.00006"
          stroke={color}
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
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

export default CloseIcon;
