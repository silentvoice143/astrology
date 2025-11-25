import React, {useRef, useState} from 'react';
import {View, ScrollView} from 'react-native';
import AppHeader from './app-header';
import {verticalScale} from '../../utils/sizer';
import Sidebar, {SidebarRef} from './sidebar';

interface PageWithHeaderProps {
  children: React.ReactNode;
  rounded?: boolean;
  scrollHeader?: boolean; // NEW PROP
  themeMode?: 'light' | 'dark';
}

const PageWithHeader = ({
  children,
  rounded,
  scrollHeader = false, // default: header ALWAYS primary
  themeMode,
}: PageWithHeaderProps) => {
  const [scrolled, setScrolled] = React.useState(true);

  const sidebarRef = useRef<SidebarRef>(null);
  // true = primary (default behavior)

  return (
    <View style={{flex: 1}}>
      <AppHeader
        scrolled={scrolled}
        rounded={rounded}
        onMenuPress={() => sidebarRef.current?.open()}
        themeMode={themeMode}
      />

      <ScrollView
        scrollEventThrottle={16}
        onScroll={e => {
          const y = e.nativeEvent.contentOffset.y;

          if (scrollHeader) {
            // Only change color if scrollHeader=true
            setScrolled(y > 10);
          } else {
            // Keep primary always
            setScrolled(true);
          }
        }}>
        <View
          style={{
            paddingTop: verticalScale(80),
            minHeight: '100%',
          }}>
          {children}
        </View>
      </ScrollView>
      <Sidebar ref={sidebarRef} />
    </View>
  );
};

export default PageWithHeader;
