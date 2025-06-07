import React, {useState} from 'react';
import {
  Image,
  Text,
  View,
  ImageSourcePropType,
  ViewStyle,
  TextStyle,
} from 'react-native';

interface AvatarProps {
  image?: ImageSourcePropType; // require('./img.png') or { uri: '...' }
  fallbackText?: string; // e.g., initials like "SV"
  size?: number; // e.g., 60, 80
  borderColor?: string;
  borderWidth?: number;
  containerStyle?: ViewStyle;
  textStyle?: TextStyle;
}

const Avatar: React.FC<AvatarProps> = ({
  image,
  fallbackText = '',
  size = 80,
  borderColor = '#ccc',
  borderWidth = 2,
  containerStyle,
  textStyle,
}) => {
  const [loadError, setLoadError] = useState(false);

  return (
    <View
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderColor,
          borderWidth,
          overflow: 'hidden',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#e0e0e0',
        },
        containerStyle,
      ]}>
      {!loadError && image ? (
        <Image
          source={image}
          style={{width: size, height: size, borderRadius: size / 2}}
          resizeMode="cover"
          onError={() => setLoadError(true)}
        />
      ) : (
        <Text
          style={[
            {
              fontSize: size / 3,
              color: '#555',
              fontWeight: 'bold',
            },
            textStyle,
          ]}>
          {fallbackText}
        </Text>
      )}
    </View>
  );
};

export default Avatar;
