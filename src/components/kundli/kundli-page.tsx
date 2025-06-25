import React from 'react';
import {Text, View} from 'react-native';
import {SharedValue} from 'react-native-reanimated';
import BasicDetails from './basic-detail';
import ChartPage from './chart';
import NakshatraAndDosha from './nakshatra';
import {colors} from '../../constants/colors';

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
  console.log(currentTab, '---screen');
  return (
    <View
      key={index}
      style={{
        width: cardWidth,
        flex: 1,

        zIndex: 999,
      }}>
      <View style={{flex: 1, zIndex: 999}}>{item?.data}</View>
    </View>
  );
};

export default KundliPage;
