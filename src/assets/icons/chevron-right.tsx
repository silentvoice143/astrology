import React from 'react';
import Svg, {Path} from 'react-native-svg';

interface ChevronRightIconProps {
  size?: number | string;
  color?: string;
  strokeWidth?: number | string;
}

const ChevronRightIcon: React.FC<ChevronRightIconProps> = ({
  size = 24,
  color = '#000000',
  strokeWidth = 2,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M9.5 7L14.5 12L9.5 17"
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={strokeWidth}
    />
  </Svg>
);

export default ChevronRightIcon;
