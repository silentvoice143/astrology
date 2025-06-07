import React from 'react';
import Svg, {Path} from 'react-native-svg';
import {ViewStyle} from 'react-native';

interface SearchIconProps {
  width?: number;
  height?: number;
  color?: string;
  style?: ViewStyle;
}

const SearchIcon: React.FC<SearchIconProps> = ({
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
        d="M15.7955 15.8111L21 21M18 10.5C18 14.6421 14.6421 18 10.5 18C6.35786 18 3 14.6421 3 10.5C3 6.35786 6.35786 3 10.5 3C14.6421 3 18 6.35786 18 10.5Z"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export default SearchIcon;
