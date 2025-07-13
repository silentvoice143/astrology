import {View, Text} from 'react-native';
import React, {useState} from 'react';
import ScreenLayout from '../components/screen-layout';
import BasicDetails from '../components/kundli/basic-detail';
import ChartPage from '../components/kundli/chart';
import NakshatraAndDosha from '../components/kundli/nakshatra';
import Carousel from '../components/carosel';
import KundliPage from '../components/kundli/kundli-page';
import {textStyle} from '../constants/text-style';
import {colors} from '../constants/colors';
import LagnaChart from '../components/kundli/charts/lagna-chart';
import RasiChart from '../components/kundli/charts/rasi-chart';
export const kundliTabs = [
  {key: 'basic', label: 'Basic Details'},
  {key: 'lagnaChart', label: 'Lagna Chart'},
  {key: 'nakshatra', label: 'Nakshatra'},
  // {key: 'yogas', label: 'Yogas'},
];

const Kundli = () => {
  const [selectedTab, setSelectedTab] = useState<number>(0);

  return (
    <ScreenLayout>
      <Carousel
        data={[
          {
            id: 1,
            screen: 'Lagna Chart',
            data: <LagnaChart active={selectedTab} />,
          },
          {
            id: 2,
            screen: 'Rasi Chart',
            data: <RasiChart active={selectedTab} />,
          },
          {
            id: 3,
            screen: 'Basic details',
            data: <BasicDetails active={selectedTab} />,
          },
          {
            id: 4,
            screen: 'Nakshatra',
            data: <NakshatraAndDosha active={selectedTab} />,
          },
        ]}
        pagination={false}
        cardWidthScale={1}
        CardComponent={KundliPage}
        showTabs={true}
        onChange={(index: number) => setSelectedTab(index)}
      />
    </ScreenLayout>
  );
};

export default Kundli;
