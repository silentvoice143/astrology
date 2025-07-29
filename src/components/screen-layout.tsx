import React, {ReactNode, useRef, useState} from 'react';
import {Text, View} from 'react-native';
import Header from './header';
import Sidebar, {SidebarRef} from './sidebar';
import {colors, themeColors} from '../constants/colors';
import BottomNavigationBar from './bottom-navigation';
import PersonalDetailModal from './personal-detail-modal';
import {useAppDispatch, useAppSelector} from '../hooks/redux-hook';
import {postUserDetail} from '../store/reducer/user';
import {UserPersonalDetail} from '../utils/types';
import {setProfileModelToggle, setUser} from '../store/reducer/auth';
import {useWebSocket} from '../hooks/use-socket';
import {useSessionEvents} from '../hooks/use-session-events';
import ConnectionStatusIndicator from './connection-indicator';

interface ScreenLayoutProps {
  children: ReactNode;
  headerBackgroundColor?: string;
  hideHeader?: boolean;
}

const ScreenLayout: React.FC<ScreenLayoutProps> = ({
  children,
  headerBackgroundColor,
  hideHeader,
}) => {
  const sidebarRef = useRef<SidebarRef>(null);
  const {isProfileModalOpen, isProfileComplete} = useAppSelector(
    state => state.auth,
  );
  const {user, isAuthenticated} = useAppSelector((state: any) => state.auth);
  const [isSaving, setIsSaving] = useState(false);
  // const {isConnected} = useWebSocket(user.id);
  // useSessionEvents(user?.id, isAuthenticated, isConnected);

  const dispatch = useAppDispatch();

  const handlePostUserData = async (user: UserPersonalDetail) => {
    setIsSaving(true);
    try {
      const payload = await dispatch(postUserDetail(user)).unwrap();

      if (payload?.success) {
        dispatch(setUser(payload.user));
        dispatch(setProfileModelToggle());
      }
    } catch (err) {
      console.log(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={{flex: 1, backgroundColor: colors.primary_surface}}>
      {/* Global Sidebar */}
      <Sidebar ref={sidebarRef} />
      {!hideHeader && (
        <Header
          onMenuClick={() => sidebarRef.current?.open()}
          headerBackgroundColor={headerBackgroundColor}
        />
      )}
      <View style={{flex: 1, backgroundColor: colors.primary_surface}}>
        {children}
      </View>
      <BottomNavigationBar />
      {!isProfileComplete && isProfileModalOpen && (
        <PersonalDetailModal
          parent={'screen layout personal modal'}
          isSaving={isSaving}
          isOpen={isProfileModalOpen && !isProfileComplete}
          onClose={() => {
            if (isProfileModalOpen) {
              dispatch(setProfileModelToggle());
            }
          }}
          onSubmit={data => {
            handlePostUserData(data);
          }}
        />
      )}
    </View>
  );
};

export default ScreenLayout;
