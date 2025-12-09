import React from 'react';
import Svg, {G, Path, ClipPath, Defs} from 'react-native-svg';

interface ChatIconProps {
  size?: number;
  color?: string;
}

const ChatIcon: React.FC<ChatIconProps> = ({size = 16, color = '#000'}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <Defs>
        <ClipPath id="clipChatIcon">
          <Path fill="#fff" d="M0 0H40V40H0z" />
        </ClipPath>
      </Defs>

      <G clipPath="url(#clipChatIcon)">
        <Path
          d="M25.555 28.889A1.111 1.111 0 0124.445 30H8.888c-.245 0-.478.222-.678.367l-3.767 2.966V15.556a1.111 1.111 0 011.112-1.111h4.288v-2.223H5.556a3.333 3.333 0 00-3.334 3.334v20a1.111 1.111 0 00.622.989 1.112 1.112 0 001.111-.112l5.723-4.21H24.61a3.078 3.078 0 003.167-3.19v-1.255h-2.223v1.11z"
          fill={color}
        />
        <Path
          d="M34.444 4.444H15.555a3.333 3.333 0 00-3.333 3.334V21.11a3.333 3.333 0 003.334 3.334H30.61l5.311 4.122a1.112 1.112 0 001.111.122 1.112 1.112 0 00.634-1V7.778a3.333 3.333 0 00-3.223-3.334zm1.111 21.045l-3.888-3.033a1.11 1.11 0 00-.678-.234H15.555a1.111 1.111 0 01-1.11-1.11V7.777a1.111 1.111 0 011.11-1.111h18.89a1.222 1.222 0 011.11 1.177V25.49z"
          fill={color}
        />
      </G>
    </Svg>
  );
};

export default ChatIcon;
