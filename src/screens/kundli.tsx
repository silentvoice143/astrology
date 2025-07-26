import React, {useState, useRef, useEffect} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
  FlatList,
} from 'react-native';

import ScreenLayout from '../components/screen-layout';
import BasicDetails from '../components/kundli/basic-detail';
import BirthChart from '../components/kundli/charts/brith-chart';
import NavamshaChart from '../components/kundli/charts/navamsha-chart';
import AkshvedanshaChart from '../components/kundli/charts/askhvedansha-chart';
import VimshottariDasha from '../components/kundli/vimshottari-dasha';
import {themeColors} from '../constants/colors';
import {scale} from '../utils/sizer';

const {width: screenWidth} = Dimensions.get('window');

const Kundli = () => {
  const [activeTab, setActiveTab] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const tabScrollRef = useRef<ScrollView>(null);
  const tabPositions = useRef<{x: number; width: number}[]>([]).current;

  const tabs = [
    {id: 1, label: 'Birth Chart', component: <BirthChart active={activeTab} />},
    {
      id: 2,
      label: 'Navamsha Chart',
      component: <NavamshaChart active={activeTab} />,
    },
    {
      id: 3,
      label: 'Akshvedansha Chart',
      component: <AkshvedanshaChart active={activeTab} />,
    },
    {
      id: 4,
      label: 'Basic Detail',
      component: <BasicDetails active={activeTab} />,
    },
    {
      id: 5,
      label: 'Vimshottari Dasha',
      component: <VimshottariDasha active={activeTab} />,
    },
  ];

  const scrollToActiveTab = (index: number) => {
    const tab = tabPositions[index];
    if (tabScrollRef.current && tab) {
      const centerOffset = tab.x + tab.width / 2 - screenWidth / 2;
      tabScrollRef.current.scrollTo({
        x: Math.max(0, centerOffset),
        animated: true,
      });
    }
  };

  const onTabLayout = (event: any, index: number) => {
    const {x, width} = event.nativeEvent.layout;
    tabPositions[index] = {x, width};
  };

  const onTabPress = (index: number) => {
    setActiveTab(index);
    flatListRef.current?.scrollToIndex({index, animated: true});
    scrollToActiveTab(index);
  };

  const onScrollEnd = (e: any) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / screenWidth);
    setActiveTab(index);
    scrollToActiveTab(index);
  };

  useEffect(() => {
    scrollToActiveTab(activeTab);
  }, []);

  return (
    <ScreenLayout>
      <View style={styles.container}>
        <View>
          <ScrollView
            ref={tabScrollRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabScrollContent}
            style={styles.tabContainer}>
            {tabs.map((tab, index) => (
              <TouchableOpacity
                key={tab.id}
                onPress={() => onTabPress(index)}
                onLayout={e => onTabLayout(e, index)}
                style={[styles.tab, activeTab === index && styles.activeTab]}>
                <Text
                  style={[
                    styles.tabText,
                    activeTab === index && styles.activeTabText,
                  ]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <FlatList
          ref={flatListRef}
          data={tabs}
          horizontal
          pagingEnabled
          keyExtractor={item => item.id.toString()}
          showsHorizontalScrollIndicator={false}
          renderItem={({item}) => (
            <View style={{width: screenWidth}}>{item.component}</View>
          )}
          onMomentumScrollEnd={onScrollEnd}
        />
      </View>
    </ScreenLayout>
  );
};

export default Kundli;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: themeColors.surface.background,
  },
  tabContainer: {
    paddingVertical: 8,
    backgroundColor: themeColors.surface.background,
  },
  tabScrollContent: {
    paddingHorizontal: 16,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: scale(12),
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: themeColors.border.secondary,
  },
  tabText: {
    color: themeColors.text.primary,
    fontSize: 16,
    fontWeight: '500',
  },
  activeTabText: {
    color: themeColors.text.tertiary,
    fontWeight: '600',
  },
});
