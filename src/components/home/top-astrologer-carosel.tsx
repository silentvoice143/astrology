import React from 'react';
import {SharedValue} from 'react-native-reanimated';
import IntroCard from './intro-card';

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
  return (
    <IntroCard
      cardWidth={cardWidth}
      name={item.name}
      rate={item.rate}
      avatar={item.avatar}
      specialty={item.specialty}
    />
  );
};

export default AstrologerCarosel;
