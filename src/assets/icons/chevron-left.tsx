import React from 'react';
import Svg, {Rect, Path} from 'react-native-svg';

// ---
// Define the interface for the component's props
// ---
interface ArrowLeftIconProps {
  /**
   * The size of the icon (width and height). Can be a number or a string (e.g., '24', '100%').
   * @default 24
   */
  size?: number | string;
  /**
   * The color of the arrow stroke.
   * @default '#000000' (black)
   */
  color?: string;
  /**
   * The width of the arrow stroke. Can be a number or a string.
   * @default 2
   */
  strokeWidth?: number | string;
}

const ChevronLeftIcon: React.FC<ArrowLeftIconProps> = ({
  size = 24,
  color = '#000000',
  strokeWidth = 2,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M14.5 17L9.5 12L14.5 7"
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={strokeWidth}
    />
  </Svg>
);

export default ChevronLeftIcon;
