import React from 'react';
import Svg, {Path, Rect} from 'react-native-svg';

interface AboutIconProps {
  size?: number;
  color?: string;
  strokeWidth?: number; // Included for API consistency
}

const AboutIcon: React.FC<AboutIconProps> = ({
  size = 24,
  color = '#000000',
  strokeWidth = 1,
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 128 128" fill="none">
      <Path
        d="M64,1C29.3,1,1,29.3,1,64s28.3,63,63,63s63-28.3,63-63S98.7,1,64,1z M64,119C33.7,119,9,94.3,9,64S33.7,9,64,9   s55,24.7,55,55S94.3,119,64,119z"
        fill={color}
      />
      <Rect x="60" y="54.5" width="8" height="40" fill={color} />
      <Rect x="60" y="35.5" width="8" height="8" fill={color} />
    </Svg>
  );
};

export default AboutIcon;
