import React, {useEffect, useState} from 'react';
import {NavigationContainer} from '@react-navigation/native';

import PublicRoutes from './public-route';
import PrivateRoutes from './private-route';
import {useAppDispatch, useAppSelector} from '../hooks/redux-hook';
import {userDetail} from '../store/reducer/user';
import {logout} from '../store/reducer/auth';

import {Text, View} from 'react-native';

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
