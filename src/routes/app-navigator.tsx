import React, {useEffect, useState} from 'react';
import {NavigationContainer} from '@react-navigation/native';

import PublicRoutes from './public-route';
import PrivateRoutes from './private-route';
import {useAppDispatch, useAppSelector} from '../hooks/redux-hook';
import {userDetail} from '../store/reducer/user';
import {logout} from '../store/reducer/auth';
import {View} from 'react-native-reanimated/lib/typescript/Animated';
import {Text} from 'react-native';

export default function AppNavigator() {
  const {token} = useAppSelector((state: any) => state.auth);
  const [loading, setLoading] = useState(true);
  const isAuthenticated = !!token;
  const dispatch = useAppDispatch();

  const checkAuth = async () => {
    try {
      const {payload} = await dispatch(userDetail());
      if (!payload?.success) {
        dispatch(logout());
      }
    } catch (err) {
      console.log(err);
      dispatch(logout());
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <Text>Loading...</Text>
      </View>
    );
  }

  useEffect(() => {
    if (!!token) {
      checkAuth();
    }
  }, [token]);

  return (
    <NavigationContainer>
      {isAuthenticated ? <PrivateRoutes /> : <PublicRoutes />}
    </NavigationContainer>
  );
}
