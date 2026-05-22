import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { View, Text, AppStateStatus, AppState } from 'react-native';

import PublicRoutes from './public-route';
import PrivateRoutes from './private-route';
import { useAppDispatch, useAppSelector } from '../hooks/redux-hook';
import { userDetail } from '../store/reducer/user';
import {
  logout,
  logoutDevice,
  setAuthentication,
  setUser,
} from '../store/reducer/auth';
import { useWebSocket } from '../hooks/use-socket-new';
import { useSessionEvents } from '../hooks/use-session-events';
import Toast from 'react-native-toast-message';
import { clearSession } from '../store/reducer/session';
import { useUserRole } from '../hooks/use-role';
import useFcm from '../hooks/use-fcm';


export default function AppNavigator() {

  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(true);
  const { user, isAuthenticated, token } = useAppSelector(
    (state: any) => state.auth,
  );
  const role = useUserRole();
  const { connect, isConnected, disconnect, send } = useWebSocket(user?.id);

  useSessionEvents(user?.id, isAuthenticated, isConnected);
  const { fcmToken } = useFcm(isAuthenticated);
  // console.log(user, '-----------------user');
  // useZegoAndFCM(user?.id, user?.name, isAuthenticated);

  const handleLogout = async () => {
    try {
      if (role === 'ASTROLOGER') {
        const payload = await dispatch(logoutDevice()).unwrap();

        if (payload.success) {
          Toast.show({
            type: 'success',
            text1: 'Online status changed successfully!',
          });

          // 🔑 finally do logout
          dispatch(clearSession());
          disconnect();
          dispatch(logout());
        } else {
          Toast.show({
            type: 'error',
            text1: 'Try again later',
          });
        }
      } else {
        dispatch(clearSession());
        disconnect();
        dispatch(logout());
      }
    } catch (err) { }
  };

  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          const { payload } = await dispatch(userDetail());

          if (payload?.success) {
            const userDetail: any = payload.user ?? payload.astrologer?.user!;
            const astro = payload.astrologer;

            const astrologer_detail: any = astro
              ? {
                id: astro.id ?? '',
                about: astro.about ?? '',
                blocked: astro.blocked ?? false,
                experienceYears: astro.experienceYears ?? 0,
                expertise: astro.expertise ?? '',
                imgUri: astro.imgUri ?? '',
                languages: astro.languages ?? '',
                pricePerMinuteChat: astro.pricePerMinuteChat ?? 0,
                pricePerMinuteVoice: astro.pricePerMinuteVoice ?? 0,
                pricePerMinuteVideo: astro.pricePerMinuteVideo ?? 0,
                isAudioOnline: astro.isAudioOnline ?? false,
                isChatOnline: astro.isChatOnline ?? false,
                isVideoOnline: astro.isVideoOnline ?? false,
              }
              : null;

            dispatch(setAuthentication(true));
            dispatch(setUser(userDetail));
            if (astrologer_detail) dispatch(setAstrologer(astrologer_detail));
            if (!isConnected) {
              connect();
            } else {
              send('/app/online.user');
            }
          } else {
            // token invalid
            // dispatch(logout());
            handleLogout();
          }
        } catch (err) {
          console.log('Network error or offline:', err);
          // don’t log out if offline, just keep user authenticated
          dispatch(setAuthentication(true));
        }
      } else {
        // dispatch(logout()); // no token, definitely logout
        handleLogout();
      }
      setLoading(false);
    };

    checkAuth();
  }, [token, dispatch, isConnected]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? <PrivateRoutes /> : <PublicRoutes />}
    </NavigationContainer>
  );
}
