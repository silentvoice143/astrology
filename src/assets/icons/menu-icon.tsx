// MenuIcon.tsx
import React from 'react';
import Svg, {Path} from 'react-native-svg';
import {ViewStyle} from 'react-native';

interface MenuIconProps {
  width?: number;
  height?: number;
  color?: string;
  style?: ViewStyle;
}

const MenuIcon: React.FC<MenuIconProps> = ({
  width = 24,
  height = 24,
  color = '#000',
  style,
}) => {
  return (
    <Svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      style={style}>
      <Path
        d="M4 6H20M4 12H14M4 18H9"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export default MenuIcon;
