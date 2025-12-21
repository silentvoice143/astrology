import React, {useRef} from 'react';
import {View, ScrollView, StatusBar} from 'react-native';
import AppHeader from './app-header';
import {verticalScale} from '../../utils/sizer';
import Sidebar, {SidebarRef} from './sidebar';
import {useAppDispatch, useAppSelector} from '../../hooks/redux-hook';
import {useWebSocket} from '../../hooks/use-socket-new';
import {logout} from '../../store/reducer/auth';
import {useNavigation} from '@react-navigation/native';
import {COLORS} from '../../constants/colors';

interface PageWithHeaderProps {
  children: React.ReactNode;
  rounded?: boolean;
  scrollHeader?: boolean;
  themeMode?: 'light' | 'dark';
  scrollEnabled?: boolean;
  title?: string;
}

const PageWithHeader = ({
  children,
  rounded,
  scrollHeader = false,
  themeMode = 'dark',
  scrollEnabled = true,
  title = '',
}: PageWithHeaderProps) => {
  const [scrolled, setScrolled] = React.useState(true);
  const sidebarRef = useRef<SidebarRef>(null);
  const dispatch = useAppDispatch();
  const {user} = useAppSelector((state: any) => state.auth);
  const {disconnect} = useWebSocket(user?.id);
  const navigation = useNavigation<any>();

  const handleLogout = async () => {
    try {
      disconnect();
      dispatch(logout());
    } catch (err) {}
  };

  // Common content wrapper
  const Content = (
    <View
      style={{
        paddingTop: verticalScale(80),
        minHeight: '100%',
        backgroundColor: COLORS.theme.white,
      }}>
      {children}
    </View>
  );

  return (
    <View style={{flex: 1}}>
      <StatusBar
        backgroundColor={COLORS.theme.primary}
        barStyle="dark-content"
        animated={true}
      />
      <AppHeader
        scrolled={scrolled}
        rounded={rounded}
        onMenuPress={() => sidebarRef.current?.open()}
        themeMode={themeMode}
        canGoBack={navigation.canGoBack()}
        onBackPress={() => navigation.goBack()}
        title={title}
        onNotificationPress={() => navigation.navigate('Notification')}
      />

      {/* Render ScrollView OR Simple View */}
      {scrollEnabled ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          scrollEventThrottle={16}
          onScroll={e => {
            const y = e.nativeEvent.contentOffset.y;

            if (scrollHeader) {
              setScrolled(y > 10);
            } else {
              setScrolled(true);
            }
          }}>
          {Content}
        </ScrollView>
      ) : (
        <View style={{flex: 1}}>{Content}</View>
      )}

      <Sidebar onLogout={handleLogout} ref={sidebarRef} />
    </View>
  );
};

export default PageWithHeader;
