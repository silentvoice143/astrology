import React, {useEffect, useState} from 'react';
import {NavigationContainer, useNavigation} from '@react-navigation/native';

import PublicRoutes from './public-route';
import PrivateRoutes from './private-route';
import {useAppDispatch, useAppSelector} from '../hooks/redux-hook';
import {userDetail} from '../store/reducer/user';
import {logout, setUser} from '../store/reducer/auth';

import {Text, View} from 'react-native';
import {setDefaultUser, setKundliPerson} from '../store/reducer/kundli';
import {UserPersonalDetail} from '../utils/types';

export default function AppNavigator() {
  const {token} = useAppSelector((state: any) => state.auth);
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          const {payload} = await dispatch(userDetail());
          if (payload?.success) {
            setIsAuthenticated(true);
            dispatch(setUser(payload?.user));
            console.log(payload, '----on checkauth');
            const user = payload?.user;
            const personalDetail: UserPersonalDetail = {
              name: user.name,
              gender: user.gender,
              birthDate: user.birthDate,
              birthTime: user.birthTime,
              birthPlace: user.birthPlace,
              latitude: user.latitude,
              longitude: user.longitude,
            };
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
