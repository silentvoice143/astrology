import React, {ReactNode, useRef} from 'react';
import {View} from 'react-native';
import Header from './header';
import Sidebar, {SidebarRef} from './sidebar';

interface ScreenLayoutProps {
  children: ReactNode;
  headerBackgroundColor: string;
}

const ScreenLayout: React.FC<ScreenLayoutProps> = ({
  children,
  headerBackgroundColor,
}) => {
  const sidebarRef = useRef<SidebarRef>(null);
  return (
    <View style={{flex: 1}}>
      {/* Global Sidebar */}
      <Sidebar ref={sidebarRef} />
      <Header
        onMenuClick={() => sidebarRef.current?.open()}
        headerBackgroundColor={headerBackgroundColor}
      />
      <View style={{flex: 1}}>{children}</View>
    </View>
  );
};

export default ScreenLayout;
