import React from 'react';
import Svg, {Path} from 'react-native-svg';

type PeopleIconProps = {
  size?: number;
  color?: string;
};

const PeopleIcon: React.FC<PeopleIconProps> = ({size = 32, color = '#000'}) => (
  <Svg width={size} height={size} viewBox="0 -0.5 25 25" fill="none">
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M15.682 8.733C15.8221 10.6388 14.4039 12.303 12.5 12.467C10.5961 12.303 9.17795 10.6388 9.31801 8.733C9.17852 6.8276 10.5966 5.16401 12.5 5C14.4035 5.16401 15.8215 6.8276 15.682 8.733V8.733Z"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M8.98601 13.4C5.47501 14.562 8.81401 19 12.5 19C16.186 19 19.525 14.562 16.014 13.4"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export default PeopleIcon;
