import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
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
}

const TabSwitcher: React.FC<TabSwitcherProps> = ({
  tabs,
  onTabChange,
  initialTab,
  containerStyle,
  tabTextStyle,
}) => {
  const [activeTab, setActiveTab] = useState(initialTab || tabs[0].key);

  const handleTabPress = (key: string) => {
    setActiveTab(key);
    onTabChange?.(key);
  };

  return (
    <View style={[styles.tabContainer, containerStyle]}>
      {tabs.map(tab => (
        <TouchableOpacity
          key={tab.key}
          style={[styles.tab, activeTab === tab.key && styles.activeTab]}
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
      ))}
    </View>
  );
};

export default TabSwitcher;

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: 'row',
    gap: scale(8),
    marginTop: verticalScale(20),
    marginHorizontal: scale(16),
    backgroundColor: themeColors.surface.lighterGray,
    borderRadius: scale(30),
    padding: scale(4),
    elevation: 4, // Android shadow
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2}, // iOS shadow
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: verticalScale(12),
    alignItems: 'center',
    borderRadius: scale(20),
    backgroundColor: '#fff',
  },
  activeTab: {
    backgroundColor: themeColors.surface.primarySurface, // You can define this as '#ff9800' or something attractive
    shadowColor: colors.secondarybtn,
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: {
    color: '#555',
    fontSize: scale(14),
    fontWeight: '500',
  },
  activeTabText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: scale(15),
  },
});
