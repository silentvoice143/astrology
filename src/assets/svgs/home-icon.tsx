import React from 'react';
import Svg, {Path} from 'react-native-svg';

type Props = {
  size?: number;
  color?: string;
};

const HomeIcon: React.FC<Props> = ({size = 24, color = '#000'}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M22.0799 9.59041V21.12C22.0784 21.6288 21.8757 22.1163 21.5159 22.476C21.1562 22.8357 20.6687 23.0385 20.1599 23.04H14.3999V15.36H9.59992V23.04H3.83992C3.33117 23.0385 2.84367 22.8357 2.48393 22.476C2.12418 22.1163 1.92142 21.6288 1.91992 21.12V9.59041C1.92019 9.29475 1.98878 9.00315 2.12033 8.73837C2.25189 8.4736 2.44285 8.2428 2.67832 8.06401L11.9999 0.960007L21.3215 8.06401C21.557 8.2428 21.748 8.4736 21.8795 8.73837C22.0111 9.00315 22.0797 9.29475 22.0799 9.59041Z"
        fill={color}
      />
    </Svg>
  );
};

export default HomeIcon;
