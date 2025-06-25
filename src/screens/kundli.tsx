import {View, Text} from 'react-native';
import React, {useState} from 'react';
import ScreenLayout from '../components/screen-layout';
import TabBar from '../components/horizontal-tab';
import {colors} from '../constants/colors';
import BasicDetails from '../components/kundli/basic-detail';
import ChartPage from '../components/kundli/chart';
import Nakshatra from '../components/kundli/nakshatra';
import Yogas from '../components/kundli/yogas';
import NakshatraAndDosha from '../components/kundli/nakshatra';
import Carousel from '../components/carosel';
import KundliPage from '../components/kundli/kundli-page';

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
      {/* <View style={{backgroundColor: colors.secondary_surface}}>
        <TabBar
          containerStyle={{}}
          tabs={kundliTabs}
          selectedKey={selectedTab}
          onTabPress={key => setSelectedTab(key)}
        />
      </View>
      <View style={{flex: 1, backgroundColor: colors.primary_surface}}>
        {selectedTab === 'basic' && <BasicDetails />}
        {selectedTab === 'lagnaChart' && <ChartPage />}
        {selectedTab === 'nakshatra' && <NakshatraAndDosha />}
        
      </View> */}

      <Carousel
        data={[
          {id: 1, screen: 'Chart', data: <ChartPage active={selectedTab} />},
          {
            id: 2,
            screen: 'Basic details',
            data: <BasicDetails active={selectedTab} />,
          },
          {
            id: 3,
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
