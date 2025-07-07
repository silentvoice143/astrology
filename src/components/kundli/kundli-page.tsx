import React from 'react';
import {Text, View} from 'react-native';
import {SharedValue} from 'react-native-reanimated';

type CardProps = {
  item: any;
  index: number;
  scrollX: SharedValue<number>;
  cardWidth: number;
  currentTab?: number;
};

const KundliPage: React.FC<CardProps> = ({
  item,
  index,
  scrollX,
  cardWidth,
  currentTab,
}) => {
  return (
    <View
      key={index}
      style={{
        width: cardWidth,
        flex: 1,

        zIndex: 999,
      }}>
      {item?.data}
    </View>
  );
};

export default KundliPage;
