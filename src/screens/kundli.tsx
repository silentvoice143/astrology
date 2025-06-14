import {View, Text} from 'react-native';
import React, {useState} from 'react';
import ScreenLayout from '../components/screen-layout';
import TabBar from '../components/horizontal-tab';
import {colors} from '../constants/colors';
import BasicDetails from '../components/kundli/basic-detail';
import ChartPage from '../components/kundli/chart';

export const kundliTabs = [
  {key: 'basic', label: 'Basic Details'},
  {key: 'lagnaChart', label: 'Lagna Chart'},
  {key: 'navamsaChart', label: 'Navamsa Chart'},
  {key: 'planetaryInfo', label: 'Planetary Info'},
  {key: 'dasha', label: 'Dasha'},
  {key: 'bhavPhal', label: 'Bhav Phal'},
  {key: 'ashtakvarga', label: 'Ashtakvarga'},
  {key: 'yogas', label: 'Yogas'},
  {key: 'mangalDosha', label: 'Mangal Dosha'},
  {key: 'kpChart', label: 'KP Chart'},
  {key: 'transit', label: 'Transit (Gochar)'},
  {key: 'numerology', label: 'Numerology'},
  {key: 'remedies', label: 'Remedies'},
];

const Kundli = () => {
  const [selectedTab, setSelectedTab] = useState('basic');
  return (
    <ScreenLayout>
      <View style={{backgroundColor: colors.secondary_surface}}>
        <TabBar
          containerStyle={{}}
          tabs={kundliTabs}
          selectedKey={selectedTab}
          onTabPress={key => setSelectedTab(key)}
        />
      </View>
      <View style={{backgroundColor: colors.primary_surface}}>
        {selectedTab === 'basic' && <BasicDetails />}
        {selectedTab === 'lagnaChart' && <ChartPage />}
      </View>
    </ScreenLayout>
  );
};

export default Kundli;
