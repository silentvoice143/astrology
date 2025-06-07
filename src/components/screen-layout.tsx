import React, {ReactNode} from 'react';
import {View} from 'react-native';
import Header from './header';

interface ScreenLayoutProps {
  children: ReactNode;
  headerBackgroundColor: string;
}

const ScreenLayout: React.FC<ScreenLayoutProps> = ({
  children,
  headerBackgroundColor,
}) => {
  return (
    <View style={{flex: 1}}>
      <Header headerBackgroundColor={headerBackgroundColor} />
      <View style={{flex: 1}}>{children}</View>
    </View>
  );
};

export default ScreenLayout;
