import React, {ReactNode, useRef} from 'react';
import {View} from 'react-native';
import Header from './header';
import Sidebar, {SidebarRef} from './sidebar';
import {colors} from '../constants/colors';
import BottomNavigationBar from './bottom-navigation';
import PersonalDetailModal from './personal-detail-modal';
import {useAppDispatch, useAppSelector} from '../hooks/redux-hook';
import {postUserDetail} from '../store/reducer/user';
import {UserPersonalDetail} from '../utils/types';
import {setProfileModelToggle, setUser} from '../store/reducer/auth';

interface ScreenLayoutProps {
  children: ReactNode;
  headerBackgroundColor?: string;
}

const ScreenLayout: React.FC<ScreenLayoutProps> = ({
  children,
  headerBackgroundColor,
}) => {
  const sidebarRef = useRef<SidebarRef>(null);
  const {isProfileModalOpen, isProfileComplete} = useAppSelector(
    state => state.auth,
  );

  const dispatch = useAppDispatch();

  const handlePostUserData = async (user: UserPersonalDetail) => {
    try {
      const payload = await dispatch(postUserDetail(user)).unwrap();

      if (payload?.success) {
        dispatch(setUser(payload.user));
        dispatch(setProfileModelToggle());
      }
    } catch (err) {
      console.log(err);
    }
  };
  return (
    <View style={{flex: 1, backgroundColor: colors.primary_surface}}>
      {/* Global Sidebar */}
      <Sidebar ref={sidebarRef} />
      <Header
        onMenuClick={() => sidebarRef.current?.open()}
        headerBackgroundColor={headerBackgroundColor}
      />
      <View style={{flex: 1, backgroundColor: colors.primary_surface}}>
        {children}
      </View>
      <BottomNavigationBar />
      <PersonalDetailModal
        isOpen={isProfileModalOpen}
        onClose={() => {
          if (isProfileModalOpen) {
            dispatch(setProfileModelToggle());
          }
        }}
        onSubmit={data => {
          handlePostUserData(data);
        }}
      />
    </View>
  );
};

export default ScreenLayout;
