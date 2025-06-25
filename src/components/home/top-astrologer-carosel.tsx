import React from 'react';
import {SharedValue} from 'react-native-reanimated';
import IntroCard from './intro-card';
import {Pressable} from 'react-native';
import {useNavigation} from '@react-navigation/native';

type CardProps = {
  item: any;
  index: number;
  scrollX: SharedValue<number>;
  cardWidth: number;
};

const AstrologerCarosel: React.FC<CardProps> = ({
  item,
  index,
  scrollX,
  cardWidth,
}) => {
  const navigation = useNavigation<any>();
  return (
    <Pressable
      onPress={() => {
        navigation.navigate('DetailsProfile');
      }}>
      <IntroCard
        cardWidth={cardWidth}
        name={item.name}
        rate={item.rate}
        avatar={item.avatar}
        specialty={item.specialty}
      />
    </Pressable>
  );
};

export default AstrologerCarosel;
