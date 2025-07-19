import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
  ScrollView,
} from 'react-native';
import {scale, verticalScale} from '../utils/sizer';
import {colors, themeColors} from '../constants/colors';

type TabOption = {
  key: string;
  label: string;
};

interface TabSwitcherProps {
  tabs: TabOption[];
  onTabChange?: (key: string) => void;
  initialTab?: string;
  containerStyle?: ViewStyle;
  tabTextStyle?: TextStyle;
  enableHorizontalScroll?: boolean; // ✅ New Prop
}

const TabSwitcher: React.FC<TabSwitcherProps> = ({
  tabs,
  onTabChange,
  initialTab,
  containerStyle,
  tabTextStyle,
  enableHorizontalScroll = false, // ✅ Default false
}) => {
  const [activeTab, setActiveTab] = useState(initialTab || tabs[0].key);

  const handleTabPress = (key: string) => {
    setActiveTab(key);
    onTabChange?.(key);
  };

  const tabList = tabs.map(tab => (
    <TouchableOpacity
      key={tab.key}
      style={[
        styles.tab,
        !enableHorizontalScroll && {flex: 1}, // ✅ Equal width if scrolling is off
        activeTab === tab.key && styles.activeTab,
      ]}
      onPress={() => handleTabPress(tab.key)}
      activeOpacity={0.8}>
      <Text
        style={[
          styles.tabText,
          tabTextStyle,
          activeTab === tab.key && styles.activeTabText,
        ]}>
        {tab.label}
      </Text>
    </TouchableOpacity>
  ));

  return enableHorizontalScroll ? (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[styles.scrollContent, {gap: scale(10)}]}
      style={[styles.tabContainer, containerStyle]}>
      {tabList}
    </ScrollView>
  ) : (
    <View style={[styles.tabContainer, containerStyle]}>{tabList}</View>
  );
};

export default TabSwitcher;

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: 'row',
    marginTop: verticalScale(20),
    marginHorizontal: scale(16),
    backgroundColor: themeColors.surface.lighterGray,
    borderRadius: scale(30),
    padding: scale(4),
    gap: scale(8),
  },
  scrollContent: {
    paddingHorizontal: scale(4),
  },
  tab: {
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(10),
    borderRadius: scale(20),
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: themeColors.surface.primarySurface,
    shadowColor: colors.secondarybtn,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  tabText: {
    color: '#333',
    fontSize: scale(13),
    fontWeight: '500',
  },
  activeTabText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: scale(14),
  },
});
