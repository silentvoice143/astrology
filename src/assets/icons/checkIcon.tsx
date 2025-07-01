import React from 'react';
import Svg, {Path} from 'react-native-svg';

type CheckIconProps = {
  size?: number;
  color?: string;
};

const CheckIcon: React.FC<CheckIconProps> = ({size = 24, color = '#000'}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M6 12L10.2426 16.2426L18.727 7.75732"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export default CheckIcon;
