import React, {ReactNode} from 'react';
import {View} from 'react-native';
import Header from './header';

interface ScreenLayoutProps {
  children: ReactNode;
}

const ScreenLayout: React.FC<ScreenLayoutProps> = ({children}) => {
  return (
    <View style={{flex: 1}}>
      <Header />
      <View style={{flex: 1}}>{children}</View>
    </View>
  );
};

export default ScreenLayout;
