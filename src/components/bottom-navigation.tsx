import React from 'react';
import {View, TouchableOpacity, Text, StyleSheet} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {colors} from '../constants/colors';
import HomeIcon from '../assets/icons/home-icon';
import AstrologerIcon from '../assets/icons/astrologer-icon';
import HistoryIcon from '../assets/icons/history-icon';

const navItems = [
  {label: 'Home', route: 'Home', icon: HomeIcon},
  {label: 'Astrologers', route: 'Astrologers', icon: AstrologerIcon},
  {label: 'Consult', route: 'ChatHistory', icon: HistoryIcon},
];

const BottomNavigationBar = () => {
  const navigation = useNavigation<any>();
  const route = useRoute();

  return (
    <View style={styles.container}>
      {navItems.map(item => {
        const isActive = route.name === item.route;
        const IconComponent = item.icon;

        return (
          <TouchableOpacity
            key={item.route}
            onPress={() => navigation.navigate(item.route)}
            style={styles.tabItem}>
            <IconComponent
              size={22}
              color={isActive ? colors.primaryText : '#999'}
            />
            <Text style={[styles.label, isActive && styles.activeText]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default BottomNavigationBar;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 10,

    justifyContent: 'space-around',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 6,
  },
  tabItem: {
    alignItems: 'center',
    padding: 6,
  },
  label: {
    color: '#777',
    fontSize: 12,
    marginTop: 2,
  },
  activeText: {
    color: colors.primaryText,
    fontWeight: '600',
  },
});
