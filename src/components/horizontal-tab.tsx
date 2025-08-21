import React from 'react';
import {
  ScrollView,
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import {scaleFont} from '../utils/sizer';
import {colors} from '../constants/colors';
import {textStyle} from '../constants/text-style';

interface TabItem {
  key: string;
  label: string;
  icon?: React.ReactNode;
}

interface TabBarProps {
  tabs: TabItem[];
  selectedKey: string;
  onTabPress: (key: string) => void;
  containerStyle?: ViewStyle;
  tabStyle?: ViewStyle;
  labelStyle?: TextStyle;
  activeColor?: string;
  inactiveColor?: string;
}

const TabBar: React.FC<TabBarProps> = ({
  tabs,
  selectedKey,
  onTabPress,
  containerStyle,
  tabStyle,
  labelStyle,
  activeColor = colors.tertiary_text,
  inactiveColor = colors.secondaryText,
}) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[styles.container, containerStyle]}>
      {tabs.map(tab => {
        const isActive = selectedKey === tab.key;

        return (
          <TouchableOpacity
            key={tab.key}
            onPress={() => onTabPress(tab.key)}
            style={[
              styles.tab,
              tabStyle,
              isActive && {borderBottomColor: activeColor},
            ]}>
            {tab.icon && <View style={[styles.icon]}>{tab.icon}</View>}
            <Text
              style={[
                styles.label,
                labelStyle,
                {color: isActive ? activeColor : inactiveColor},
              ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

export default TabBar;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
  },
  tab: {
    flexDirection: 'column',
    alignItems: 'center',
    marginHorizontal: 10,
    paddingVertical: 8,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  icon: {
    marginBottom: 4,
  },
  label: {
    ...textStyle.fs_abyss_14_400,
  },
});
