import React, {useEffect, useState} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {View, Text, AppStateStatus, AppState} from 'react-native';

import PublicRoutes from './public-route';
import PrivateRoutes from './private-route';
import {useAppDispatch, useAppSelector} from '../hooks/redux-hook';
import {userDetail} from '../store/reducer/user';
import {
  logout,
  setAstrologer,
  setAuthentication,
  setUser,
} from '../store/reducer/auth';
import {useWebSocket} from '../hooks/use-socket-new';
import {useSessionEvents} from '../hooks/use-session-events';

export default function AppNavigator() {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(true);
  const {user, isAuthenticated, token} = useAppSelector(
    (state: any) => state.auth,
  );

  const {connect, isConnected, disconnect, send} = useWebSocket(user?.id);

  useSessionEvents(user?.id, isAuthenticated, isConnected);

  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          const {payload} = await dispatch(userDetail());

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
            dispatch(logout());
          }
        } catch (err) {
          console.log(err);
          dispatch(logout());
        }
      } else {
        dispatch(logout());
      }
      setLoading(false);
    };

    checkAuth();
  }, [token, dispatch, isConnected]);

  // const handleAppStateChange = (nextState: AppStateStatus) => {
  //   if (nextState === 'active') {
  //     console.log('[useSessionEvents] App resumed — resubscribing...');
  //   }
  // };

  // useEffect(() => {
  //   const appStateListener = AppState.addEventListener(
  //     'change',
  //     handleAppStateChange,
  //   );

  //   return () => {
  //     disconnect();
  //     appStateListener.remove();
  //   };
  // }, []);

  if (loading) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
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
