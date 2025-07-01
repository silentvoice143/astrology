import React, {useEffect, useState} from 'react';
import {NavigationContainer, useNavigation} from '@react-navigation/native';

import PublicRoutes from './public-route';
import PrivateRoutes from './private-route';
import {useAppDispatch, useAppSelector} from '../hooks/redux-hook';
import {userDetail} from '../store/reducer/user';
import {logout, setAstrologer, setUser} from '../store/reducer/auth';

import {Text, View} from 'react-native';
import {setDefaultUser, setKundliPerson} from '../store/reducer/kundli';
import {UserPersonalDetail} from '../utils/types';
import {useSessionEvents} from '../hooks/use-session-events';
import {useWebSocket} from '../hooks/use-socket';

export default function AppNavigator() {
  const {token, user} = useAppSelector((state: any) => state.auth);
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const {connect} = useWebSocket(user.id);

  // useEffect(() => {
  //   if (user.id) {
  //     connect(); // ✅ Connect socket
  //   }
  // }, [user.id]);
  // console.log(user.id);
  // useSessionEvents(user.id);

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
                  id: astro.id,
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

            setIsAuthenticated(true);
            dispatch(setUser(userDetail));
            if (astrologer_detail) dispatch(setAstrologer(astrologer_detail));
            connect();
          } else {
            dispatch(logout());
            setIsAuthenticated(false);
          }
        } catch (err) {
          console.log(err);
          dispatch(logout());
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(false);
      }

      setLoading(false);
    };

    checkAuth();
  }, [token, dispatch]);

  useSessionEvents(user.id, isAuthenticated);

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
